from wikidataintegrator import wdi_core
from domain.model import ErrorResponse


def execute_sparql_query(query: str) -> list or ErrorResponse:
    # If connection to Wikidata fails after retries, return an error
    try:
        return wdi_core.WDItemEngine.execute_sparql_query(query, max_retries=3, retry_after=5)[ # Could make retry parameters part of env
            'results']['bindings']
    except:
        return ErrorResponse(error="Error retrieving data from Wikidata")
