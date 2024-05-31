import sqlite3
import requests
from bs4 import BeautifulSoup
import time
from domain.model import PlayerGroup33_extra
from group33_backend.services.players_service import getPlayerById_database, getPlayerById_wikidata 
from unidecode import unidecode

#Maximum stats
max_ = {
    "goals": 75.5,
    "assists": 36.5,
    "goals_pens": 31.75,
    "pens_att": 14.0,
    "progressive_carries": 326.0,
    "progressive_passes": 669.5,
    "progressive_passes_received": 944.5,
    "shots": 142.25,
    "shots_on_target": 67.25,
    "goals_per_shot_on_target": 1.87,
    "passes_completed": 6678.5,
    "passes": 7302.0,
    "through_balls": 27.5,
    "passes_switches": 64.25,
    "passes_offsides": 22.25,
    "passes_blocked": 72.75,
    "sca": 227.5,
    "sca_take_ons": 16.75,
    "gca": 23.5,
    "tackles": 115.25,
    "tackles_won": 145.0,
    "blocks": 73.0,
    "blocked_shots": 55.75,
    "blocked_passes": 10.0,
    "interceptions": 144.0,
    "errors": 4.5,
    "touches": 3993.5,
    "take_ons": 163.75,
    "take_ons_won": 101.0,
    "carries": 2532.5,
    "miscontrols": 140.25,
    "ball_recoveries": 338.75,
    "aerials_won": 171.75,
    "aerials_lost": 140.25,
}

def fetch_and_parse_html(url) -> BeautifulSoup or None: # type: ignore
    """Fetch HTML content for a given URL and return a BeautifulSoup object."""
    response = requests.get(url)
    if response.status_code == 200:
        return BeautifulSoup(response.content, 'html.parser')
    else:
        return None

def filter_rows_by_season(rows, seasons_of_interest) -> list:
    """Filter rows by seasons of interest and return filtered rows."""
    filtered_rows = []
    for row in rows:
        year_td = row.find('th', {'data-stat': 'year_id'})
        if year_td and any(season in year_td.text for season in seasons_of_interest):
            filtered_rows.append(row)
    return filtered_rows

def accumulate_stats_from_rows(rows, stats_keys) -> dict:
    """Accumulate stats from rows and return a dictionary of cumulative stats."""
    cumulative_stats = {stat: 0 for stat in stats_keys}
    for row in rows:
        for stat in stats_keys:
            data_stat = row.find('td', {'data-stat': stat})
            if data_stat and data_stat.text:
                try:
                    cumulative_stats[stat] += float(data_stat.text)
                except ValueError:
                    pass  # Handle cases where text cannot be converted to float
    return cumulative_stats

