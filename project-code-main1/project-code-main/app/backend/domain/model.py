from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List


class ErrorResponse(BaseModel):
    error: str

class Coordinates(BaseModel):
    lat: float
    lng: float

class Countries(BaseModel):
    countries: list[str]

class Stadium(BaseModel):
    team_id: str
    team: str
    league_id: str
    name: str
    coordinates: Coordinates
    capacity: int = Field(ge=0)
    country: str
    year: int
    image_url: str
    location_desc: str

class Stadiums(BaseModel):
    stadiums: List[Stadium]


class LeagueAndNation(BaseModel):
    '''
    Represents the last league a player played for as well as their nation
    end_date (str) - The date they last played for the league (could be present day)
    league_id (str) - The league id they last played for
    league_label (str) - The league name they last played for
    nation_id (str) - The id of the nation they play for
    nation_label (str) - The name of the nation they play for
    '''
    end_date: str
    league_id: str
    league_label: str
    nation_id: str
    nation_label: str

class NextLeagueTable(BaseModel):
    '''
    Represents the chance any particular player will play for the league specified
    leagueName (str) - Name of the league specified
    numberofplayers (str) - Number of players (out of 100) that went to that league after the current player's one. Acts as a % chance
    '''
    leagueName: str
    numberofplayers: str
class League(BaseModel):
    league_id: int
    league: str
    country: str

class Leagues(BaseModel):
    leagues: List[League] 

class StadiumFilter(BaseModel):
    min_capacity: int = Field(None, alias='min-capacity', ge=0)
    max_capacity: int = Field(None, alias='max-capacity', ge=0)
    countries: List[str] = Field(None, description="List of countries to display")

class LeagueFilter(BaseModel):
    countries: List[str] = Field(None, description="List of countries to display")

class StadiumForm(BaseModel):
    stadium_name: str = Field(alias="stadium-name")
    capacity: int = Field(ge=0)
    coordinates: Coordinates
    year: int
    team_name: str = Field(alias="team-name")
    league: str

class StadiumFormResponse(BaseModel):
    stadium_id: int

class ErrorLog(BaseModel):
    error: str
    component_stack: str

class TeamByLeague(BaseModel):
    """
    Represents a team with an ID and name.

    Attributes:
    -----------
        id (str): The unique identifier for the team.
        name (str): The name of the team.
    """
    id: str
    name: str
    
class TeamWithAllInfo(BaseModel):
    """
    Represents a team with an ID and name.

    Attributes:
    -----------
        id (str): The unique identifier for the team.
        name (str): The name of the team.
    """
    id: str
    name: str
    logo: str
    colour: str

class playerWithID(BaseModel):
    id: str
    name: str
    

class League(BaseModel):
    id: str
    name: str
    teams: List[TeamByLeague]
    logo: str

class Player31(BaseModel):
    id: str
    name: str
    years_played: str
    teamID: str
    DOB : str
    citizenship : str
    position: str
    birthName : str

class Player(BaseModel):
    '''
    Represents a Player
    name (str) - name of player
    '''
    name : str

class PlayerID(BaseModel):
    '''
    Represents a PlayerID
    id (str) - id of player
    '''
    id:str
    
class PlayerResponse(BaseModel):
    '''
    Represents a Player ID response
    player_id (str) - id of player
    '''
    player_id: str
    
class Team(BaseModel):
    '''
    Represents a Team
    id (str) - Team ID
    name (str) - Team Name
    appearances (str) - Number of appearances a certain player made for a team
    goals (str) - Number of goals a certain player scored for a team
    startDate(str) - The date for which a certain player started playing for the club
    endDate (str) - The date for which a certain player stopped playing for the club
    stadiumID (str) - The ID of the stadium the team plays at
    '''
    id: str
    name: str
    appearances: str
    goals: str
    startdate: str
    enddate: str
    stadiumId: str
    image: str
    teamImage: str
    playerName: str

class League(BaseModel):
    '''
    Represents a League someone has played for
    id (str) - Team ID
    name (str) - Team Name
    startDate(str) - The date for which a certain player started playing for the club
    endDate (str) - The date for which a certain player stopped playing for the club
    leagueId (str) - League ID
    leagueName (str) - League Name
    '''
    id: str
    name: str
    startdate: str
    enddate: str
    leagueId: str
    leagueName: str

class Tournament(BaseModel):
    '''
    Represents a Participant
    name (str) - Participant Name

    '''

    name: str


class NationAndLeagueID(BaseModel):
    '''
    Represents the last league and nation a player played for
    nation (str) - Name of the Nation
    league (str) - Name of League
    '''
    nation:str
    league: str

class Article(BaseModel):
    '''
    Represents an Article
    title (str) - The article name
    link (str) - The link to the original article
    '''
    title: str
    link: str

class PlayerInfo(BaseModel):
    '''
    dob (str) - Player's Date Of Birth
    height (str) - Player's height
    weight (str) - Player's weight
    '''
    dob: str
    height : str
    weight : str


class Stadium(BaseModel):
    '''
    Represents a Stadium
    id (str) - Stadium ID
    name (str) - Stadium Name
    coords (List of floats) - Coordinates of the stadium's location
    '''
    id: str
    name: str
    coords: List[float]

# class UsersUpdateRequest(BaseModel):
#     name: str

# class UserResponse(BaseModel):
#     __root__: User

# class UsernameResponse(BaseModel):
#     __root__: str


# Specyfy player and team models here 
# FIXME will need updating

