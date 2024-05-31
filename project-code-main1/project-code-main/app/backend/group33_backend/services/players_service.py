"""
This module provides functions to retrieve information about players from Wikidata and Wikipedia.
"""
from domain.model import PlayerGroup33, DatabasePlayer
from SPARQLWrapper import SPARQLWrapper, JSON
from group33_backend.services.connection_service import getWikipediaUrlById, checkConnection
from group33_backend.services.countries_service import getCountryById_database
from group33_backend.services.teams_service import getTeamsLogoById
import requests
import re
import sqlite3

def getTeamPlayersById_wikidata(team_id: str) -> list[DatabasePlayer]:
    """
    Get all players in a team by team Q-number (e.g. Q9439 for Arsenal F.C.) and their Q-numbers from wikidata

    Args:
        team_id (str): Team Q-number
        
    Returns:
        list[Player]: List of players
    """
    if not checkConnection():
        return []
    
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.setReturnFormat(JSON)
    
    offset = 0  # Initialize the offset to 0
    batch_size = 50  # Set your desired batch size

    players = []

    while True:
        query = f"""
        SELECT
            # Get a sample of the player's Wikidata ID
            (SAMPLE(?playerQ) as ?player)
            # Get the player's label
            ?playerLabel
            # Get all distinct images of the player, separated by commas
            (GROUP_CONCAT(DISTINCT ?image; separator=",") as ?images)
            # Get all distinct citizenships of the player, separated by commas
            (GROUP_CONCAT(DISTINCT ?citizenQ; separator=",") as ?citizens)
            # Get the player's date of birth
            ?DOB
            # Get the player's height
            ?height
            # Get all distinct positions of the player, separated by commas
            (GROUP_CONCAT(DISTINCT ?positionLabel; separator=",") as ?positions)
            # Get the player's career start date
            ?career_start
            # Get the player's end dates of teams they have played for
            (GROUP_CONCAT(DISTINCT ?endtime; separator=",") as ?endtimes)
            ?fbrefId
        WHERE {{
            # Filter for players who are members of the team with the ID team_id
            ?player wdt:P54 wd:{team_id};       # P54 is "member of sports team"
                    wdt:P1532 ?citizen;         # P1532 is "country for sport"
                    wdt:P569 ?DOB;              # P569 is "date of birth"
                    wdt:P2048 ?height;          # P2048 is "height"
                    wdt:P413 ?position;         # P413 is "position played on team / speciality"
                    wdt:P2031 ?career_start;    # P2031 is "start time"
                    wdt:P5750 ?fbrefId;          # P5750 is "FBref player ID"
                    wdt:P18 ?image.             # P18 is "image"

            # Fetch position labels
            ?position rdfs:label ?positionLabel.
            FILTER(LANG(?positionLabel) = "en").

            # Get the player's end date for the current team being queried if it exists
            OPTIONAL {{ ?player p:P54 [
                    ps:P54 wd:{team_id};
                    pq:P582 ?endtime
                    ].}}
            
            # Get the Q-number of the player and the country of citizenship
            BIND (STRAFTER(STR(?player), "http://www.wikidata.org/entity/") as ?playerQ)
            BIND (STRAFTER(STR(?citizen), "http://www.wikidata.org/entity/") as ?citizenQ)

            # Filters players out who have a valid endtime at the current club being queried
            FILTER (!BOUND(?endtime) || STRSTARTS(STR(?endtime), "http")).

            # Fetch labels in the user's language, defaulting to English
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
        }}
        # Group the results by player label, date of birth, height, and career start date
        GROUP BY ?playerLabel ?DOB ?height ?career_start ?fbrefId
        # Skip the first offset results
        OFFSET {offset}
        # Limit the number of results to batch_size
        LIMIT {batch_size}
        """

        sparql.setQuery(query)

        #convert the result of the query into JSON
        results = sparql.query().convert()

        #if there is no more data
        if not results["results"]["bindings"]:
            break

        #iterate through each record in the result
        for binding in results["results"]["bindings"]:
            #extract the values for each field
            players_id = binding.get("player", {}).get("value", "N/A")
            playerLabel = binding.get("playerLabel", {}).get("value", "N/A")
            citizen_ids = binding.get("citizens", {}).get("value", "N/A").split(',')
            DoB = binding.get("DOB", {}).get("value", "N/A")
            height = binding.get("height", {}).get("value", "N/A")
            positions = binding.get("positions", {}).get("value", "N/A").split(',')
            career_start = binding.get("career_start", {}).get("value", "N/A")
            image_url = binding.get("images", {}).get("value", "N/A").split(',')
            fbrefID = binding.get("fbrefId", {}).get("value", "N/A")
            teamBadge_URL = ""

            #construct a DatabasePlayer object from the extracted data
            players.append(DatabasePlayer(id=players_id, name=playerLabel, citizenship=citizen_ids[0], DOB=DoB, height=height, position=positions[0], career_start=career_start, image_url=image_url[0], teamId=team_id, fbrefId=fbrefID, teamBadge_URL=teamBadge_URL))
        
        # Increment the offset by the batch size
        offset += batch_size  
    return players