def rate(position, normalised_stats) -> list:
    ratings = [0 for i in range(7)]

    #dribbling
    ratings[0] = int(30 + (0.15*normalised_stats["progressive_carries"] + 0.15*normalised_stats["take_ons_won"] + 0.15*normalised_stats["take_ons_pct"] + 0.15*normalised_stats["carries"] + 0.13*normalised_stats["touches"] + 0.12*normalised_stats["sca_take_ons"] + 0.10*normalised_stats["miscontrols"] + 0.05*normalised_stats["progressive_passes"]) * 70)
    #shooting
    ratings[1] = int(30 + (0.20*normalised_stats["goals"] + 0.15*normalised_stats["pens_pct"] + 0.15*normalised_stats["shots_on_target_pct"] + 0.13*normalised_stats["shots"] + 0.13*normalised_stats["goals_per_shot"] + 0.12*normalised_stats["shots_on_target"] + 0.12*normalised_stats["goals_pens"]) * 70)
    #passing
    ratings[2] = int(30 + (0.25*normalised_stats["passes_completed"] + 0.25*normalised_stats["passes_pct"] + 0.20*normalised_stats["passes"] + 0.10*normalised_stats["through_balls"] + 0.10*normalised_stats["passes_offsides"] + 0.10*normalised_stats["passes_blocked"]) * 70)
    #physicality
    ratings[3] = int(30 + (0.16*normalised_stats["tackles_won"] + 0.14*normalised_stats["tackles"] + 0.14*normalised_stats["tackles_won_pct"] + 0.13*normalised_stats["take_ons_won"] + 0.13*normalised_stats["take_ons_pct"] + 0.11*normalised_stats["aerials_won"] + 0.11*normalised_stats["aerials_lost"] + 0.09*normalised_stats["take_ons"]) * 70)
    #playmaking
    ratings[4] = int(30 + (0.15*normalised_stats["assists"] + 0.14*normalised_stats["sca"] + 0.14*normalised_stats["gca"] + 0.13*normalised_stats["carries"] + 0.12*normalised_stats["through_balls"] + 0.12*normalised_stats["passes_switches"] + 0.10*normalised_stats["passes_offsides"] + 0.10*normalised_stats["miscontrols"]) * 70)
    #defending
    ratings[5] = int(30 + (0.10*normalised_stats["tackles_won"] + 0.10*normalised_stats["tackles"] + 0.10*normalised_stats["tackles_won_pct"] + 0.10*normalised_stats["blocked_shots"] + 0.09*normalised_stats["interceptions"] + 0.09*normalised_stats["blocked_passes"] + 0.09*normalised_stats["blocks"] + 0.09*normalised_stats["ball_recoveries"] + 0.07*normalised_stats["aerials_won"] + 0.06*normalised_stats["errors"] + 0.06*normalised_stats["miscontrols"] + 0.06*normalised_stats["aerials_lost"]) * 70)

    for i in range(6):
        if ratings[i] > 100:
            ratings[i] = 100
        elif ratings[i] > 65:
            ratings[i] = int(100 - (100-ratings[i])*2/3)
        elif ratings[i] > 45:
            ratings[i] = int(100 - (100-ratings[i])*3/4)
        else:
            ratings[i] = int(100 - (100-ratings[i])*7/8)
    
    #calculate overall score
    #if they are a forward
    if position in ["winger", "forward"]:
        ratings[6] = 0.25*ratings[1] + 0.21*ratings[0] + 0.19*ratings[4]  + 0.15*ratings[2] + 0.14*ratings[3] + 0.06*ratings[5]

    #if they are a defender
    elif position in ["centre back", "defender", "full back"]:
        ratings[6] = 0.25*ratings[5] + 0.21*ratings[3] + 0.19*ratings[2] + 0.15*ratings[0] + 0.14*ratings[4]  + 0.06*ratings[1]

    #if they are a midfielder
    else:
        ratings[6] = 0.20*ratings[2] + 0.20*ratings[4]  + 0.18*ratings[0] + 0.14*ratings[5] + 0.14*ratings[3] + 0.14*ratings[1]

    return ratings

##def scrape_player(player_id, player_name):
def scrape_player(player_id):
    player_dict = getPlayerById_database(player_id)
    if not player_dict:
        # so it works for all players - get live data
        player_dict = getPlayerById_wikidata(player_id)
    player_name = player_dict.name
    print(f"Scraping data for {player_name}")
    
    player_name = unidecode(player_name)
    player_name = player_name.replace(" ", "-")

    """Scrape player data based on provided parameters."""
    base_url = "https://fbref.com/en/players/{}/all_comps/{}-Stats---All-Competitions"
    url = base_url.format(player_dict.fbrefId, player_name)

    #get the position of the player
    position = player_dict.position.lower()

    #if a player is a goalkeeper, return none
    if position == "goalkeeper":
        return None

    stats_keys = [
        'goals', 'assists', 'goals_pens', 'pens_att', 'progressive_carries', 'progressive_passes', 'progressive_passes_received',
        'shots', 'shots_on_target', 'goals_per_shot_on_target', 'passes_completed', 'passes',
        'through_balls', 'passes_switches', '-passes_offsides', '-passes_blocked', 'sca', "sca_take_ons", 'gca', 
        'tackles', 'tackles_won', 'blocks', 'blocked_shots', 'blocked_passes', 'interceptions', '-errors', 'touches', 'take_ons',
        'take_ons_won', 'carries', '-miscontrols', 'ball_recoveries', 'aerials_won', '-aerials_lost'
    ]

    ratio_keys = [
        ["goals_pens", "pens_att", "pens_pct"],
        ["goals", "shots_on_target", "goals_per_shot"],
        ["shots_on_target", "shots", "shots_on_target_pct"],
        ["passes_completed", "passes", "passes_pct"],
        ["take_ons_won", "take_ons", "take_ons_pct"],
        ["tackles_won", "tackles", "tackles_won_pct"]
    ]

    seasons_of_interest = ['2020-2021', '2021-2022', '2022-2023', '2023-2024']
    soup = fetch_and_parse_html(url)
    if soup:
        tables = ['stats_standard', 'stats_shooting', 'stats_passing', 'stats_passing_types', 'stats_gca', 'stats_defense', 'stats_possession', 'stats_misc']
        cumulative_stats = {stat: 0 for stat in stats_keys}
        actual_num_seasons = 0

        for table_suffix in tables:
            table = soup.find('div', id=f'div_{table_suffix}_expanded')
            rows = table.find('tbody').find_all('tr') if table else []
            filtered_rows = filter_rows_by_season(rows, seasons_of_interest)
            table_stats = accumulate_stats_from_rows(filtered_rows, stats_keys)

            # Update cumulative stats
            for stat in stats_keys:
                cumulative_stats[stat] += table_stats[stat]

            if table_suffix == 'stats_standard':
                # Determine the number of seasons from the standard stats table
                actual_num_seasons = len(set(row.find('th', {'data-stat': 'year_id'}).text for row in filtered_rows))

        # Calculate the average for each stat over the actual number of seasons found
        for stat in cumulative_stats:
            cumulative_stats[stat] /= actual_num_seasons if actual_num_seasons > 0 else 1  # Avoid division by zero

        # print(f"Averages for {player_name} from {min(seasons_of_interest)} to {max(seasons_of_interest)}: {cumulative_stats}\n")

        normalised_stats = {}

        #normalise the statistics
        for key in stats_keys:
            if key[0] == "-":
                key = key[1:]
                normalised_stats[key] = (max_[key] - cumulative_stats["-"+key])/max_[key]
            else:
                normalised_stats[key] = cumulative_stats[key]/max_[key]
        
        for key in ratio_keys:
            if cumulative_stats[key[1]] != 0:
                normalised_stats[key[2]] = cumulative_stats[key[0]]/cumulative_stats[key[1]]
            else:
                normalised_stats[key[2]] = 0

        # print(f"Normalised values for {player_name} from {min(seasons_of_interest)} to {max(seasons_of_interest)}: {normalised_stats}\n")

        ratings = rate(position, normalised_stats)

        extra_info = {
            "goals": int(cumulative_stats["goals"]),
            "assists": int(cumulative_stats["assists"]),
            "shots_on_target_pct": round(normalised_stats["shots_on_target_pct"]*100, 1),
            "tackles_won": int(cumulative_stats["tackles_won"]),
            "tackles_won_pct": round(normalised_stats["tackles_won_pct"]*100, 1),
            "shots": int(cumulative_stats["shots"])
        }

        return ratings, extra_info
    else:
        print(f"Failed to fetch data for {player_name}")

        return None

