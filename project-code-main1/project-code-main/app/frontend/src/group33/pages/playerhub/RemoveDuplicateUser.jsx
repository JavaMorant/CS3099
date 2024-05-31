export function removeDuplicatePlayers(players) {
    const uniqueIds = new Set();
    const uniquePlayers = [];
  
    players.forEach(player => {
      if (!uniqueIds.has(player.id)) {
        uniqueIds.add(player.id);
        uniquePlayers.push(player);
      }
    });
  
    return uniquePlayers;
  }