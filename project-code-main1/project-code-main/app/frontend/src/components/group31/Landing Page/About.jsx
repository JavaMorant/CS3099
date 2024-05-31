import React from 'react';
import './About.css';
import { Icon } from '../../common/Icons';

const About = () => {
    return (
        <div className="about-container">
            <div className="about-paragraph">
                <p>
                    We are a team of dedicated innovators
                    <br />committed to helping football fans
                    <br />find all the information about
                    <br />clubs, stadiums, transfers and players.
                </p>
            </div>
            <div className="about-text">
                <p className="text-line text-line-1">Live for the game,</p>
                <p className="text-line text-line-2">get all the info.</p>
            </div>
        </div>
    );
};

export default About;
