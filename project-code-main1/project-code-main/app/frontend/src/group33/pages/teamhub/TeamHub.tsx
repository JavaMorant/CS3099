import React, { useMemo, useState } from 'react';

import { getTeamsList } from '../../hooks/group33.hooks';
import TeamCard from '../../components/teamcard/TeamCard.jsx';
import { Link } from 'react-router-dom';
import LoadingPage from '../loadingPage/LoadingPage';
import fs from 'fs';

const TeamHub = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: teamsResponse,
    isLoading,
    isError,
    error
  } = getTeamsList() as {
    data: { teamList: any[] } | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
  console.log(teamsResponse);

  // List of Premier League team names for sorting
  const premierLeagueTeams = useMemo(
    () => [
      'Arsenal F.C.', // Yes
      'Liverpool F.C.', // Yes
      'Manchester City F.C.', // Yes
      'Aston Villa F.C', // Yes
      'Everton F.C.', // Yes
      'Tottenham Hotspur F.C.', // Yes
      'Manchester United F.C.', // Yes
      'West Ham United F.C.', // Yes
      'Brighton & Hove Albion F.C.', // Yes
      'Wolverhampton Wanderers F.C.', // Yes
      'Newcastle United F.C.',
      'Chelsea F.C.', // Yes
      'Fulham F.C.', // Yes
      // 'Bournemouth F.C.', // Yes
      'Crystal Palace F.C.', // Yes
      'Brentford F.C.', // Yes
      'Nottingham Forest F.C.',
      'Luton Town F.C.', // Yes
      'Burnley F.C.', // Yes
      'Sheffield United F.C.' // Yes
    ],
    []
  );

  // Function to sort teams with Premier League teams first
  const sortTeams = (teams: any[]) => {
    return teams.sort((a, b) => {
      const aIsPremier = premierLeagueTeams.includes(a.name);
      const bIsPremier = premierLeagueTeams.includes(b.name);
      if (aIsPremier && !bIsPremier) {
        return -1;
      }
      if (!aIsPremier && bIsPremier) {
        return 1;
      }
      return 0;
    });
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  const filteredTeams = teamsResponse?.teamList.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTeams = filteredTeams ? sortTeams([...filteredTeams]) : [];

  return (
    <div className="mainBackground">
      <div className="bg-gray-900">
        <div className="flex justify-center mt-10 mb-10">
          <div className="lg:w1">
            <input
              type="text"
              placeholder="Search for a team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar placeholder-gray-900"
            />
          </div>
        </div>
        <div className="flex flex-wrap mx-auto w-3/4 mt-3">
          {sortedTeams && sortedTeams.length > 0 ? (
            sortedTeams.map((team: { id: React.Key | null | undefined; name: string }) => (
              <Link
                to={`/team/${team.id}`}
                className="w-1/4 p-2 flex-shrink-0 flex justify-center items-center"
                key={team.id}>
                <TeamCard team={team} />
              </Link>
            ))
          ) : (
            <p>No teams found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamHub;
