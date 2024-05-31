from domain.model import Node_ClubInfo_Query, Node_Leagues_Query,Node_Clubs_Query,Team_Node,Node_Info_Query,Node_Player_Query,ErrorResponse,teamTemp
from flask_app import app
from auth.auth import protected
from flask_openapi3 import Tag
from group31_backend.services.DBQuery_service import query_clubname_by_ID, query_node_info, query_club_by_ID, query_all_countries,query_leagues_of_countryID,query_clubs_of_leagueID,query_node_info, query_player_by_ID

@protected
@app.get("/api/node_data/", responses={'200': teamTemp, '400': ErrorResponse})
def getPlayersByTeamID(query: Node_Info_Query) -> Team_Node:
    players = query_node_info(query.id)
    if players == None:
        return ErrorResponse(error="Error Retrieving Node data"), 400
    return {"players" : players}, 200,{"Content-Type": "application/json"}

@protected
@app.get("/api/node_player/", responses={'200': teamTemp, '400': ErrorResponse})
def getPlayerByID(query: Node_Player_Query):
    player = query_player_by_ID(query.id)
    if player == None:
        return ErrorResponse(error="User not logged in"), 400
    return {"player" : player}, 200,{"Content-Type": "application/json"}

@protected
@app.get("/api/club/", responses={'200': teamTemp, '400': ErrorResponse})
def getClubByID(query: Node_ClubInfo_Query):
    club = query_club_by_ID(query.id)
    if club == None:
        return ErrorResponse(error="User not logged in"), 400
    return {"club" : club}, 200,{"Content-Type": "application/json"}

@protected
@app.get("/api/clubname/", responses={'200': teamTemp, '400': ErrorResponse})
def getClubnameByID(query: Node_ClubInfo_Query):
    clubname = query_clubname_by_ID(query.id)
    if clubname == None:
        return ErrorResponse(error="User not logged in"), 400
    return {"clubname" : clubname}, 200,{"Content-Type": "application/json"}

@protected
@app.get("/api/clubs/", responses={'200': teamTemp, '400': ErrorResponse})
def getClubsByLeagueID(query: Node_Clubs_Query):
    clubs = query_clubs_of_leagueID(query.id)
    if clubs == None:
        return ErrorResponse(error="User not logged in"), 400
    return {"clubs" : clubs}, 200,{"Content-Type": "application/json"}

@protected
@app.get("/api/leagues/", responses={'200': teamTemp, '400': ErrorResponse})
def getLeaguesByCountryID(query: Node_Leagues_Query):
    leagues = query_leagues_of_countryID(query.id)
    if leagues == None:
        return ErrorResponse(error="User not logged in"), 400
    return {"leagues" : leagues}, 200,{"Content-Type": "application/json"}

@protected
@app.get("/api/countries/", responses={'200': teamTemp, '400': ErrorResponse})
def getCountries():
    countries = query_all_countries()
    if countries == None:
        return ErrorResponse(error="User not logged in"), 400
    return {"countries" : countries}, 200,{"Content-Type": "application/json"}


