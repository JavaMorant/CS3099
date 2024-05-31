import sqlite3
from SPARQLWrapper import SPARQLWrapper, JSON

def insert_league(conn, league_id, league_name, league_logo):
    cursor = conn.cursor()
    cursor.execute("INSERT OR IGNORE INTO Leagues (LeagueId, LeagueName) VALUES (?, ?)", (league_id, league_name))
    conn.commit()

def insert_team(conn, team_id, team_name, league_id):
    cursor = conn.cursor()
    cursor.execute("INSERT OR IGNORE INTO Teams (TeamId, Name, LeagueId) VALUES (?, ?, ?)", (team_id, team_name, league_id))
    conn.commit()

def insert_player(conn, player_id, player_name, team_id, country):
    cursor = conn.cursor()
    cursor.execute("INSERT OR IGNORE INTO Players (PlayerId, Name, TeamId, Country) VALUES (?, ?, ?, ?)", (player_id, player_name, team_id, country))
    conn.commit()

def insert_player_years_played(conn, player_id, team_id, years):
    cursor = conn.cursor()
    for year in years:
        cursor.execute("INSERT OR IGNORE INTO PlayerYearsPlayed (PlayerId, TeamId, Year) VALUES (?, ?, ?)", (player_id, team_id, year))
    conn.commit()

def main():
    # Connect to your database
    conn = sqlite3.connect("FootballDatabase.db")

    # Example: Inserting data for a specific league
    league_id = "Q12345"  # Example league Wikidata ID
    league_name = "Example League"
    league_logo = "URL to league logo"

    insert_league(conn, league_id, league_name, league_logo)

    # Assume getTeamsByLeagueId_wikidata and other functions are defined and work correctly
    league = getTeamsByLeagueId_wikidata(league_id)

    for team in league.teams:
        insert_team(conn, team.id, team.name, league_id)
        
        for player in getPlayersByTeamId(team.id):
            insert_player(conn, player.id, player.name, team.id, "Player's country")  # Adjust according to actual data availability
            
            # Example player years, assuming you have a function to get this data
            player_years = [2015, 2016, 2017, 2018]  # This should be fetched dynamically
            insert_player_years_played(conn, player.id, team.id, player_years)

    # Close the connection
    conn.close()

if __name__ == "__main__":
    main()
