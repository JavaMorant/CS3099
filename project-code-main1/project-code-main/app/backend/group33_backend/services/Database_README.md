# DATABASE DESIGN

3 tables: Players, Teams, Countries

To populate teams and countries use service database_service.py. Remember to add domain directory to the path:
> export PYTHONPATH = {$PYTHONPATH}:"(path to domain reporitory)"

After that you can run the team and countries population script from services depository using python:
> python3 detabase_service.py

The script will not populate the `Players` table. This happend when executing the `insert_players()` function in players_service.py

## Players (@see model.DatabasePlayer):
`getPlayerById_database(playerId: str)` to receive the players from the datbase of or live data if non-existent using the player's QID

$${\color{red}!!! \space WARNING \space \color{white}Function \space below \space will \space call \space `insert \_ players()` }$$
`getTeamPlayersById_database(teamId: str)` to receive players for a team specified by the QID

Holds Players of a Team:
- `playerId` - player's QID
- `name` - player's name
- `countryId` - player's country QID
- `DOB` - player's Date Of Birth
- `height` - player's height
- `position`- player's playing position
- `career_start` - player's career start date
- `image_url` - player's image url
- `teamId` - player's team QID

## Teams (@see model.TeamGroup33):
`getTeams_database()` to receive all teams in UK

$${\color{red}!!! \space WARNING \space \color{white}Function \space below \space will \space call \space `insert \_ players()` }$$
`getTeamsWithPlayers_databse()` returns all teams with their players

Holds UK Teams:
- `teamId` - team's QID
- `name` - team's name
- `image_url` - team's logo url

## Countries (@see model.Country):
`getCountries()` receives all countries from wikidata (some are missing)

`getCountryById_database()` returns country based on its QID

`getCountryById_wikidata()` same as above but uses wikidata

Holds All countries in the world:
- `countryId` - countrie's QID
- `name` - countrie's name
- `flag_url` - countrie's glag url