class Country(BaseModel):
    """
    Represents a country with an ID, name, and flag.

    Attributes:
    -----------
        id (str): The unique identifier for the country.
        name (str): The name of the country.
        flag (str): The URL of the flag image for the country.
    """
    id: str
    name: str
    flag: str

class PlayerGroup33(BaseModel):
    """
    Represents a player in the system.

    Attributes:
    -----------
    - id (str): The unique identifier for the player.
    - name (str): The name of the player.
    - citizenships (Country): A countries that the player holds citizenship for.
    - DOB (str): The date of birth of the player.
    - height (str): The height of the player.
    - position (str): A position the player can play.
    - career_start (str): The year the player started their professional career.
    - image_url (str): A list of URL to images of the player.
    - teamId (str): The unique identifier for the team the player is currently playing for.
    - teamBadge_URL (str): The URL to the image of the badge of the team the player is currently playing for.
    - fbrefId (str): The id of the player on fbref
    """
    id: str
    name: str
    citizenship: Country
    DOB: str
    height: str
    position: str
    career_start: str
    image_url: str
    teamId: str
    fbrefId: str
    teamBadge_URL: str
    
    ovrall: str
    
    # ratings
    dribbling: str
    shooting: str
    passing: str
    physicality: str
    playmaking: str
    defending: str
    
    
Player.update_forward_refs()
    
class PlayerGroup33_extra(BaseModel):
    goals: str
    assists: str
    sot: str
    tackles_won: str
    tackles_won_pct: str
    shots: str

    # ratings
    dribbling: str
    shooting: str
    passing: str
    physicality: str
    playmaking: str
    defending: str
    

class DatabasePlayer(BaseModel):
    """
    Represents a player in the database.

    Attributes:
    -----------
    id : str
        The unique identifier of the player.
    name : str
        The name of the player.
    citizenships : str
        The citizenship of the player.
    DOB : str
        The date of birth of the player.
    height : str
        The height of the player.
    position : str
        The position that a player can play.
    career_start : str
        The start date of the player's career.
    image_url : str
        A URL to the player's images.
    teamId : str
        The unique identifier of the team the player belongs to.
    teamBadge_URL : str
        The URL of the team's badge.
    fbrefId : str
        The fbref id of the player.
    """
    id: str
    name: str
    citizenship: str
    DOB: str
    height: str
    position: str
    career_start: str
    image_url: str
    teamId: str
    fbrefId: str
    teamBadge_URL: str

class TeamGroup33(BaseModel):
    """
    Represents a team in the application.

    Attributes:
    -----------
        id (str): The unique identifier for the team.
        name (str): The name of the team.
        image_url (str): The URL for the team's image.
    """
    id: str
    name: str
    image_url: str

class TeamWithPlayers(BaseModel):
    """
    A model representing a team and its players.

    Attributes:
    -----------
    team : Team
        The team object.
    players : list[Player]
        A list of player objects belonging to the team.
    """
    team: TeamGroup33
    players: list[PlayerGroup33]

TeamWithPlayers.update_forward_refs()

class TeamsResponseGroup33(BaseModel):
    """
    A response model for a list of teams.

    Attributes:
    -----------
    teamList (list[Team]): A list of Team objects.
    """
    teamList: list[TeamGroup33]

class TeamResponse(BaseModel):
    """
    A response model for a Team object.

    Attributes:
    -----------
    team : Team
        The Team object being returned in the response.
    """
    team: Team

class PlayersResponseGroup33(BaseModel):
    """
    A response model for a list of players.

    Attributes:
    -----------
    playerList (list[PlayerGroup33]): A list of Player objects.
    """
    playerList: list[PlayerGroup33]

class CountryResponse(BaseModel):
    """
    A response model for a Country object.

    Attributes:
    -----------
    country : Country
        The Country object being returned in the response.
    """
    country: Country

class PlayersPath(BaseModel):
    """
    Represents the path to the players endpoint for a specific team.

    Attributes:
    -----------
    team_id : str
        The ID of the team whose players are being accessed.
    """
    team_id: str


class PlayersPathID(BaseModel):
    """
    Represents the path to the players endpoint for a specific team.

    Attributes:
    -----------
    team_id : str
        The ID of the team whose players are being accessed.
    """
    player_id: str

class PlayerPathName(BaseModel):
    """
    Represents the path to the players endpoint for a specific team.

    Attributes:
    -----------
    name : str
        The name of the player whose information is being accessed.
    """
    name: str

class CountriesPath(BaseModel):
    """
    Represents a path to a country in the database.

    Attributes:
    -----------
        country_id (str): The ID of the country.
    """
    country_id: str

class TeamsPath(BaseModel):
    """
    Represents a team's path in the database.

    Attributes:
    -----------
    team_id : str
        The ID of the team.
    """
    team_id: str

class TeamWithPlayersResponse(BaseModel):
    """
    A response model representing a team with its players.

    Attributes:
    -----------
    teamWithPlayers : TeamWithPlayers
        The team with its players.
    """
    teamWithPlayers: TeamWithPlayers
    #coords: str

class teamTemp(BaseModel):
    teamTemp : str

class Player_Node(BaseModel):
    id:str
    name: str
    years_played : List[int]
    
class Team_Node(BaseModel):
    id:str
    name:str
    players: List[Player_Node]

class Node_Info_Query(BaseModel):
    id:str

class Node_Player_Query(BaseModel):
    id:str

class Node_ClubInfo_Query(BaseModel):
    id:str

class Node_Clubs_Query(BaseModel):
    id:str

class Node_Leagues_Query(BaseModel):
    id:str

