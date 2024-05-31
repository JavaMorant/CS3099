import React from 'react';

const DataTable = ({ dataPointsPassed }) => {
  const dataPoints = [
    { label: 'Playmaking', value: dataPointsPassed?.playmaking ?? 75 },
    { label: 'Dribbling', value: dataPointsPassed?.dribbling ?? 75 },
    { label: 'Shooting', value: dataPointsPassed?.shooting ?? 75 },
    { label: 'Defending', value: dataPointsPassed?.defending ?? 75 },
    { label: 'Passing', value: dataPointsPassed?.passing ?? 75 },
    { label: 'Physicality', value: dataPointsPassed?.physicality ?? 75 },
  ];

  return (
    <table>
      <tbody>
        {dataPoints.map((point, index) => (
          <tr key={index}>
            <td>{point.label}</td>
            <td>{point.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
