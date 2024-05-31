import os

# from ayd_backend.flask_app import app
from config import APP_ENV

from app import app
# https://github.com/pallets/werkzeug/blob/main/docs/routing.rst
from werkzeug.routing import Rule
# https://luolingchun.github.io/flask-openapi3/v2.x/
from flask_openapi3 import OpenAPI


from utils.iterutils import one


def print_endpoints_served(application: OpenAPI) -> None:
    def main_method(rule: Rule) -> str:
        return one(m for m in rule.methods if m not in ('HEAD', 'OPTIONS'))

    endpoints = sorted((r.rule, main_method(r))
                       for r in application.url_map.iter_rules())

    print('Serving the following endpoints:')
    for address, method in endpoints:
        print(f'- {method:6} {address}')


if __name__ == "__main__":
    is_development = (APP_ENV == 'development')

    if is_development:
        print_endpoints_served(app)

    backend_port = os.getuid()
    # if backend port is not set, use default port 5000
    if backend_port == 0:
        backend_port = 24858

    app.run(debug=is_development, port=backend_port)
