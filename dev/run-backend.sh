#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
backend_path="${1:-$script_dir/../../ApartmentBooking/ApartmentBooking}"

if [ ! -d "$backend_path" ]; then
  echo "Backend project not found: $backend_path" >&2
  exit 1
fi

if ! command -v dotnet >/dev/null 2>&1; then
  echo "dotnet not found. Install .NET 10 SDK: brew install --cask dotnet-sdk" >&2
  exit 1
fi

export ASPNETCORE_ENVIRONMENT=Development
export ConnectionStrings__Default='Host=localhost;Port=5433;Database=apartment_booking;Username=postgres;Password=postgres'
export Authentication__Authority='http://localhost:8081/realms/apartment-booking'

local_env="$script_dir/backend.env"
if [ -f "$local_env" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*[^#[:space:]][^=]*= ]] || continue
    name="${line%%=*}"
    value="${line#*=}"
    name="$(echo "$name" | xargs)"
    value="$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    export "$name=$value"
  done < "$local_env"
fi

exec dotnet run --project "$(cd "$backend_path" && pwd)" --launch-profile http
