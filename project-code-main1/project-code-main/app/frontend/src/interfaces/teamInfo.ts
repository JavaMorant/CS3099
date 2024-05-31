export interface TeamInfo {
    Team_name: string;
    Appearances: string;
    EndDate: string;
    Goals: string;
    StadiumCoords: [number, number] | null;
    StadiumName: string | null;
    StartDate: string | null;
    Image: string | null;
    TeamImage: string | null;
    PlayerName: string;
}