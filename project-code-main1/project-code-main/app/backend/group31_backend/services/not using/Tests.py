import sqlite3
import time
from pydantic import BaseModel, Field
from typing import List

from SPARQLWrapper import SPARQLWrapper, JSON
from bs4 import BeautifulSoup
import requests
import json
from typing import Union, Optional
import sqlite3


def checkConnection() -> bool:
    """
    Check connection to Wikidata
        
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        response = requests.get("https://query.wikidata.org/sparql", timeout=10)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False


def getWikipediaUrlById(id: str) -> Optional[str]:
    """
    Given a Wikidata ID, returns the corresponding Wikipedia URL for the English language version of the page.

    Args:
        id (str): The Wikidata ID of the page.

    Returns:
        Optional[str]: The URL of the corresponding Wikipedia page, or None if the page does not exist.
    """
    wikidata_url = "https://www.wikidata.org/wiki/" + id
    wikidata_page = requests.get(wikidata_url)
    if (wikidata_page.status_code == 200):
        soup = BeautifulSoup(wikidata_page.content, 'html.parser')
        wikipedia_url = soup.find('span', class_='wikibase-sitelinkview-link-enwiki').find('a')['href']
        return wikipedia_url
    else:
        return None



class TeamWithAllInfo(BaseModel):
    """
    Represents a team with an ID and name.

    Attributes:
    -----------
        id (str): The unique identifier for the team.
        name (str): The name of the team.
    """
    id: str
    name: str
    logo: str
    colour: str


class Player(BaseModel):
   id: str
   name: str
   years_played: str
   teamID: str



class Player(BaseModel):
    id: str
    name: str
    years_played: str
    teamID: str

def getPlayersByTeamId(team_id: str):
    """
    Get all players from a specific team by the team's Q-number (Wikidata ID) and returns a list of Player objects.

    Args:
        team_id (str): The team's Q-number on Wikidata.

    Returns:
        list[Player]: A list of Player objects containing each player's ID, name, years played, and team ID.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?player ?playerLabel ?startYear ?endYear WHERE {{
        ?player p:P54 ?teamMembership .
        ?teamMembership ps:P54 wd:{team_id} .
        OPTIONAL {{ ?teamMembership pq:P580 ?start . }}
        OPTIONAL {{ ?teamMembership pq:P582 ?end . }}
        BIND(YEAR(?start) AS ?startYear)
        BIND(YEAR(?end) AS ?endYear)
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" }}
    }}
    ORDER BY ?playerLabel
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    players = []
    for result in results["results"]["bindings"]:
        player_id = result["player"]["value"].split('/')[-1]  # Extracting Q-number
        player_name = result["playerLabel"]["value"]

        start_year = result["startYear"]["value"] if "startYear" in result else None
        end_year = result["endYear"]["value"] if "endYear" in result else None
        
        # If end year is not available, set it to start year + 12
        if start_year and not end_year:
            end_year = str(int(start_year) + 12)

        years_played = []

        if start_year and end_year:
            years_played.extend(range(int(start_year), int(end_year) + 1))

        player = Player(
            id=player_id,
            name=player_name,
            years_played=",".join(map(str, years_played)),  # Join the list of years with commas
            teamID=team_id
        )
        #print(player)
        players.append(player)

    return players


