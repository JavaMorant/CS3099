import sqlite3

connection = sqlite3.connect('player_teams.db')
cursor = connection.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Players(
        player_id INTEGER PRIMARY KEY,
        player_name TEXT
    )
    ''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Teams(
        team_id INTEGER PRIMARY KEY,
        num_of_matches TEXT,
        num_of_goals TEXT,
        team_name TEXT,
        start_date DATE,
        end_date DATE,
        stadium_location TEXT
    )
    ''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Stadiums(
        stadium_id INTEGER PRIMARY KEY,
        FOREIGN KEY (team_id) REFERENCES Teams(team_id),
        stadium_name TEXT,
        stadium_coords TEXT
    )
    ''')

connection.commit()
connection.close()
