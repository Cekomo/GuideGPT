import { getLastMessages } from './ServerOperation';

const MAX_MESSAGES = 8;
let conversationHistory: Array<{ role: string, content: string }> = [
    { role: "system", content: "Respond to the user's input. At the end, provide a concise summary of the user's question prefixed with '/nSummary:'." }
];

const RetrieveGptRespond = async (inputMessage: string, userId: string, chatId?: string) => {
    if (conversationHistory.length === 1) {
        const historyFromDb = await getLastMessages(userId, chatId || ""); 
        console.log(historyFromDb);
        if (Array.isArray(historyFromDb)) {
            conversationHistory = [conversationHistory[0], ...historyFromDb]; // Keep system message at index 0
        } else {
            console.error("Error retrieving history:");
        }    }

    conversationHistory.push({ role: "user", content: inputMessage });

    if (conversationHistory.length > MAX_MESSAGES) {
        conversationHistory.splice(1, 1);
    }
    
    const response = await fetch('http://localhost:5001/api/gpt_response', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previousMessages: conversationHistory })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error: ${response.status}, ${error}`);
    }

    const data = await response.json();
    console.log(data);

    conversationHistory.push({ role: "assistant", content: data.completion });

    return data.completion;
}

export default RetrieveGptRespond;
