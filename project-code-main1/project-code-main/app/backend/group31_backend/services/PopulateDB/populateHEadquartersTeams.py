from SPARQLWrapper import SPARQLWrapper, JSON
import sqlite3

def get_headquarters_coordinates_by_team_ids(team_ids: list) -> list:
    """
    Fetches the coordinates of headquarters (home venue) for a list of team IDs from Wikidata.
    
    Parameters:
        team_ids (list): A list of team IDs (Wikidata Q-identifiers).
    
    Returns:
        list: A list of tuples (team ID, coordinates as a (latitude, longitude) tuple).
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.setReturnFormat(JSON)
    
    # Construct a VALUES clause for filtering by the given team IDs
    values_clause = "VALUES ?team { " + " ".join([f"wd:{team_id}" for team_id in team_ids]) + " }"
    
    query = f"""
    SELECT
        ?team
        (SUBSTR(STR(?team), STRLEN("http://www.wikidata.org/entity/") + 1) AS ?teamQ)
        ?coordinates
    WHERE {{
        {values_clause}
        ?venue wdt:P625 ?coordinates.
    }}
    """
    
    sparql.setQuery(query)
    results = sparql.query().convert()
    
    team_headquarters_coordinates = []
    for result in results["results"]["bindings"]:
        team_id = result["teamQ"]["value"]
        coordinates = result["coordinates"]["value"]
        # Parsing the coordinates string to extract latitude and longitude
        lat, lon = map(float, coordinates.strip('Point(').rstrip(')').split(' '))
        team_headquarters_coordinates.append((team_id, (lat, lon)))
    
    return team_headquarters_coordinates


def update_headquarters_in_db(database_path: str):
    # Connect to the SQLite Database
    try:
        conn = sqlite3.connect(database_path)
        cursor = conn.cursor()
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        return

    # Fetch Team IDs from the Database where headquarters is NULL or empty
    try:
        cursor.execute("SELECT teamId FROM Teams WHERE IFNULL(headquarters, '') = ''")
        team_ids = [row[0] for row in cursor.fetchall()]
        print(team_ids)
    except sqlite3.Error as e:
        print(f"Error fetching team IDs: {e}")
        conn.close()
        return

    for team_id in team_ids:
        try:
            team_headquarters_coordinates = get_headquarters_coordinates_by_team_ids([team_id])
            if team_headquarters_coordinates:
                for _, coordinates in team_headquarters_coordinates:
                    coordinates_str = f"{coordinates[0]}, {coordinates[1]}"
                    print(coordinates_str)
                    cursor.execute("UPDATE Teams SET headquarters = ? WHERE teamId = ?", (coordinates_str, team_id))
                conn.commit()
        except Exception as e:
            print(f"An error occurred for team ID {team_id}: {e}")

    conn.close()
    print("Headquarters coordinates update process completed for teams with missing headquarters information.")
# Specify the path to your database
database_path = 'project-code/app/backend/group31_backend/database/Database31HardCodedV3.db'
update_headquarters_in_db(database_path)



