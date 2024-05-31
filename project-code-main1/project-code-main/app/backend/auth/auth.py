from flask import redirect
import werkzeug
from auth.basic import auth
from config import APP_AUTH_TYPE
from flask_app import app


"""Class for unauthorized access
"""
class Unauthorized(werkzeug.exceptions.HTTPException):
    code = 403
    description = "You are not authorized to access this page."


"""Handle unauthorized access
"""
@app.errorhandler(werkzeug.exceptions.BadRequest)
def handle_unauthorized(e):
    return redirect('/unauthorized')


"""Initialize authentication
"""
def initAuth():
    app.register_error_handler(Unauthorized, handle_unauthorized)
    

"""Make an API endpoint protected
"""
def protected(f):
    if APP_AUTH_TYPE == 'NONE':
        return f
    
    if APP_AUTH_TYPE == 'BASIC':
        return auth.login_required(f)
