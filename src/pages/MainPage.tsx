import React, { useState, useRef, useEffect } from 'react';
import './MainPage.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useParams, BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const MainPage: React.FC = () => {
    const [value, setValue] = useState(''); 
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [conversation, setConversation] = useState<{ [key: string]: string }> ({});
    const [messageCount, setMessageCount] = useState(1);

    const HandleSendButton = () => {
        const currentValue = textareaRef.current?.value;
        const trimmedValue = currentValue?.trim();
        if (trimmedValue) {
            const newKey = `u${messageCount}`;
            setConversation(prevConversation => ({
                ...prevConversation,
                [newKey]: trimmedValue                
            }));
            CreateTextBubble(trimmedValue);
            handleInsertChatBubble(trimmedValue);
            setMessageCount(prevCount => prevCount + 1);
            setValue(''); 
            textareaRef.current!.value = '';
        }
    };

    return (
        <div id='main-page'>
            <div id='chat-container'>
                <div id='bubble-container'>
                    <Router>
                        <Routes>
                            <Route path="/:chatId" element={<ChatConversation  />} />
                        </Routes>
                    </Router>
                </div>
                <div id='input-container'>
                    <ExpandableMessageBox
                        value={value}
                        setValue={setValue}
                        textareaRef={textareaRef}
                    />
                </div>
                <button id='input-button' onClick={HandleSendButton}>
                    <i className="fa-solid fa-paper-plane fa-lg"></i>
                </button>
            </div>  
        </div>
    );
}
  
export default MainPage;

interface ExpandableMessageBoxProps {
    value: string;
    setValue: (value: string) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>; // Accept the ref as a prop
}

const ExpandableMessageBox: React.FC<ExpandableMessageBoxProps> = ({ value, setValue, textareaRef }) => {
    
    const HandleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const trimmedValue = value.trim();
        
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                return;
            } 
            if (!trimmedValue || trimmedValue === '') {
                event.preventDefault();
            } else if (trimmedValue) {
                CreateTextBubble(trimmedValue);
                handleInsertChatBubble(trimmedValue);
                setValue('');
                event.preventDefault();
            }
        } 
    }

    // this works for a line having 48 characters
    useEffect(() => {
        if (textareaRef.current) {
            const currentValue = textareaRef.current.value;
            textareaRef.current.style.height = 'auto';
            if (currentValue.length <= 48) {
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight - 16}px`;
            } else {
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }

            if (textareaRef.current.scrollHeight > 250) {
                textareaRef.current.style.height = '250px'
            }
        }
    }, [value]);
    
    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={HandleKeyDown}
            placeholder="Type your message here..."
            className="expandable-textarea"
        />
    );
};

function CreateTextBubble(text: string): void {
    const bubbleContainer = document.getElementById('bubble-container') as HTMLElement;
    const textBubble = document.createElement("div");
    textBubble.classList.add('text-bubble');
    textBubble.textContent = text;
    if (bubbleContainer.firstChild) {
        bubbleContainer.insertBefore(textBubble, bubbleContainer.firstChild);
    } else {
        bubbleContainer.appendChild(textBubble);
    }
    bubbleContainer.scrollTop = bubbleContainer.scrollHeight;
}

const handleInsertChatBubble = async (text: string) =>  {
    try {
        const currentDate = new Date().toISOString();
        const chat_id = 1;
        const token_qty = Math.ceil(text.length / 4);
        const response = await fetch('http://localhost:5001/insert-chat-bubble-record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chat_id,  
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

interface Message {
    chat_id: number;
    bubble_id: number;
    content: string;
    is_user_input: boolean;
    creation_date: string; // or Date if already converted
    token_count: number;
}

const ChatConversation = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:5001/${chatId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }
                const data = await response.json();
                setMessages(data.messages);
                setLoading(false);
            }
            catch {
                setError(error);
                setLoading(false);
            }
        };
        fetchMessages();
    }, [chatId]);


    return (
        <div>
            <ul>
            {messages.map((msg, index) => (
                    <div key={index}>
                        <p><strong>{msg.bubble_id}</strong> {msg.content}</p>
                    </div>
                ))}
            </ul>
        </div>
    );
} 