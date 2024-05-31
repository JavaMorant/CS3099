"""
This module contains functions for retrieving country information from Wikidata and a SQLite database.
"""

from domain.model import Country
from SPARQLWrapper import SPARQLWrapper, JSON
import sqlite3

def getCountryById_wikidata(country_id: str) -> Country:
    """
    Gets a country by its Q-number from Wikidata.

    Args:
        country_id (str): Country's Q-number.

    Returns:
        Country: Country object containing the country's ID, name, and flag.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.setReturnFormat(JSON)
    query = f"""
    SELECT 
        # Get the label of the country
        ?countryLabel 
        # Get the flag of the country
        ?flag
    WHERE {{
        # Filter for the country with the provided ID
        wd:{country_id} rdfs:label ?countryLabel.
        FILTER(LANG(?countryLabel) = "en").
        # Get the flag of the country with the provided ID
        wd:{country_id} wdt:P41 ?flag.
    }}
    """
    sparql.setQuery(query)
    results = sparql.query().convert()
    binding = results["results"]["bindings"][0]
    countryLabel = binding.get("countryLabel", {}).get("value", "N/A")
    flag = binding.get("flag", {}).get("value", "N/A")
    return Country(id=country_id, name=countryLabel, flag=flag)

def getCountryById_database(country_id: str) -> Country:
    """
    Gets a country by its Q-number from a SQLite database.

    Args:
        country_id (str): Country's Q-number.

    Returns:
        Country: Country object containing the country's ID, name, and flag.
    """
    connection = sqlite3.connect('group33_backend/Database.db')
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM Countries WHERE countryId = ?", (country_id,))
    row = cursor.fetchone()
    if row is None:
        # If the country is not in the database, get it from Wikidata and add it to the database
        print("Country not in database, getting from Wikidata")
        country = getCountryById_wikidata(country_id)
        cursor.execute(f"INSERT INTO Countries VALUES (?, ?, ?)", (country.id, country.name, country.flag))
        connection.commit()
    cursor.execute(f"SELECT * FROM Countries WHERE countryId = ?", (country_id,))
    row = cursor.fetchone()
    connection.close()
    return Country(id=row[0], name=row[1], flag=row[2])

def getCountries_wikidata() -> list[Country]:
    """
    Gets all countries from Wikidata.

    Returns:
        list[Country]: List of Country objects containing the countries' IDs, names, and flags.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.setReturnFormat(JSON)
    query = """
    SELECT 
        # Get the country's ID
        ?country
        # Extract the actual ID part from the country's ID
        (SUBSTR(STR(?country), STRLEN("http://www.wikidata.org/entity/")+1) as ?countryQ)
        # Get the country's label
        ?countryLabel
        # Get the country's flag
        ?flag
    WHERE {
        # Filter for countries that are instances of a sovereign state (Q3624078)
        ?country wdt:P31 wd:Q3624078.
        # Get the flag of the country
        ?country wdt:P41 ?flag.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
    """
    sparql.setQuery(query)
    results = sparql.query().convert()
    countries = []
    for binding in results["results"]["bindings"]:
        country_id = binding.get("countryQ", {}).get("value", "N/A")
        countryLabel = binding.get("countryLabel", {}).get("value", "N/A")
        flag = binding.get("flag", {}).get("value", "N/A")
        countries.append(Country(id=country_id, name=countryLabel, flag=flag))
    return countries