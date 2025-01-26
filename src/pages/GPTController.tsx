const RetrieveGptRespond = async (inputMessage: string) => {
    const response = await fetch ( 'http://localhost:5001/api/gpt_response', { // I can make this URL dynamic
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            { 
                prompt: inputMessage
            })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error: ${response.status}, ${error}`);
    }

    const data = await response.json();
    console.log(data);
    return data.completion;
}

export default RetrieveGptRespond;

