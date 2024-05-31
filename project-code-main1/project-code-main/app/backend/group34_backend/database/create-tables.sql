CREATE TABLE league(
    ID VARCHAR(10) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL
);

CREATE TABLE stadium(
    ID VARCHAR(10) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    year FLOAT,
    image_url VARCHAR(2000),
    location_desc VARCHAR(200)
);

CREATE TABLE team(
    ID VARCHAR(10) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    league_ID VARCHAR(10) NOT NULL,
    stadium_ID VARCHAR(10) NOT NULL,
    FOREIGN KEY(league_ID) REFERENCES league(league_ID),
    FOREIGN KEY(stadium_ID) REFERENCES stadium(stadium_ID)
);
