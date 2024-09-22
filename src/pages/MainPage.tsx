import React, { useState, useRef, useEffect } from 'react';
import './MainPage.css'
import '@fortawesome/fontawesome-free/css/all.min.css';


interface ExpandableMessageBoxProps {
    value: string;
    setValue: (value: string) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>; // Accept the ref as a prop
}

const MainPage: React.FC = () => {
    const [value, setValue] = useState(''); 
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const HandleSendButton = () => {
        const currentValue = textareaRef.current?.value;
        const trimmedValue = currentValue?.trim();
        console.log(textareaRef.current?.value)
        if (trimmedValue) {
            const currentValue = textareaRef.current?.value;
            console.log(trimmedValue);
            setValue(''); 
            textareaRef.current!.value = '';
            console.log(currentValue);
        }
    };

    return (
        <div id='main-page'>
            <div id='chat-block'>
                <div id='input-block'>
                    <ExpandableMessageBox
                        value={value}
                        setValue={setValue}
                        textareaRef={textareaRef}
                    />
                    <button id='input-button' onClick={HandleSendButton}>
                        <i className="fa-solid fa-paper-plane fa-lg"></i>
                    </button>
                </div>
            </div>  
        </div>
    );
}
  
export default MainPage;
  

const ExpandableMessageBox: React.FC<ExpandableMessageBoxProps> = ({ value, setValue, textareaRef }) => {
    
    const HandleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const currentValue = textareaRef.current?.value;
        const trimmedValue = currentValue?.trim();

        if (event.key === 'Enter' && (!trimmedValue || trimmedValue === '')) {
            event.preventDefault();
        } else if (event.key === 'Enter' && trimmedValue) {
            console.log(currentValue);
            setValue('');
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