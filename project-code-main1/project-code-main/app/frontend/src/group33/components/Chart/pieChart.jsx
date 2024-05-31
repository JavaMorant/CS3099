import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const MyChart = ({ playerExtraInfo }) => {
  const chartRef = useRef();

  useEffect(() => {
    const sotPercentage = playerExtraInfo && playerExtraInfo.sot ? playerExtraInfo.sot : 75;

    const data = {
      labels: ['SoT%', 'Not SoT%'],
      datasets: [
        {
          label: 'Data',
          data: [sotPercentage, 100 - sotPercentage], // Example data points for each label
          backgroundColor: ['rgba(0, 0, 139, 1)', 'rgba(255, 165, 0, 1)'],
          borderColor: [
            'rgba(0, 0, 139, 1)', // Dark blue
            'rgba(255, 165, 0, 1)' // Orange
          ],
          borderWidth: 1
        }
      ]
    };

    // Pie chart does not typically use options for onClick events in the same way, so we'll omit this part
    const options = {};

    const ctx = chartRef.current.getContext('2d');

    // Create a new Chart instance as a pie chart
    const chart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: options
    });

    return () => {
      chart.destroy(); // Clean up the chart when the component unmounts
    };
  }, [playerExtraInfo]); // The empty dependency array ensures this code runs once after the component is mounted

  return (
    <div>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default MyChart;
