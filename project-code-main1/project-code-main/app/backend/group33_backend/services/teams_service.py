"""
This module provides functions to retrieve information about Premier League teams from different sources.
"""

from domain.model import TeamGroup33, TeamWithPlayers
from group33_backend.services.connection_service import getWikipediaUrlById, checkConnection
from SPARQLWrapper import SPARQLWrapper, JSON
from bs4 import BeautifulSoup
import requests
from typing import Optional
import sqlite3

def getTeamsLogoById(team_id: str) -> Optional[str]:
    """
    Get a team's logo by its Q-number

    Args:
        team_id (str): Team's Q-number
        
    Returns:
        str: Team's logo URL
    """
    wikipedia_url = getWikipediaUrlById(team_id)
    if wikipedia_url is None:
        return None
    print(wikipedia_url)
    try:
        wikipedia_page = requests.get(wikipedia_url, timeout=5)  # 5 seconds timeout
    except:
        print("The request timed out")
        return None
    if (wikipedia_page.status_code == 200):
        soup = None
        try:
            soup = BeautifulSoup(wikipedia_page.content, 'html.parser')
            logo_url = soup.find('table', class_='infobox vcard').find('td', class_='infobox-image').find('img', class_='mw-file-element')['src']
        except:
            return None
        return "https:" + logo_url
    else:
        return None

# import players_service now to avoid circular imports
from group33_backend.services.players_service import getTeamPlayersById_database
def getUKTeams_wikidata() -> list[TeamGroup33]:
    """
    Get all teams in the UK and their Q-numbers from wikidata
    
    Returns:
        list[Team]: List of teams
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.setReturnFormat(JSON)
    offset = 0  # Initialize the offset to 0
    batch_size = 100  # Set your desired batch size
    teams = []
    while True:
        query = f"""
        SELECT
            # Get the team's Wikidata ID
            ?team
            # Extract the actual ID part from the team's Wikidata ID
            (SUBSTR(STR(?team), STRLEN("http://www.wikidata.org/entity/")+1) as ?teamQ)
            # Get the team's label
            ?teamLabel
        WHERE {{
        # Filter for teams that are in the Premier League (Q9448) and are instances of a football club (Q476028)
        ?team   wdt:P17 wd:Q145;      # P17 is the property for "country," Q145 is the item for "United Kingdom"
                wdt:P31 wd:Q476028.   # P31 is the property for "instance of," Q476028 is the item for "football club"
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
        }}
        # Skip the first offset results
        OFFSET {offset}
        # Limit the number of results to batch_size
        LIMIT {batch_size}
        """
        sparql.setQuery(query)
        results = sparql.query().convert()

        if not results["results"]["bindings"]:
            break

        for binding in results["results"]["bindings"]:
            team_id = binding.get("teamQ", {}).get("value", "N/A")
            image_url = getTeamsLogoById(team_id)
            if image_url is None:
                continue
            teamLabel = binding.get("teamLabel", {}).get("value", "N/A")
            teams.append(TeamGroup33(id=team_id, name=teamLabel, image_url=image_url))
        #time.sleep(0.001)
        offset += batch_size  # Increment the offset by your batch size
    return teams

def getTeams_database() -> list[TeamGroup33]:
    """
    Get all teams from the database

    Returns:
        list[Team]: List of teams
    """
    connection = sqlite3.connect('group33_backend/Database.db')
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM Teams")
    teams = []
    for row in cursor.fetchall():
        teams.append(TeamGroup33(id=row[0], name=row[1], image_url=row[2]))
    connection.close()
    return teams

def getTeamWithPlayersById_database(team_id: str) ->  Optional[TeamWithPlayers]:
    """
    Get a team with its players by its Q-number from the database

    Args:
        team_id (str): Team's Q-number

    Returns:
        TeamWithPlayers | None: Team with its players
    """
    connection = sqlite3.connect('group33_backend/Database.db')
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM Teams WHERE teamId=?", (team_id,))
    row = cursor.fetchone()
    if row is None:
        return None
    team = TeamGroup33(id=row[0], name=row[1], image_url=row[2])
    connection.close()
    return TeamWithPlayers(team=team, players=getTeamPlayersById_database(team_id))

@DeprecationWarning
def getPremierLeagueTeams_wikidata() -> list[TeamGroup33]:
    """
    Get all teams in the Premier League (Q9448) and their Q-numbers from wikidata

    Returns:
        list[Team]: List of teams
    """
    if not checkConnection():
        return []
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.setReturnFormat(JSON)
    offset = 0  # Initialize the offset to 0
    batch_size = 100  # Set your desired batch size
    teams = []
    while True:
        query = f"""
        SELECT
            # Get the team's Wikidata ID
            ?team
            # Extract the actual ID part from the team's Wikidata ID
            (SUBSTR(STR(?team), STRLEN("http://www.wikidata.org/entity/")+1) as ?teamQ)
            # Get the team's label
            ?teamLabel
        WHERE {{
            # Filter for teams that are in the Premier League (Q9448) and are instances of a football club (Q476028)
            ?team wdt:P118 wd:Q9448;    # P118 is the property for "league," Q9448 is the item for "Premier League"
                  wdt:P31 wd:Q476028.   # P31 is the property for "instance of," Q476028 is the item for "football club"

            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
        }}
        # Skip the first offset results
        OFFSET {offset}
        # Limit the number of results to batch_size
        LIMIT {batch_size}
        """
        sparql.setQuery(query)
        results = sparql.query().convert()

        if not results["results"]["bindings"]:
            break

        for binding in results["results"]["bindings"]:
            team_id = binding.get("teamQ", {}).get("value", "N/A")
            teamLabel = binding.get("teamLabel", {}).get("value", "N/A")
            image_url = getTeamsLogoById(team_id)
            teams.append(TeamGroup33(id=team_id, name=teamLabel, image_url=image_url))
        offset += batch_size  # Increment the offset by your batch size
    return teams