param(
  [string]$BackendPath = (Join-Path $PSScriptRoot '..\..\ApartmentBooking\ApartmentBooking')
)

$ErrorActionPreference = 'Stop'

$project = Resolve-Path $BackendPath

$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:ConnectionStrings__Default = 'Host=localhost;Port=5433;Database=apartment_booking;Username=postgres;Password=postgres'
$env:Authentication__Authority = 'http://localhost:8081/realms/apartment-booking'

$localEnv = Join-Path $PSScriptRoot 'backend.env'
if (Test-Path $localEnv) {
  Get-Content $localEnv | Where-Object { $_ -match '^\s*[^#\s][^=]*=' } | ForEach-Object {
    $name, $value = $_ -split '=', 2
    Set-Item -Path "env:$($name.Trim())" -Value $value.Trim()
  }
}

dotnet run --project $project --launch-profile http
