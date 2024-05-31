from pydantic import BaseModel, Field

class Player(BaseModel):
    id: str
    name: str
    years_played: str
    teamID: str
    DOB: str
    citizenship: str
    position: str
    birthName: str

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
    stadiumName: str
    inception: int
    coach: str
    sponsor: str
    headquarters: str

class League(BaseModel):
    id: str
    name: str
    logo: str
    country: str

class Country(BaseModel):
    id: str
    name: str
    flag: str