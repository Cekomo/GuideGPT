const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const bodyParser = require('body-parser');
const port = 5001;
const cors = require('cors');
const { OpenAI } = require('openai');

require('dotenv').config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

async function getNextBubbleId (userId, chatId, messageType) {
    const lastBubbleQuery = 'SELECT MAX(bubble_id) as maxBubbleId FROM chat_bubble WHERE chat_id = ?';
    try {
        const [rows] = await client.execute(lastBubbleQuery, [chatId]);
        const lastBubbleId = rows[0]?.maxBubbleId || 0;
        if (messageType === 0) {
            return lastBubbleId + 1;
        }
        else {
            return lastBubbleId;
        }
    }
    catch (error) {
        console.error('Error retrieving last bubble id: ', error);
        throw error;
    }
}

async function getNextChatBoardId(userId) {
    const lastChatBoardQuery = 'SELECT MAX(chat_id) as maxChatBoardId FROM chat_board WHERE user_id = ?';
    try {
        const [rows] = await client.execute(lastChatBoardQuery, [userId]);
        const lastChatBoardId = rows[0]?.maxChatBoardId || 0;
        return lastChatBoardId + 1;
    } catch (error) {
        console.error('Error retrieving last chat board id: ', error);
        throw error;
    }
}

async function getUpdatedMessageCount (chatId, userId) {
    const chatBoardQuery = 'SELECT message_count as messageCount FROM chat_board WHERE chat_id = ? AND user_id = ?';
    
    try {
        const [rows] = await client.execute(chatBoardQuery, [chatId, userId]);
        const messageCount = rows[0]?.messageCount || 0;
        return messageCount + 1;
    }
    catch (error) {
        console.error('Error message count: ', error);
        throw error;
    }
}

async function getUpdatedChatCount (userId) {
    const chatBoardQuery = 'SELECT chat_count as chatCount FROM chat_user WHERE user_id = ?';
    
    try {
        const [rows] = await client.execute(chatBoardQuery, [userId]);
        const chatCount = rows[0]?.chatCount || 0;
        return chatCount + 1;
    }
    catch (error) {
        console.error('Error message count: ', error);
        throw error;
    }
}

async function insertChatBoardRecord(data) {
    const lastChatBoardId = await getNextChatBoardId(data.user_id);

    const query = `
    INSERT INTO chat_board (user_id, chat_id, chat_title, message_count, creation_date)
    VALUES (?, ?, ?, ?, STR_TO_DATE(SUBSTRING(?, 1, 19), '%Y-%m-%dT%H:%i:%s'));`;
    
    const values = [
        data.user_id,
        lastChatBoardId,
        data.chat_title,
        data.message_count,
        data.creation_date
    ];

    await client.query(query, values);
    return lastChatBoardId;
}


app.post('/insert-chat-board-record', async (req, res) => {
    const data = req.body;
    
    try {
        // const lastChatBoardId = await insertChatBoardRecord(data);
        const lastChatBoardId = await getNextChatBoardId(data.user_id);
        
        const query = `
        INSERT INTO chat_board (user_id, chat_id, chat_title, chat_summary, message_count, creation_date)
        VALUES (?, ?, ?, ?, ?, STR_TO_DATE(SUBSTRING(?, 1, 19), '%Y-%m-%dT%H:%i:%s'));`;

        const values = [
            data.user_id,
            lastChatBoardId,
            data.chat_title,
            data.chat_summary,
            data.message_count,
            data.creation_date
        ];
        const result = await client.query(query, values);
        res.status(201).json( {
            message: 'Chat board data is inserted.',
            chat_id: lastChatBoardId,
            data: data
        });
    } catch (error) {
        console.error('Error during insert:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
})

app.post('/insert-chat-bubble-record', async (req, res) => {
    const data = req.body;
    try {
        const lastBubbleId = await getNextBubbleId('U0001', data.chat_id, data.message_type);

        const query = `
        INSERT INTO chat_bubble (user_id, chat_id, bubble_id, message_type, content, token_count, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, STR_TO_DATE(SUBSTRING(?, 1, 19), '%Y-%m-%dT%H:%i:%s'));`;
        
        const values = [
            'U0001',
            data.chat_id,
            lastBubbleId,
            data.message_type,
            data.content,
            data.token_count,
            data.creation_date            
        ];
        console.log(values);
        const result = await client.query(query, values);
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

app.post('/api/gpt_response', async (req, res) => {
    const { prompt } = req.body;

    try {
        messages: [
            { role: "system", content: "Provide a summary of the user's message with few words at the end. I should not change complete meaning of provided summary." },
            { role: "user", content: prompt }, // User's input message
            
            // { role: "user", content: `${prompt}\n\nProvide a detailed response followed by a summary.` }
        ]

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: messages,
            max_tokens: 300,
        });
        res.json({ completion: completion.choices[0]?.message.content || "No response available" });
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
});

app.patch('/', async (req, res) => {
    const { userId } = req.body;
    try {
        const chatCount = await getUpdatedChatCount('U0001');
        const [result] = await client.execute(
            'UPDATE chat_user SET chat_count = ? WHERE user_id = ?', 
            [chatCount, 'U0001']
        );
        if (result.affectedRows > 0) {
            res.json({ message: 'Chat count updated successfully', chatCount: chatCount });
        } else {
            res.status(404).json({ message: 'Chat not found or update failed'});
        }
    } catch (err) {
        console.error('Error updating chat count:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.patch('/:chatId', async (req, res) => {
    const { chatId } = req.params;
    const { userId } = req.body;
    try {
        const messageCount = await getUpdatedMessageCount(chatId, 'U0001');
        const [result] = await client.execute(
            'UPDATE chat_board SET message_count = ? WHERE chat_id = ? AND user_id = ?', 
            [messageCount, chatId, 'U0001']
        );

        if (result.affectedRows > 0) {
            res.json({ message: 'Message count updated successfully', messageCount: messageCount });
        } else {
            res.status(404).json({ message: 'Chat not found or update failed'});
        }
    } catch (err) {
        console.error('Error updating message count:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
    const { lastMessage } = req.query;
    try {
        if (lastMessage === 'true') {
            const [lastBubble] = await client.execute('SELECT * FROM chat_bubble WHERE chat_id = ? ORDER BY bubble_id DESC LIMIT 1', [chatId]);
            if (lastBubble.length > 0) {
                res.json({ 
                    messages: lastBubble
                });
            } else {
                res.status(404).json({ message: 'No messages found for this chat.' });
            }
        }
        else {
            const [bubbles] = await client.execute('SELECT * FROM chat_bubble WHERE chat_id = ?', [chatId]); // user_id will be added
            if (bubbles.length > 0) {
                res.json({ 
                    messages: bubbles
                });
            } else if (chatId == 0) {
                res.json({ 
                    messages: bubbles
                });
            }
            else {
                res.status(404).json({ message: 'Chat bubble not found.' });
            }
        }
        
    } catch (err) {
        console.error('Error fetching chat bubbles:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});