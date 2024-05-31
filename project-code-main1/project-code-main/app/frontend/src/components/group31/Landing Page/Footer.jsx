import React from 'react';
import './Footer.css';
import { Icon } from '../../common/Icons';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <Icon name="Logo" className="footer-logo" />
                    <a href="https://info.cs.st-andrews.ac.uk/">Studres</a>
                    <a href="https://info.cs.st-andrews.ac.uk/student-handbook/modules/CS3099.html">Module Information</a>
                </div>
                <div className="footer-right">
                    {}
                    Copyright © University of St Andrews
                </div>
            </div>
        </footer>
    );
};

export default Footer;
