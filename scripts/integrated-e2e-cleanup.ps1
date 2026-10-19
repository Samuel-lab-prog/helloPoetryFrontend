function Assert-IntegratedE2EProjectIdentity {
	param(
		[Parameter(Mandatory = $true)]
		[string]$ProjectName,
		[Parameter(Mandatory = $true)]
		[bool]$IdentityVerified
	)

	if (-not $IdentityVerified) {
		throw 'The E2E Compose project identity has not been verified; refusing cleanup.'
	}
	if ($ProjectName -cnotmatch '^hello-poetry-e2e-\d+-[a-f0-9]{12}$') {
		throw "Invalid E2E Compose project identity '$ProjectName'; refusing cleanup."
	}
}

function Test-IntegratedE2EComposeFileLabel {
	param([object]$Labels, [string]$ComposeFile)
	$configFiles = [string]$Labels.'com.docker.compose.project.config_files'
	if ([string]::IsNullOrWhiteSpace($configFiles)) { return $false }
	$expectedPath = [IO.Path]::GetFullPath($ComposeFile)
	foreach ($configuredFile in ($configFiles -split ',')) {
		$trimmedPath = $configuredFile.Trim().Trim('"')
		if (-not [string]::IsNullOrWhiteSpace($trimmedPath) -and [IO.Path]::GetFullPath($trimmedPath) -ieq $expectedPath) {
			return $true
		}
	}
	return $false
}

function Invoke-E2EDockerCommand {
	param(
		[Parameter(Mandatory = $true)]
		[string[]]$Arguments,
		[scriptblock]$DockerInvoker
	)

	if ($DockerInvoker) {
		return & $DockerInvoker $Arguments
	}

	$previousErrorActionPreference = $ErrorActionPreference
	try {
		# Compose lifecycle progress is written to stderr on successful `down`.
		# Capture it for diagnostics while relying on the actual exit code.
		$ErrorActionPreference = 'Continue'
		$output = & docker @Arguments 2>&1
		$exitCode = $LASTEXITCODE
	} finally {
		$ErrorActionPreference = $previousErrorActionPreference
	}
	return [pscustomobject]@{
		ExitCode = $exitCode
		Output   = @($output | ForEach-Object { [string]$_ })
	}
}

function Assert-IntegratedE2EProjectUnoccupied {
	[CmdletBinding()]
	param(
		[Parameter(Mandatory = $true)]
		[string]$ProjectName,
		[scriptblock]$DockerInvoker
	)

	Assert-IntegratedE2EProjectIdentity -ProjectName $ProjectName -IdentityVerified $true
	$label = "label=com.docker.compose.project=$ProjectName"
	$checks = @(
		@('ps', '--all', '--quiet', '--filter', $label),
		@('network', 'ls', '--quiet', '--filter', $label),
		@('volume', 'ls', '--quiet', '--filter', $label)
	)
	foreach ($arguments in $checks) {
		$result = Invoke-E2EDockerCommand -Arguments $arguments -DockerInvoker $DockerInvoker
		if ($result.ExitCode -ne 0) {
			throw "Could not verify that Compose project '$ProjectName' has no preexisting resources: $($result.Output -join ' ')"
		}
		if (@($result.Output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }).Count -gt 0) {
			throw "Compose project '$ProjectName' already has resources; refusing to reuse or clean it."
		}
	}
}

