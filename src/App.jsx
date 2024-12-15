import React, { useState } from 'react';
import LoadingScreen from './pages/LoadingScreen.tsx';
import MainPage from './pages/MainPage.tsx';
import { ChatBoards } from  './pages/PageComponents.tsx';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
    {/* <div id='loading-page'>
      <LoadingScreen />
    </div> */}
    <div id='main-page'>
      <Router>
        <Routes>
          <Route path="/conversation/:chatId" element={<MainPage />} />
          <Route path="/conversation/*" element={<ChatBoards />} />
        </Routes>
      </Router>
       {/* <MainPage/> */}
    </div>
    </>
  );
}

export default App;
