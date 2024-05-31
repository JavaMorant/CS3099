import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';

const MyChart = ({ dataPointsPassed }) => {
  // Use a ref to access the canvas element
  const chartRef = useRef();
  useEffect(() => {
    // Ensure the data points passed are not undefined
    const dataPoints = [
      dataPointsPassed && dataPointsPassed.playmaking ? dataPointsPassed.playmaking : 75,
      dataPointsPassed && dataPointsPassed.dribbling ? dataPointsPassed.dribbling : 75,
      dataPointsPassed && dataPointsPassed.shooting ? dataPointsPassed.shooting : 75,
      dataPointsPassed && dataPointsPassed.defending ? dataPointsPassed.defending : 75,
      dataPointsPassed && dataPointsPassed.passing ? dataPointsPassed.passing : 75,
      dataPointsPassed && dataPointsPassed.physicality ? dataPointsPassed.physicality : 75
    ];

    console.log('Passed', dataPointsPassed);

    const data = {
      labels: ['PAC', 'DRI', 'SHO', 'DEF', 'PAS', 'PHY'],
      datasets: [
        {
          data: dataPoints,
          borderColor: 'rgb(185,181,255)',
          fill: true,
          backgroundColor: 'rgba(185,181,255,0.5)', // Add this line
          labels: ['PAC', 'DRI', 'SHO', 'DEF', 'PAS', 'PHY']
        }
      ]
    };

    const options = {
      scales: {
        r: {
          grid: {
            color: 'rgba(105,105,105, 0.5)'
          },
          angleLines: {
            color: 'rgba(105,105,105, 0.5)'
          },
          beginAtZero: true,
          min: 0,
          max: 100,
          pointLabels: {
            font: {
              size: 14
            }
          }
          // ticks: {
          //   fontSize: 20
          // }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true, // Enable tooltips
          mode: 'index',
          intersect: false
        }
      },

      onClick: (e) => {
        const canvasPosition = getRelativePosition(e, chart);

        // Substitute the appropriate scale IDs
        const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
        const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
        console.log(`Clicked at (x, y): (${dataX}, ${dataY})`);
      }
    };

    const ctx = chartRef.current.getContext('2d');

    // Create a new Chart instance
    const chart = new Chart(ctx, {
      type: 'radar',
      data: data,
      options: options
    });

    return () => {
      // Clean up the chart when the component unmounts
      chart.destroy();
    };
  }, [dataPointsPassed]); // Allows for the component to re-render when the data points change

  return (
    <div>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default MyChart;
