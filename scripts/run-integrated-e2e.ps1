$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'integrated-e2e-cleanup.ps1')

function Invoke-E2EProcess {
	param(
		[Parameter(Mandatory = $true)]
		[string]$Command,
		[Parameter(Mandatory = $true)]
		[string[]]$Arguments
	)

	$previousErrorActionPreference = $ErrorActionPreference
	try {
		# Docker Compose writes progress messages to stderr even on success. Keep
		# those messages observable without letting PowerShell treat them as a
		# terminating script error; the native exit code remains authoritative.
		$ErrorActionPreference = 'Continue'
		$output = & $Command @Arguments 2>&1
		$exitCode = $LASTEXITCODE
	} finally {
		$ErrorActionPreference = $previousErrorActionPreference
	}
	foreach ($line in $output) { Write-Host $line }
	return [int]$exitCode
}

$backendPath = (Resolve-Path (Join-Path $PSScriptRoot '..\..\backend')).Path
$frontendPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$composeFile = (Resolve-Path (Join-Path $backendPath 'docker-compose.e2e.yml')).Path
$backendEnvFile = Join-Path $backendPath '.env.test'
if (-not (Test-Path $backendEnvFile)) {
	$backendEnvFile = Join-Path $backendPath '.env'
}
$databaseUrl = 'postgresql://hello_poetry_e2e:hello_poetry_e2e_only@127.0.0.1:55432/hello_poetry_e2e_test?schema=public'
$projectSuffix = [Guid]::NewGuid().ToString('N').Substring(0, 12)
$projectName = "hello-poetry-e2e-$PID-$projectSuffix"
Assert-IntegratedE2EProjectIdentity -ProjectName $projectName -IdentityVerified $true
$composeArgs = @('compose', '-f', $composeFile, '-p', $projectName)
$e2eTempRoot = Join-Path ([IO.Path]::GetTempPath()) $projectName
$composeAttempted = [ref]$false
$projectIdentityVerified = $false
$environmentNames = @(
	'NODE_ENV', 'DATABASE_URL', 'PORT', 'JWT_SECRET_KEY', 'JWT_ISSUER', 'JWT_AUDIENCE',
	'FRONTEND_URL', 'CORS_ORIGIN', 'CSRF_ENABLED', 'CSRF_ORIGIN_ALLOWLIST', 'CROSS_SITE_COOKIES',
	'HELLO_POETRY_E2E_PROJECT', 'HELLO_POETRY_E2E_TEMP_ROOT'
)
if (Test-Path $backendEnvFile) {
	$envFileNames = @(
		Get-Content $backendEnvFile | ForEach-Object {
			if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=') { $Matches[1] }
		}
	)
	$environmentNames = @($environmentNames + $envFileNames | Select-Object -Unique)
} else {
	$envFileNames = @()
}
$sensitiveEnvironmentNames = @(
	Get-ChildItem Env: | Where-Object {
		$_.Name -match '^(AWS_|S3_|AZURE_|GOOGLE_|GCP_|SMTP_|MAIL_|REDIS_|.*(SECRET|PASSWORD|TOKEN|API_KEY).*)'
	} | ForEach-Object { $_.Name }
)
$environmentNames = @($environmentNames + $sensitiveEnvironmentNames | Select-Object -Unique)
$previousEnvironment = @{}
foreach ($name in $environmentNames) {
	$previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}

Write-Host 'Integrated E2E will use an isolated PostgreSQL Compose project:'
Write-Host '  host: 127.0.0.1:55432'
Write-Host '  database/schema: hello_poetry_e2e_test/public'
Write-Host '  storage: tmpfs at /var/lib/postgresql/data; cleanup also removes project volumes'
Write-Host "  Compose project: $projectName"
Write-Host "  temporary artifacts: $e2eTempRoot (retained for diagnosis; must not already exist)"
Write-Host '  actions: start PostgreSQL, apply test migrations, prepare three disposable accounts, run Playwright, clean this project'

if (-not (Test-Path (Join-Path $backendPath 'src\generic-subdomains\persistance\prisma\generated'))) {
	throw 'Generated Prisma client is missing. Run the separately reviewed Prisma generation step before integrated E2E.'
}
if (Test-Path -LiteralPath $e2eTempRoot) {
	throw "Temporary directory '$e2eTempRoot' already exists; refusing to overwrite prior E2E artifacts."
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
	throw 'Docker CLI is required for integrated E2E.'
}
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
	throw 'Bun is required for integrated E2E.'
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
	throw 'Node.js is required for Prisma CLI and Playwright.'
}

$dockerInfo = & docker info --format '{{.ServerVersion}}'
if ($LASTEXITCODE -ne 0 -or -not $dockerInfo) {
	throw 'Docker daemon is not available.'
}

$existingProjects = @(& docker compose ls --all --format json | ConvertFrom-Json)
if ($LASTEXITCODE -ne 0) {
	throw 'Could not inspect existing Docker Compose projects.'
}
if ($existingProjects | Where-Object { $_.Name -eq $projectName }) {
	throw "Compose project '$projectName' already exists; refusing to reuse or remove it."
}
Assert-IntegratedE2EProjectUnoccupied -ProjectName $projectName
$projectIdentityVerified = $true

