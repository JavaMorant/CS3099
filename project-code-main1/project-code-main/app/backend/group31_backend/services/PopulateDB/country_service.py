from typing import List
from Models import Country
from SPARQLWrapper import SPARQLWrapper, JSON
from connection_service import getWikipediaUrlById, checkConnection



def getCountriesFromWikidata() -> List[Country]:
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.setQuery("""
        SELECT ?country ?countryLabel ?flag WHERE {
            ?country wdt:P31 wd:Q6256.
            OPTIONAL { ?country wdt:P41 ?flag. }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        }
        
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    countries = []
    for result in results["results"]["bindings"]:
        country_id = result["country"]["value"].split('/')[-1]
        country_name = result["countryLabel"]["value"]
        flag = result["flag"]["value"] if "flag" in result else "N/A"
        countries.append(Country(id=country_id, name=country_name, flag=flag))
    
    return countries


#print(getCountriesFromWikidata())