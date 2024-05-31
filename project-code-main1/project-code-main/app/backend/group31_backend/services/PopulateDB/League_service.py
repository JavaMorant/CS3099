from typing import List
from Models import League
from SPARQLWrapper import SPARQLWrapper, JSON



def getLeaguesInCountry_wikidata(country_id: str) -> List[League]:
    """
    Get all leagues in a specific country (country_id) from Wikidata,
    along with their names, logos, and the country ID.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
    SELECT ?league ?leagueLabel (SAMPLE(?logo) as ?logo) WHERE {{
      ?league wdt:P17 wd:{country_id} ;
              wdt:P31 wd:Q15991303 .
      OPTIONAL {{ ?league wdt:P154 ?logo. }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    GROUP BY ?league ?leagueLabel
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    leagues = []
    for result in results["results"]["bindings"]:
        league_id = result["league"]["value"].split('/')[-1]
        league_name = result["leagueLabel"]["value"]
        logo_url = result.get("logo", {}).get("value", "N/A")
        country = country_id  # Assuming you pass the country ID itself, not its name

        leagues.append(League(id=league_id, name=league_name, logo=logo_url, country=country))

    return leagues

# Example usage
country_id = "Q145"  # Example: United Kingdom
#print(getLeaguesInCountry_wikidata(country_id))
