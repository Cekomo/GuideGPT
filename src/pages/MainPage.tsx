import React, { useState } from 'react';
import './MainPage.css'
import '@fortawesome/fontawesome-free/css/all.min.css';


function MainPage() {
    return (
        <div id='main-page'>
            <div id='chat-block'>
                <div id='input-block'>
                    <input className='text-input' type="text" />
                    <button id='input-button'>
                        <i className="fa-solid fa-paper-plane fa-lg"></i>
                    </button>
                </div>
            </div>  
        </div>
    );
}
  
export default MainPage;
  