import React from 'react';

const Table = ({ extraInfo = {} }) => {
  // If the tackles_won_pct is greater than 100%, subtract 50% from it
  if (extraInfo.tackles_won_pct && parseFloat(extraInfo.tackles_won_pct) > 100) {
    extraInfo.tackles_won_pct = `${Math.floor(parseFloat(extraInfo.tackles_won_pct) - 50)}`;
  }
  // If the tackles_won_pct is greter than 100%, subtract 50% from it
  if (extraInfo.tackles_won_pct && parseFloat(extraInfo.tackles_won_pct) > 100) {
    extraInfo.tackles_won_pct = Math.floor(parseFloat(extraInfo.tackles_won_pct) - 50).toString();
  }
  return (
    <div className="flex justify-center">
      <table className="table-auto border-collapse border border-gray-300 shadow-lg bg-white">
        <tbody>
          <tr className="bg-blue-100">
            <th className="border border-gray-300 text-left p-2 text-blue-900 font-semibold">
              Total Shots
            </th>
            <td className="border border-gray-300 p-2 text-gray-700">{extraInfo.shots || 'N/A'}</td>
          </tr>
          <tr className="bg-blue-50">
            <th className="border border-gray-300 text-left p-2 text-blue-900 font-semibold">
              Shots on Target(%)
            </th>
            <td className="border border-gray-300 p-2 text-gray-700">{extraInfo.sot || 'N/A'}</td>
          </tr>
          <tr className="bg-blue-100">
            <th className="border border-gray-300 text-left p-2 text-blue-900 font-semibold">
              Number of Goals
            </th>
            <td className="border border-gray-300 p-2 text-gray-700">{extraInfo.goals || 'N/A'}</td>
          </tr>
          <tr className="bg-blue-50">
            <th className="border border-gray-300 text-left p-2 text-blue-900 font-semibold">
              Number of Assists
            </th>
            <td className="border border-gray-300 p-2 text-gray-700">
              {extraInfo.assists || 'N/A'}
            </td>
          </tr>
          <tr className="bg-blue-100">
            <th className="border border-gray-300 text-left p-2 text-blue-900 font-semibold">
              Number of Tackles Won
            </th>
            <td className="border border-gray-300 p-2 text-gray-700">
              {extraInfo.tackles_won || 'N/A'}
            </td>
          </tr>
          <tr className="bg-blue-50">
            <th className="border border-gray-300 text-left p-2 text-blue-900 font-semibold">
              Average Tackles Won (%)
            </th>
            <td className="border border-gray-300 p-2 text-gray-700">
              {extraInfo.tackles_won_pct || 'N/A'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table;
