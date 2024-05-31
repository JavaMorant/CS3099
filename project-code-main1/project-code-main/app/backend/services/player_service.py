from domain.model import Player, Team, Stadium, Article, LeagueAndNation, NextLeagueTable, Tournament, PlayerInfo
import json
from urllib import request, parse, error
import requests
wiki_end_point = "https://query.wikidata.org/sparql"

'''
Query to find a player's WikiData ID given their name. 
'''
def get_player_id(player_name: str) -> str:
    query = f"""
        SELECT ?player
        WHERE {{
            ?player wdt:P106 wd:Q937857; rdfs:label "{player_name}"@en.
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
        }}
    """
    params = {
        'query': query,
        'format': 'json'
    }
    try:
        query_string = parse.urlencode(params)
        req = request.Request(url=f"{wiki_end_point}?{query_string}")
        with request.urlopen(req) as response:
            response_text = response.read()
            data = json.loads(response_text)
            results = data.get('results', {}).get('bindings', [])
            if results:
                player_url = results[0]['player']['value']
                player_id = player_url.split("/")[-1]  # Extract ID from full URI
                return player_id
    except error.URLError as e:
        print(f"Error fetching player ID: {e}")
    return None

'''
Query to find a player's WikiData ID given the user does not search with accents.
'''
def get_player_id_two(player_name: str) -> str:
    query = f"""
        SELECT ?player  
        WHERE {{
            ?player p:P54 ?currentStatement.       
            ?currentStatement ps:P54 ?currentTeam; 
            pq:P580 ?startDate.      
            ?currentTeam wdt:P118 wd:Q9448.  
            FILTER (YEAR(?startDate) >= 1980)
            ?player wdt:P106 wd:Q937857;
            rdfs:label ?name.
            FILTER(REGEX(?name, "{player_name}", "i")).
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
            }}
    LIMIT 1
    """
    params = {
        'query': query,
        'format': 'json'
    }
    try:
        query_string1 = parse.urlencode(params)
        req1 = request.Request(url=f"{wiki_end_point}?{query_string1}")
        with request.urlopen(req1) as response:
            response_text = response.read()
            data = json.loads(response_text)
            results = data.get('results', {}).get('bindings', [])
            if results:
                player_url = results[0]['player']['value']
                player_id = player_url.split("/")[-1]  # Extract ID from full URI
                return player_id
    except error.URLError as e:
        print(f"Error fetching player ID: {e}")
    return None


'''
Query to find a player's information for each team they've played for, given their WikiData ID.  
'''
def get_team(player_id: str) -> list[Team]:
    sparql_endpoint = "https://query.wikidata.org/sparql"
    
    query = f"""
        SELECT ?team ?teamLabel ?numberOfMatches ?goals ?startDate ?endDate ?location ?image ?stadiumImage ?playerLabel
        WHERE {{
            wd:{player_id} p:P54 ?teamStatement.
            wd:{player_id} rdfs:label ?playerLabel.
            FILTER (LANG(?playerLabel) = "en")
            OPTIONAL {{ ?teamStatement pq:P582 ?endDate. }}
            OPTIONAL {{ ?teamStatement pq:P1350 ?numberOfMatches. }}  
            OPTIONAL {{ ?teamStatement pq:P1351 ?goals. }}            
            OPTIONAL {{ ?teamStatement pq:P580 ?startDate. }}     
            OPTIONAL {{ wd:{player_id} wdt:P18 ?image }}  
            ?teamStatement ps:P54 ?team.
            ?team rdfs:label ?teamLabel.
            OPTIONAL {{?team wdt:P115 ?stadium.     
            ?stadium wdt:P18 ?stadiumImage }}
            OPTIONAL {{ ?team wdt:P115 ?location }}  # Location
            FILTER (LANG(?teamLabel) = "en")
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
        }}
        ORDER BY ASC(?startDate)
    """
    
    

    params = {
        'query': query,
        'format': 'json'
    }
    teams = []
    try:
        query_string = parse.urlencode(params)
        req = request.Request(url=f"{wiki_end_point}?{query_string}")
        with request.urlopen(req) as response:
            response_text = response.read()
            data = json.loads(response_text)
            results = data.get('results', {}).get('bindings', [])
            for result in results:
                team_id = result['team']['value'].split("/")[-1]
                team_label = result['teamLabel']['value']
                num_of_matches = result.get('numberOfMatches', {}).get('value',"")
                num_of_goals = result.get('goals', {}).get('value',"")
                start_date = result.get('startDate', {}).get('value', "")
                end_date = result.get('endDate', {}).get('value', "")
                stadium_id = result.get('location', {}).get('value',"").replace("http://www.wikidata.org/entity/", "")
                Image = result.get('image', {}).get('value', '')
                TeamImage= result.get('stadiumImage', {}).get('value', '')
                PlayerName = result.get('playerLabel', {}).get('value', '')
                teams.append(Team(id=team_id, name=team_label, appearances=num_of_matches, goals=num_of_goals, startdate=start_date, enddate=end_date, stadiumId = stadium_id, image=Image, teamImage=TeamImage, playerName=PlayerName))
                
    except error.URLError as e:
        print(f"Error fetching Teams: {e}")
    return teams


