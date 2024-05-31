#!/bin/sh

# exit on any failed command
set -e

appenv='production'
build=0
noauth=0

while getopts 'bnd' opt; do
  case "${opt}" in
  b) build=1 ;;
  n) noauth=1 ;;
  d) appenv='development' ;;
  *)
    echo "Invalid option: -${OPTARG}, Use flag options -b (build), -n (noauth), -d (development)" >&2
    exit 1
    ;;
  esac
done

export APP_ENV=$appenv
if [ $noauth -eq 1 ]; then
  export APP_AUTH_TYPE="NONE"
fi

# === FRONTEND ===
echo ""
echo "Initialising app/frontend ..."
npm install
echo "> Building frontend ..."

# Set environment variable for Vite
export VITE_BACKEND_PORT=$(python3 -c 'import os; print(os.getuid())')

npm run dev:full
echo "> Successfully built frontend"
echo "Successfully initialised app/frontend"
