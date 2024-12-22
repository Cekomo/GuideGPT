import React from 'react';
import OpenAI from "openai";

const RetrieveGptRespond = async (inputMessage: string) => {
    const response = await fetch ( 'api/gpt_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputMessage })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error: ${response.status}, ${error}`);
    }

    const data = await response.json();
    return data.completion;
}

export default RetrieveGptRespond;

