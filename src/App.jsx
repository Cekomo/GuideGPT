import React, { useState } from 'react';
import LoadingScreen from './pages/LoadingScreen.tsx';
import MainPage from './pages/MainPage.tsx';
import './App.css';

function App() {
  return (
    <>
    {/* <div id='loading-page'>
      <LoadingScreen />
    </div> */}
    <div id='main-page'>
      <MainPage/>
    </div>
    </>
  );
}

export default App;
