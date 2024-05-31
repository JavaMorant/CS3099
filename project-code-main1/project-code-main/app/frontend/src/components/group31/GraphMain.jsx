import React, { Component, useState, useEffect } from 'react';

import { useNodeInfo } from '../../api/hooks/node.hooks';
import { useLoadGraph, SigmaContainer} from '@react-sigma/core';
import LoadingScreen from "./Graph/LoadingScreen";
import SearchBar from "./Controls/SearchBar";
import GraphEvents from './Graph/GraphEvents';
import GraphComponent from './Graph/GraphComponent';
import YearSlider from './Controls/YearSlider';
import SlidingPanel from './SlidingPanel/SlidingPanel'
import PanelContent from './SlidingPanel/PanelContent';
import HighContrastToggle from './Controls/HighContrastToggle';

/**
 * Page containing graph and additional control elements.
 * @returns rendered graph according to current parameters, loading screen if data has not yet been received from backend.
 */
const GraphMain = ({ clubData }) => {
  // Set State of graph according to the selectedYear
  const [selectedYear, setSelectedYear] = useState(2010);
  // Fetch data (asynchonously using hook)
  const {data, fetchStatus, error} = useNodeInfo(clubData, true);
  // Panel state handler
  const [contentID, fetchPanelData] = useState("");

  if(fetchStatus === 'fetching'){
    return <LoadingScreen/>;
  }
  return(
  <>
    <SlidingPanel isOpen={contentID} setOpen={fetchPanelData}>
      <PanelContent isClub={data.id == contentID} contentID={contentID} clubID={data.id}/>
    </SlidingPanel>
    <SigmaContainer settings={{renderEdgeLabels: true}} style={{height: "90%"}}>
    <div style={{position: "absolute", top: 50, left: 10, zIndex: 1000}}>
        <HighContrastToggle/>
      </div>
      <SearchBar/>
      
      <GraphComponent graphdata={data} selectedYear={selectedYear}/>
      <GraphEvents fetchPanelData={fetchPanelData}/>

    </SigmaContainer>
    <YearSlider year={selectedYear} changeYear={setSelectedYear}/>
  </>
  );
};

export default GraphMain;