'''
Query to find the stadium information, including coordinates, given the its WikiData ID. 
'''
def get_stadium(stadium_id: str) -> Stadium:
    data = []
    query = f"""
        SELECT ?stadium ?stadiumName ?coords
        WHERE {{
            wd:{stadium_id} rdfs:label ?stadiumName;
                            wdt:P625 ?coords.
            FILTER (LANG(?stadiumName) = "en")
        }}
        LIMIT 1
    """

    params = {
        'query': query,
        'format': 'json'
    }
    try:
        query_string = parse.urlencode(params)
        req = request.Request(url=f"{wiki_end_point}?{query_string}")
        with request.urlopen(req) as response:
            response_text = response.read()
            data = json.loads(response_text)
            results = data.get('results', {}).get('bindings', [])
            
        
        if results:
            result = results[0]
            stadium_label = result['stadiumName']['value']
            coords = result['coords']['value'].replace("Point(","")
            coords = coords.replace(")","")
            coordslist = coords.split(" ", 1)
            coordslist[0] = float(coordslist[0])
            coordslist[1] = float(coordslist[1])
            return Stadium(id=stadium_id, name=stadium_label, coords=coordslist)
            
    
    except error.URLError as e:
        print(f"Error fetching Stadiums: {e}")
          
    return None
'''
Query that when given a player ID, returns the nation they play for and the last league they played for
(or the one they currently play for)
'''
def get_leagues(player_id: str) -> list[LeagueAndNation]:
    sparql_endpoint = "https://query.wikidata.org/sparql"
    query = f"""
    SELECT ?team ?teamLabel ?endDate ?league ?leagueLabel ?nation ?nationLabel
        WHERE {{
            wd:{player_id} p:P54 ?teamStatement.
            ?teamStatement pq:P580 ?startDate.
            OPTIONAL {{ ?teamStatement pq:P582 ?endDate. }}
            ?teamStatement ps:P54 ?team.
            ?team rdfs:label ?teamLabel.
            ?team wdt:P118 ?league.
            ?league rdfs:label ?leagueLabel.
            wd:{player_id} wdt:P1532 ?nation.    # Adding property for nationality of the player
            ?nation rdfs:label ?nationLabel.  # Label of the nationality


            OPTIONAL {{?team wdt:P115 ?location}}
            FILTER (LANG(?teamLabel) = "en")
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
            FILTER (LANG(?leagueLabel) = "en")
            SERVICE wikibase:label {{bd:serviceParam wikibase:language "en". }}
            FILTER (LANG(?nationLabel) = "en")
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
        }}
        ORDER BY DESC(?startDate)
    LIMIT 1
        
    """
    params = {
        'query': query,
        'format': 'json'
    }
    leagueAndNation = []
    try:
        query_string = parse.urlencode(params)
        req = request.Request(url=f"{wiki_end_point}?{query_string}")
        with request.urlopen(req) as response:
            response_text = response.read()
            data = json.loads(response_text)
            results = data.get('results', {}).get('bindings', [])
            for result in results:
                end_date = result.get('endDate', {}).get('value', "")
                league_id = result.get('league', {}).get('value',"").replace("http://www.wikidata.org/entity/", "")
                league_label = result['leagueLabel']['value']
                nation_id = result.get('nation',{}).get('value',"").replace("http://www.wikidata.org/entity/", "")
                nation_label = result['nationLabel']['value']
                leagueAndNation.append(LeagueAndNation(end_date=end_date, league_id = league_id, league_label=league_label, nation_id = nation_id, nation_label = nation_label))
    except error.URLError as e:
        print(f"Error fetching League and Nation: {e}")
    return leagueAndNation

