import React from 'react';

interface HandleSendOperationProps {
    value: string;
    chatId?: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    setMessageCount: React.Dispatch<React.SetStateAction<number>>;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    gptRespond?: string;
}

export const HandleSendOperation = ({
    value,
    chatId,
    setValue,
    setMessageCount,
    textareaRef,
    gptRespond,
}: HandleSendOperationProps) => {
    const trimmedValue = value.trim();

    if (trimmedValue && chatId) {
        if (gptRespond) {
            HandleInsertChatBubble(gptRespond, `0`, chatId, setMessageCount);
        }
        else {
            HandleInsertChatBubble(trimmedValue, `1`, chatId, setMessageCount);
        }
        
        // setMessageCount((prevCount) => prevCount + 1);
        setValue(''); // Clear the input field
        if (textareaRef.current) {
            textareaRef.current.value = ''; // Reset the textarea value
        }
    }
};


export const HandleInsertChatBoard = async (userId: string, chatId: string, chatTitle: string) => {
    try {
        const currentDate = new Date().toISOString();
        const chatIdAsNumber = chatId ? parseInt(chatId, 10) : null;
        const response = await fetch('http://localhost:5001/insert-chat-board-record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                chat_id: chatIdAsNumber,  
                chat_title: chatTitle,
                message_count: 0,
                creation_date: currentDate
            })
        });

        if (!response.ok) {
            const errorDetails = await response.text(); // capture the error details
            console.error('Failed to insert data:', errorDetails);
            return; // exit the function if the response is not ok
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

const HandleInsertChatBubble = async (text: string, isUserInput: string, chatId: string, setMessageCount: React.Dispatch<React.SetStateAction<number>>) =>  {
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
                is_user_input: isUserInput,
                creation_date: currentDate,
                token_count: token_qty
            })
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error('Failed to insert data:', errorDetails);
            return { success: false, error: errorDetails };
        }

        return { success: true };
    }
    catch (error) {
        console.error('Error:', error);
    }
}