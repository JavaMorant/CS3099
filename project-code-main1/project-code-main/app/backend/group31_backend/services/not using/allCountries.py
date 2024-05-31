from pydantic import BaseModel
from SPARQLWrapper import SPARQLWrapper, JSON

class Country(BaseModel):
    """
    Represents a country with an ID, name, and flag.
    """
    id: str
    name: str
    flag: str

def get_all_countries():
    # Initialize the SPARQLWrapper with the Wikidata endpoint
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    
    # SPARQL query to select countries, their names, and flag images
    query = """
    SELECT ?country ?countryLabel ?flag WHERE {
        ?country wdt:P31 wd:Q6256;  # Instance of country
                 wdt:P41 ?flag.    # Country's flag
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
    ORDER BY ?countryLabel
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    
    countries = []
    for result in results["results"]["bindings"]:
        country_id = result["country"]["value"].split('/')[-1]  # Extracting ID from the full URI
        country_name = result["countryLabel"]["value"]
        flag_url = result["flag"]["value"]
        
        countries.append(Country(id=country_id, name=country_name, flag=flag_url))
    
    return countries

# Example usage
countries = get_all_countries()
for country in countries:
    print(f"{country.name} ({country.id}): {country.flag}")