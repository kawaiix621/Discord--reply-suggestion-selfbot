// App.js
import React from 'react';
import './App.css';
import MessagesComponent from './MessagesComponent';
import SplashScreen from './SplashScreen';

function App() {
  return (
    <div className="App">
      <SplashScreen />
      <MessagesComponent />
    </div>
  );
}

export default App;