Push-Location $frontendPath
try {
	$chromiumPath = node -e "process.stdout.write(require('@playwright/test').chromium.executablePath())"
	if ($LASTEXITCODE -ne 0 -or -not (Test-Path $chromiumPath)) {
		throw 'Playwright Chromium is not installed. Install the browser separately before starting the E2E database.'
	}
} finally {
	Pop-Location
}

foreach ($port in @(4174, 5101, 55432)) {
	$listener = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
	if ($listener) { throw "Port $port is already listening. Stop that process before integrated E2E." }
}

$confirmation = Read-Host 'Type START ISOLATED E2E to authorize these disposable test database operations'
if ($confirmation -cne 'START ISOLATED E2E') {
	throw 'Authorization phrase did not match. No database or Docker operation was started.'
}

# Reserve the already-verified unique artifact directory after authorization.
# The marker lets Playwright workers distinguish this run's own output from a
# preexisting directory when the config is reloaded after the build begins.
if (Test-Path -LiteralPath $e2eTempRoot) {
	throw "Temporary directory '$e2eTempRoot' appeared after preflight; refusing to write artifacts."
}
$null = New-Item -ItemType Directory -Path $e2eTempRoot -ErrorAction Stop
$artifactMarkerPath = Join-Path $e2eTempRoot '.hello-poetry-integrated-e2e-owner'
$markerStream = [IO.File]::Open($artifactMarkerPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
try {
	$markerBytes = [Text.Encoding]::UTF8.GetBytes($projectName)
	$markerStream.Write($markerBytes, 0, $markerBytes.Length)
} finally {
	$markerStream.Dispose()
}

$runResult = $null
try {
	$runResult = Invoke-IntegratedE2EWithCleanup -Work {
		$composeAttempted.Value = $true
		$exitCode = Invoke-E2EProcess -Command 'docker' -Arguments ($composeArgs + @('up', '--detach', '--wait'))
		if ($exitCode -ne 0) { return $exitCode }
		try {
			$storage = Assert-IntegratedE2EPostgresStorage -ComposeFile $composeFile -ProjectName $projectName -IdentityVerified $projectIdentityVerified
			Write-Host "Verified PostgreSQL data mount: $($storage.MountType) at $($storage.DataPath) ($($storage.Options))."
		} catch {
			Write-Host "PostgreSQL storage isolation check failed: $($_.Exception.Message)"
			return 1
		}

		foreach ($name in $envFileNames) {
			[Environment]::SetEnvironmentVariable($name, '', 'Process')
		}
		foreach ($name in $sensitiveEnvironmentNames) {
			[Environment]::SetEnvironmentVariable($name, '', 'Process')
		}
		$env:NODE_ENV = 'test'
		$env:DATABASE_URL = $databaseUrl
		$env:PORT = '5101'
		$env:JWT_SECRET_KEY = 'hello-poetry-integrated-e2e-only-secret'
		$env:JWT_ISSUER = 'http://127.0.0.1:5101'
		$env:JWT_AUDIENCE = 'http://127.0.0.1:5101'
		$env:FRONTEND_URL = 'http://127.0.0.1:4174'
		$env:CORS_ORIGIN = 'http://127.0.0.1:4174'
		$env:CSRF_ENABLED = 'true'
		$env:CSRF_ORIGIN_ALLOWLIST = 'http://127.0.0.1:4174'
		$env:CROSS_SITE_COOKIES = 'false'
		$env:HELLO_POETRY_E2E_PROJECT = $projectName
		$env:HELLO_POETRY_E2E_TEMP_ROOT = $e2eTempRoot

		Push-Location $backendPath
		try {
			$exitCode = Invoke-E2EProcess -Command 'bun' -Arguments @('run', 'db:migrate:test')
			if ($exitCode -ne 0) { return $exitCode }
			$exitCode = Invoke-E2EProcess -Command 'bun' -Arguments @('scripts/e2e/prepare-accounts.ts')
			if ($exitCode -ne 0) { return $exitCode }
		} finally {
			Pop-Location
		}

		Push-Location $frontendPath
		try {
			return Invoke-E2EProcess -Command 'bunx' -Arguments @('playwright', 'test', '--config=playwright.integrated.config.ts')
		} finally {
			Pop-Location
		}
	} -Cleanup {
		if (-not $composeAttempted.Value) {
			return [pscustomobject]@{ Success = $true; Errors = @(); CapturedVolumeNames = @() }
		}
		Invoke-IntegratedE2ECleanup -ComposeFile $composeFile -ProjectName $projectName -IdentityVerified $projectIdentityVerified
	}
} finally {
	foreach ($name in $environmentNames) {
		[Environment]::SetEnvironmentVariable($name, $previousEnvironment[$name], 'Process')
	}
}

if ($runResult.WorkError) { Write-Host "E2E execution failed: $($runResult.WorkError)" }
if ($runResult.CleanupError) { Write-Warning "E2E cleanup failed independently: $($runResult.CleanupError)" }
if ($runResult.ExitCode -eq 0) {
	Write-Host "E2E completed and Compose cleanup was verified. Diagnostics remain at '$e2eTempRoot'."
}
exit $runResult.ExitCode
