import sqlite3

def create_database():
    try:
        conn = sqlite3.connect("FootballDatabase.db")
        cursor = conn.cursor()

        # Create Teams table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Teams (
                teamId TEXT PRIMARY KEY,
                name TEXT
            )""")

        # Create Players table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Players (
                playerId TEXT PRIMARY KEY,
                name TEXT,
                teamId TEXT,
                country TEXT,
                FOREIGN KEY(teamId) REFERENCES Teams(teamId)
            )""")

        # Create PlayerYearsPlayed table to store the years a player played for a team
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS PlayerYearsPlayed (
                playerId TEXT,
                year INTEGER,
                FOREIGN KEY(playerId) REFERENCES Players(playerId),
                PRIMARY KEY (playerId, year)
            )""")

        conn.commit()
        print("Database and tables created successfully.")
    except sqlite3.Error as e:
        print(f"Error creating the database: {e}")
    finally:
        conn.close()

create_database()
