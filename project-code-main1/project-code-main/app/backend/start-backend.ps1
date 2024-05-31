param ($appenv = 'production', [switch]$build, [switch]$noauth)

Set-Item -Path "env:\APP_ENV" -Value $appenv
if ($noauth) {
  Set-Item -Path "env:\APP_AUTH_TYPE" -Value "NONE"
}

function Get-PythonVenvPath {
  if (-Not (Test-Path -Path "/usr")) { # Windows
    ".venv/scripts/python.exe"
  } else { # Linux
    ".venv/bin/python"
  }
}

# === Set BACKEND_PORT Environment Variable ===
if ($uid -ne $null) {
    Write-Host "Setting BACKEND_PORT environment variable..."
    $env:BACKEND_PORT = $uid
} else {
    $env:BACKEND_PORT = 24858
}


# === BACKEND ===
$backendVenvPythonPath = Get-PythonVenvPath
if ($build) {
  Write-Host ""
  Write-Host "Initialising app/backend ..."

  Write-Host '> Creating python 3.10 virtual environment at backend/.venv ...'
  $pythonCmd = Get-Command 'python3.10' -ErrorAction SilentlyContinue
  if (-not $pythonCmd) {
    $pythonCmd = Get-Command python3
  }
  Start-Process -FilePath ($pythonCmd).Source -ArgumentList "-m venv --upgrade-deps .venv" -Wait -NoNewWindow

  Write-Host "> Installing python packages for backend ..."
  Start-Process -FilePath $backendVenvPythonPath -ArgumentList "-m pip install -r requirements.txt" -Wait -NoNewWindow
  if ($LASTEXITCODE -ne 0) {
    Write-Host "> Failed to restore backend python packages"
    exit $LASTEXITCODE
  }

  Write-Host '> Successfully installed python packages for backend:'
  Start-Process -FilePath $backendVenvPythonPath -ArgumentList "-m pip freeze" -Wait -NoNewWindow

  Write-Host 'Successfully initialised app/backend'
}

Write-Host ""
Write-Host "Starting backend"
Write-Host ""
Start-Process http://localhost:$env:BACKEND_PORT

Start-Process -FilePath $backendVenvPythonPath -ArgumentList "-m main" -Wait -NoNewWindow

if ($LASTEXITCODE -ne 0) {
  Write-Host "Failed to start backend"
  exit $LASTEXITCODE
}
