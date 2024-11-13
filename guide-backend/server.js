const express = require('express');
const { Client } = require('pg');
const app = express();
const bodyParser = require('body-parser');
const port = 5001;
const cors = require('cors');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'GuideGPT',
    password: '3204965',
    port: 5432,
});

client.connect().catch(err => {
    console.error('Failed to connect to the database:', err);
});

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

async function getNextBubbleId (chatId) {
    const lastBubbleQuery = 'SELECT MAX(bubble_id) FROM chat_bubble WHERE chat_id = $1';
    try {
        const lastBubbleResult = await client.query(lastBubbleQuery, [chatId]);
        const lastBubbleId = lastBubbleResult.rows[0]?.max || 0;
        return lastBubbleId + 1;
    }
    catch (error) {
        console.error('Error retrieving last bubble_id: ', error);
        return 1;
    }
}


app.post('/insert-chat-bubble-record', async (req, res) => {
    const data = req.body;
    try {
        const lastBubbleId = await getNextBubbleId(data.chat_id);
        // chat_id = 1 until chat part in client is created
        const query = `
        INSERT INTO chat_bubble (chat_id, bubble_id, content, is_user_input, creation_date, token_count)
        VALUES ($1, $2, $3, $4, $5, $6);
        `;
        const values = [
            data.chat_id,
            lastBubbleId,
            data.content,
            data.is_user_input,
            data.creation_date,
            data.token_count
        ];
        const result = await client.query(query, values);
        // console.log('Insert result:', result);
        res.status(201).json( {
            message: 'Data is inserted.',
            data: data
        });
    }
    catch {
        console.error('Error during insert:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
