import React, { useState, useRef, useEffect } from 'react';
import './MainPage.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useParams, useNavigate } from 'react-router-dom';


const MainPage: React.FC = () => {
    const [value, setValue] = useState(''); 
    const { chatId } = useParams<{ chatId: string }>();
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messageCount, setMessageCount] = useState(0);

    const HandleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const trimmedValue = value.trim();

        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (trimmedValue && chatId) {
                HandleInsertChatBubble(trimmedValue, chatId);
                setMessageCount((prevCount) => prevCount + 1);
                setValue('');
                if (textareaRef.current) {
                    textareaRef.current.value = '';
                }
            }
        }
    };

    const HandleButtonClick = () => {
        const trimmedValue = value.trim();

        if (trimmedValue && chatId) {
            HandleInsertChatBubble(trimmedValue, chatId);
            setMessageCount((prevCount) => prevCount + 1);
            setValue('');
            if (textareaRef.current) {
                textareaRef.current.value = '';
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
                            onKeyDown={HandleKeyDown}
                        />
                    </div>
                    <button id='input-button' onClick={HandleButtonClick} >
                        <i className="fa-solid fa-paper-plane fa-lg"></i>
                    </button>
                </div>  
            </div>
        </div>
    );
}
  
export default MainPage;

interface ExpandableMessageBoxProps {
    value: string;
    setValue: (value: string) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const ExpandableMessageBox: React.FC<ExpandableMessageBoxProps> = ({ value, setValue, textareaRef, onKeyDown }) => {
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
            onKeyDown={onKeyDown}
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

interface Message {
    chat_id: number;
    bubble_id: number;
    content: string;
    is_user_input: boolean;
    creation_date: string;
    token_count: number;
}

interface ChatConversationProps {
    chatId: string;
    messageCount: number;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({chatId, messageCount}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatBoards, setChatBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const bubbleContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:5001/${chatId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }
                const data = await response.json();
                setChatBoards(data.chatBoards || []);
                setMessages(data.messages);
                setLoading(false);
            }
            catch {
                setError(error);
                setLoading(false);
            }
        };
        fetchMessages();
    }, [chatId, messageCount]);

    useEffect(() => {
        if (bubbleContainerRef.current) {
            bubbleContainerRef.current.scrollTop = bubbleContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const renderMessages = () => {
        return messages.map((msg) => (
            <div key={msg.bubble_id} className="text-bubble">
                {msg.content}
            </div>
        ));
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <div ref={bubbleContainerRef}>
                { renderMessages() }
            </div>
        </div>
    );
} 

export const ChatBoards = () => {
    const [boards, setBoards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChatBoards = async () => {
            try {
                const response = await fetch(`http://localhost:5001/`);
                if (!response.ok) {
                    throw new Error('Failed to fetch chat boards');
                }

                const data = await response.json();
                setBoards(data.chatBoards || []);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setLoading(false);
            }
        };

        fetchChatBoards();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const handleNavigation = (chatId: number) => {
        navigate(`/conversation/${chatId}`); 
    };

    return (
        <div >
            {boards.map((board) => (
                <button 
                    key={board.chat_id} 
                    className="chat-board-item"
                    onClick={() => handleNavigation(board.chat_id)}>
                    {board.chat_title}
                </button>
            ))}
        </div>
    );
};
