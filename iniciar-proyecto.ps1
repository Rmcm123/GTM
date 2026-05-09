param(
  [switch]$Instalar
)

$ErrorActionPreference = "Stop"

function Probar-Comando($nombre) {
  if (-not (Get-Command $nombre -ErrorAction SilentlyContinue)) {
    throw "No se encontro '$nombre'. Instala Node.js y vuelve a intentar."
  }
}

$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $raiz "gtm"
$frontend = Join-Path $backend "frontend"
$envPath = Join-Path $backend ".env"
$envExamplePath = Join-Path $backend ".env.example"

Probar-Comando "node"
Probar-Comando "npm.cmd"

if (-not (Test-Path $backend)) {
  throw "No se encontro la carpeta del backend: $backend"
}

if (-not (Test-Path $frontend)) {
  throw "No se encontro la carpeta del frontend: $frontend"
}

if (-not (Test-Path $envPath)) {
  if (Test-Path $envExamplePath) {
    Copy-Item $envExamplePath $envPath
    Write-Host "Se creo gtm\.env desde gtm\.env.example. Revisa usuario, clave y base de datos PostgreSQL." -ForegroundColor Yellow
  } else {
    Write-Host "No existe gtm\.env. Crea ese archivo antes de iniciar el backend." -ForegroundColor Yellow
  }
}

if ($Instalar -or -not (Test-Path (Join-Path $backend "node_modules"))) {
  Write-Host "Instalando dependencias del backend..." -ForegroundColor Cyan
  Push-Location $backend
  npm.cmd install
  Pop-Location
}

if ($Instalar -or -not (Test-Path (Join-Path $frontend "node_modules"))) {
  Write-Host "Instalando dependencias del frontend..." -ForegroundColor Cyan
  Push-Location $frontend
  npm.cmd install
  Pop-Location
}

Write-Host "Iniciando backend en http://localhost:3000" -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy",
  "Bypass",
  "-Command",
  "Set-Location '$backend'; npm.cmd run start:dev"
)

Write-Host "Iniciando frontend en http://localhost:5173" -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy",
  "Bypass",
  "-Command",
  "Set-Location '$frontend'; npm.cmd run dev"
)

Write-Host ""
Write-Host "Proyecto iniciado." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:3000"
Write-Host ""
Write-Host "Nota: PostgreSQL debe estar iniciado y la base configurada en gtm\.env."