def getLeagueTeams_wikidata(league_id) -> list[TeamWithAllInfo]: 
    
    """
    Get all teams in the chosen League (league_id) and their Q-numbers from Wikidata

    Returns:
        list[TeamWithAllInfo]: List of Teams With All the Info we need
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
            # Filter for teams that are in the chosen league and are instances of a football club (Q476028)
            ?team wdt:P118 wd:{league_id};  # Use {league_id} to include the actual league ID
                  wdt:P31 wd:Q476028.       # P31 is the property for "instance of," Q476028 is the item for "football club"

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
            
            id = binding.get("teamQ", {}).get("value", "N/A")
            teamLabel = binding.get("teamLabel", {}).get("value", "N/A")
            logo = getTeamsLogoById(id)
            colour = getTeamColorsById(id)
            teams.append(TeamWithAllInfo(id=id, name=teamLabel, logo=logo,colour=colour))
            
        offset += batch_size  # Increment the offset by your batch size
    return teams


def getTeamsLogoById(team_id: str) -> str: #tested and works
    """
    Get a team's logo by its Q-number

    Args:
        team_id (str): Team's Q-number
        
    Returns:
        str: Team's logo URL
    """
    wikipedia_url = getWikipediaUrlById(team_id)
    wikipedia_page = requests.get(wikipedia_url)
    if (wikipedia_page.status_code == 200):
        soup = BeautifulSoup(wikipedia_page.content, 'html.parser')
        logo_url = soup.find('table', class_='infobox vcard').find('img')['src']
        return "https:" + logo_url
    else:
        return "N/A"
    
def getTeamColorsById(team_id: str) -> str:
    """
    Get a team's colors by its Q-number from Wikidata.

    Args:
        team_id (str): Team's Q-number.

    Returns:
        str: Comma-separated string of color names, if available.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?colorLabel WHERE {{
      wd:{team_id} wdt:P6364 ?color .
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". ?color rdfs:label ?colorLabel. }}
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    colors = []
    try:
        results = sparql.query().convert()
        for result in results['results']['bindings']:
            color_label = result['colorLabel']['value']
            colors.append(color_label)
        # Convert the list of colors to a comma-separated string
        return ', '.join(colors)
    except IndexError:
        # If there's no color information or an error occurs, return a placeholder or indicate absence of data
        return "Color information not available"




def expand_years(year_ranges):
    expanded_years = []
    for year_range in year_ranges:
        # Check if year_range is just "-" or if it's not a valid range
        if year_range == "-" or not year_range.replace("-", "").isdigit():
            continue  # Skip this iteration if the range is invalid
        
        # Attempt to split the range and convert to integers
        try:
            start_year, end_year = map(int, year_range.split('-'))
            expanded_years.extend(range(start_year, end_year + 1))
        except ValueError:
            # Handle cases where conversion to int fails or range is improperly formatted
            print(f"Skipping invalid range: {year_range}")
            continue
        
    return expanded_years




def create_database():
    try:
        conn = sqlite3.connect("Database31.db")
        print(f"Database created successfully.")

        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS Teams (teamId TEXT PRIMARY KEY, name TEXT, logo TEXT, colour TEXT, leagueID TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS Players (playerId TEXT, name TEXT, years_played TEXT, teamID TEXT, FOREIGN KEY(teamID) REFERENCES Teams(teamId), PRIMARY KEY(playerId, teamId))")


    except sqlite3.Error as e:
        print(f"Error creating the database: {e}")





def populate_database(leagueID):

    teams = getLeagueTeams_wikidata(leagueID)

    try:
        conn = sqlite3.connect("Database31.db")
        cursor = conn.cursor()

        for team in teams:
            team_list = []
            team_list.append(getattr(team, 'id'))
            team_list.append(getattr(team, 'name'))
            team_list.append(getattr(team, 'logo'))
            team_list.append(getattr(team, 'colour'))
            team_list.append(leagueID)
           
            cursor.execute('''
                           INSERT OR IGNORE INTO Teams (teamId, name, logo, colour, leagueID)
                           VALUES (?, ?, ?,?,?)
                           ''', team_list)
        
        conn.commit()
        conn.close()
        print("Teams inserted successfully.")
        
        populate_players(teams)   

        print("Database was populated")
    
    except sqlite3.Error as e:
        print(f"Error inserting data: {e}")


def populate_players(teams: str):
   

        try:
            x=0
            conn = sqlite3.connect("Database31.db")
            cursor = conn.cursor()

            for team in teams:
                players = getPlayersByTeamId(getattr(team, 'id'))

                for player in players:


                    player_list = []
                    player_list.append(getattr(player, 'id'))
                    player_list.append(getattr(player, 'name'))
                    player_list.append(getattr(player, 'years_played'))
                    player_list.append(getattr(player, 'teamID'))
                    x+=1
                    


                    cursor.execute('''
                                INSERT OR IGNORE INTO Players (playerId, name, years_played, teamID)
                                VALUES (?, ?, ?,?)
                                ''', player_list)


                time.sleep(1)


                
            conn.commit()
            conn.close()
            print("Players inserted successfully")
            print(x)
        except sqlite3.Error as e:
           print(f"Error inserting player data: {e}")




start_time = time.time()
leagueID = 'Q9448'
create_database()
populate_database(leagueID)
print("--- %s seconds ---" % (time.time() - start_time))

def print_teams():
    try:
        conn = sqlite3.connect("Database31.db")
        cursor = conn.cursor()

        cursor.execute('''SELECT * FROM Teams''')
        teams = cursor.fetchall()

        for team in teams:
            print(team)  
        conn.close()
    
    except sqlite3.Error as e:
        print(f"Error accessing data: {e}")

# Call this function after populating the database to print the teams

#print_teams()