# # Player URLs or IDs and related parameters
# player_ids_names = [
#     ("1f44ac21", "Erling Haaland"),
#     ("6025fab1", "Luka Modrić"),
#     ("e06683ca", "Virgil van Dijk")
# ]


# # Main loop to scrape players with rate limiting
# start_time = time.time()
# requests_made = 0
# for player_id, player_name in player_ids_names:
#     ratings, extra_info = scrape_player(player_id, player_name)

#     print(f"dribbling: {ratings[0]}")
#     print(f"shooting: {ratings[1]}")
#     print(f"passing: {ratings[2]}")
#     print(f"physicality: {ratings[3]}")
#     print(f"playmaking: {ratings[4]}")
#     print(f"defending: {ratings[5]}")

#     if requests_made >= 20:
#         elapsed = time.time() - start_time

def insert_extra_info(playerId: str, Group33_extra: PlayerGroup33_extra) -> None:
    try: 
        conn = sqlite3.connect("group33_backend/Database.db")
        cursor = conn.cursor()
        extra_info = [playerId, getattr(Group33_extra, 'goals'), getattr(Group33_extra, 'assists'), getattr(Group33_extra, 'sot'), getattr(Group33_extra, 'tackles_won'), getattr(Group33_extra, 'tackles_won_pct'), getattr(Group33_extra, 'shots')]
        cursor.execute('''
                        INSERT OR IGNORE INTO ExtraInfo (playerId, goals, assists, sot, tackles_won, tackles_won_pct, shots)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ''', extra_info)
        conn.commit()
        conn.close()
        print("Extra info inserted successfully")
    except sqlite3.Error as e:
        print(f"Error inserting extra info: {e}")
        conn.close()
        
# def getAdditionalData(player_id: str) -> PlayerGroup33_extra or None:
#     # get player's extra data if exists
#     connection = sqlite3.connect("group33_backend/Database.db")
#     cursor = connection.cursor()
#     cursor.execute("SELECT goals, assists, sot, tackles_won, tackles_won_pct, shots FROM ExtraInfo WHERE playerId=?", (player_id,))
#     player = cursor.fetchone()
#     connection.close()
#     if player:
#         # return extra info
#         return PlayerGroup33_extra(
#             goals=player[0], 
#             assists=player[1], 
#             sot=player[2], 
#             tackles_won=player[3], 
#             tackles_won_pct=player[4], 
#             shots=player[5])
    
