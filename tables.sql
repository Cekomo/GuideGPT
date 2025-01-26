CREATE TABLE chat_user (
	user_id VARCHAR(10) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(50) NOT NULL,
    chat_count INT DEFAULT 0,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_board (
	user_id VARCHAR(10) NOT NULL,
    chat_id INT NOT NULL,
    chat_title VARCHAR(80) NOT NULL, 
    chat_summary TEXT DEFAULT NULL
    message_count INT NOT NULL,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (user_id) REFERENCES chat_user(user_id)
);

CREATE TABLE chat_bubble (
    user_id VARCHAR(10) NOT NULL,
    chat_id INT NOT NULL,
    bubble_id INT NOT NULL,
    message_type INT NOT NULL,
    content TEXT NOT NULL,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token_count INT NOT NULL,
    PRIMARY KEY (chat_id, bubble_id, message_type),
    FOREIGN KEY (user_id, chat_id) REFERENCES chat_board(user_id, chat_id)
);

-- chat board insertion script
INSERT INTO chat_board (user_id, chat_id, chat_title, message_count, creation_date)
VALUES (?, ?, 'New Conversation', 0, STR_TO_DATE(SUBSTRING(?, 1, 19), '%Y-%m-%dT%H:%i:%s'));

-- chat_user insertion script
INSERT INTO chat_user (user_id, name, surname, email, password, chat_count, creation_date)
VALUES ('U0001', 'Cemil', 'Şahin', 'cemils18@gmail.com', '3204965', 0, STR_TO_DATE('2025-01-26T14:30:00', '%Y-%m-%dT%H:%i:%s'));
