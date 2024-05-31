import sqlite3
from domain.model import ErrorResponse
from services.stadium_service import parse_coordinates, parse_id
from services.wikidata_service import execute_sparql_query


def gather_results():
    # Selects all UK association football stadiums, teams, and leagues
    query = """
    SELECT ?team ?teamLabel ?league ?leagueLabel ?leagueCountryLabel ?stadium ?stadiumLabel ?coordinates ?capacity (YEAR(?opened) AS ?openedYear) ?image_url ?locationLabel ?locationDescription
        WHERE {
        ?team wdt:P31/wdt:P279* wd:Q476028.   # Teams that are instances of football clubs
        ?team wdt:P118 ?league.                # League
        ?league wdt:P17 ?leagueCountry.         # League country
        ?team wdt:P115 ?stadium.               # Has home stadium
        ?stadium wdt:P625 ?coordinates.        # Stadium coordinates
        ?stadium wdt:P1083 ?capacity.          # Capacity
        OPTIONAL { ?stadium wdt:P571 ?opened. } # Date the stadium was opened
        OPTIONAL { ?stadium wdt:P18 ?image_url. } # Image URL
        ?stadium wdt:P131 ?location.       # Stadium location

        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
    """

    response = execute_sparql_query(query)

    # Loop through data extracting what we need to result
    result = []
    existing_stadiums = set()
    for item in response:
        team_id = parse_id(item['team']['value'])
        team_label = item['teamLabel']['value']
        league_id = parse_id(item['league']['value'])
        league_label = item['leagueLabel']['value']
        league_country = item['leagueCountryLabel']['value']
        stadium_id = parse_id(item['stadium']['value'])
        stadium_label = item['stadiumLabel']['value']
        coordinates = parse_coordinates(item['coordinates']['value'])
        if not coordinates:
            return ErrorResponse(error="Could not retrieve coordinates from Wikidata").dict(), 400
        capacity = item['capacity']['value']
        try:
            year = int(item['openedYear']['value'])
        except:
            year = ""
        try:
            image_url = item['image_url']['value']
        except:
            image_url = ""
        try:
            location_desc = item['locationLabel']['value'] + " (" + item['locationDescription']['value'] + ")."
        except:
            location_desc = "unknown"

        # If either team or stadium already exists, skip
        if (team_label, stadium_label) in existing_stadiums:
            continue

        result.append({
            "team_id": team_id,
            "team": team_label,
            "league_id": league_id,
            "league": league_label,
            "country": league_country,
            "stadium_id": stadium_id,
            "name": stadium_label,
            "coordinates": coordinates,
            "capacity": capacity,
            "year": year,
            "image_url": image_url,
            "location_desc": location_desc
        })

        # Add to set of existing stadiums to avoid duplicates
        existing_stadiums.add((team_label, stadium_label))

    return result


def insert_data(results):
    # Connect to database file
    conn = sqlite3.connect('group34_backend/database/stadiums.db', isolation_level=None)
    cursor = conn.cursor()

    # Delete existing outdated records
    cursor.execute("DELETE FROM team;")
    cursor.execute("DELETE FROM league;")
    cursor.execute("DELETE FROM stadium;")

    # Keep track of what has already been inserted to avoid duplicates
    leagues = []
    stadiums = []
    teams = []
    
    # Loop through results and insert data into each table
    for item in results:
        if item['league_id'] not in leagues:
            query = "INSERT INTO league VALUES (?, ?, ?);"
            cursor.execute(query, (item['league_id'], item['league'], item['country']))
        leagues.append(item['league_id'])
        
        if item['stadium_id'] not in stadiums:
            query = "INSERT INTO stadium VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
            cursor.execute(query, (item['stadium_id'], item['name'], item['capacity'], item['coordinates']['lat'], item['coordinates']['lng'], item['year'], item['image_url'], item['location_desc']))
        stadiums.append(item['stadium_id'])

        if item['team_id'] not in teams:
            query = "INSERT INTO team VALUES (?, ?, ?, ?);"
            cursor.execute(query, (item['team_id'], item['team'], item['league_id'], item['stadium_id']))
        teams.append(item['team_id'])

    # Close connection
    cursor.close()
    conn.close()
