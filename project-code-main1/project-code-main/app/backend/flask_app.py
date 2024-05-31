from datetime import timedelta
from flask_session import Session
from flask_cors import CORS
from flask_openapi3 import OpenAPI, Info
from tempfile import mkdtemp

import os

app = OpenAPI(
    import_name=__name__,
    info=Info(
        title='Sport Supergroup Backend',
        description='Backend for the Sport Supergroup project',
        version='0.0.1',
    ),
)

CORS(
    app,
    resources={
        r'/*': {'origins': [f'http://localhost:{os.getuid()}', 'http://localhost']}},
    supports_credentials=True,
)

app.config.update(
    SECRET_KEY='1e1980a4c56a60eaddac09310a69075d7ec2a25e',
    SESSION_TYPE='filesystem',
    SESSION_FILE_DIR=mkdtemp(prefix='flask_session_'),
    PERMANENT_SESSION_LIFETIME=timedelta(hours=24),
    SESSION_FILE_THRESHOLD=5000,
)

Session(app)
