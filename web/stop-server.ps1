$conn = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($conn) {
  Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
  Write-Host "Stopped server (PID $($conn.OwningProcess))"
} else {
  Write-Host "No server running on port 5173"
}
