from flask_httpauth import HTTPBasicAuth
from config import APP_AUTH_TYPE, APP_BASIC_AUTH_PASSWORD

user = {
    "groupuser": {}
}

auth = None

if APP_AUTH_TYPE == "BASIC":
    auth = HTTPBasicAuth()

    @auth.verify_password
    def verify_password(username, password):
        if username in user and password == APP_BASIC_AUTH_PASSWORD:
            return True
        return False