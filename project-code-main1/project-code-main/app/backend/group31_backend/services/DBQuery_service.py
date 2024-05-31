import sqlite3
import time
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from SPARQLWrapper import SPARQLWrapper, JSON
from bs4 import BeautifulSoup
import requests
import json
from typing import Union, Optional

def run_query(query):
    try:
        conn = sqlite3.connect("group31_backend/database/Database31HardCodedV3.db")
        cursor = conn.cursor()

        cursor.execute(query)
        res = cursor.fetchall()

        conn.close()

        return res

    except sqlite3.Error as e:
        print(f"Error accessing data: {e}")

def query_all_countries():
    query = f'''SELECT * FROM CuratedCountries'''
    return run_query(query)

def query_leagues_of_countryID(country):
    query = f'''SELECT * FROM CuratedLeagues WHERE country = "{country}"'''
    return run_query(query)

def query_clubs_of_leagueID(league):
    query = f'''SELECT * FROM Teams WHERE leagueID = "{league}"'''
    return run_query(query)

def query_player_by_ID(playerID):
    query = f'''SELECT * FROM Players WHERE playerId = "{playerID}"'''
    return run_query(query)

def query_club_by_ID(clubID):
    query = f'''SELECT * FROM Teams WHERE teamId = "{clubID}"'''
    return run_query(query)

def query_clubname_by_ID(clubID):
    query = f'''SELECT name FROM Teams WHERE teamId = "{clubID}"'''
    return run_query(query)

def query_node_info(club):
    club_query = f'''SELECT name, colour, logo FROM Teams WHERE teamID = "{club}"'''
    clubdata = run_query(club_query)
    players_query = f'''SELECT playerId, name, years_played FROM Players WHERE teamID = "{club}"'''
    players = run_query(players_query)
    res = dict()
    res['id'] = club
    res['name'] = clubdata[0][0]
    res['colour'] = clubdata[0][1]
    res['logo'] = clubdata[0][2]
    res['players'] = players
    return res

def main():
    # res = query_all_countries()
    res = query_leagues_of_countryID("Q145")
    # res = query_clubs_of_leagueID("Q9448")
    # res = query_node_info("Q1130849")
    # res = query_player_by_ID("Q459830")
    print(res)

if __name__ == '__main__':
    main()
