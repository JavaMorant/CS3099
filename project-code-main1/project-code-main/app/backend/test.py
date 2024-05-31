import sqlite3
import unittest
from wikidataintegrator import wdi_core
from domain.model import Coordinates, ErrorResponse, LeagueFilter, StadiumFilter, StadiumForm
from services.stadium_service import build_stadiums_query, insert_data, parse_coordinates, parse_id


class Test(unittest.TestCase):
    def test_home_stadium_for_west_ham(self):
        query = """
        SELECT ?stadiumLabel
        WHERE {
            ?team rdfs:label "West Ham United F.C."@en.   # Find the team with the specified label
            ?team wdt:P31/wdt:P279* wd:Q476028.   # Teams that are instances of football clubs
            ?team wdt:P17 wd:Q145.                 # Located in the United Kingdom
            ?team wdt:P115 ?stadium.              # Has home stadium
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        }
        """

        result = wdi_core.WDItemEngine.execute_sparql_query(query)[
            'results']['bindings']

        for item in result:
            stadium_name = item['stadiumLabel']['value']
            self.assertEqual(stadium_name, 'London Stadium')

    def test_query(self):
        stadiums_query = """
        SELECT ?teamLabel ?stadiumLabel ?coordinates ?capacity
        WHERE {
            ?team wdt:P31/wdt:P279* wd:Q476028.   # Teams that are instances of football clubs
            ?team wdt:P17 wd:Q145.                 # Located in the United Kingdom
            ?team wdt:P115 ?stadium.              # Has home stadium
            ?stadium wdt:P625 ?coordinates.       # Stadium coordinates
            ?stadium wdt:P1083 ?capacity.        # Capacity
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            }
        """

        result = wdi_core.WDItemEngine.execute_sparql_query(stadiums_query)[
            'results']['bindings']

        for item in result:
            team_name = item['teamLabel']['value']
            stadium_name = item['stadiumLabel']['value']
            if team_name == 'West Ham United F.C.':
                self.assertEqual(stadium_name, 'London Stadium')
                return

    def test_parse_coordinates(self):
        # Test case 1: Valid coordinates string
        coord_str = "Point(-74.0059 40.7128)"
        result = parse_coordinates(coord_str)
        self.assertEqual(result, {'lat': 40.7128, 'lng': -74.0059})

        # Test case 2: Invalid coordinates string
        coord_str = "Invalid coordinates string"
        result = parse_coordinates(coord_str)
        self.assertIsNone(result)

    def test_coordinates_from_wikidata(self):
        stadiums_query = """
        SELECT ?teamLabel ?stadiumLabel ?coordinates ?capacity
        WHERE {
            ?team wdt:P31/wdt:P279* wd:Q476028.   # Teams that are instances of football clubs
            ?team wdt:P17 wd:Q145.                 # Located in the United Kingdom
            ?team wdt:P115 ?stadium.              # Has home stadium
            ?stadium wdt:P625 ?coordinates.       # Stadium coordinates
            ?stadium wdt:P1083 ?capacity.        # Capacity
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            }
        """

        result = wdi_core.WDItemEngine.execute_sparql_query(stadiums_query)[
            'results']['bindings']

        for item in result:
            coord_str = item['coordinates']['value']
            coordinates = parse_coordinates(coord_str)
            self.assertIn('lat', coordinates)
            self.assertIn('lng', coordinates)

    def test_build_standard_query(self):
        filter = StadiumFilter()
        query, params = build_stadiums_query(filter)

        desired_query = "SELECT team.ID, team.name, league.id, league.country, stadium.name, stadium.lat, stadium.lng, stadium.capacity, stadium.year, stadium.image_url, stadium.location_desc FROM team, stadium, league WHERE team.stadium_ID = stadium.ID AND team.league_ID = league.ID;"
        self.assertEqual(query, desired_query)
        self.assertEqual(params, [])

    def test_parse_id(self):
        test_str = "http://www.wikidata.org/entity/Q18462"
        id = parse_id(test_str)

        bad_test_str = "http://www.wikidata.org/entity/q18462"
        bad_id = parse_id(bad_test_str)

        self.assertEqual(id, "Q18462")
        self.assertIsNone(bad_id)

    def test_insert_stadium(self):
        form = StadiumForm(**{"stadium-name": "hello", "capacity": 10, "coordinates": Coordinates(
            lat=10, lng=20), "year": 1900, "team-name": "Hello", "league": "blah"})
        self.assertEqual(ErrorResponse(
            error="League not in database."), insert_data(form))

        form2 = StadiumForm(**{"stadium-name": "hello", "capacity": 10, "coordinates": Coordinates(
            lat=10, lng=20), "year": 1900, "team-name": "Hello", "league": "Q9448"})
        new_id = insert_data(form2)
        self.assertIsInstance(new_id, int)


    def test_stadium_filtering(self):
        filter = StadiumFilter(
            **{"min-capacity": 10000, "max-capacity": 30000})
        stadiums_query, params = build_stadiums_query(filter)
        
        # Connect to database file
        conn = sqlite3.connect('group34_backend/database/stadiums.db', isolation_level=None)
        cursor = conn.cursor()

        rows = cursor.execute(stadiums_query, params).fetchall()

        for item in rows:
            self.assertTrue(item[7] <= 30000 and item[7] >= 10000)

        # Close connection
        cursor.close()
        conn.close()

    def test_league_filtering(self):
        # Connect to database file
        conn = sqlite3.connect('group34_backend/database/stadiums.db', isolation_level=None)
        cursor = conn.cursor()

        query = LeagueFilter(countries=["Italy"])
        rows = cursor.execute(f"SELECT * FROM league WHERE country in ({','.join(['?'] * len(query.countries))})", query.countries).fetchall()

        for item in rows:
            self.assertTrue(item[2] == "Italy")

        query2 = LeagueFilter(countries=["United Kingdom", "China", "Venezuela", "Uzbekistan"])
        rows2 = cursor.execute(f"SELECT * FROM league WHERE country in ({','.join(['?'] * len(query2.countries))})", query2.countries).fetchall()

        for item in rows2:
            self.assertTrue(item[2] in ("United Kingdom", "China", "Venezuela", "Uzbekistan"))


if __name__ == '__main__':
    unittest.main()
