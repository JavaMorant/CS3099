"""
This module contains the endpoints for retrieving information about teams in the Premier League.

Endpoints:
    - get_premier_league_teams: Returns a list of all teams in the Premier League (Q9448) and their Q-numbers.
    - get_premier_league_teams_stream: Returns a stream of all teams in the Premier League (Q9448) and their Q-numbers.
    - get_teams_with_players_by_id: Retrieve the team with the given ID, along with its players.
"""

from group33_backend.services.teams_service import getTeams_database, getTeamWithPlayersById_database
from flask_app import app
from flask import Response
from auth.auth import protected
from flask_openapi3 import Tag
from domain.model import TeamsResponseGroup33, ErrorResponse, TeamWithPlayersResponse, TeamsPath

teams_tag = Tag(name="teams", description="Teams operations")

@protected
@app.get("/api/teams", responses={'200': TeamsResponseGroup33, '400': ErrorResponse}, tags=[teams_tag], description="Get all teams in the Premier League (Q9448) and their Q-numbers")
def get_premier_league_teams():
    """
    Returns a list of all teams and their Q-numbers.

    This endpoint retrieves data from the database and returns a JSON response containing a list of all teams in the Premier League and their Q-numbers.

    Returns:
        A JSON response containing a list of all teams in the Premier League and their Q-numbers.

    Raises:
        ErrorResponse: If no data is found in the database.
    """
    teams = getTeams_database()
    if teams.__len__() == 0:
        return ErrorResponse(error="No data found").dict(), 400

    return TeamsResponseGroup33(teamList=teams).dict()

@protected
@app.get("/api/teams_with_players/<string:team_id>", responses={'200': TeamWithPlayersResponse, '400': ErrorResponse}, tags=[teams_tag], description="Get all teams in the Premier League (Q9448) and their Q-numbers")
def get_teams_with_players_by_id(path: TeamsPath):
    """
    Retrieve the team with the given ID, along with its players.

    Args:
        path: A TeamsPath object containing the team ID.

    Returns:
        A TeamWithPlayersResponse object containing the team and its players.

    Raises:
        HTTPException: If the team with the given ID is not found.
    """
    teamWithPlayers = getTeamWithPlayersById_database(path.team_id)
    if teamWithPlayers is None:
        return ErrorResponse(error="No data found").dict(), 400
    return TeamWithPlayersResponse(teamWithPlayers=teamWithPlayers).dict()