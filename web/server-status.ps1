$conn = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($conn) {
  Write-Host "Server is RUNNING on http://localhost:5173 (PID $($conn.OwningProcess))"
} else {
  Write-Host "Server is NOT running"
}
