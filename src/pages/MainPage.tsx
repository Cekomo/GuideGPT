import React, { useState, useRef, useEffect } from 'react';
import './MainPage.css'
import { ExpandableMessageBox, ChatConversation, ChatBoards, CreateTextBubble } from './PageComponents'
import { HandleSendOperation } from './ServerOperation'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useParams, useNavigate } from 'react-router-dom';


const MainPage: React.FC = () => {
    const [value, setValue] = useState(''); 
    const { chatId } = useParams<{ chatId: string }>();
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messageCount, setMessageCount] = useState(0);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef });
            // CreateTextBubble(value);
        }
    };

    const handleButtonClick = () => {
        HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef });
        // CreateTextBubble(value);
    };

    return (
        <div id='main-page'>    
            <div id='chat-container'>
                <div id='chat-board-list'>
                    <ChatBoards/>
                </div>
                <div id='chat-board'>
                    <div id='bubble-container'>
                        {chatId && <ChatConversation chatId={chatId} messageCount={messageCount}/>}
                    </div>
                    <div id='input-container'>
                        <ExpandableMessageBox
                            value={value}
                            setValue={setValue}
                            textareaRef={textareaRef}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <button id='input-button' onClick={handleButtonClick} >
                        <i className="fa-solid fa-paper-plane fa-lg"></i>
                    </button>
                </div>  
            </div>
        </div>
    );
}
  
export default MainPage;
