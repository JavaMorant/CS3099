import sqlite3
import pandas as pd
from datetime import datetime

# Database connection (adjust this for your specific database)
conn = sqlite3.connect('Database31HardCodedV3.db')  # For SQLite, specify the path to your database file

# Fetching data from the Players table
query = "SELECT playerId, name, years_played, teamID, DOB, citizenship, position, birthName FROM Players"
df = pd.read_sql_query(query, conn)

# Ensure you close the connection after fetching the data
conn.close()

# Handle potentially empty years_played and calculate the number of years played
def calculate_years_played(years_string):
    if not years_string:  # Check if the string is empty or None
        return 0  # Return 0 for missing data
    years = [int(year) for year in years_string.split(',') if year.strip()]  # Skip empty strings
    if years:
        return max(years) - min(years) + 1  # +1 to include both the first and last year
    else:
        return 0

# Apply the function to calculate years played
df['years_played'] = df['years_played'].apply(calculate_years_played)

# Function to safely convert DOB to datetime
def safe_convert_dob(dob_str):
    try:
        return pd.to_datetime(dob_str, format='%Y-%m-%dT%H:%M:%SZ', errors='coerce')
    except ValueError:
        return pd.NaT  # Return Not-a-Time for entries that cannot be converted

# Convert 'DOB' to datetime considering the specific format and derive 'age'
df['DOB'] = df['DOB'].apply(safe_convert_dob)
current_year = datetime.now().year
df['age'] = (current_year - df['DOB'].dt.year).fillna(0)  # Fill missing or invalid ages with 0 or another placeholder

# Defining age groups
bins = [0, 25, 30, 35, 100]
labels = ['Under 25', '25-30', '31-35', '36+']
df['age_group'] = pd.cut(df['age'], bins=bins, labels=labels, right=False)

# Grouping by Years Played and Position
group1 = df.groupby(['position', pd.cut(df['years_played'], 3, labels=['Newcomer', 'Experienced', 'Veteran'])]).size().reset_index(name='count')

# Grouping by Citizenship and Team
group2 = df.groupby(['citizenship', 'teamID']).size().reset_index(name='count')

# Grouping by Age Group and Position
group3 = df.groupby(['age_group', 'position']).size().reset_index(name='count')

# Output the grouped data
print("Grouping by Years Played and Position:")
print(group1)
print("\nGrouping by Citizenship and Team:")
print(group2)
print("\nGrouping by Age Group and Position:")
print(group3)
