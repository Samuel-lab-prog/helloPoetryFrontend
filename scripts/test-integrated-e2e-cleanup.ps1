$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'integrated-e2e-cleanup.ps1')

$backendPath = (Resolve-Path (Join-Path $PSScriptRoot '..\..\backend')).Path
$composeFile = (Resolve-Path (Join-Path $backendPath 'docker-compose.e2e.yml')).Path
$projectName = 'hello-poetry-e2e-12345-0123456789ab'
$passed = 0

function Assert-True {
	param([bool]$Condition, [string]$Message)
	if (-not $Condition) { throw "Assertion failed: $Message" }
}

function Assert-Throws {
	param([scriptblock]$Action, [string]$Message)
	$threw = $false
	try { & $Action } catch { $threw = $true }
	Assert-True $threw $Message
}

function New-CleanupMock {
	param([hashtable]$State)
	return {
		param([string[]]$Arguments)
		$State.Calls.Add(@($Arguments))
		$first = if ($Arguments.Count -gt 0) { $Arguments[0] } else { '' }
		$second = if ($Arguments.Count -gt 1) { $Arguments[1] } else { '' }
		if ($first -eq 'ps') {
			if ($State.DownCalled) {
				return [pscustomobject]@{ ExitCode = 0; Output = @($State.ResidualContainers) }
			}
			return [pscustomobject]@{ ExitCode = 0; Output = @('container-e2e-1') }
		}
		if ($first -eq 'inspect' -and $Arguments -contains 'container-e2e-1') {
			return [pscustomobject]@{ ExitCode = 0; Output = @($State.ContainerJson) }
		}
		if ($first -eq 'compose' -and $Arguments -contains 'down') {
			$State.DownCalled = $true
			$State.DownArguments = @($Arguments)
			return [pscustomobject]@{ ExitCode = $State.DownExitCode; Output = @($State.DownOutput) }
		}
		if ($first -eq 'network') {
			return [pscustomobject]@{ ExitCode = 0; Output = @($State.ResidualNetworks) }
		}
		if ($first -eq 'volume' -and $second -eq 'ls') {
			return [pscustomobject]@{ ExitCode = 0; Output = @($State.ResidualVolumes) }
		}
		if ($first -eq 'volume' -and $second -eq 'inspect') {
			if ($State.KeepCapturedVolume) {
				return [pscustomobject]@{ ExitCode = 0; Output = @('volume still exists') }
			}
			return [pscustomobject]@{ ExitCode = 1; Output = @("Error: no such volume: $($Arguments[2])") }
		}
		return [pscustomobject]@{ ExitCode = 0; Output = @() }
	}.GetNewClosure()
}

function New-CleanupState {
	param([string]$Project)
	$container = @{
		Config = @{ Labels = @{ 'com.docker.compose.project' = $Project; 'com.docker.compose.project.config_files' = $composeFile } }
		Mounts = @(@{ Type = 'volume'; Name = 'anonymous-e2e-data'; Destination = '/var/lib/postgresql/data' })
	}
	return @{
		Calls = [System.Collections.Generic.List[object]]::new()
		ContainerJson = ($container | ConvertTo-Json -Depth 8 -Compress)
		DownCalled = $false
		DownArguments = @()
		DownExitCode = 0
		DownOutput = @()
		ResidualContainers = @()
		ResidualNetworks = @()
		ResidualVolumes = @()
		KeepCapturedVolume = $false
	}
}

function New-StorageMock {
	param([hashtable]$State)
	return {
		param([string[]]$Arguments)
		$State.Calls.Add(@($Arguments))
		if ($Arguments[0] -eq 'compose') {
			return [pscustomobject]@{ ExitCode = 0; Output = @('container-e2e-1') }
		}
		if ($Arguments[0] -eq 'inspect') {
			return [pscustomobject]@{ ExitCode = 0; Output = @($State.ContainerJson) }
		}
		if ($Arguments[0] -eq 'exec') {
			return [pscustomobject]@{ ExitCode = $State.RuntimeMountExitCode; Output = @($State.RuntimeMountOutput) }
		}
		return [pscustomobject]@{ ExitCode = 1; Output = @('unexpected docker command') }
	}.GetNewClosure()
}

