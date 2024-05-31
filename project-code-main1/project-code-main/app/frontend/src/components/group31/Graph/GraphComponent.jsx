import React, { useEffect } from 'react';
import { MultiDirectedGraph } from "graphology";
import seedrandom from 'seedrandom';
import './GraphComponent.css';

import { useLoadGraph } from '@react-sigma/core';

// Graph component needs to receive data (most likely as props)

const GraphComponent = ({ graphdata, selectedYear }) => {
  // Seeded random number generator f     or persisting player positions
  const generator = seedrandom('Groupmates Please do Something');
  const loadGraph = useLoadGraph(); // Attempt to Load graph (graphdata received or not)
  const currentYear = new Date().getFullYear();
  var player_data = graphdata.players.map(player => {
    let playerdict = {};
    playerdict['id'] = player[0]
    playerdict['name'] = player[1]
    playerdict['years_played'] = player[2].split(",").map(str => parseInt(str, 10)).filter(year => year < currentYear)
    return playerdict
  })
  var nodeCols = graphdata.colour.split(", ")

  useEffect(() => {
    const localGraph = new MultiDirectedGraph();
    const isHighContrast = document.body.classList.contains('high-contrast');
    // Decide node colors based on the high contrast mode
    var nodeColNormal = graphdata.colour.split(", ");
    var nodeColHighContrast = ["#00000", "#FF00FF"]; 
    let maxYear = 0;
    var nodeCols = isHighContrast ? nodeColHighContrast : nodeColNormal;

    player_data.forEach(player => {
      maxYear = player.years_played.length > maxYear ? player.years_played.length + 5 : maxYear;
    })
    player_data.forEach(player => {
      let offset = Math.random() * 6
      const rand = generator();
      player.x = Math.cos(2 * Math.PI * rand) * (maxYear - player.years_played.length + offset);
      player.y = Math.sin(2 * Math.PI * rand) * (maxYear - player.years_played.length + offset);
    })
    const filteredPlayers = player_data.filter((player) => {
      return player.years_played.includes(selectedYear);
    })
    // Add team node (CURRENTLY STATIC AT 0,0)
    localGraph.addNode(graphdata.id, {
      label: graphdata.name,
      name: "club",
      // class: {image: graphdata.logo},
      // image: graphdata.logo,
      // url: graphdata.logo,
      x: 0,
      y: 0,
      size: 50,
      color: (nodeCols.length > 1? nodeCols[1] : nodeCols[0])
    });

    // Add Node for each player in the filtered graphdata:
    let nodeCol = (nodeCols.length > 1? nodeCols[0] : nodeCols[0])
    filteredPlayers.forEach(player => {
      localGraph.addNode(player.id, {
        label: player.name,
        // Coordinates are generated randomly (chance of overlap, consider layout)
        x: player.x,
        y: player.y,
        size: 12,
        color: nodeCols[0] 
      });
      // Add edge between the team node and player node
      localGraph.addEdge(graphdata.id, player.id);
    });

    loadGraph(localGraph);

  }, [graphdata, selectedYear]); // Dependencies (to reload graph)
  // Component does not require additional tags, just the graph object to be loaded.
  return null;
};

export default GraphComponent;
