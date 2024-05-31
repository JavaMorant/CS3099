from SPARQLWrapper import SPARQLWrapper, JSON
from Models import Player
import time



def getPlayersByTeamId(team_id: str):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    offset = 0
    batchsize = 50
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
    OFFSET {offset}
    LIMIT {batchsize}
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
        offset += batchsize
    time.sleep(3)
    return players
    
#print(getPlayersByTeamId('Q18656'))