function New-StorageState {
	param([string]$Project, [string]$MountType = 'tmpfs', [string]$Service = 'postgres')
	$mountName = if ($MountType -eq 'volume') { 'unexpected-volume' } else { '' }
	$container = @{
		Config = @{ Labels = @{ 'com.docker.compose.project' = $Project; 'com.docker.compose.project.config_files' = $composeFile; 'com.docker.compose.service' = $Service } }
		HostConfig = @{ Tmpfs = @{ '/var/lib/postgresql/data' = 'rw,noexec,nosuid,size=512m' } }
		Mounts = @(@{ Type = $MountType; Name = $mountName; Destination = '/var/lib/postgresql/data' })
	}
	return @{
		Calls = [System.Collections.Generic.List[object]]::new()
		ContainerJson = ($container | ConvertTo-Json -Depth 8 -Compress)
		RuntimeMountExitCode = 0
		RuntimeMountOutput = @('tmpfs /var/lib/postgresql/data tmpfs rw,nosuid,nodev,noexec,relatime,size=524288k 0 0')
	}
}

function New-EmptyProjectInventoryMock {
	param([hashtable]$State)
	return {
		param([string[]]$Arguments)
		$State.Calls.Add(@($Arguments))
		$index = $State.Calls.Count - 1
		if ($State.OccupiedAt -eq $index) {
			return [pscustomobject]@{ ExitCode = 0; Output = @('preexisting-resource') }
		}
		return [pscustomobject]@{ ExitCode = 0; Output = @() }
	}.GetNewClosure()
}

function docker {
	Write-Error 'simulated Compose lifecycle progress on stderr' -ErrorAction Continue
	$global:LASTEXITCODE = 0
}

$previousErrorActionPreference = $ErrorActionPreference
$nativeOutputResult = Invoke-E2EDockerCommand -Arguments @('compose', 'up', '--wait')
Assert-True ($nativeOutputResult.ExitCode -eq 0) 'Docker lifecycle output on stderr does not replace a successful native exit code'
Assert-True (($nativeOutputResult.Output -join ' ') -match 'simulated Compose lifecycle progress') 'Docker lifecycle stderr remains available for diagnostics'
Assert-True ($ErrorActionPreference -eq $previousErrorActionPreference) 'Docker invocation restores the caller error policy'
Remove-Item Function:\docker
$passed++

$state = New-CleanupState -Project $projectName
$mock = New-CleanupMock -State $state
$result = Invoke-IntegratedE2ECleanup -ComposeFile $composeFile -ProjectName $projectName -IdentityVerified $true -DockerInvoker $mock
Assert-True $result.Success 'cleanup succeeds when all scoped resources are removed'
Assert-True ($state.DownArguments -contains '--volumes') 'Compose down includes --volumes'
Assert-True ($state.DownArguments -contains '--remove-orphans') 'Compose down includes --remove-orphans'
Assert-True ($state.DownArguments -contains $composeFile) 'Compose down uses the explicit E2E compose file'
Assert-True ($state.DownArguments -contains $projectName) 'Compose down uses the verified project identity'
Assert-True ($result.CapturedVolumeNames -contains 'anonymous-e2e-data') 'image-declared anonymous volume is captured before container removal'
Assert-True (@($state.Calls | Where-Object { $_ -contains 'prune' }).Count -eq 0) 'cleanup never invokes global prune commands'
$passed++

