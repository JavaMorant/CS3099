import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';

const MyChart = () => {
  // Use a ref to access the canvas element
  const chartRef = useRef();

  useEffect(() => {
    // Define your chart data and options
    const data = {
      labels: ['2000', '2002', '2004'],
      datasets: [
        {
          label: 'player score',
          data: [10, 20, 15],
          borderColor: 'rgb(128,122,255)',
          fill: false,
        },
        {
          label: 'number of goals',
          data: [5, 7, 17],
          borderColor: 'rgb(41,204,173)',
          fill: false,
        },
      ],
    };

    const options = {
      onClick: (e) => {
        const canvasPosition = getRelativePosition(e, chart);

        // Substitute the appropriate scale IDs
        const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
        const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
        console.log(`Clicked at (x, y): (${dataX}, ${dataY})`);
      },
    };

    const ctx = chartRef.current.getContext('2d');

    // Create a new Chart instance
    const chart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: options,
    });

    return () => {
      // Clean up the chart when the component unmounts
      chart.destroy();
    };
  }, []); // The empty dependency array ensures this code runs once after the component is mounted

  return (
    <div>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default MyChart;