function Assert-IntegratedE2EPostgresStorage {
	[CmdletBinding()]
	param(
		[Parameter(Mandatory = $true)]
		[string]$ComposeFile,
		[Parameter(Mandatory = $true)]
		[string]$ProjectName,
		[Parameter(Mandatory = $true)]
		[bool]$IdentityVerified,
		[scriptblock]$DockerInvoker
	)

	Assert-IntegratedE2EProjectIdentity -ProjectName $ProjectName -IdentityVerified $IdentityVerified
	if (-not [IO.Path]::IsPathRooted($ComposeFile) -or -not (Test-Path -LiteralPath $ComposeFile -PathType Leaf)) {
		throw 'The E2E Compose file must be an existing absolute path; refusing storage validation.'
	}

	$composeArgs = @('compose', '-f', $ComposeFile, '-p', $ProjectName)
	$containerResult = Invoke-E2EDockerCommand -Arguments ($composeArgs + @('ps', '--all', '--quiet', 'postgres')) -DockerInvoker $DockerInvoker
	if ($containerResult.ExitCode -ne 0) {
		throw "Could not inspect the isolated PostgreSQL container: $($containerResult.Output -join ' ')"
	}
	$containerIds = @($containerResult.Output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
	if ($containerIds.Count -ne 1) {
		throw "Expected exactly one PostgreSQL container in '$ProjectName'; found $($containerIds.Count)."
	}

	$inspectResult = Invoke-E2EDockerCommand -Arguments @('inspect', '--format', '{{json .}}', $containerIds[0]) -DockerInvoker $DockerInvoker
	if ($inspectResult.ExitCode -ne 0) {
		throw "Could not inspect PostgreSQL container '$($containerIds[0])': $($inspectResult.Output -join ' ')"
	}
	try {
		$container = ($inspectResult.Output -join "`n") | ConvertFrom-Json
	} catch {
		throw "Could not parse PostgreSQL container inspection: $($_.Exception.Message)"
	}

	$labels = $container.Config.Labels
	if (
		$labels.'com.docker.compose.project' -cne $ProjectName -or
		$labels.'com.docker.compose.service' -cne 'postgres' -or
		-not (Test-IntegratedE2EComposeFileLabel -Labels $labels -ComposeFile $ComposeFile)
	) {
		throw "PostgreSQL container '$($containerIds[0])' does not prove ownership by '$ProjectName'."
	}

	$dataPath = '/var/lib/postgresql/data'
	$tmpfsConfiguration = $container.HostConfig.Tmpfs
	if (-not $tmpfsConfiguration -or -not $tmpfsConfiguration.PSObject.Properties[$dataPath]) {
		throw "PostgreSQL container '$($containerIds[0])' does not configure tmpfs at $dataPath."
	}
	$mountsAtDataPath = @($container.Mounts | Where-Object { $_.Destination -eq $dataPath })
	if ($mountsAtDataPath.Count -gt 1 -or ($mountsAtDataPath.Count -eq 1 -and $mountsAtDataPath[0].Type -ne 'tmpfs')) {
		$actualTypes = ($mountsAtDataPath | ForEach-Object { $_.Type }) -join ', '
		throw "PostgreSQL data path is not proven to be a single tmpfs mount (observed: '$actualTypes')."
	}

	# Docker Desktop may omit tmpfs mounts from ContainerInspect.Mounts even
	# though HostConfig.Tmpfs is set. Verify the effective kernel mount inside
	# the exact, label-verified container before allowing migrations or fixtures.
	$runtimeMountResult = Invoke-E2EDockerCommand -Arguments @(
		'exec', $containerIds[0], 'sh', '-c', "grep -E '^[^ ]+ $dataPath tmpfs ' /proc/mounts"
	) -DockerInvoker $DockerInvoker
	$runtimeMountLines = @($runtimeMountResult.Output | Where-Object { $_ -match "^\S+\s+$([regex]::Escape($dataPath))\s+tmpfs\s+\S+" })
	if ($runtimeMountResult.ExitCode -ne 0 -or $runtimeMountLines.Count -ne 1) {
		throw "PostgreSQL data path is not proven to be a single effective tmpfs mount at $dataPath."
	}
	$runtimeMountFields = $runtimeMountLines[0] -split '\s+'
	$runtimeMountOptions = $runtimeMountFields[3] -split ','
	if ('noexec' -notin $runtimeMountOptions -or 'nosuid' -notin $runtimeMountOptions) {
		throw "Effective tmpfs mount at $dataPath is missing required noexec or nosuid options."
	}

	return [pscustomobject]@{
		ContainerId = $containerIds[0]
		DataPath    = $dataPath
		MountType   = 'tmpfs'
		Options     = $runtimeMountOptions -join ','
	}
}

function Invoke-IntegratedE2ECleanup {
	[CmdletBinding()]
	param(
		[Parameter(Mandatory = $true)]
		[string]$ComposeFile,
		[Parameter(Mandatory = $true)]
		[string]$ProjectName,
		[Parameter(Mandatory = $true)]
		[bool]$IdentityVerified,
		[scriptblock]$DockerInvoker
	)

	Assert-IntegratedE2EProjectIdentity -ProjectName $ProjectName -IdentityVerified $IdentityVerified
	if (-not [IO.Path]::IsPathRooted($ComposeFile) -or -not (Test-Path -LiteralPath $ComposeFile -PathType Leaf)) {
		throw 'The E2E Compose file must be an existing absolute path; refusing cleanup.'
	}

	$composeArgs = @('compose', '-f', $ComposeFile, '-p', $ProjectName)
	$projectLabel = "label=com.docker.compose.project=$ProjectName"
	$errors = [System.Collections.Generic.List[string]]::new()
	$capturedVolumeNames = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
	$ownershipProven = $true

	# Capture anonymous image-declared volumes while their owning containers still exist.
	$containerResult = Invoke-E2EDockerCommand -Arguments @('ps', '--all', '--quiet', '--filter', $projectLabel) -DockerInvoker $DockerInvoker
	if ($containerResult.ExitCode -ne 0) {
		$errors.Add("Could not inventory E2E containers before cleanup: $($containerResult.Output -join ' ')")
		$ownershipProven = $false
	} else {
		$containerIds = @($containerResult.Output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
		foreach ($containerId in $containerIds) {
			$inspectResult = Invoke-E2EDockerCommand -Arguments @('inspect', '--format', '{{json .}}', $containerId) -DockerInvoker $DockerInvoker
			if ($inspectResult.ExitCode -ne 0) {
				$errors.Add("Could not inspect E2E container '$containerId' before cleanup: $($inspectResult.Output -join ' ')")
				$ownershipProven = $false
				continue
			}

			try {
				$container = ($inspectResult.Output -join "`n") | ConvertFrom-Json
				$labels = $container.Config.Labels
				if (
					$labels.'com.docker.compose.project' -cne $ProjectName -or
					-not (Test-IntegratedE2EComposeFileLabel -Labels $labels -ComposeFile $ComposeFile)
				) {
					$errors.Add("Container '$containerId' does not prove ownership by '$ProjectName' and the E2E Compose file.")
					$ownershipProven = $false
					continue
				}
				foreach ($mount in @($container.Mounts)) {
					if ($mount.Type -eq 'volume' -and -not [string]::IsNullOrWhiteSpace($mount.Name)) {
						[void]$capturedVolumeNames.Add([string]$mount.Name)
					}
				}
			} catch {
				$errors.Add("Could not parse ownership and mounts for E2E container '$containerId': $($_.Exception.Message)")
				$ownershipProven = $false
			}
		}
	}

	if ($ownershipProven) {
		$downResult = Invoke-E2EDockerCommand -Arguments ($composeArgs + @('down', '--remove-orphans', '--volumes')) -DockerInvoker $DockerInvoker
		if ($downResult.ExitCode -ne 0) {
			$errors.Add("Compose cleanup failed for '$ProjectName' (exit $($downResult.ExitCode)): $($downResult.Output -join ' ')")
		}
	} else {
		$errors.Add("Refusing Compose down for '$ProjectName' because resource ownership could not be proven.")
	}

	$resourceChecks = @(
		@{ Kind = 'containers'; Arguments = @('ps', '--all', '--quiet', '--filter', $projectLabel) },
		@{ Kind = 'networks'; Arguments = @('network', 'ls', '--quiet', '--filter', $projectLabel) },
		@{ Kind = 'volumes'; Arguments = @('volume', 'ls', '--quiet', '--filter', $projectLabel) }
	)
	foreach ($check in $resourceChecks) {
		$result = Invoke-E2EDockerCommand -Arguments $check.Arguments -DockerInvoker $DockerInvoker
		if ($result.ExitCode -ne 0) {
			$errors.Add("Could not verify residual E2E $($check.Kind): $($result.Output -join ' ')")
		} elseif (@($result.Output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }).Count -gt 0) {
			$errors.Add("Residual E2E $($check.Kind) remain for '$ProjectName': $($result.Output -join ', ')")
		}
	}

	foreach ($volumeName in $capturedVolumeNames) {
		$result = Invoke-E2EDockerCommand -Arguments @('volume', 'inspect', $volumeName) -DockerInvoker $DockerInvoker
		if ($result.ExitCode -eq 0) {
			$errors.Add("Captured E2E volume '$volumeName' remains after cleanup.")
		} elseif (($result.Output -join ' ') -notmatch '(?i)(no such volume|not found)') {
			$errors.Add("Could not prove captured E2E volume '$volumeName' was removed: $($result.Output -join ' ')")
		}
	}

	return [pscustomobject]@{
		Success             = ($errors.Count -eq 0)
		Errors              = @($errors)
		CapturedVolumeNames = @($capturedVolumeNames)
	}
}

function Invoke-IntegratedE2EWithCleanup {
	[CmdletBinding()]
	param(
		[Parameter(Mandatory = $true)]
		[scriptblock]$Work,
		[Parameter(Mandatory = $true)]
		[scriptblock]$Cleanup
	)

	$originalExitCode = 0
	$workError = $null
	$cleanupError = $null
	try {
		$workResult = & $Work
		if ($null -ne $workResult) {
			$originalExitCode = [int]$workResult
		}
	} catch {
		$workError = $_.Exception.Message
		if ($_.Exception.Data.Contains('ExitCode')) {
			$originalExitCode = [int]$_.Exception.Data['ExitCode']
		} else {
			$originalExitCode = 1
		}
	}

	try {
		$cleanupResult = & $Cleanup
		if ($null -eq $cleanupResult -or -not $cleanupResult.Success) {
			$cleanupError = if ($cleanupResult.Errors) { $cleanupResult.Errors -join ' ' } else { 'Cleanup did not confirm success.' }
		}
	} catch {
		$cleanupError = $_.Exception.Message
	}

	$finalExitCode = $originalExitCode
	if ($finalExitCode -eq 0 -and $cleanupError) {
		$finalExitCode = 1
	}

	return [pscustomobject]@{
		OriginalExitCode = $originalExitCode
		ExitCode         = $finalExitCode
		WorkError        = $workError
		CleanupError     = $cleanupError
	}
}
