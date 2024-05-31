from domain.model import Team_Node, Player_Node
from SPARQLWrapper import SPARQLWrapper, JSON
import re

# Utility function to extract a year from a string
def is_valid_year(year_string):
    # Use regular expression to match 4 consecutive digits which we assume to represent a year.
    match = re.search(r'\b(\d{4})\b', year_string)
    # If a match is found, return the year as an integer; otherwise, return None.
    return int(match.group(1)) if match else None

# Function to query a SPARQL endpoint for players in a Team_Node, paginated by batch size
def searchTeamplayers(team_id, batch_size=500):
    offset = 0  # Initialize the offset for pagination
    
    # Set up the SPARQL endpoint
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    
    all_players = []  # List to store all players
    processed_ids = set()  # Set to keep track of already processed player IDs

    # Continue querying in a loop until there are no more results
    while True:
        # SPARQL query to retrieve player information, paginated by batch_size and offset
        base_query = f"""
            SELECT ?item ?itemLabel ?nationalityLabel ?startYear ?endYear
            WHERE {{
                ?item p:P54 ?teamMembership .
                ?teamMembership ps:P54 wd:{team_id} .
                OPTIONAL {{?item wdt:P1532 ?nationality.}}
                OPTIONAL {{
                    ?teamMembership pq:P580 ?startYear.
                    ?teamMembership pq:P582 ?endYear.
                }}
                SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
            }}
            LIMIT {batch_size} OFFSET {offset}
            """
        
        # Execute the query and retrieve the results in JSON format
        sparql.setQuery(base_query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()

        # If no results are returned, exit the loop
        if not results["results"]["bindings"]:
            break

        # Process each result in the current batch
        for result in results["results"]["bindings"]:
            # Extract the Q-identifier for the player
            player_id = result['item']['value'].split('/')[-1]
            
            # Skip already processed players to avoid duplicates
            if player_id in processed_ids:
                continue
            processed_ids.add(player_id)
            
            # Get the player's nationality if available
            nationality = result['nationalityLabel']['value'] if 'nationalityLabel' in result else ''
            
            # Validate and extract start and end years, if available
            start_year = is_valid_year(result['startYear']['value']) if 'startYear' in result else None
            end_year = is_valid_year(result['endYear']['value']) if 'endYear' in result else None
            
            # Create a list of years the player has played
            if start_year and end_year:
                years_played = list(range(start_year, end_year + 1))
            else:
                years_played = []

            # Construct player data using the Player model
            player_data = {
                "id": player_id,
                "name": result['itemLabel']['value'],
                "team": "wd:" + team_id,
                "country": nationality,
                "years_played": years_played
            }
            player = Player_Node(**player_data)
            
            # Add the player object to the list of all players
            all_players.append(player)

        # Increase the offset for the next batch
        offset += batch_size

    # Return the complete list of player objects
    return all_players

# Function to create a Team object with its associated players, optionally filtered by a specific year
def create_team_with_players(team_id: str, team_name: str, year: int = None) -> Team_Node:
    # Retrieve all players for the team
    players_list = searchTeamplayers(team_id)
    
    # If a year is specified, filter players to include only those who played in that year
    if year:
        players_list = [player for player in players_list if year in player.years_played]
    
    # Create a Team object with the filtered list of players
    team = Team_Node(id=team_id, name=team_name, players=players_list)
    return team