$emptyState = @{ Calls = [System.Collections.Generic.List[object]]::new(); OccupiedAt = -1 }
$emptyMock = New-EmptyProjectInventoryMock -State $emptyState
Assert-IntegratedE2EProjectUnoccupied -ProjectName $projectName -DockerInvoker $emptyMock
Assert-True ($emptyState.Calls.Count -eq 3) 'preflight checks containers, networks, and volumes before project creation'
$occupiedState = @{ Calls = [System.Collections.Generic.List[object]]::new(); OccupiedAt = 1 }
$occupiedMock = New-EmptyProjectInventoryMock -State $occupiedState
Assert-Throws {
	Assert-IntegratedE2EProjectUnoccupied -ProjectName $projectName -DockerInvoker $occupiedMock
} 'preflight rejects a preexisting resource bearing the proposed project label'
$passed++

$storageState = New-StorageState -Project $projectName
$storageMock = New-StorageMock -State $storageState
$storageResult = Assert-IntegratedE2EPostgresStorage -ComposeFile $composeFile -ProjectName $projectName -IdentityVerified $true -DockerInvoker $storageMock
Assert-True ($storageResult.MountType -eq 'tmpfs') 'runtime guard accepts an effective tmpfs data mount'
Assert-True ($storageResult.Options -match 'noexec' -and $storageResult.Options -match 'nosuid') 'runtime guard reports the effective tmpfs options'
$composeInspectCall = @($storageState.Calls | Where-Object { $_[0] -eq 'compose' })[0]
Assert-True ($composeInspectCall -contains $composeFile -and $composeInspectCall -contains $projectName) 'runtime storage inspection uses the explicit compose file and project'
Assert-True (@($storageState.Calls | Where-Object { $_[0] -eq 'exec' -and ($_ -join ' ') -match '/proc/mounts' }).Count -eq 1) 'runtime storage inspection verifies the kernel mount inside the owned container'
$passed++

$volumeState = New-StorageState -Project $projectName -MountType 'volume'
$volumeMock = New-StorageMock -State $volumeState
Assert-Throws {
	Assert-IntegratedE2EPostgresStorage -ComposeFile $composeFile -ProjectName $projectName -IdentityVerified $true -DockerInvoker $volumeMock
} 'runtime guard rejects a persistent volume at the PostgreSQL data path'
$passed++

$nonTmpfsState = New-StorageState -Project $projectName
$nonTmpfsState.RuntimeMountOutput = @('overlay /var/lib/postgresql/data overlay rw,relatime 0 0')
$nonTmpfsMock = New-StorageMock -State $nonTmpfsState
Assert-Throws {
	Assert-IntegratedE2EPostgresStorage -ComposeFile $composeFile -ProjectName $projectName -IdentityVerified $true -DockerInvoker $nonTmpfsMock
} 'runtime guard rejects a configured tmpfs when the effective kernel mount is not tmpfs'
$passed++

$invalidState = New-CleanupState -Project $projectName
$invalidMock = New-CleanupMock -State $invalidState
foreach ($invalidName in @('', 'backend', 'hello-poetry-e2e-1-not-a-guid')) {
	Assert-Throws {
		Invoke-IntegratedE2ECleanup -ComposeFile $composeFile -ProjectName $invalidName -IdentityVerified $true -DockerInvoker $invalidMock
	} "rejects invalid project identity '$invalidName'"
}
Assert-Throws {
	Invoke-IntegratedE2ECleanup -ComposeFile $composeFile -ProjectName $projectName -IdentityVerified $false -DockerInvoker $invalidMock
} 'rejects an identity that was not verified'
Assert-True ($invalidState.Calls.Count -eq 0) 'invalid identities issue no Docker commands'
$passed++

$unprovenState = New-CleanupState -Project 'some-other-project'
$unprovenMock = New-CleanupMock -State $unprovenState
$unprovenResult = Invoke-IntegratedE2ECleanup -ComposeFile $composeFile -ProjectName $projectName -IdentityVerified $true -DockerInvoker $unprovenMock
Assert-True (-not $unprovenState.DownCalled) 'cleanup refuses Compose down when container labels do not match the E2E project'
Assert-True (-not $unprovenResult.Success) 'unproven project ownership is reported as cleanup failure'
$passed++

