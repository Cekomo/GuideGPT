const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const bodyParser = require('body-parser');
const port = 5001;
const cors = require('cors');

const client = mysql.createPool({
    user: 'root',
    host: '127.0.0.1',
    database: 'GuideGPT',
    password: '3204965',
    port: 3306,
});

client.getConnection().catch(err => {
    console.error('Failed to connect to the database:', err);
});

app.use(express.json());
app.use(cors());

async function getNextBubbleId (chatId) {
    const lastBubbleQuery = 'SELECT MAX(bubble_id) as maxBubbleId FROM chat_bubble WHERE chat_id = ?';
    try {
        const [rows] = await client.execute(lastBubbleQuery, [chatId]);
        const lastBubbleId = rows[0]?.maxBubbleId || 0;
        return lastBubbleId + 1;
    }
    catch (error) {
        console.error('Error retrieving last bubble_id: ', error);
        throw error;
    }
}


app.post('/insert-chat-bubble-record', async (req, res) => {
    const data = req.body;
    try {
        const lastBubbleId = await getNextBubbleId(data.chat_id);
        console.log(data.chat_id);
        // chat_id = 1 until chat part in client is created
        const query = `
        INSERT INTO chat_bubble (chat_id, bubble_id, content, is_user_input, creation_date, token_count)
        VALUES (?, ?, ?, ?, STR_TO_DATE(SUBSTRING(?, 1, 19), '%Y-%m-%dT%H:%i:%s'), ?);
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
    catch (error) {
        console.error('Error during insert:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
})


app.get('/conversation', async (req, res) => { // '1' will be changed as chatId
    const data = req.body;
    const chatId = 1; // will be fetched later dynamically
    
    try {
        const textBubbleQuery = 'SELECT content FROM chat_bubble WHERE chat_id = ?'
        const result = await pool.query(textBubbleQuery, [chatId]);
        const messages = result.rows.map(row => row.content);

        res.status(200).json({
            chat_id: chatId,
            messages: messages,
        });
    }
    catch {
        console.error('Error fetching chat bubbles:', error);
        res.status(500).json({ error: 'An error occurred while fetching chat bubbles' });
    }
});



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
