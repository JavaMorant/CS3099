"""
This module provides functions to check connection to Wikidata and get Wikipedia URL by Wikidata ID.
"""
import requests
from bs4 import BeautifulSoup
from typing import Optional



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
    try:
        wikidata_page = requests.get(wikidata_url, timeout=5)  # 5 seconds timeout
    except:
        print("The request timed out")
        return None
    if (wikidata_page.status_code == 200):
        soup = BeautifulSoup(wikidata_page.content, 'html.parser')
        try:
            wikipedia_url = soup.find('span', class_='wikibase-sitelinkview-link-enwiki').find('a')['href']
        except:
            return None
        return wikipedia_url
    else:
        return None