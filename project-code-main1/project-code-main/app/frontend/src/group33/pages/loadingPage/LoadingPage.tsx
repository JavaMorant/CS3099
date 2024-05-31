import React from 'react';
import { Link } from 'react-router-dom';

import Football from '../../assets/images/loadingPage/football.webp';

import './LoadingPage.css';
import './LoadingPage.css';

const LoadingPage = () => {
  return (
    <div className="court">
      <img className="football" src={Football}></img>
      <h1 className="font">Querying players, hang on tight!</h1>
      <div className=" court_image"></div>
    </div>
  );
};

export default LoadingPage;