#     else:
#         print("Player not found in database, trying to scrape the data")
#         # if doesn't exist need to scrape the data
#         try:
#             ratings, extra_info = scrape_player(player_id)
#             # insert the extra info into the database: table Player
#             connection = sqlite3.connect("group33_backend/Database.db")
#             cursor = connection.cursor()
#             cursor.execute("UPDATE Players SET dribbling=?, shooting=?, passing=?, physicality=?, playmaking=?, defending=?, overall=? WHERE playerId=?", (ratings[0], ratings[1], ratings[2], ratings[3], ratings[4], ratings[5], ratings[6], player_id))
#             connection.commit()
            
#             # insert the extra info into the database: table ExtraInfo
#             cursor.execute("INSERT INTO ExtraInfo (playerId, goals, assists, sot, tackles_won, tackles_won_pct, shots) VALUES (?, ?, ?, ?, ?, ?, ?)", (player_id, extra_info['goals'], extra_info['assists'], extra_info['shots_on_target_pct'], extra_info['tackles_won'], extra_info['tackles_won_pct'], extra_info['shots']))
#             connection.commit()
            
#             connection.close()
#             print("Extra info inserted successfully")
#             return PlayerGroup33_extra(
#                 goals=extra_info["goals"], 
#                 assists=extra_info["assists"], 
#                 sot=extra_info["shots_on_target_pct"], 
#                 tackles_won=extra_info["tackles_won"], 
#                 tackles_won_pct=extra_info["tackles_won_pct"], 
#                 shots=extra_info["shots"])
#         except:
#             return None

def getAdditionalData(player_id: str) -> PlayerGroup33_extra or None:
    # Connect to the database
    connection = sqlite3.connect("group33_backend/Database.db")
    cursor = connection.cursor()
    
    # Fetch the player's extra info and ratings
    cursor.execute("""
        SELECT e.goals, e.assists, e.sot, e.tackles_won, e.tackles_won_pct, e.shots,
               p.dribbling, p.shooting, p.passing, p.physicality, p.playmaking, p.defending, p.overall
        FROM ExtraInfo e
        JOIN Players p ON e.playerId = p.playerId
        WHERE e.playerId=?
        """, (player_id,))
    player = cursor.fetchone()
    
    # Close the database connection
    connection.close()
    
    if player:
        # Return the player's extra info and ratings if found
        return PlayerGroup33_extra(
            goals=player[0], 
            assists=player[1], 
            sot=player[2], 
            tackles_won=player[3], 
            tackles_won_pct=player[4], 
            shots=player[5],
            dribbling=player[6],
            shooting=player[7],
            passing=player[8],
            physicality=player[9],
            playmaking=player[10],
            defending=player[11],
            overall=player[12]
        )
    else:
        # If player's extra info and ratings are not found, attempt to scrape and insert the data
        print("Player not found in database, trying to scrape the data")
        try:
            ratings, extra_info = scrape_player(player_id)
            
            # Insert or update the player's ratings and extra info in the database
            connection = sqlite3.connect("group33_backend/Database.db")
            cursor = connection.cursor()
            cursor.execute("""
                UPDATE Players SET dribbling=?, shooting=?, passing=?, physicality=?, playmaking=?, defending=?, overall=?
                WHERE playerId=?
                """, (ratings[0], ratings[1], ratings[2], ratings[3], ratings[4], ratings[5], ratings[6], player_id))
            connection.commit()
            
            cursor.execute("""
                INSERT INTO ExtraInfo (playerId, goals, assists, sot, tackles_won, tackles_won_pct, shots)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (player_id, extra_info['goals'], extra_info['assists'], extra_info['shots_on_target_pct'], extra_info['tackles_won'], extra_info['tackles_won_pct'], extra_info['shots']))
            connection.commit()
            
            connection.close()
            print("Extra info and ratings inserted successfully")
            
            # Return the newly scraped extra info and ratings
            return PlayerGroup33_extra(
                goals=extra_info["goals"], 
                assists=extra_info["assists"], 
                sot=extra_info["shots_on_target_pct"], 
                tackles_won=extra_info["tackles_won"], 
                tackles_won_pct=extra_info["tackles_won_pct"], 
                shots=extra_info["shots"],
                dribbling=ratings[0],
                shooting=ratings[1],
                passing=ratings[2],
                physicality=ratings[3],
                playmaking=ratings[4],
                defending=ratings[5],
                overall=ratings[6]
            )
        except Exception as e:
            print(f"Error scraping player data: {e}")
            return None
