# PowerShell script to sync .env.local from credentials folder
# Run: .\sync-env.ps1

$SourcePath = "..\credentials\.env.local"
$DestPath = ".env.local"

if (Test-Path $SourcePath) {
    Copy-Item $SourcePath $DestPath -Force
    Write-Host "✅ Copied .env.local from credentials folder" -ForegroundColor Green
    Write-Host "Source: $SourcePath" -ForegroundColor Gray
    Write-Host "Destination: $DestPath" -ForegroundColor Gray
} else {
    Write-Host "❌ Source file not found: $SourcePath" -ForegroundColor Red
    Write-Host "Please check that the credentials/.env.local file exists." -ForegroundColor Yellow
}

