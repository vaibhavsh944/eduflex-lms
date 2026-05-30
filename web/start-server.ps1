$log = Join-Path $PSScriptRoot "vite-persistent.log"
$webRoot = $PSScriptRoot

$existing = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Server already running on port 5173 (PID $($existing.OwningProcess))"
  exit 0
}

Write-Host "Starting Vite dev server in background..."
Write-Host "Log: $log"

$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = "powershell.exe"
$startInfo.Arguments = "-NoProfile -Command Set-Location '$webRoot'; npm run dev *> '$log'"
$startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$startInfo.CreateNoWindow = $true
$startInfo.UseShellExecute = $false

$proc = [System.Diagnostics.Process]::Start($startInfo)
Write-Host "Server starting... (background PID: $($proc.Id))"
Start-Sleep -Seconds 4

$check = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($check) {
  Write-Host "Server is running on http://localhost:5173 (PID $($check.OwningProcess))"
} else {
  Write-Host "Waiting for server... (check log for details)"
}
