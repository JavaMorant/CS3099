## This file populates the database with the Leagues we 100% need to be populated correctly


import sqlite3
import time
import sqlite3
from country_service import  getCountriesFromWikidata
from League_service import  getLeaguesInCountry_wikidata
from teams_service import getLeagueTeams_wikidata
from player_service import getPlayersByTeamId





def create_database():
    try:
        conn = sqlite3.connect("Database31HardCodedVX.db")
        print(f"Database created successfully.")

        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS Countries (CountryID TEXT PRIMARY KEY, name TEXT, flag TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS Leagues (LeagueID TEXT PRIMARY KEY, name TEXT, logo TEXT, country TEXT, FOREIGN KEY(country) REFERENCES Countries(CountryID))")
        cursor.execute("CREATE TABLE IF NOT EXISTS Teams (teamId TEXT PRIMARY KEY, name TEXT, logo TEXT, colour TEXT, leagueID TEXT, stadiumName TEXT, inception INT, headquarters TEXT,FOREIGN KEY(leagueID) REFERENCES Leagues(leagueID))")
        cursor.execute("CREATE TABLE IF NOT EXISTS Players (playerId TEXT, name TEXT, years_played TEXT, teamID TEXT, DOB TEXT, citizenship TEXT, position TEXT , birthName TEXT, FOREIGN KEY(teamID) REFERENCES Teams(teamId), PRIMARY KEY(playerId, teamId))")


    except sqlite3.Error as e:
        print(f"Error creating the database: {e}")





def populate_teams_and_players(leagueID):

    print(f'populating database for {leagueID}')
    teams = getLeagueTeams_wikidata(leagueID)

    try:
        conn = sqlite3.connect("Database31HardCodedVX.db")
        cursor = conn.cursor()

        for team in teams:
            team_list = []
            team_list.append(getattr(team, 'id'))
            team_list.append(getattr(team, 'name'))
            team_list.append(getattr(team, 'logo'))
            team_list.append(getattr(team, 'colour'))
            team_list.append(leagueID)
            team_list.append(getattr(team, 'stadiumName'))
            team_list.append(getattr(team, 'inception'))
            
           
            cursor.execute('''
                           INSERT OR IGNORE INTO Teams (teamId, name, logo, colour, leagueID, stadiumName, inception)
                           VALUES (?, ?, ?,?,?,?,?)
                           ''', team_list)
        
        conn.commit()
        conn.close()
        print("Teams inserted successfully.")
        
        populate_players(teams)   

        print("Database was populated")
    
    except sqlite3.Error as e:
        print(f"Error inserting data: {e}")



def populate_players(teams: str):
   

        try:
            
            conn = sqlite3.connect("Database31HardCodedVX.db")
            cursor = conn.cursor()
            x=0 
            for team in teams:
                players = getPlayersByTeamId(getattr(team, 'id'))
                y=0
                for player in players:
                    y+=1

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
                print(f'number of players added: {y}')

                
            conn.commit()
            conn.close()
            print("Players inserted successfully")
            print(x)
        except sqlite3.Error as e:
           print(f"Error inserting player data: {e}")


def populate_countries_and_leagues():
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect("Database31HardCodedVX.db")
        cursor = conn.cursor()

        countries_data = getCountriesFromWikidata()
        # Insert data into the Countries table

        for country in countries_data:
            countries_list =[]
            countries_list.append(getattr(country, 'id'))
            countries_list.append(getattr(country, 'name'))
            countries_list.append(getattr(country, 'flag'))

            cursor.execute('''
                INSERT OR IGNORE INTO Countries (CountryID, name,flag)
                VALUES (?, ?,?)
            ''', countries_list)


            leagues = getLeaguesInCountry_wikidata(getattr(country, 'id'))
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
                print("Leagues inserted successfully.")

        # Commit changes and close the connection
        conn.commit()
        print("Countries inserted successfully.")
    except sqlite3.Error as e:
        print(f"Error inserting countries: {e}")
    finally:

        conn.close()

def populate_leagues(countryID):
    
    leagues = getLeaguesInCountry_wikidata(countryID)
    print(leagues)
    try:
        conn = sqlite3.connect("Database31HardCodedVX.db")
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





################################## CODE TO RUN IF NEEDED TO POPULATE THE CURATED DATABASE ###########################


List_of_leagues = ['Q324867','Q35615','Q100146559','Q9448','Q19510','Q19565','Q15804','Q194052','Q607965','Q13394','Q217374','Q18543','Q14377162','Q14468438','Q82595','Q152665','Q154069','Q255633']
#create_database()
#populate_countries_and_leagues()
#populate_teams_and_players(List_of_leagues[Replace manually by 0-17 in order to make sure all curated teams and players are populated])


