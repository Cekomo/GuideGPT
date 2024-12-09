import { Routes, Route } from 'react-router-dom';
import ChatBoards, {ChatConversation} from './MainPage';
import React from 'react';

const ChatBoardsAndConversationRoutes = () => {
  return (
    <Routes>
      <Route index element={<ChatBoards />} />
      <Route path=":chatId" element={<ChatConversation />} /> 
    </Routes>
  );
};

export default ChatBoardsAndConversationRoutes;
