import sqlite3
from json import dumps
from flask_app import app
from flask_openapi3 import Tag
from auth.auth import protected
from domain.model import Countries, ErrorResponse

countries_tag = Tag(name="countries", description="Retrieving the list of countries")


@protected
@app.get('/api/countries', responses={'200': Countries, '400': ErrorResponse}, tags=[countries_tag], description="Retrieves list of countries")
def get_countries() -> Countries or ErrorResponse:
    # Connect to database file
    conn = sqlite3.connect('group34_backend/database/stadiums.db', isolation_level=None)
    cursor = conn.cursor()

    # Execute query to select all countries
    rows = cursor.execute("SELECT DISTINCT country FROM league;").fetchall()
    
    # Loop through data and add to list
    result = []
    for item in rows:
        result.append(item[0])

    # Close connection
    cursor.close()
    conn.close()

    return dumps({"countries": result}, ensure_ascii=False)
