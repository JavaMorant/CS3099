import React from 'react';
import { Stadium } from '../../api/services/stadiums';
import './StadiumMap.css';
import {toWords} from 'number-to-words';
import { Link } from 'react-router-dom';


const StadiumTable: React.FC<{ stadiums: Stadium[] }> = ({ stadiums }) => {
  const maxHeightVh = `calc(100vh - 45vh)`; // Calculate max height of table div
  const widthVw = `calc(100vw - 10vw)`; // Calculate width of no results found div

return (
  <div tabIndex={0} 
      className=" mx-5 flex-1 overflow-auto absolute top-[160px] p-3 overflow-auto bg-gray-200 flex flex-col gap-4 border-none"
      style={{ maxHeight: maxHeightVh }}>
        {stadiums.length == 0 ? (
          <table 
      aria-label="List of stadiums" 
      style={{ margin:'-2px -4px -2px -2px', width:'100%', borderCollapse: 'collapse', borderRadius: '4px', border: '2px solid grey', tableLayout: 'fixed', overflow: 'hidden' }}
    >
      <caption className="text-lg font-bold text-center">No stadiums match the selected criteria.
      </caption></table>        ) :(
      <table 
      aria-label="List of stadiums" 
      style={{ margin:'-2px -4px -2px -2px', width:'100%', borderCollapse: 'collapse', borderRadius: '4px', border: '2px solid grey', tableLayout: 'fixed', overflow: 'hidden' }}
    >
      <caption className="text-lg font-bold text-center">Screen Reader friendly table of stadiums
      </caption>
      <thead>
      <tr>
        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' }}>Stadium Name</th>
        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' }}>Capacity</th>
        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' }}>Location</th>
        <th style={{ border: '1px solid black', padding: '8px', paddingRight: '0px', textAlign: 'left', backgroundColor: '#f2f2f2' }}>Team</th>
      </tr>
      </thead>
      <tbody>
        {stadiums.map((stadium, index) => (
          <tr key={index}>
            <td tabIndex={0} style={{ border: '1px solid black', padding: '8px' }} aria-label={'Stadium Name: '+stadium.name}>{stadium.name}</td>
            <td tabIndex={0} style={{ border: '1px solid black', padding: '8px' }} aria-label={'Capacity: '+toWords(stadium.capacity)}>{stadium. capacity}</td>
            <td tabIndex={0} style={{ border: '1px solid black', padding: '8px' }} aria-label={'Location: '+stadium.location_desc}>{stadium.location_desc}</td>
            {stadium.team_id.startsWith('Q') ? (
                <td tabIndex={0} style={{ border: '1px solid black', padding: '8px', color:'#0078A8' }} aria-label={'Team: '+stadium.team}>
                <Link aria-label={'Link to: '+stadium.team} to={`/team/${stadium.team_id}`}>{stadium.team}</Link></td>
              ) : (
                <td tabIndex={0} style={{ border: '1px solid black', padding: '8px' }} aria-label={'Team: '+stadium.team}>{stadium.team}
                </td>
              )}

          </tr>
        ))}
      </tbody>
    </table>)}

  </div>
  );
};

export default StadiumTable;
