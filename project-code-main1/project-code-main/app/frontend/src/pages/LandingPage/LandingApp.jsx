// In src/App.js
import React, { useState, useEffect } from 'react';
import About from '../../components/group31/Landing Page/About';
import ClubSelection from '../../components/group31/Landing Page/ClubSelection';
import Footer from '../../components/group31/Landing Page/Footer';
import './LandingApp.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        let nextProgress;
        if (prevProgress < 50) {
          nextProgress = prevProgress + 10; // Speed up before 50%
        } else if (prevProgress >= 50 && prevProgress < 80) {
          nextProgress = prevProgress + 5; // Slow down after 50% and before 80%
        } else {
          nextProgress = prevProgress + 1; // Further slow down as it nears completion
        }

        if (nextProgress >= 100) {
          clearInterval(interval);
          setLoading(false);
        }
        return nextProgress;
      });
    }, 40); // You might adjust the interval time for finer control

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="preloader">
        {progress}%
      </div>
    );
  }

  return (
      <div className="LandingApp">
          <ClubSelection />
          <About />
          <Footer />
      </div>
  );
}

export default App;
