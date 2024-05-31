import { TeamInfo } from './teamInfo';

export interface MapData {
  playerName: string;
  lineColour: string;
  teamData: TeamInfo[];
  isDisplayed: boolean;
  numberClubs: number;
  startDate: string;
  endDate: string;
}
