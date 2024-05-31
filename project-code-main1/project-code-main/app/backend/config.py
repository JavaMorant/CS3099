# File for storing global configuration variables

import os

# Access environment variables set in the build process, see README.md or start.ps1/start.sh
APP_ENV = os.environ.get('APP_ENV') or "development"
APP_AUTH_TYPE = os.environ.get('APP_AUTH_TYPE') or "BASIC"

# Basic auth password
APP_BASIC_AUTH_PASSWORD = os.environ.get('APP_BASIC_AUTH_PASSWORD') or "groupuser"