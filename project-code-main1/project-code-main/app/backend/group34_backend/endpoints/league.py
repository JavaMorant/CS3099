import sqlite3
from json import dumps
from flask_app import app
from flask_openapi3 import Tag
from auth.auth import protected
from domain.model import LeagueFilter, Leagues, ErrorResponse
from services.stadium_service import check_countries

leagues_tag = Tag(name="leagues", description="Retrieving league data")


@protected
@app.get('/api/leagues', responses={'200': Leagues, '400': ErrorResponse}, tags=[leagues_tag], description="Retrieves list of leagues")
def get_leagues(query: LeagueFilter) -> Leagues or ErrorResponse:
    # Connect to database file
    conn = sqlite3.connect('group34_backend/database/stadiums.db', isolation_level=None)
    cursor = conn.cursor()

    # Execute query with selected leagues, or for all leagues
    if query.countries:
        # Check countries are all valid
        result = check_countries(query.countries)
        if type(result) == ErrorResponse:
            return result.dict()
        
        rows = cursor.execute(f"SELECT * FROM league WHERE country in ({','.join(['?'] * len(query.countries))})", query.countries).fetchall()
    else:
        # Select all leagues
        rows = cursor.execute("SELECT * FROM league;").fetchall()
    
    # Loop through data extracting what we need to result
    result = []
    for item in rows:
        league_id = item[0]
        league_label = item[1]
        league_country = item[2]

        result.append({
            "league_id": league_id,
            "league": league_label,
            "country": league_country
        })

    # Close connection
    cursor.close()
    conn.close()

    return dumps({"leagues": result}, ensure_ascii=False)
