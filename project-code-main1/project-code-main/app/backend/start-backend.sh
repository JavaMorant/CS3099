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
    *) echo "Invalid option: -${OPTARG}, Use flag options -b (build), -n (noauth), -d (development)" >&2
       exit 1 ;;
  esac
done

export APP_ENV=$appenv
if [ $noauth -eq 1 ]; then
    export APP_AUTH_TYPE="NONE"
fi

if [ $build -eq 1 ]; then
    # === BACKEND ===
    echo ""
    echo "Initialising app/backend ..."
    echo "> Creating python 3 virtual environment at backend/.venv ..."
    python3 -m venv --upgrade-deps .venv
    . ./.venv/bin/activate
    echo "> Installing python packages for backend ..."
    pip3 install -r requirements.txt
    echo "> Successfully installed python packages for backend:"
    pip3 freeze
    echo "Successfully initialised app/backend"
    deactivate
fi

echo ""
echo "Starting backend"
echo ""
.venv/bin/python3 -m main
