import React from 'react';
import { Link } from 'react-router-dom';

const TeamCard = ({ team }) => {
    return (
            <div className='w-40 h-40 rounded relative'>
                <img src={team.image_url} alt={team.name} className='absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 max-w-full max-h-full rounded' />
            </div>


    );
};


export default TeamCard;