'''
Query that looks for 100 players that share the same nationality as the player, and played in the same league.
It then finds where they played next, and returns a list of the 5 most popular options

'''
def getprobabilityLeagues(league_id: str, nation_id: str) -> list[NextLeagueTable]:
    sparql_endpoint = "https://query.wikidata.org/sparql"
    query = f"""
        SELECT ?nextLeague ?nextLeagueLabel (COUNT(?nextLeague) as ?occurrences)
        WHERE{{
            SELECT DISTINCT ?player ?playerLabel ?nextLeague ?nextLeagueLabel ?nextStartDate
            WHERE {{

                    ?player p:P54 ?currentStatement.       
                    ?currentStatement ps:P54 ?currentTeam; 
                    pq:P580 ?startDate;    
                    pq:P582 ?endDate.      
 
                    ?currentTeam wdt:P118 wd:{league_id}.  
                    ?player wdt:P1532 wd:{nation_id}
                    FILTER (YEAR(?startDate) >= 2000)

                    OPTIONAL {{
                        ?player p:P54 ?nextStatement.        
                        ?nextStatement ps:P54 ?nextTeam;     
                        pq:P580 ?nextStartDate.  
   
                        FILTER (?nextStartDate > ?endDate)  
                        ?nextTeam wdt:P118 ?nextLeague.     
                    }}

                    SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
            }}

            LIMIT 100
        }}
        GROUP BY ?nextLeague ?nextLeagueLabel
        ORDER BY DESC(?occurrences)
        LIMIT 5
        
    """
    params = {
        'query': query,
        'format': 'json'
    }
    nextLeague = []
    try:
        query_string = parse.urlencode(params)
        req = request.Request(url=f"{wiki_end_point}?{query_string}")
        with request.urlopen(req) as response:
            response_text = response.read()
            data = json.loads(response_text)
            results = data.get('results', {}).get('bindings', [])
            for result in results:
                if 'nextLeagueLabel' in result:
                    league_label = result['nextLeagueLabel']['value']
                    league_occurences = result['occurrences']['value']
                    #league_occurences = str(int(league_occurences)/100) + "%"
                    nextLeague.append(NextLeagueTable(leagueName=league_label, numberofplayers=league_occurences))
                else:
                    return []
    except error.URLError as e:
        print(f"Error fetching Next Leagues: {e}")
    return nextLeague

'''
Query to find the tournaments a player has participated in, given their name.
'''
def get_tourny(player_id: str) -> list[Tournament]:
    sparql_endpoint = "https://query.wikidata.org/sparql"
    
    query = f"""
        SELECT ?participant ?teamStatement ?teamLabel ?numberOfMatches ?goals
        WHERE {{
            wd:{player_id} p:P1344 ?participant.
            OPTIONAL{{?participant pq:P54 ?teamStatement.}}
            OPTIONAL{{?participant pq:P1350 ?numberOfMatches.}}
            OPTIONAL{{?participant pq:P1351 ?goals. }}
          
            ?participant ps:P1344 ?team.
            ?team rdfs:label ?teamLabel.
            FILTER (LANG(?teamLabel) = "en")
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
        }}
    """
    
    params = {
        'query': query,
        'format': 'json'
    }
    tournaments = []
    try:
        query_string = parse.urlencode(params)
        req = request.Request(url=f"{wiki_end_point}?{query_string}")
        with request.urlopen(req) as response:
            response_text = response.read()
            data = json.loads(response_text)
            results = data.get('results', {}).get('bindings', [])
            for result in results:
                tournamentlabel = result['teamLabel']['value']
                
                num_of_matches = "0"

                num_of_goals = "0"
                tournaments.append(Tournament(name=tournamentlabel))
       
    except error.URLError as e:
        print(f"Error fetching Tournaments: {e}")
    return tournaments


'''
Query to find news articles about a player, given their name.
'''
def get_news(player_name: str) -> list[Article]:
    api_key = '9c492700257641689438ff132d660160'
    base_url = 'https://newsapi.org/v2/everything'
    query = player_name
    params = {
        'q': query,
        'searchIn': 'title,content',
        'apiKey': api_key,
        'pageSize': 5,
        'language': 'en',
    }
    response = requests.get(base_url, params=params)
    articles = []
    if response.status_code == 200:
        data = response.json()
        for article in data.get('articles', []):
            article_title = article['title']
            article_url = article['url']
            articles.append(Article(title=article_title, link=article_url))
    else:
        print(f"Error: {response.status_code} - {response.text}")
    return articles  
        
'''
Query to find a player's personal information given their name. 
'''
def get_player_info(player_id: str) -> str:
    
    query = f"""
        SELECT ?playerLabel ?dob ?height ?weight
        WHERE {{
        wd:{player_id} rdfs:label ?playerLabel.
        OPTIONAL {{ wd:{player_id} wdt:P569 ?dob. }}
        OPTIONAL {{ wd:{player_id} wdt:P2048 ?height. }}
        OPTIONAL {{ wd:{player_id} wdt:P2067 ?weight. }}
        SERVICE wikibase:label {{bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
        }}
    LIMIT 1
    """
    params = {
        'query': query,
        'format': 'json'
    }
    infos = []
    try:
        query_string = parse.urlencode(params)
        req = request.Request(url=f"{wiki_end_point}?{query_string}")
        with request.urlopen(req) as response:
            response_text = response.read()
            data = json.loads(response_text)
            results = data.get('results', {}).get('bindings', [])
            for result in results:
                birthday = result['dob']['value'].replace("T00:00:00Z", "")
                player_height = result.get('height', {}).get('value', "")
                player_weight = result.get('weight', {}).get('value', "")
                infos.append(PlayerInfo(dob=birthday, height=player_height, weight=player_weight))

    except error.URLError as e:
        print(f"Error fetching player information: {e}")
    return infos