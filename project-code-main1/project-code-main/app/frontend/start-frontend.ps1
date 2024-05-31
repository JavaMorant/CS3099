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

Write-Host ""
Write-Host "Initialising app/frontend ..."

Write-Host "> Installing frontend npm packages ..."

npm install
if ($LASTEXITCODE -ne 0) {
Write-Host "> Failed to restore frontend npm packages"
exit $LASTEXITCODE
}

Write-Host "> Building frontend ..."
npm run dev:full 

if ($LASTEXITCODE -ne 0) {
Write-Host "> Failed to build frontend"
exit $LASTEXITCODE
}
Write-Host "> Successfully built frontend"

Write-Host "Successfully initialised app/frontend"