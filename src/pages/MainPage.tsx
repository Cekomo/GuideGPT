import React, { useState, useRef, useEffect } from 'react';
import './MainPage.css'
import { ExpandableMessageBox, ChatConversation, ChatBoards } from './PageComponents'
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
        }
    };

    const handleButtonClick = () => {
        HandleSendOperation({ value, chatId, setValue, setMessageCount, textareaRef });
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

interface HandleSendOperationProps {
    value: string;
    chatId?: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    setMessageCount: React.Dispatch<React.SetStateAction<number>>;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const HandleSendOperation = ({
    value,
    chatId,
    setValue,
    setMessageCount,
    textareaRef,
}: HandleSendOperationProps) => {
    const trimmedValue = value.trim();

    if (trimmedValue && chatId) {
        HandleInsertChatBubble(trimmedValue, chatId); // Call your message insertion function
        setMessageCount((prevCount) => prevCount + 1); // Update message count
        setValue(''); // Clear the input field
        if (textareaRef.current) {
            textareaRef.current.value = ''; // Reset the textarea value
        }
    }
};

const HandleInsertChatBubble = async (text: string, chatId: string) =>  {
    try {
        const currentDate = new Date().toISOString();

        const token_qty = Math.ceil(text.length / 4);
        const chatIdAsNumber = chatId ? parseInt(chatId, 10) : null;
        const response = await fetch('http://localhost:5001/insert-chat-bubble-record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatIdAsNumber,  
                bubble_id: null,  
                content: text,
                is_user_input: true,
                creation_date: currentDate,
                token_count: token_qty
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Data inserted:', result);
        } else {
            console.error('Failed to insert data:', response);
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
}