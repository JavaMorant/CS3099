import requests
from bs4 import BeautifulSoup
import time
import copy

def getPlayers():
    """Get the players from the premier league page"""

    player_ids_names = []
    # Open out2.txt and read the player ids and names
    with open('out2.txt', 'r', encoding='utf-8') as file:
        for line in file:
            player_ids_names.append(line.split())
    return player_ids_names


def fetch_and_parse_html(url) -> BeautifulSoup or None: # type: ignore
    """Fetch HTML content for a given URL and return a BeautifulSoup object."""
    response = requests.get(url)
    if response.status_code == 200:
        return BeautifulSoup(response.content, 'lxml')
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
                    pass  
    return cumulative_stats

def scrape_player(player_id, player_name) -> None:
    """Scrape player data based on provided parameters."""
    base_url = "https://fbref.com/en/players/{}/all_comps/{}-Stats---All-Competitions"
    url = base_url.format(player_id, player_name)

    stats_keys = [
    'goals', 'assists', 'goals_pens', 'pens_att', 'progressive_carries', 'progressive_passes', 'progressive_passes_received',
    'shots', 'shots_on_target', 'shots_on_target_pct', 'goals_per_shot_on_target', 'passes_completed', 'passes',
    'passes_pct', 'through_balls', 'passes_switches', 'passes_offsides', 'passes_blocked', 'sca', 'sca_take_ons', 'gca', 
    'tackles', 'tackles_won', 'blocks', 'blocked_shots', 'blocked_passed', 'interceptions', 'errors', 'touches', 'take_ons',
    'take_ons_won', 'take_ons_pct', 'carries', 'miscontrols', 'ball_recoveries', 'aerials_won', 'aerials_lost', 'aerials_won_pct',
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
                actual_num_seasons = len(set(row.find('th', {'data-stat': 'year_id'}).text for row in filtered_rows))

        # Calculate the average for each stat over the actual number of seasons found
        for stat in cumulative_stats:
            cumulative_stats[stat] /= actual_num_seasons if actual_num_seasons > 0 else 1 

        print(f"Averages for {player_name}")

        return cumulative_stats

    else:
        print(f"Failed to fetch data for {player_name}")

player_ids_names = getPlayers()

# Scrape player data for the first player
first_player_stats = scrape_player(player_ids_names[0][0], player_ids_names[0][1])
if first_player_stats:
    min_stats = copy.deepcopy(first_player_stats)
    max_stats = copy.deepcopy(first_player_stats)
else:
    print("Failed to fetch stats for the first player.")
time.sleep(3.5)  
# Continue scraping for the rest of the players
for player_id, player_name in player_ids_names[1:]:
    player_stats = scrape_player(player_id, player_name)
    if player_stats:
        # Update min and max stats
        for stat in player_stats:
            min_stats[stat] = min(min_stats[stat], player_stats[stat])
            max_stats[stat] = max(max_stats[stat], player_stats[stat])
    time.sleep(3.5) 

print(f"Minimum stats: {min_stats}")
print(f"Maximum stats: {max_stats}")

# Write min and max stats to a file

with open('min_max_stats.txt', 'w') as file:
    file.write("Minimum stats:\n")
    for stat, value in min_stats.items():
        file.write(f"{stat}: {value}\n")
    file.write("\nMaximum stats:\n")
    for stat, value in max_stats.items():
        file.write(f"{stat}: {value}\n")




