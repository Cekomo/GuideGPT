import React, { useState, useRef, useEffect } from 'react';
import './MainPage.css'
import { ExpandableMessageBox, ChatConversation, ChatBoards } from './PageComponents'
import { HandleSendOperation } from './ServerOperation'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useParams, useNavigate } from 'react-router-dom';
import RetrieveGptRespond from './GPTController'


const MainPage: React.FC = () => {
    const [value, setValue] = useState(''); 
    const { chatId } = useParams<{ chatId: string }>();
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messageCount, setMessageCount] = useState(0);
    // const [isUserInput, setIfUserInput] = useState(`0`);

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && value?.trim()) {
            event.preventDefault();
            HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef });
            // setIfUserInput('1');
            try {
                const gptRespond = await RetrieveGptRespond(value); // Wait for the GPT response
                HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef, gptRespond });
                // setIfUserInput('0');
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleButtonClick = async () => {
        if (value?.trim()) {
            HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef });
            // setIfUserInput('1');
            try {
                const gptRespond = await RetrieveGptRespond(value); // Wait for the GPT response
                HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef, gptRespond });
                // setIfUserInput('0');
            } catch (error) {
                console.error(error);
            }
        }
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