def checkIfWikipediaContainsRetirById_wikidata(player_id: str) -> bool:
    """
    Check if a player is retired by its Q-number

    Args:
        player_id (str): Player Q-number

    Returns:
        bool: True if player is retired, False otherwise
    """

    wikipedia_url = getWikipediaUrlById(player_id)
    if wikipedia_url is None:
        return False
    
    #pull from the corresponding wikipedia page
    wikipedia_page = requests.get(wikipedia_url)

    #if the pull was successful
    if(wikipedia_page.status_code == 200):
        wikipedia_content = wikipedia_page.text
        pattern = r'\bretir\w*\b'

        #if 'retir' followed by any string appears in the wikipedia page 
        if re.search(pattern, wikipedia_content, re.IGNORECASE):
            return True
        else:
            return False
    else:
        return False
    
def getPlayerById_wikidata(player_id: str) -> PlayerGroup33:
    """
    Get a player by player Q-number (e.g. Q357984 for a specific player) from wikidata
    
    Args:
        player_id (str): Player Q-number
    
    Returns:
        Player: Player object
    """
    if not checkConnection():
        return None
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.setReturnFormat(JSON)
    
    query = f"""
    SELECT
        (SAMPLE(?playerLabel) as ?playerLabel)
        ?teamId
        (GROUP_CONCAT(DISTINCT ?image; separator=",") as ?images)
        (GROUP_CONCAT(DISTINCT ?citizenQ; separator=",") as ?citizens)
        ?DOB
        ?height
        (GROUP_CONCAT(DISTINCT ?positionLabel; separator=",") as ?positions)
        ?career_start
        ?fbrefId
    WHERE {{
        BIND (wd:{player_id} as ?playerId)
        ?playerId rdfs:label ?playerLabel;
                wdt:P54 ?team;
                wdt:P1532 ?citizen;
                wdt:P569 ?DOB;
                wdt:P2048 ?height;
                wdt:P413 ?position;
                wdt:P2031 ?career_start;
                wdt:P18 ?image;
                wdt:P5750 ?fbrefId.

        ?position rdfs:label ?positionLabel.
        FILTER(LANG(?positionLabel) = "en").
        FILTER(LANG(?playerLabel) = "en").

        BIND (STRAFTER(STR(?team), "http://www.wikidata.org/entity/") as ?teamId)
        BIND (STRAFTER(STR(?citizen), "http://www.wikidata.org/entity/") as ?citizenQ)

        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    GROUP BY ?playerId ?teamId ?DOB ?height ?career_start ?fbrefId"""

    sparql.setQuery(query)

    #convert the result of the query into JSON
    results = sparql.query().convert()

    #iterate through each record in the result
    for binding in results["results"]["bindings"]:
        #extract the values for each field
        playerLabel = binding.get("playerLabel", {}).get("value", "N/A")
        citizen_ids = binding.get("citizens", {}).get("value", "N/A").split(',')
        DoB = binding.get("DOB", {}).get("value", "N/A")
        height = binding.get("height", {}).get("value", "N/A")
        positions = binding.get("positions", {}).get("value", "N/A").split(',')
        career_start = binding.get("career_start", {}).get("value", "N/A")
        image_url = binding.get("images", {}).get("value", "N/A").split(',')
        team_id = binding.get("teamId", {}).get("value", "N/A")
        fbrefId = binding.get("fbrefId", {}).get("value", "N/A")
        
        teamBadge_URL = getTeamsLogoById(team_id)
        country = getCountryById_database(citizen_ids[0])
        
        # construct a Player object from the extracted data
        return PlayerGroup33(
            id=player_id, 
            name=playerLabel, 
            citizenship=country, 
            DOB=DoB, height=height, 
            position=positions[0], 
            career_start=career_start, 
            image_url=image_url[0], 
            teamId=team_id, 
            teamBadge_URL=teamBadge_URL, 
            fbrefId=fbrefId,
            ovrall="N/A",
            dribbling="N/A",
            shooting="N/A",
            passing="N/A",
            physicality="N/A",
            playmaking="N/A",
            defending="N/A")

    
