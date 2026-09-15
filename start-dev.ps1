<#
.SYNOPSIS
Starts the PostgreSQL/backend Compose stack and the Next.js development server.

.DESCRIPTION
The backend runs detached through Docker Compose. The frontend stays in this
terminal so its development logs and Ctrl+C behavior remain visible.
#>

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Push-Location $projectRoot
try {
    docker compose up -d --build
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose could not start the backend services."
    }
} finally {
    Pop-Location
}

Write-Host "Backend:  http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Press Ctrl+C to stop the frontend. Backend containers stay running."

Push-Location (Join-Path $projectRoot "frontend")
try {
    npm run dev
} finally {
    Pop-Location
}
