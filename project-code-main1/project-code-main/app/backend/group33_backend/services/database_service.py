# before running run:
# export PYTHONPATH=${PYTHONPATH}:"(pwd-to-domain-model)"
import sqlite3
import time
from players_service import getTeamPlayersById_wikidata
from countries_service import getCountries_wikidata
from teams_service import getUKTeams_wikidata
import argparse

def create_database() -> None:
    print("Creating database...")
    start_time = time.time()
    try:
        conn = sqlite3.connect("group33_backend/Database.db")
        print(f"Database created successfully.")

        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS Teams (
                        teamId TEXT PRIMARY KEY, 
                        name TEXT, 
                        image_url TEXT
                        emptyTeam TEXT DEFAULT null)''')
        cursor.execute('''CREATE TABLE IF NOT EXISTS Countries (
                        countryId TEXT PRIMARY KEY, 
                        name TEXT, 
                        flag_url TEXT, 
                        UNIQUE(countryId))''')
        cursor.execute('''CREATE TABLE IF NOT EXISTS Players (
                        playerId TEXT, 
                        name TEXT, 
                        countryId TEXT, 
                        DOB TEXT, 
                        height TEXT, 
                        position TEXT, 
                        career_start TEXT, 
                        image_url TEXT, 
                        teamId TEXT,
                        fbrefId TEXT,
                        overall TEXT DEFAULT null, 
                        dribbling TEXT DEFAULT null,
                        shooting TEXT DEFAULT null,
                        passing TEXT DEFAULT null, 
                        physicality TEXT DEFAULT null,
                        playmaking TEXT DEFAULT null,
                        defending TEXT DEFAULT null,
                        FOREIGN KEY(teamId) REFERENCES Teams(teamId), 
                        FOREIGN KEY(countryId) REFERENCES Countries(countryId))''')
        cursor.execute('''CREATE TABLE IF NOT EXISTS ExtraInfo (
                        playerId TEXT,
                        goals TEXT DEFAULT null,
                        assists TEXT DEFAULT null,
                        sot TEXT DEFAULT null,
                        tackles_won TEXT DEFAULT null,
                        tackles_won_pct TEXT DEFAULT null,
                        shots TEXT DEFAULT null,
                        FOREIGN KEY(playerId) REFERENCES Players(playerId))''')
        conn.close()

    except sqlite3.Error as e:
        print(f"Error creating the database: {e}")
        
    print("--- %s seconds ---" % (time.time() - start_time))

def populate_database() -> None:
    print("Populating database...")
    start_time = time.time()

    #get all UK teams
    teams = getUKTeams_wikidata()

    try:
        conn = sqlite3.connect("group33_backend/Database.db")
        cursor = conn.cursor()

        for team in teams:

            team_list = []
            team_list.append(getattr(team, 'id'))
            team_list.append(getattr(team, 'name'))
            team_list.append(getattr(team, 'image_url'))

            cursor.execute('''
                           INSERT OR IGNORE INTO Teams (teamId, name, image_url)
                           VALUES (?, ?, ?)
                           ''', team_list)
        
        conn.commit()
        conn.close()
        print("Teams inserted successfully.")
        
        # get all countries in the world
        populate_countries()

        print("Database was populated")
    
    except sqlite3.Error as e:
        print(f"Error inserting data: {e}")
    
    print("--- %s seconds ---" % (time.time() - start_time))

def populate_countries() -> None:
    print("Populating countries...")
    countries = getCountries_wikidata()

    try:
        conn = sqlite3.connect("group33_backend/Database.db")
        cursor = conn.cursor()

        for country in countries:

            country_list = []
            country_list.append(getattr(country, 'id'))
            country_list.append(getattr(country, 'name'))
            country_list.append(getattr(country, 'flag'))

            cursor.execute('''
                           INSERT OR IGNORE INTO Countries (countryId, name, flag_url)
                           VALUES (?, ?, ?)
                           ''', country_list)
        
        conn.commit()
        conn.close()
        print("Countries inserted successfully.")
    
    except sqlite3.Error as e:
        print(f"Error inserting data: {e}")

def emptyDB() -> None:
    print("Emptying database...")
    try:
        conn = sqlite3.connect("group33_backend/Database.db")
        cursor = conn.cursor()
        cursor.execute('''DELETE FROM Players''')
        cursor.execute('''DELETE FROM ExtraInfo''')
        cursor.execute('''UPDATE Teams SET emptyTeam = null''')
        conn.commit()
        conn.close()
        print("Database was emptied")
    except sqlite3.Error as e:
        print(f"Error emptying the database: {e}")


@DeprecationWarning
def populate_players(teams: str) -> None:

        try:
            conn = sqlite3.connect("group33_backend/Database.db")
            cursor = conn.cursor()
        
            for team in teams:
                players = getTeamPlayersById_wikidata(getattr(team, 'id'))

                for player in players:

                    player_list = []
                    player_list.append(getattr(player, 'id'))
                    player_list.append(getattr(player, 'name'))
                    player_list.append(getattr(player, 'citizenship'))
                    player_list.append(getattr(player, 'DOB'))
                    player_list.append(getattr(player, 'height'))
                    player_list.append(getattr(player, 'position'))
                    player_list.append(getattr(player, 'career_start'))
                    player_list.append(getattr(player, 'image_url'))
                    player_list.append(getattr(player, 'teamId'))
                    player_list.append(getattr(player, 'fbrefId'))

                    print(player_list)

                    cursor.execute('''
                                INSERT OR IGNORE INTO Players (playerId, name, countryId, DOB, height, position, career_start, image_url, teamId, fbrefId)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                ''', player_list)

                time.sleep(1)

            conn.commit()
            conn.close()
            print("Players inserted successfully")

        except sqlite3.Error as e:
            print(f"Error inserting player data: {e}")
            
# Create the parser
parser = argparse.ArgumentParser(description="Execute different database functions")

# Add the arguments
parser.add_argument('-c', '--create', action='store_true', help='Create the database')
parser.add_argument('-p', '--populate', action='store_true', help='Populate the database with Teams and Countries')
parser.add_argument('-e', '--empty', action='store_true', help='Empty the database')


# Parse the arguments
args = parser.parse_args()

# Ensure only one flag is used at a time
if sum([args.create, args.populate, args.empty]) > 1:
    print("Error: Please pass only one flag at a time.")
    parser.print_help()
    exit(1)

# Execute the appropriate function
if args.create:
    create_database()
elif args.populate:
    populate_database()
    populate_countries
elif args.empty:
    emptyDB()
else:
    print("No flag / Wrong flag passed. Please pass a correct flag.")
    parser.print_help()