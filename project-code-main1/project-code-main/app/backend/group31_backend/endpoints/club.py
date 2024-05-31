from domain.model import Player_Node,Team_Node,ErrorResponse,teamTemp
from flask_app import app
from auth.auth import protected
from flask_openapi3 import Tag
from services.player_services31 import create_team_with_players
from services.player_services31 import create_team_with_players

clubTag = Tag(name="clubs", description="club testing")

@protected
@app.get("/api/club", responses={'200': teamTemp, '400': ErrorResponse}, tags=[clubTag])
def searchTeamplayers_(year: int = None):  # year is optional for now
    team = create_team_with_players("Q7156", "Barcelona F.C", year)
    if team == None:
        return ErrorResponse(error="User not logged in").dict(), 400
    return team.dict()


@protected
@app.get("/api/club/Arsenal", responses={'200': teamTemp, '400': ErrorResponse}, tags=[clubTag])
def searchTeamplayers1_(year: int = None):  # year is optional for now
    team = create_team_with_players("Q9617", "Arsenal F.C. ", year)
    if team == None:
        return ErrorResponse(error="User not logged in").dict(), 400
    return team.dict()

@protected
@app.get("/api/club/Chelsea", responses={'200': teamTemp, '400': ErrorResponse}, tags=[clubTag])
def searchTeamplayers2_(year: int = None):  # year is optional for now
    team = create_team_with_players("Q9616", "Chelsea F.C.", year)
    if team == None:
        return ErrorResponse(error="User not logged in").dict(), 400
    return team.dict()

@protected
@app.get("/api/club/Liverpool", responses={'200': teamTemp, '400': ErrorResponse}, tags=[clubTag])
def searchTeamplayers3_(year: int = None):  # year is optional for now
    team = create_team_with_players("Q1130849", "Liverpool F.C.", year)
    if team == None:
        return ErrorResponse(error="User not logged in").dict(), 400
    return team.dict()

@protected
@app.get("/api/club/Manchester", responses={'200': teamTemp, '400': ErrorResponse}, tags=[clubTag])
def searchTeamplayers4_(year: int = None):  # year is optional for now
    team = create_team_with_players("Q50602", "Manchester City F.C.", year)
    if team == None:
        return ErrorResponse(error="User not logged in").dict(), 400
    return team.dict()



@protected
@app.get("/api/club/Tottenham", responses={'200': teamTemp, '400': ErrorResponse}, tags=[clubTag])
def searchTeamplayers5_(year: int = None):  # year is optional for now
    team = create_team_with_players("Q18741", "Tottenham Hotspur F.C.", year)
    if team == None:
        return ErrorResponse(error="User not logged in").dict(), 400
    return team.dict()



#Way of doing it dinamically, we now need to find a way of querying a database so once we look for X club we get its ID and wecan use this method.
#@protected
#@app.get("/api/club/{club_id}/{club_name}", responses={'200': teamTemp, '400': ErrorResponse}, tags=[clubTag])
#def searchTeamplayers3_(club_id: str, club_name: str, year: int = None):
#    team = create_team_with_players(club_id, club_name, year)
#    if team is None:
#        return ErrorResponse(error="User not logged in").dict(), 400
<<<<<<< HEAD
#    return team.dict()
=======
#    return team.dict()

# from domain.model import Player_Node, Team_Node, ErrorResponse, teamTemp
# from flask_app import app
# from auth.auth import protected
# from flask_openapi3 import Tag
# from services.player_services31 import create_team_with_players

# clubTag = Tag(name="clubs", description="Club operations, including retrieving team players and details.")

# def get_team_by_id(club_id: str, club_name: str, year: int = None):
#     """
#     Retrieve a team and its players based on the club ID, name, and optionally the year.
#     Returns the team object if found, else returns None.
#     """
#     return create_team_with_players(club_id, club_name, year)

# @protected
# @app.get("/api/club/<string:club_name>", responses={'200': teamTemp, '400': ErrorResponse}, tags=[clubTag])
# def search_team_players(club_name: str, year: int = None):
#     """
#     Endpoint to search for team players based on the club name and optional year.
#     The club name is dynamically matched to its ID within the function.
    
#     Parameters:
#     - club_name: The name of the club (e.g., 'Barcelona', 'Arsenal').
#     - year: Optional; the year to filter the players by.
#     """
#     # Example mapping, in practice, this should query a database or another dynamic data source
#     club_ids = {
#         "Barcelona": "Q7156",
#         "Arsenal": "Q9617",
#         "Chelsea": "Q9616",
#         "Liverpool": "Q1130849",
#         "Manchester": "Q50602",
#         "Tottenham": "Q18741",
#     }
    
#     club_id = club_ids.get(club_name)
#     if not club_id:
#         return ErrorResponse(error=f"Club '{club_name}' not found").dict(), 404
    
#     team = get_team_by_id(club_id, f"{club_name} F.C.", year)
#     if team is None:
#         return ErrorResponse(error="User not logged in or team not found").dict(), 400
    
#     return team.dict()



>>>>>>> c35614faa3c8e7a1a48c0c749cf188747b346ba9
