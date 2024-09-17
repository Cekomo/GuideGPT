import React, { useState, useRef, useEffect } from 'react';
import './MainPage.css'
import '@fortawesome/fontawesome-free/css/all.min.css';


function MainPage() {
    return (
        <div id='main-page'>
            <div id='chat-block'>
                <div id='input-block'>
                    <ExpandableMessageBox/>
                    <button id='input-button'>
                        <i className="fa-solid fa-paper-plane fa-lg"></i>
                    </button>
                </div>
            </div>  
        </div>
    );
}
  
export default MainPage;
  

const ExpandableMessageBox: React.FC = () => {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Adjust the height of the textarea based on its content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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
            placeholder="Type your message here..."
            className="expandable-textarea"
        />
    );
};