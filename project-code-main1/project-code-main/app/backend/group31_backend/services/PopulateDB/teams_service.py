"""
This module provides functions to retrieve information about Premier League teams from different sources.
"""


from Models import TeamWithAllInfo
from connection_service import getWikipediaUrlById, checkConnection
from SPARQLWrapper import SPARQLWrapper, JSON
from bs4 import BeautifulSoup 
import requests






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
    batch_size = 25  # Set your desired batch size
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
            ?headquarters
        WHERE {{
            # Filter for teams that are in the chosen league and are instances of a football club (Q476028)
            ?team wdt:P118 wd:{league_id};  # Use {league_id} to include the actual league ID
                  wdt:P31 wd:Q476028.       # P31 is the property for "instance of," Q476028 is the item for "football club"
            OPTIONAL {{ ?team wdt:P159/wdt:P625  ?headquarters. }}
                  
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
            headquarters = binding.get("headquarters", {}).get("value", "N/A")
            teams.append(TeamWithAllInfo(id=id, name=teamLabel, logo=logo,colour=colour,stadiumName=stadiumName, inception= inception, coach =coach,sponsor =sponsor, headquarters =headquarters))
            

        offset += batch_size  # Increment the offset by your batch size
    return teams




def getTeamsLogoById(team_id: str) -> str:
    """
    Get a team's logo by its Q-number

    Args:
        team_id (str): Team's Q-number
        
    Returns:
        str: Team's logo URL or 'N/A' if not found or error occurs.
    """
    wikipedia_url = getWikipediaUrlById(team_id)
    if wikipedia_url is None:
        print(f"No Wikipedia URL found for team with ID: {team_id}")
        return "N/A"  # Return a default value or handle the error as appropriate

    try:
        wikipedia_page = requests.get(wikipedia_url)
        if wikipedia_page.status_code == 200:
            soup = BeautifulSoup(wikipedia_page.content, 'html.parser')
            table = soup.find('table', class_='infobox vcard')
            
            if table is not None:
                img = table.find('img')
                if img is not None and 'src' in img.attrs:
                    logo_url = img['src']
                    return "https:" + logo_url
                else:
                    print(f"Logo image not found for team with ID: {team_id}")
                    return "N/A"
            else:
                print(f"Infobox not found for team with ID: {team_id}")
                return "N/A"
        else:
            print(f"Failed to fetch Wikipedia page for team with ID: {team_id}")
            return "N/A"
    except requests.exceptions.RequestException as e:
        print(f"Request failed for team with ID: {team_id}, Error: {e}")
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




#leagueID = 'Q9448'
#print(getLeagueTeams_wikidata(leagueID))