def getTeamPlayersById_database(team_id: str) -> list[PlayerGroup33]:
    """
    Get all players in a team by team Q-number (e.g. Q9439 for Arsenal F.C.) and their Q-numbers from the database

    Args:
        team_id (str): Team Q-number

    Returns:
        list[Player]: List of players
    """

    #connect to the local database
    connection = sqlite3.connect('group33_backend/Database.db')
    cursor = connection.cursor()

    # check whether the teams is not empty
    cursor.execute("SELECT emptyTeam FROM Teams WHERE teamId = ?", (team_id,))
    row = cursor.fetchone()
    if row[0] == "empty":
        connection.close()
        return []

    #query for every player in the requested team
    cursor.execute("SELECT * FROM Players WHERE teamId = ?", (team_id,))
    rows = cursor.fetchall()
    
    # if there are no players in the team, insert them into the database from wikidata
    if rows.__len__() == 0:
        print("No players found in database, inserting players for " + team_id + " from wikidata")
        insert_players(team_id)
        cursor.execute("SELECT * FROM Players WHERE teamId = ?", (team_id,))
        rows = cursor.fetchall()

    connection.close()

    players = []
    for row in rows:
        #create a Country from the country id
        country = getCountryById_database(row[2])

        #create a Player object from each row and append it to a list
        players.append(PlayerGroup33(
            id=row[0], 
            name=row[1], 
            citizenship=country, 
            DOB=row[3], 
            height=row[4], 
            position=row[5], 
            career_start=row[6], 
            image_url=row[7], 
            teamId=row[8], 
            teamBadge_URL="N/A", 
            fbrefId=row[9], 
            ovrall=row[10] if row[10] else "N/A", 
            dribbling=row[11] if row[11] else "N/A", 
            shooting=row[12] if row[12] else "N/A", 
            passing=row[13] if row[13] else "N/A", 
            physicality=row[14] if row[14] else "N/A", 
            playmaking=row[16] if row[16] else "N/A", 
            defending=row[15] if row[15] else "N/A"))
    return players


#FIXME: MAY CAUSE PROBLEMS, IF NOT IN DB THEN WHAT?
def getPlayerById_database(player_id: str) -> PlayerGroup33:
    """
    Get a player by player Q-number (e.g. Q357984 for a specific player) from the database

    Args:
        player_id (str): Player Q-number

    Returns:
        Player: Player object
    """

    #connect to the local database
    connection = sqlite3.connect('group33_backend/Database.db')
    cursor = connection.cursor()

    #query for the player with the requested ID
    cursor.execute("SELECT * FROM Players WHERE playerId = ?", (player_id,))
    row = cursor.fetchone()

    connection.close()

    if row is None:
        return None

    country = getCountryById_database(row[2])
    # assuming Player is a namedtuple or similar, and row contains the fields in the correct order
    player = PlayerGroup33(
        id=row[0], 
        name=row[1], 
        citizenship=country, 
        DOB=row[3], 
        height=row[4], 
        position=row[5], 
        career_start=row[6], 
        image_url=row[7], 
        teamId=row[8], 
        teamBadge_URL="N/A",
        fbrefId=row[9],
        ovrall=row[10] if row[10] else "N/A",
        dribbling=row[11] if row[11] else "N/A",
        shooting=row[12] if row[12] else "N/A",
        passing=row[13] if row[13] else "N/A",
        physicality=row[14] if row[14] else "N/A",
        playmaking=row[16] if row[16] else "N/A",
        defending=row[15] if row[15] else "N/A"
    )
    return player

