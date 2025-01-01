import React, { useState, useRef, useEffect } from 'react';
import './MainPage.css'
import { ExpandableMessageBox, ChatConversation, ChatBoards } from './PageComponents'
import { HandleSendOperation, HandleInsertChatBoard } from './ServerOperation'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import RetrieveGptRespond from './GPTController'


const MainPage: React.FC = () => {
    const [value, setValue] = useState(''); 
    const navigate = useNavigate();
    const location = useLocation();
    const { chatId } = useParams<{ chatId: string }>();
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messageCount, setMessageCount] = useState(0);
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    const navigateToStartPage = async (chatId: string = '') => {
        try {
            navigate(`/conversation/${chatId}`);
        } catch {
            console.error('Start page cannot be navigated.');
        }
    };

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && value?.trim()) {
            event.preventDefault();
            HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef });
            try {
                const gptRespond = await RetrieveGptRespond(value); // Wait for the GPT response
                HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef, gptRespond });
            } catch (error) {
                console.error(error);
            }
            if (lastSegment == '0') {
                navigateToStartPage(chatId?.toString());
            }
        }
        else if (event.key === 'Enter' && !event.shiftKey &&!value?.trim()) {
            event.preventDefault();
        }
    };

    const handleButtonClick = async () => {
        if (value?.trim()) {
            HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef });
            try {
                const gptRespond = await RetrieveGptRespond(value); // Wait for the GPT response
                HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef, gptRespond });
            } catch (error) {
                console.error(error);
            }
            if (lastSegment == '0') {
                navigateToStartPage(chatId?.toString());
            }
        }
    };

    const addNewChat = async () => {
        navigateToStartPage('0');
    }

    return (
        <div id='main-page'>    
            <div id='chat-container'>
                <div id='left-panel'>
                    <div id='chat-board-list'>
                        <ChatBoards/>
                    </div>
                    <div id='control-panel'>
                        <button id='chat-adder-button' onClick={addNewChat}>
                            <i className="fa-solid fa-plus"></i>
                        </button>
                    </div>
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
