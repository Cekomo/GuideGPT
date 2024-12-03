CREATE TABLE chat_user (
	user_id VARCHAR(10) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(50) NOT NULL,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_board (
	user_id VARCHAR(10),
	FOREIGN KEY (user_id) REFERENCES chat_user(user_id),
    chat_id INT NOT NULL PRIMARY KEY,
    chat_title VARCHAR(80) NOT NULL, 
    message_count INT NOT NULL,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_bubble (
   chat_id int NOT NULL,
   bubble_id int NOT NULL PRIMARY KEY,
   content text NOT NULL,
   is_user_input tinyint(1) NOT NULL,
   creation_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
   token_count int NOT NULL,
   FOREIGN KEY (chat_id) REFERENCES chat_board(chat_id)
);