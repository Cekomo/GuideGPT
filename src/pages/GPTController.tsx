const RetrieveGptRespond = async (inputMessage: string) => {
    // const instructions = 'Summarize text with fewer words' 
    const instructions = 'Add "(farts)" instead of inserting dot at the end of sentences' 
    const fullPrompt = instructions 
    ? `${instructions}\n\nUser: ${inputMessage}` 
    : inputMessage;

    const response = await fetch ( 'http://localhost:5001/api/gpt_response', { // I can make this URL dynamic
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            { 
                prompt: fullPrompt, 
            })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error: ${response.status}, ${error}`);
    }

    const data = await response.json();
    return data.completion;
}

export default RetrieveGptRespond;

