import sqlite3
from json import dumps
from flask_app import app
from flask_openapi3 import Tag
from auth.auth import protected
from services.stadium_service import build_stadiums_query, insert_data
from domain.model import StadiumForm, StadiumFormResponse, Stadiums, StadiumFilter, ErrorResponse

stadiums_tag = Tag(name="query_endpoint", description="Querying DB")

@protected
@app.get('/api/stadiums', responses={'200': Stadiums, '400': ErrorResponse}, tags=[stadiums_tag], description="Retrieves list of stadiums with optional filtering")
def get_stadiums(query: StadiumFilter) -> Stadiums or ErrorResponse:
    stadiums_query, params = build_stadiums_query(query)

    # Connect to database file
    conn = sqlite3.connect('group34_backend/database/stadiums.db', isolation_level=None)
    conn.row_factory = sqlite3.Row # Allows field name to be used as key, but not if two fields of same name from different tables.
    cursor = conn.cursor()

    rows = cursor.execute(stadiums_query, params).fetchall()

    # Loop through data extracting what we need to result
    result = []
    existing_stadiums = set()
    for item in rows:
        team_id = item[0]
        team_label = item[1]
        league_id = item[2]
        country = item[3]
        stadium_label = item[4]
        coordinates = {
            'lat': item[5],
            'lng': item[6]
        }
        capacity = item[7]
        year = item['year']
        image_url = item['image_url']
        location_desc = item['location_desc']


        # If either team or stadium already exists, skip
        if (team_label, stadium_label) in existing_stadiums:
            continue

        result.append({
            "team_id": team_id,
            "team": team_label,
            "league_id": league_id,
            "name": stadium_label,
            "coordinates": coordinates,
            "capacity": capacity,
            "country": country,
            "year": year,
            "image_url": image_url,
            "location_desc": location_desc
        })

        # Add to set of existing stadiums to avoid duplicates
        existing_stadiums.add((team_label, stadium_label))

    # Close connection
    cursor.close()
    conn.close()

    return dumps({"stadiums": result}, ensure_ascii=False)


@protected
@app.post('/api/stadiums', responses={'200': StadiumFormResponse, '400': ErrorResponse}, tags=[stadiums_tag], description="Inserts given data in to the database")
def insert_stadiums(body: StadiumForm) -> StadiumFormResponse or ErrorResponse:
    result = insert_data(body)
    if type(result) == ErrorResponse:
        return result.dict(), 400
    
    return {"stadium_id": result}
