import sqlite3
import time
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
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
    stadiumName: str
    inception: int
    coach: str
    sponsor: str
    


class Player(BaseModel):
   id: str
   name: str
   years_played: str
   teamID: str
   DOB : str
   citizenship : str
   position: str
   birthName : str


def getPlayersByTeamId(team_id: str):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?player ?playerLabel ?startYear ?endYear ?birthNameLabel ?positionLabel ?dateOfBirth ?countryLabel WHERE {{
        ?player p:P54 ?teamMembership .
        ?teamMembership ps:P54 wd:{team_id} .
        OPTIONAL {{ ?teamMembership pq:P580 ?start . }}
        OPTIONAL {{ ?teamMembership pq:P582 ?end . }}
        OPTIONAL {{ ?player wdt:P1477 ?birthName . }}
        OPTIONAL {{ ?player wdt:P413 ?position . }}
        OPTIONAL {{ ?player wdt:P569 ?dateOfBirth . }}
        OPTIONAL {{ ?player wdt:P27 ?country . }}
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
        player_id = result["player"]["value"].split('/')[-1]
        player_name = result["playerLabel"]["value"]

        start_year = result["startYear"]["value"] if "startYear" in result else None
        end_year = result["endYear"]["value"] if "endYear" in result else None
        birth_name = result["birthNameLabel"]["value"] if "birthNameLabel" in result else "Birth name not available"

        position_label = result["positionLabel"]["value"] if "positionLabel" in result else "Position information not available" 

        date_of_birth = result["dateOfBirth"]["value"] if "dateOfBirth" in result else "Date of birth not available"
        country = result["countryLabel"]["value"] if "countryLabel" in result else "Country not available"

        # If end year is not available, set it to start year + 12
        if start_year and not end_year:
            end_year = str(int(start_year) + 12)

        years_played = []
        if start_year and end_year:
            years_played.extend(range(int(start_year), int(end_year) + 1))

        player = Player(
            id=player_id,
            name=player_name,
            years_played=",".join(map(str, years_played)),
            teamID=team_id,
            DOB=date_of_birth,
            citizenship=country,
            position=position_label,
            birthName=birth_name
        )
        players.append(player)

    return players


def getPlayerBirthName(player_id: str) -> str:
    """
    Get the birth name for a specific player by their Q-number (Wikidata ID).

    Args:
        player_id (str): The player's Q-number on Wikidata.

    Returns:
        str: Birth name, if available.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?birthNameLabel WHERE {{
        wd:{player_id} wdt:P1477 ?birthName .
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        if 'results' in results and 'bindings' in results['results'] and results['results']['bindings']:
            birth_name_label = results['results']['bindings'][0]['birthNameLabel']['value']
            return birth_name_label
        else:
            return "Birth name not available"
    except Exception as e:
        print(f"Error retrieving birth name information: {e}, player {player_id}")
        return "Birth name not available"



def getPlayerPositionSpecialty(player_id: str) -> str:
    """
    Get the position played on a team or specialty for a specific player by their Q-number (Wikidata ID).

    Args:
        player_id (str): The player's Q-number on Wikidata.

    Returns:
        str: Comma-separated string of positions or specialties, if available.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?positionLabel WHERE {{
        wd:{player_id} wdt:P413 ?position .
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        if 'results' in results and 'bindings' in results['results'] and results['results']['bindings']:
            positions_labels = [result['positionLabel']['value'] for result in results['results']['bindings']]
            return ', '.join(positions_labels)
        else:
            return "Position or specialty information not available"
    except Exception as e:
        print(f"Error retrieving position or specialty information: {e}player {player_id}")
        return "Position or specialty information not available"


def getFormattedDate(date_str: str) -> str:
    """
    Format the given date string to return only the date part.

    Args:
        date_str (str): The input date string.

    Returns:
        str: The formatted date (without time).
    """
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")
        return date_obj.strftime("%Y-%m-%d")
    except ValueError:
        return f"Error parsing date: {date_str}"

def getPlayerDateOfBirth(player_id: str) -> str:
    """
    Get the date of birth for a specific player by their Q-number (Wikidata ID).

    Args:
        player_id (str): The player's Q-number on Wikidata.

    Returns:
        str: Date of birth of the player (without time), if available.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?dateOfBirth WHERE {{
        wd:{player_id} wdt:P569 ?dateOfBirth .
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        if 'results' in results and 'bindings' in results['results'] and results['results']['bindings']:
            dob = results['results']['bindings'][0]['dateOfBirth']['value']
            formatted_date = getFormattedDate(dob)
            return formatted_date
        else:
            return "Date of birth information not available"
    except Exception as e:
        print(f"Error retrieving date of birth information: {e},player {player_id}")
        return "Date of birth information not available"



def getPlayerCountryOfCitizenship(player_id: str) -> str:
    """
    Get the country of citizenship for a specific player by their Q-number (Wikidata ID).

    Args:
        player_id (str): The player's Q-number on Wikidata.

    Returns:
        str: Country of citizenship, if available.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?countryLabel WHERE {{
        wd:{player_id} wdt:P27 ?country .
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        if 'results' in results and 'bindings' in results['results'] and results['results']['bindings']:
            country_label = results['results']['bindings'][0]['countryLabel']['value']
            return country_label
        else:
            return "Country of citizenship not available"
    except Exception as e:
        print(f"Error retrieving country of citizenship information: {e}player {player_id}")
        return "Country of citizenship not available"




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
            stadiumName = getHomeVenueById(id)
            inception = getInceptionDateById(id)
            coach = getHeadCoachName(id)
            sponsor =getSponsor(id)
            teams.append(TeamWithAllInfo(id=id, name=teamLabel, logo=logo,colour=colour,stadiumName=stadiumName, inception= inception, coach =coach,sponsor =sponsor))
            
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

def getHomeVenueById(team_id: str) -> str:
    """
    Get a team's home venue by its Q-number from Wikidata.

    Args:
        team_id (str): Team's Q-number.

    Returns:
        str: Home venue name, if available.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?venueLabel WHERE {{
      wd:{team_id} wdt:P115 ?venue .
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". ?venue rdfs:label ?venueLabel. }}
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    try:
        results = sparql.query().convert()
        if 'results' in results and 'bindings' in results['results'] and results['results']['bindings']:
            venue_label = results['results']['bindings'][0]['venueLabel']['value']
            return venue_label
        else:
            return "Venue information not available"
    except IndexError:
        # If an error occurs, return a placeholder or indicate absence of data
        return "Venue information not available"



def getInceptionDateById(team_id: str) -> int:
    """
    Get a team's inception date by its Q-number from Wikidata.

    Args:
        team_id (str): Team's Q-number.

    Returns:
        int: Inception year, if available. Returns -1 if not available or if there's an error.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?inceptionDate WHERE {{
      wd:{team_id} wdt:P571 ?inceptionDate .
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    try:
        results = sparql.query().convert()
        if 'results' in results and 'bindings' in results['results'] and results['results']['bindings']:
            inception_date = results['results']['bindings'][0]['inceptionDate']['value']
            # Extract the year part and convert it to an integer
            inception_year = int(inception_date.split("-")[0])
            return inception_year
        else:
            return -1  # Inception date not available
    except Exception as e:
        # If an error occurs, return -1
        print(f"Error retrieving inception date: {e}")
        return -1

def getHeadCoachName(team_id: str) -> str:
    """
    Get the name of the head coach for a specific team by the team's Q-number (Wikidata ID).

    Args:
        team_id (str): The team's Q-number on Wikidata.

    Returns:
        str: Name of the head coach, if available.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?headCoachLabel WHERE {{
        wd:{team_id} wdt:P286 ?headCoach .
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        if 'results' in results and 'bindings' in results['results'] and results['results']['bindings']:
            head_coach_name = results['results']['bindings'][0]['headCoachLabel']['value']
            return head_coach_name
        else:
            return "Head coach information not available"
    except Exception as e:
        print(f"Error retrieving head coach information: {e}")
        return "Head coach information not available"




def getSponsor(team_id: str) -> str:
    """
    Get the sponsor for a specific team by the team's Q-number (Wikidata ID).

    Args:
        team_id (str): The team's Q-number on Wikidata.

    Returns:
        str: Name of the sponsor, if available.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?sponsorLabel WHERE {{
        wd:{team_id} wdt:P859 ?sponsor .
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        if 'results' in results and 'bindings' in results['results'] and results['results']['bindings']:
            sponsor_name = results['results']['bindings'][0]['sponsorLabel']['value']
            return sponsor_name
        else:
            return "Sponsor information not available"
    except Exception as e:
        print(f"Error retrieving sponsor information: {e}")
        return "Sponsor information not available"










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
        cursor.execute("CREATE TABLE IF NOT EXISTS Teams (teamId TEXT PRIMARY KEY, name TEXT, logo TEXT, colour TEXT, leagueID TEXT, stadiumName TEXT, inception INT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS Players (playerId TEXT, name TEXT, years_played TEXT, teamID TEXT, DOB TEXT, citizenship TEXT, position TEXT , birthName TEXT, FOREIGN KEY(teamID) REFERENCES Teams(teamId), PRIMARY KEY(playerId, teamId))")


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
            team_list.append(getattr(team, 'stadiumName'))
            team_list.append(getattr(team, 'inception'))
            team_list.append(leagueID)
           
            cursor.execute('''
                           INSERT OR IGNORE INTO Teams (teamId, name, logo, colour, leagueID, stadiumName, inception)
                           VALUES (?, ?, ?,?,?,?,?)
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
                    player_list.append(getattr(player, 'DOB'))
                    player_list.append(getattr(player, 'citizenship'))
                    player_list.append(getattr(player, 'position'))
                    player_list.append(getattr(player, 'birthName'))
                    x+=1
                    


                    cursor.execute('''
                                INSERT OR IGNORE INTO Players (playerId, name, years_played, teamID,DOB,citizenship,position, birthName)
                                VALUES (?, ?, ?,?,?,?,?,?)
                                ''', player_list)


                time.sleep(1)
                print(getattr(team, 'name'))

                
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



#print(getLeagueTeams_wikidata(leagueID))
#print(getPlayersByTeamId('Q18656'))

#getPlayersByTeamId('Q18656')



