import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ExpandableMessageBoxProps {
    value: string;
    setValue: (value: string) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const ExpandableMessageBox: React.FC<ExpandableMessageBoxProps> = ({ value, setValue, textareaRef, onKeyDown }) => {
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