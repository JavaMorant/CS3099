from flask_app import app
from auth.auth import protected
from services.player_service import get_player_id, get_player_id_two, get_team, get_stadium, get_leagues, getprobabilityLeagues, get_news, get_tourny, get_player_info
from flask_openapi3 import Tag
from domain.model import PlayerID,PlayerResponse,Player,ErrorResponse, NationAndLeagueID

players_tag = Tag(name="Players", description="Players operations")


@protected
@app.get("/api/playerData/<string:name>", responses={'200': PlayerResponse, '400': ErrorResponse}, tags = [players_tag])
def get_player_Id(path: Player):
    '''
    Returns a player's WikiData ID given the player's name, if it is found in the database.
    If it is not found, returns an error response
    '''
    id = get_player_id(path.name)
    if id == None:
        id_two = get_player_id_two(path.name)
        if id_two == None:
            return ErrorResponse(error = "PlayerNotFoundWithAccent").dict(),400
        else:
            response_body = {"player_id": id_two}
    else:
        response_body = {"player_id": id}
    return response_body,200,{"Content-Type": "application/json"}

@protected
@app.get("/api/teamData/<string:id>", responses={'200': PlayerResponse, '400': ErrorResponse}, tags = [players_tag])
def get_Team(path: PlayerID):
    '''
    Given a player ID, returns for each team they've played for:
        Team Name - string
        Start Date - string
        End Date (if it exists) - string
        Stadium Name (if it exists) - string
        Stadium Coordinates (if it exists) - list of floats
        Goals for team (if it exists) - string
        Appearances for team (if it exists) - string
    Returns an error message if the playerID does not exist
    '''
    id = get_player_id(path.id)
    if id == None:
        id = get_player_id_two(path.id)
        if id == None:
            return ErrorResponse(error = "PlayerNotFoundWithAccent").dict(),400

    teams = get_team(id)
    teamnames = []
    startDates = []
    endDates = []
    stadiumNames = []
    stadiumCoords = []
    team_goals = []
    team_appearances = []
    image = ""
    playerName = ""
    team_image = []
    
    if teams == None:
        return ErrorResponse(error = "TeamNotFound").dict(),400
    else:
        for team in teams:
            if team.stadiumId:
                stadium = get_stadium(team.stadiumId)
                stadiumNames.append(stadium.name)
                stadiumCoords.append(stadium.coords)
            else:
                stadiumNames.append(None)
                stadiumCoords.append(None)
            if team.appearances:
                team_appearances.append(team.appearances)
            else:
                team_appearances.append("0")
            if team.goals:
                team_goals.append(team.goals)
            else:
                team_goals.append("0")

            if team.enddate:
                endDates.append(team.enddate)
            else:
                endDates.append("Present")
            if team.teamImage:
                team_image.append(team.teamImage)
            else:
                team_image.append(team.teamImage)
            teamnames.append(team.name)
            startDates.append(team.startdate)
            image = team.image
            playerName = team.playerName
            

         
    response_body = {"Team_names": teamnames, "startDates": startDates, "endDates":endDates, "stadium_names":stadiumNames, "stadium_coords": stadiumCoords, 
    "goals": team_goals, "appearances": team_appearances, "Image": image, "TeamImage": team_image, "PlayerName": playerName}
    return response_body,200,{"Content-Type": "application/json"}


@protected
@app.get("/api/getTournaments/<string:name>", responses={'200': PlayerResponse, '400': ErrorResponse}, tags = [players_tag])
def get_Tournaments(path: Player):
    '''
    Given a player name, returns for each tournament they have participated in:
        Tournament Name - string
        Tournament Date - string
    Returns an error message if the playerID does not exist
    '''
    id = get_player_id(path.name)
    if id == None:
        return ErrorResponse(error = "PlayerNotFoundWithAccent").dict(),400
    tournaments = get_tourny(id)

    tournamentnames = []
    tournamentdates = []
    if tournaments == None:
       return ErrorResponse(error = "TournamentsNotFound").dict(),400
    for tourny in tournaments:
        tournament = tourny.name
        name = "".join(c for c in tournament if (c.isalpha() or c == " "))
        date = "".join(c for c in tournament if (not c.isalpha() and c != " "))
        tournamentnames.append(name)
        tournamentdates.append(date)
    response_body = {"Tournament Name" : tournamentnames, "Tournament Date": tournamentdates}
    return response_body, 200, {"Content-Type":"application/json"}


@protected
@app.get("/api/newsArticles/<string:name>", responses={'200': PlayerResponse, '400': ErrorResponse}, tags = [players_tag])
def get_newsArticles(path:Player):
    '''
    Given a player ID, returns for each of the top 5 news articles about them:
        Article Name - string
        Article link - string
    Returns an error message if the playerID does not exist
    '''
    articles = get_news(path.name + " football transfer")
    titles = []
    links = []

    if articles == None:
        return ErrorResponse(error = "NewsNotFound").dict(),400
    else:
        for article in articles:
            if article.title:
                titles.append(article.title)
            if article.link:
                links.append(article.link)
    response_body = {"Article_names": titles, "article_links": links}
    return response_body, 200,{"Content-Type": "application/json"}

@protected
@app.get("/api/getPlayerInfo/<string:name>", responses={'200': PlayerResponse, '400': ErrorResponse}, tags = [players_tag])
def get_PlayerInfo(path: Player):
    '''
    Given a player ID, returns the player's birthday, height and weight given they exists in WikiData.
    Returns an error message if the playerID does not exist. 
    '''

    id = get_player_id(path.name)
    if id == None:
        return ErrorResponse(error = "PlayerNotFoundWithAccent").dict(),400
    personalInfo = get_player_info(id)
    birthdays = []
    heights = []
    weights = []
    if personalInfo == None:
        return ErrorResponse(error = "PlayerInfoNotFound").dict(),400
    else:
        for info in personalInfo:
            if info.dob:
                birthdays.append(info.dob)
            if info.height:
                heights.append(info.height)
            if info.weight:
                weights.append(info.weight)
    response_body = {"Player birthday" : birthdays, "player height" : heights, "player weight" : weights}
    return response_body, 200, {"Content-Type" : "application/json"}



@protected
@app.get("/api/fullPlayerPredictiveLeague/<string:name>", responses={'200': PlayerResponse, '400': ErrorResponse}, tags = [players_tag])
def predictnextLeagues(path:Player):
    '''
    Given a player name, uses a combination of previous methods to find 100 players that played in the same league
    that share the same nationality as the player, and then find where they played next.
    Returns the top 5 leagues with the most players.
    Returns an error message according to lack of information depending on ID, League, Nation or Probability
    '''
    id = get_player_id(path.name)
    if id == None:
        return ErrorResponse(error = "PlayerNotFoundWithAccent").dict(),400
    
    leagues = get_leagues(id)[0]
    if leagues == None:
        return ErrorResponse(error = "LeagueAndNationNotFound").dict(),400
    
    league_id = leagues.league_id
    nation_id = leagues.nation_id
    league_label = leagues.league_label

    possibilityList = getprobabilityLeagues(league_id, nation_id)
    league_probability = []
    if possibilityList == None:
        return ErrorResponse(error = "PredictorNotFound").dict(),400
    else:
        for league in possibilityList:
            if league.leagueName:
                leaguename = league.leagueName
            else:
                leaguename = ""
            if league.numberofplayers:
                probability = league.numberofplayers
            else:
                probability = "0"
            league_probability.append([leaguename,probability])
    

    response_body = {"League_and_Chance": league_probability, "League_Name":league_label}
    return response_body, 200, {"Content-Type": "application/json"}