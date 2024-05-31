"""
This module provides functions to check connection to Wikidata and get Wikipedia URL by Wikidata ID.
"""
import requests
from bs4 import BeautifulSoup
from typing import Union, Optional



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
        Optional[str]: The URL of the corresponding Wikipedia page, or None if the page does not exist or an error occurs.
    """
    wikidata_url = "https://www.wikidata.org/wiki/" + id
    wikidata_page = requests.get(wikidata_url)
    
    if wikidata_page.status_code == 200:
        soup = BeautifulSoup(wikidata_page.content, 'html.parser')
        wikipedia_link_container = soup.find('span', class_='wikibase-sitelinkview-link-enwiki')
        
        if wikipedia_link_container is not None:
            wikipedia_link = wikipedia_link_container.find('a')
            if wikipedia_link and 'href' in wikipedia_link.attrs:
                return wikipedia_link['href']
            else:
                print(f"Wikipedia link not found for ID: {id}")
                return None
        else:
            print(f"Wikibase sitelink for English Wikipedia not found for ID: {id}")
            return None
    else:
        print(f"Failed to fetch Wikidata page for ID: {id}")
        return None