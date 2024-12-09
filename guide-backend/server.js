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
        // console.log(result);
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

app.get('/', async(req, res) => {
    try {
        const [boards] = await client.execute('SELECT * FROM chat_board'); // user_id will be added
        if (0 || boards.length > 0) {
            res.json({
                chatBoards: boards
            });
        }
        else {
            res.status(404).json({ message: 'Chat item not found'})
        }
    }
    catch (err) {
        console.error('Error fetching chat bubbles:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/:chatId', async (req, res) => {
    const { chatId } = req.params;
    try {
        const [bubbles] = await client.execute('SELECT * FROM chat_bubble WHERE chat_id = ?', [chatId]); // user_id will be added
        bubbles
        if (bubbles.length > 0) {
            res.json({ 
                messages: bubbles
            });
        } else {
            res.status(404).json({ message: 'Chat bubble not found.' });
        }
        
    } catch (err) {
        console.error('Error fetching chat bubbles:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});