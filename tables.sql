CREATE TABLE chat_user (
	user_id VARCHAR(10) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(50) NOT NULL,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_board (
	user_id VARCHAR(10) NOT NULL,
    chat_id INT NOT NULL,
    chat_title VARCHAR(80) NOT NULL, 
    message_count INT NOT NULL,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (user_id) REFERENCES chat_user(user_id),
);

CREATE TABLE chat_bubble (
    chat_id INT NOT NULL,
    bubble_id INT NOT NULL,
    content TEXT NOT NULL,
    is_user_input TINYINT(1) NOT NULL,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token_count INT NOT NULL,
    PRIMARY KEY (chat_id, bubble_id),
    FOREIGN KEY (chat_id) REFERENCES chat_board(chat_id)
);