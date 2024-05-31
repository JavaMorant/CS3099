from typing import List
from pydantic import BaseModel
from player_service import  getPlayersByTeamId
from teams_service import  getLeagueTeams_wikidata
from League_service import  getLeaguesInCountry_wikidata
from country_service import  getCountriesFromWikidata
import json

import sqlite3
import time





def create_database():
    try:
        conn = sqlite3.connect("Database31.db")
        print(f"Database created successfully.")

        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS Countries (CountryID TEXT PRIMARY KEY, name TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS Leagues (LeagueID TEXT PRIMARY KEY, name TEXT, logo TEXT, country TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS Teams (teamId TEXT PRIMARY KEY, name TEXT, logo TEXT, colour TEXT, leagueID TEXT, stadiumName TEXT, inception INT, headquarters TEXT, FOREIGN KEY(leagueID) REFERENCES Leagues(leagueID))")
        cursor.execute("CREATE TABLE IF NOT EXISTS Players (playerId TEXT, name TEXT, years_played TEXT, teamID TEXT, DOB TEXT, citizenship TEXT, position TEXT , birthName TEXT , FOREIGN KEY(teamID) REFERENCES Teams(teamId), PRIMARY KEY(playerId, teamId))")


    except sqlite3.Error as e:
        print(f"Error creating the database: {e}")




def populate_database():

   
    numberOfPlayers = 0
    try:
        conn = sqlite3.connect("Database31.db")
        cursor = conn.cursor()
        countries = getCountriesFromWikidata()


        for country in countries:
            countries_list =[]
            countries_list.append(getattr(country, 'id'))
            countries_list.append(getattr(country, 'name'))
            cursor.execute('''
                INSERT OR IGNORE INTO Countries (CountryID, name)
                VALUES (?, ?)
            ''', countries_list)

            leagues = getLeaguesInCountry_wikidata(getattr(country, 'id'))
            print(f'getting leagues in country:{country}')



            for league in leagues:
                league_list = []
                league_list.append(getattr(league, 'id'))
                league_list.append(getattr(league, 'name'))
                league_list.append(getattr(league, 'logo'))
                league_list.append(getattr(league, 'country'))
                cursor.execute('''
                            INSERT OR IGNORE INTO Leagues (leagueId, name, logo, country)
                            VALUES (?, ?, ?,?)
                            ''', league_list)


                teams = getLeagueTeams_wikidata(getattr(league, 'id'))
                print(f'getting teams in league:{league}')


                for team in teams:
                    team_list = []
                    team_list.append(getattr(team, 'id'))
                    team_list.append(getattr(team, 'name'))
                    team_list.append(getattr(team, 'logo'))
                    team_list.append(getattr(team, 'colour'))
                    team_list.append(getattr(team, 'stadiumName'))
                    team_list.append(getattr(team, 'inception'))
                    team_list.append(getattr(team, 'headquarters'))
                    team_list.append(leagueID)
                
                    cursor.execute('''
                                INSERT OR IGNORE INTO Teams (teamId, name, logo, colour, leagueID, stadiumName, inception,headquarters)
                                VALUES (?, ?, ?,?,?,?,?,?)
                                ''', team_list)
                    players = getPlayersByTeamId(getattr(team, 'id'))   
                    teamname =getattr(team, 'name')
                    print(f'getting players in team:{teamname}')
                    #time.sleep(1)
                    for player in players:
                        print(player)
                        player_list = []
                        player_list.append(getattr(player, 'id'))
                        player_list.append(getattr(player, 'name'))
                        player_list.append(getattr(player, 'years_played'))
                        player_list.append(getattr(player, 'teamID'))
                        player_list.append(getattr(player, 'DOB'))
                        player_list.append(getattr(player, 'citizenship'))
                        player_list.append(getattr(player, 'position'))
                        player_list.append(getattr(player, 'birthName'))
                        numberOfPlayers+=1
                        


                        cursor.execute('''
                                    INSERT OR IGNORE INTO Players (playerId, name, years_played, teamID,DOB,citizenship,position, birthName)
                                    VALUES (?, ?, ?,?,?,?,?,?)
                                    ''', player_list)
                    print(getattr(team, 'name'))
                    time.sleep(1)



               

                
        
        conn.commit()
        conn.close()
        print("Teams inserted successfully.")
        print(f'number of players: {numberOfPlayers}')
        

        print("Database was populated")

    except sqlite3.Error as e:
        print(f"Error inserting data: {e}")



def populate_leagues(countryID):
    
    leagues = getLeaguesInCountry_wikidata(countryID)
    print(leagues)
    try:
        conn = sqlite3.connect("Database31.db")
        cursor = conn.cursor()

        for league in leagues:
            league_list = []
            league_list.append(getattr(league, 'id'))
            league_list.append(getattr(league, 'name'))
            league_list.append(getattr(league, 'logo'))
            league_list.append(getattr(league, 'country'))
        
           
            cursor.execute('''
                           INSERT OR IGNORE INTO Leagues (leagueId, name, logo, country)
                           VALUES (?, ?, ?,?)
                           ''', league_list)
        
        conn.commit()
        conn.close()
        print("Leagues inserted successfully.")


    except sqlite3.Error as e:
            print(f"Error inserting dataaaa: {e}")



def populate_countries():
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect("Database31.db")
        cursor = conn.cursor()

    

        # Sample data for countries (you may replace this with actual data)
        countries_data = getCountriesFromWikidata()
        # Insert data into the Countries table

        for country in countries_data:

            countries_list =[]
            countries_list.append(getattr(country, 'id'))
            countries_list.append(getattr(country, 'name'))

            cursor.execute('''
                INSERT OR IGNORE INTO Countries (CountryID, name)
                VALUES (?, ?)
            ''', countries_list)

        # Commit changes and close the connection
        conn.commit()
        print("Countries inserted successfully.")
    except sqlite3.Error as e:
        print(f"Error inserting countries: {e}")
    finally:
        conn.close()










def populate_players(teams: str):
   

        try:
            x=0
            conn = sqlite3.connect("Database31.db")
            cursor = conn.cursor()

            for team in teams:
                players = getPlayersByTeamId(getattr(team, 'id'))

                for player in players:


                    player_list = []
                    player_list.append(getattr(player, 'id'))
                    player_list.append(getattr(player, 'name'))
                    player_list.append(getattr(player, 'years_played'))
                    player_list.append(getattr(player, 'teamID'))
                    player_list.append(getattr(player, 'DOB'))
                    player_list.append(getattr(player, 'citizenship'))
                    player_list.append(getattr(player, 'position'))
                    player_list.append(getattr(player, 'birthName'))
                    x+=1
                    


                    cursor.execute('''
                                INSERT OR IGNORE INTO Players (playerId, name, years_played, teamID,DOB,citizenship,position, birthName)
                                VALUES (?, ?, ?,?,?,?,?,?)
                                ''', player_list)


                time.sleep(1)
                print(getattr(team, 'name'))

                
            conn.commit()
            
            print("Players inserted successfully")
            print(x)
        except sqlite3.Error as e:
           print(f"Error inserting player data: {e}")




start_time = time.time()
leagueID = 'Q9448'
create_database()
populate_database()
print("--- %s seconds ---" % (time.time() - start_time))


def print_teams():
    try:
        conn = sqlite3.connect("Database31.db")
        cursor = conn.cursor()

        cursor.execute('''SELECT * FROM Players''')
        teams = cursor.fetchall()

        for team in teams:
            print(team)  
        conn.close()
    
    except sqlite3.Error as e:
        print(f"Error accessing data: {e}")

# Call this function after populating the database to print the teams

print_teams()
