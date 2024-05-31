import sqlite3
from re import findall
from domain.model import ErrorResponse, StadiumFilter, StadiumForm


def build_stadiums_query(query: StadiumFilter) -> str:
    sql_query = "SELECT team.ID, team.name, league.id, league.country, stadium.name, stadium.lat, stadium.lng, stadium.capacity, stadium.year, stadium.image_url, stadium.location_desc FROM team, stadium, league WHERE team.stadium_ID = stadium.ID AND team.league_ID = league.ID"
    params = []

    # Add optional filter condition for countries
    if query.countries:
        sql_query += " AND ("
        for i, country in enumerate(query.countries):
            if i > 0:
                sql_query += " OR"
            sql_query += f" league.country = ?"
            params.append(country)
        sql_query += ")"

    # Add optional filter conditions for capacity
    if query.min_capacity:
        sql_query += f" AND stadium.capacity >= {query.min_capacity}"
    if query.max_capacity:
        sql_query += f" AND stadium.capacity <= {query.max_capacity}"

    # Closing semicolon of the query
    sql_query += ";"

    return sql_query, params


def parse_coordinates(coord_str: str) -> dict or None:
    # Parse coordinates from Point(lng, lat) which is what Wikidata returns
    match = findall(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", coord_str)
    if match:
        return {
            'lat': float(match[1]),
            'lng': float(match[0])
        }
    return None


def parse_id(id_str: str) -> str or None:
    # Parse unique identifier from Wikidata link
    match = findall(r'/Q(\d+)', id_str)
    if match:
        return "Q" + match[0]
    return None


def insert_data(body: StadiumForm) -> int or ErrorResponse:
    # Connect to database file
    conn = sqlite3.connect(
        'group34_backend/database/stadiums.db', isolation_level=None)
    cursor = conn.cursor()

    # Execute a query to check if the league ID exists in the table
    cursor.execute("SELECT COUNT(*) FROM league WHERE ID = ?", (body.league,))
    result = cursor.fetchone()[0]

    if result == 0:
        return ErrorResponse(error="League not in database.")

    # Execute a query to check if the coordinates already exist in the table
    cursor.execute("SELECT COUNT(*) FROM stadium WHERE lat = ? AND lng = ?",
                   (body.coordinates.lat, body.coordinates.lng))
    result = cursor.fetchone()[0]

    if result != 0:
        return ErrorResponse(error="Coordinates already in database.")

    # Get an ID we can use to insert a new stadium
    cursor.execute(
        "SELECT COALESCE(MAX(CAST(ID AS INTEGER)), 0) + 1 FROM stadium;")
    stadium_id = int(cursor.fetchone()[0])

    # Get an ID we can use to insert a new team
    cursor.execute(
        "SELECT COALESCE(MAX(CAST(ID AS INTEGER)), 0) + 1 FROM team;")
    team_id = int(cursor.fetchone()[0])

    # Insert new stadium
    query = "INSERT INTO stadium VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
    cursor.execute(query, (stadium_id, body.stadium_name, body.capacity,
                   body.coordinates.lat, body.coordinates.lng, body.year, "", ""))

    # Insert new team
    query = "INSERT INTO team VALUES (?, ?, ?, ?);"
    cursor.execute(query, (team_id, body.team_name, body.league, stadium_id))

    # Close connection
    cursor.close()
    conn.close()

    # Return the ID of the new stadium inserted
    return stadium_id


def check_countries(countries: list[str]) -> ErrorResponse or None:
    # Connect to database file
    conn = sqlite3.connect(
        'group34_backend/database/stadiums.db', isolation_level=None)
    cursor = conn.cursor()
    for country in countries:
        # Execute a query to check if the country exists in the table
        cursor.execute(
            "SELECT COUNT(*) FROM league WHERE country = ?", (country,))
        result = cursor.fetchone()[0]
        if result == 0:
            return ErrorResponse(error=f"No such country: '{country}'.")