#FIXME: IF NOT IN DB THEN WHAT?
def getPlayerByName_database(player_name: str) -> list[PlayerGroup33]:
    """
    Get a player by player name from the database, does not support case sensitive matches. Returns a list of players if there are multiple matches.
    For instance, if you type "Messi", will return a list of all players with "Messi" in their name, such as "Lionel Messi" and "Maxi Messi".

    Args:
        player_name (str): Player name

    Returns:
        Player: Player object
    """

    #connect to the local database
    connection = sqlite3.connect('group33_backend/Database.db')
    cursor = connection.cursor()

    #query for the player with the requested name
    cursor.execute("SELECT * FROM Players WHERE name LIKE ?", ('%' + player_name + '%',))
    rows = cursor.fetchall()

    connection.close()

    players = []
    for row in rows:

        #create a Country from the country id
        country = getCountryById_database(row[2])

        #create a Player object from each row and append it to a list
        players.append(PlayerGroup33(
            id=row[0] if row[0] else None,
            name=row[1] if row[1] else None,
            citizenship=country,
            DOB=row[3] if row[3] else None,
            height=row[4] if row[4] else None,
            position=row[5] if row[5] else None,
            career_start=row[6] if row[6] else None,
            image_url=row[7] if row[7] else None,
            teamId=row[8] if row[8] else None,
            teamBadge_URL="N/A",
            fbrefId=row[9] if row[9] else None,
            ovrall=row[10] if row[10] else None,
            dribbling=row[11] if row[11] else None,
            shooting=row[12] if row[12] else None,
            passing=row[13] if row[13] else None,
            physicality=row[14] if row[14] else None,
            playmaking=row[16] if row[16] else None,
            defending=row[15] if row[15] else None
    ))    
    return players
    
def insert_players(team_id: str) -> None:
    """
    Insert players into the database for a given team id.
    
    Args:
        team: A `Team` object containing the `team_id` parameter.
        
    Returns:
        A `PlayersResponseGroup33` object containing a list of `Player` objects, each representing a player from the team.
            
    Raises:
        HTTPException: If no players are found for the given `team_id`.
    """
    try:
        conn = sqlite3.connect("group33_backend/Database.db")
        cursor = conn.cursor()
    
        players = getTeamPlayersById_wikidata(team_id)
        if(players.__len__() == 0):
            print("No players found for " + team_id + ", updating team entry in database")
            cursor.execute("UPDATE Teams SET emptyTeam = 'empty' WHERE teamId = ?", (team_id,))
            conn.commit()
            conn.close()
            return

        for player in players:

            player_list = []
            player_list.append(getattr(player, 'id'))
            player_list.append(getattr(player, 'name'))
            player_list.append(getattr(player, 'citizenship'))
            player_list.append(getattr(player, 'DOB'))
            player_list.append(getattr(player, 'height'))
            player_list.append(getattr(player, 'position'))
            player_list.append(getattr(player, 'career_start'))
            player_list.append(getattr(player, 'image_url'))
            player_list.append(getattr(player, 'teamId'))
            player_list.append(getattr(player, 'fbrefId'))

            cursor.execute('''
                        INSERT OR IGNORE INTO Players (playerId, name, countryId, DOB, height, position, career_start, image_url, teamId, fbrefId)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', player_list)

        conn.commit()
        conn.close()
        print("Players for " + team_id + " inserted successfully")

    except sqlite3.Error as e:
        print(f"Error inserting player data: {e}")