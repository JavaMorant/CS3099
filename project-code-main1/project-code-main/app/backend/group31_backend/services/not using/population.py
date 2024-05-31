# preliminary pre alpha pre release patch for the databases, needs dynamic teams as well as possible batching and insertion improvments tm




from player_services31 import create_team_with_players

def populate_database():
    conn = sqlite3.connect("FootballDatabase.db")
    cursor = conn.cursor()

    # Example: List of team IDs and names; adjust as necessary.
    teams_info = [
        {"id": "Q7156", "name": "Barcelona F.C."},
        # Add more teams as needed
    ]

    for team_info in teams_info:
        team = create_team_with_players(team_info['id'], team_info['name'])

        # Insert team
        cursor.execute("INSERT OR IGNORE INTO Teams (teamId, name) VALUES (?, ?)",
                       (team.id, team.name))

        for player in team.players:
            # Insert player
            cursor.execute("INSERT OR IGNORE INTO Players (playerId, name, teamId, country) VALUES (?, ?, ?, ?)",
                           (player.id, player.name, team.id, player.country))

            # Insert years played
            for year in player.years_played:
                cursor.execute("INSERT OR IGNORE INTO PlayerYearsPlayed (playerId, year) VALUES (?, ?)",
                               (player.id, year))

    conn.commit()
    conn.close()

populate_database()