$residualState = New-CleanupState -Project $projectName
$residualState.ResidualContainers = @('residual-container')
$residualState.ResidualNetworks = @('residual-network')
$residualState.ResidualVolumes = @('project-volume-residual')
$residualState.KeepCapturedVolume = $true
$residualMock = New-CleanupMock -State $residualState
$residualResult = Invoke-IntegratedE2ECleanup -ComposeFile $composeFile -ProjectName $projectName -IdentityVerified $true -DockerInvoker $residualMock
Assert-True (-not $residualResult.Success) 'cleanup fails when a labeled or captured volume remains'
Assert-True (($residualResult.Errors -join ' ') -match 'volumes|anonymous-e2e-data') 'residual volume is reported'
Assert-True (($residualResult.Errors -join ' ') -match 'containers|residual-container') 'residual container is reported'
Assert-True (($residualResult.Errors -join ' ') -match 'networks|residual-network') 'residual network is reported'
$passed++

$downFailureState = New-CleanupState -Project $projectName
$downFailureState.DownExitCode = 29
$downFailureState.DownOutput = @('simulated compose down failure')
$downFailureMock = New-CleanupMock -State $downFailureState
$downFailureResult = Invoke-IntegratedE2ECleanup -ComposeFile $composeFile -ProjectName $projectName -IdentityVerified $true -DockerInvoker $downFailureMock
Assert-True (-not $downFailureResult.Success -and ($downFailureResult.Errors -join ' ') -match 'exit 29') 'Compose cleanup command failure is reported'
$passed++

$cleanupRan = [ref]$false
$failedWorkResult = Invoke-IntegratedE2EWithCleanup -Work { return 37 } -Cleanup {
	$cleanupRan.Value = $true
	[pscustomobject]@{ Success = $true; Errors = @() }
}
Assert-True $cleanupRan.Value 'cleanup runs after a nonzero work result'
Assert-True ($failedWorkResult.ExitCode -eq 37 -and $failedWorkResult.OriginalExitCode -eq 37) 'original work failure exit code is preserved'
$passed++

$cleanupRanAfterException = [ref]$false
$processFailure = [System.Exception]::new('simulated process failure')
$processFailure.Data['ExitCode'] = 53
$exceptionWorkResult = Invoke-IntegratedE2EWithCleanup -Work { throw $processFailure } -Cleanup {
	$cleanupRanAfterException.Value = $true
	[pscustomobject]@{ Success = $true; Errors = @() }
}
Assert-True $cleanupRanAfterException.Value 'cleanup runs after a thrown process failure'
Assert-True ($exceptionWorkResult.ExitCode -eq 53) 'a process exit code carried by an exception is preserved'
$passed++

$failedWorkCleanupFailure = Invoke-IntegratedE2EWithCleanup -Work { return 41 } -Cleanup {
	[pscustomobject]@{ Success = $false; Errors = @('cleanup could not prove removal') }
}
Assert-True ($failedWorkCleanupFailure.ExitCode -eq 41) 'cleanup failure does not replace the original work failure exit code'
Assert-True ($failedWorkCleanupFailure.CleanupError -match 'could not prove removal') 'cleanup failure remains separately observable'
$passed++

$successfulWorkCleanupFailure = Invoke-IntegratedE2EWithCleanup -Work { return 0 } -Cleanup {
	[pscustomobject]@{ Success = $false; Errors = @('residual test volume') }
}
Assert-True ($successfulWorkCleanupFailure.ExitCode -eq 1) 'cleanup failure fails an otherwise successful run'
Assert-True ($successfulWorkCleanupFailure.CleanupError -match 'residual test volume') 'cleanup failure is reported independently'
$passed++

Write-Host "Integrated E2E cleanup tests passed: $passed groups."
