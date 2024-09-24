import React, { useState, useRef, useEffect } from 'react';
import './MainPage.css'
import '@fortawesome/fontawesome-free/css/all.min.css';


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
            setMessageCount(prevCount => prevCount + 1);
            setValue(''); 
            textareaRef.current!.value = '';
        }
    };

    useEffect(() => {
        console.log("Conversation updated:", conversation);
    }, [conversation]); 

    return (
        <div id='main-page'>
            <div id='chat-container'>
                <div id='bubble-container'></div>
                <div id='input-container'>
                    <ExpandableMessageBox
                        value={value}
                        setValue={setValue}
                        textareaRef={textareaRef}
                        onSendMessage={HandleSendButton} 
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
    onSendMessage: (message: string) => void;
}

const ExpandableMessageBox: React.FC<ExpandableMessageBoxProps> = ({ value, setValue, textareaRef, onSendMessage }) => {
    
    const HandleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const trimmedValue = value.trim();
        
        if (event.key === 'Enter' && (!trimmedValue || trimmedValue === '')) {
            event.preventDefault();
        } else if (event.key === 'Enter' && trimmedValue) {
            // onSendMessage(trimmedValue);
            CreateTextBubble(trimmedValue);
            setValue(''); // Clear the input
            event.preventDefault();
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
    
    // Append the textBubble to the container
    bubbleContainer.appendChild(textBubble);
}