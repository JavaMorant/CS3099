from flask_app import app
from flask_openapi3 import Tag
from auth.auth import protected
from domain.model import ErrorLog

logging_tag = Tag(name="logging", description="Logging messages")

@app.post('/api/logging', tags=[logging_tag])
def log_message(body: ErrorLog):
    app.logger.error(body.error)
    if body.component_stack:
        app.logger.info(body.component_stack)
    return '', 200