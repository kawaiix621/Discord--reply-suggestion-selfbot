// SplashScreen.js
import React, { useEffect, useState } from 'react';
import logo from './logo.svg'; // Ensure this path is correct
import './SplashScreen.css'; // You can create a CSS file for styling

const SplashScreen = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  if (!showSplash) return null; // Do not render anything if splash screen is not needed

  return (
    <div className="splash-screen">
      <div style={
        {
            textAlign:'center'
        }
      }>
      <h1>Discord</h1>
      <h2
      style={{
color:'#7369c9'
      }}

      >0_O</h2>
      </div>
    </div>
  );
};

export default SplashScreen;
