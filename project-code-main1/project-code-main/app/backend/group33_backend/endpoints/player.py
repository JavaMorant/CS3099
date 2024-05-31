"""
This module contains the endpoint for retrieving all players from a team by team Q-number and their Q-numbers.

It defines the following endpoint:
    - `get_team_players`: Retrieves all players from a team by team Q-number and their Q-numbers.
"""

from group33_backend.services.players_service import getTeamPlayersById_database, getPlayerById_database, getPlayerByName_database, getPlayerById_wikidata
from group33_backend.services.getExtraInfro import getAdditionalData
from flask_app import app
from auth.auth import protected
from flask_openapi3 import Tag
from domain.model import PlayersResponseGroup33, PlayersPath, ErrorResponse, PlayerGroup33, PlayerPathName, PlayersPathID, PlayerGroup33_extra

players_tag = Tag(name="players", description="Player operations")

@protected
@app.get("/api/players/<string:team_id>", responses={'200': PlayersResponseGroup33, '400': ErrorResponse}, tags=[players_tag], description="Get all players from a team by team Q-number (e.g. Q9439 for Arsenal F.C.) and their Q-numbers")
def get_team_players(path: PlayersPath):
    """
    Retrieve all players from a team by team Q-number and their Q-numbers.

    Args:
        path: A `PlayersPath` object containing the `team_id` parameter.

    Returns:
        A `PlayersResponseGroup33` object containing a list of `Player` objects, each representing a player from the team.

    Raises:
        HTTPException: If no players are found for the given `team_id`.
    """
    players = getTeamPlayersById_database(path.team_id)
    if players.__len__() == 0:
        return ErrorResponse(error="No data found").dict(), 400
    return PlayersResponseGroup33(playerList=players).dict()


@app.get("/api/player/<string:player_id>", responses={'200': PlayerGroup33, '400': ErrorResponse}, tags=[players_tag], description="Get a player by player Q-number (e.g. Q50602 for a specific player)")
@protected
def get_player_by_ID(path: PlayersPathID):
    """
    Retrieve a player by player Q-number.

    Args:
        path: A `PlayerPath` object containing the `player_id` parameter.

    Returns:
        A `Player` object containing a `Player` object representing the player.

    Raises:
        HTTPException: If no player is found for the given `player_id`.
    """
    try:
        player = getPlayerById_database(path.player_id)
        return player.dict(), 200
    except:
        print(path.player_id)
        print("Hi")
        print("Player not found in database, trying wikidata")
        player = getPlayerById_wikidata(path.player_id)
        if player is None:
            return ErrorResponse(error="No data found").dict(), 400
        return player.dict(), 200

# @app.get("/api/player/", responses={'200': PlayerGroup33, '400': ErrorResponse}, tags=[players_tag], description="Get a player by player Q-number (e.g. Q50602 for a specific player)")
# @protected
# def get_player_by_ID(query: PlayersPathID):
#     """
#     Retrieve a player by player Q-number.

#     Args:
#         path: A `PlayerPath` object containing the `player_id` parameter.

#     Returns:
#         A `Player` object containing a `Player` object representing the player.

#     Raises:
#         HTTPException: If no player is found for the given `player_id`.
#     """
#     try:
#         player = getPlayerById_database(query.player_id)
#         return player.dict(), 200
#     except:
#         print("Player not found in database, trying wikidata")
#         player = getPlayerById_wikidata(query.player_id)
#         if player is None:
#             return ErrorResponse(error="No data found").dict(), 400
#         return player.dict(), 200
    


@app.get("/api/player/name/<string:name>", responses={'200': PlayersResponseGroup33, '400': ErrorResponse}, tags=[players_tag], description="Get players by name (e.g. Messi for all players named Messi)")
@protected
def get_players_by_Name(path: PlayerPathName):
    """
    Retrieve players by Name.
    
    Args:
        name: A string containing the `name` parameter.

    Returns:
        A list of `Player` objects representing the players.

    Raises:
        HTTPException: If no player is found for the given `name`.
    """
    players = getPlayerByName_database(path.name)
    
    if not players:
        return ErrorResponse(error="No data found").dict(), 400
    return PlayersResponseGroup33(playerList=players).dict()

@app.get("/api/player/extra/<string:player_id>", responses={'200': PlayerGroup33_extra, '400': ErrorResponse}, tags=[players_tag], description="Get additinal data for a player using their QID (e.g. Q50602 for a specific player)")
@protected
def get_player_extra_by_ID(path: PlayersPathID):
    """
    Retrieve a player by player Q-number.

    Args:
        path: A `PlayerPath` object containing the `player_id` parameter.

    Returns:
        A `Player` object containing a `Player` object representing the player.

    Raises:
        HTTPException: If no player is found for the given `player_id`.
    """
    try:
        player = getAdditionalData(path.player_id)
        return player.dict(), 200
    except:
        return ErrorResponse(error="No data found").dict(), 400