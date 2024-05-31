import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './PanelContent.css'
import MapContainerLink from '../Foreign/MapContainerLink';
import { usePlayerInfo, useClubInfo, useClubname } from '../../../api/hooks/node.hooks';
import { useNavigate } from 'react-router-dom';
import PlayerCard from '../../../group33/components/playercard/PlayerCard';
import {getSinglePlayerByID} from '../../../group33/hooks/group33.hooks';



const PanelContent = ({ isClub, contentID, clubID }) => {
    const [name, setName] = useState("");
    const { data, fetchStatus, error } = useClubname(clubID, true);
    let wikidatalink = 'https://www.wikidata.org/wiki/' + contentID;
    let panelContent = <></>;

    useEffect(() => {
        if (data) {
            setName(data[0][0])
        }
    }, [fetchStatus])

    if (isClub) {
        panelContent = <ClubContent ClubID={contentID} />;
    } else {
        panelContent = <PlayerContent PlayerID={contentID} ClubID={clubID} Clubname={name} />;
    }


    return (
        <>
            <div className='linkpos'>
                <Link className='wikidatalink' to={wikidatalink}>To Wikidata: {contentID}</Link>
            </div>
            {panelContent}
        </>
    )
};

const ClubContent = ({ ClubID }) => {
    const { data, fetchStatus, error } = useClubInfo(ClubID, true);
    if (fetchStatus === 'error') {
        return <div>Error: {error.message}</div>;
    }

    const [clubData, setClubData] = useState({
        id: '',
        name: '',
        img: '',
        stadium: '',
        inception: '',
        stad_lat: 0,
        stad_lng: 0
    });

    useEffect(() => {
        if (data) {
            let stad_coords = data[0][7].split(", ").map(str => parseFloat(str));
            setClubData({
                id: data[0][0],
                name: data[0][1],
                img: data[0][2],
                stadium: data[0][5],
                inception: data[0][6],
                stad_lat: stad_coords[0],
                stad_lng: stad_coords[1]
            });
        }
    }, [fetchStatus]);


    return (
        <>
            <div className='title'>{clubData.name}</div>
            <div className='flex-container'>
                <div className='flex-item'>
                    <img src={clubData.img} alt='logo' />
                </div>
                <div className='flex-item'>
                    Club Information:
                    <div className='list-item'>Inception: {clubData.inception}</div>
                    <div className='list-item'>Stadium name: {clubData.stadium}</div>
                </div>
                <div style={{ height: "30vh", width: "33vmin", padding: "10px" }}>
                    {clubData.stad_lat || clubData.stad_lng ? (
                        <MapContainerLink lat={clubData.stad_lng} lng={clubData.stad_lat} /> 
                    ) : (
                        <p>Map Unavailable</p>
                    )}
                </div>
            </div>
        </>
    )
};

const PlayerContent = ({ PlayerID, ClubID, Clubname }) => {
    const navigate = useNavigate();
    const { data, fetchStatus, error } = usePlayerInfo(PlayerID, true);
    const [queriedPlayer ,setQueriedPlayer] = useState('');
    const { data: playerInfo, isFetching, error: playerError } = getSinglePlayerByID(queriedPlayer);
    console.log("MADE PLAYER REQUEST")

    const [player ,setPlayer] = useState(null);

    useEffect(() => {
        console.log('Data:', playerInfo);
        setPlayer(playerInfo);
        
    }, [PlayerID, data, isFetching]);

    useEffect(() => {
        console.log('Querying player:', queriedPlayer);
        setQueriedPlayer(PlayerID);
        
    }, [PlayerID, data, isFetching]);

    const [playerData, setPlayerData] = useState({
        id: '',
        name: '',
        years_played: '',
        dob: '',
        nationality: '',
        position: '',
        birthname: ''
    });



    useEffect(() => {
        if (data && data[0]) {
            setPlayerData({
                id: data[0][0],
                name: data[0][1],
                years_played: calcYearsPlayed(data, ClubID),
                dob: formatISODateToReadable(data[0][4]),
                nationality: data[0][5],
                position: data[0][6],
                birthname: data[0][7],
            });
        }

    }, [data, fetchStatus]);

    function handleCareerLinkClick() {
        navigate('/group32', { state: { passedSearchText: playerData.name } });
    
    }

    return (
        <>
            <div className='title'>{playerData.name}</div>
            <div className='flex-container'>
                <div className='flex-item'>
                <Link to={"/TeamHub"} title='Click to view more cards'>
                    {player && player.id == PlayerID ? (
                        <PlayerCard key={PlayerID} player={player} />
                    ) : (
                        playerError ? (
                            <p>Card Unavailable</p>
                        ) : (
                            <p>Card Loading...</p>
                        )
                    )}
                </Link>
                </div>
                <div className='flex-item'>
                    <div className='p-list-item'>Name: {playerData.birthname == "Birth name not available" ? playerData.name : playerData.birthname}</div>
                    <div className='p-list-item'>Date of Birth: {playerData.dob}</div>
                    <div className='p-list-item'>Nationality: {playerData.nationality}</div>
                    <div className='p-list-item'>Position: {playerData.position}</div>
                    <div className='p-list-item'>Stint at {Clubname}: {playerData.years_played}</div>
                </div>
                <div className='flex-item'>
                    <button className='careerlinkButton' onClick={handleCareerLinkClick}>
                        Click to Learn More about {playerData.name}'s Career
                    </button>
                </div>
            </div>
        </>
    )
};

function formatISODateToReadable(isoDate) {
    const date = new Date(isoDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function calcYearsPlayed(playerdata, clubID) {
    let playtime_intervals = '';
    const currentYear = new Date().getFullYear();
    playerdata.forEach(record => {
        if (record[3] == clubID) {
            let years_list = record[2].split(",").map(str => parseInt(str, 10)).filter(year => year < currentYear);
            let delimiter = playtime_intervals.length == 0 ? "" : ", ";
            playtime_intervals = playtime_intervals + delimiter + years_list[0] + " - " + years_list[years_list.length - 1]
        }
    });
    return playtime_intervals;
}

export default PanelContent;