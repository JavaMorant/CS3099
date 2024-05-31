import React, { useState, useEffect } from 'react';
import PDFGenerator from './PDFGenerator';
import './PlayerDetails.css';

interface PlayerPersonalDetails {
    Age?: number;
    Height?: string;
    Weight?: string;
    Nationality?: string;
}

interface PlayerCareerDetails {
    Position?: string;
    Clubs?: string;
    Appearances?: number;
    Goals?: number;
    Assists?: number;
    TournamentsName?: string;
}

interface PlayerDetailsProps {
    playerName: string;
    currentPlayerNotes: string;
    predictionsData: any[] | null;
    playerImageSrc: string | null;
}


const PlayerDetails: React.FC<PlayerDetailsProps> = ({
    playerName, currentPlayerNotes, predictionsData, playerImageSrc }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [playerPersonalDetails, setPlayerPersonalDetails] = useState<PlayerPersonalDetails>({});
    const [playerCareerDetails, setPlayerCareerDetails] = useState<PlayerCareerDetails>({});
    const [predictiveData, setPredictionsData] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlayerDetails = async () => {
            setLoading(true);
            try {
                const personalDetailsResponse = await fetch(`/api/getPlayerInfo/${playerName}`);
                const careerDetailsResponse = await fetch(`/api/teamData/${playerName}`);
                const tournamentsResponse = await fetch(`/api/getTournaments/${playerName}`); // Fetching tournament data
                const predictionsResponse = await fetch(`/api/fullPlayerPredictiveLeague/${playerName}`); // Fetching predictions data


                const personalDetailsData = await personalDetailsResponse.json();
                const careerDetailsData = await careerDetailsResponse.json();
                const tournamentsData = await tournamentsResponse.json(); // Parsing tournament data
                const predictionsData = await predictionsResponse.json(); // Parsing predictions data

                if (!personalDetailsResponse.ok || !careerDetailsResponse.ok || !tournamentsResponse.ok || !predictionsResponse.ok) {
                    throw new Error('Failed to fetch player details');
                }

                setPlayerPersonalDetails({
                    Age: personalDetailsData['Player birthday'] ? personalDetailsData['Player birthday'][0] : undefined,
                    Height: personalDetailsData['player height'] ? personalDetailsData['player height'][0] : undefined,
                    Weight: personalDetailsData['player weight'] ? personalDetailsData['player weight'][0] : undefined,
                    Nationality: 'Unknown' // You may need to fetch nationality from another endpoint
                });

                setPlayerCareerDetails({
                    Position: careerDetailsData['Position'],
                    Clubs: careerDetailsData['Team_names'] ? careerDetailsData['Team_names'].length : undefined,
                    Appearances: careerDetailsData['appearances'] ? careerDetailsData['appearances'].reduce((acc: number, val: number) => Number(acc) + Number(val), 0) : undefined,
                    Goals: careerDetailsData['goals'] ? careerDetailsData['goals'].reduce((acc: number, val: number) => (Number(acc) + Number(val)), 0) : undefined,
                    TournamentsName: tournamentsData['Tournament Name'].join(', ')
                });

                setPredictionsData(predictionsData['League_and_Chance']); // Adjust based on actual data structure

            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (playerName) {
            fetchPlayerDetails();
        }
    }, [playerName]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='share-button'>
            <PDFGenerator
                playerName={playerName}
                playerPersonalDetails={playerPersonalDetails}
                playerCareerDetails={playerCareerDetails}
                playerImageSrc={playerImageSrc}
                playerNotes={currentPlayerNotes}
                predictedTransfers={predictiveData}

            />
        </div>
    );

};

export default PlayerDetails;
