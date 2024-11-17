import express from 'express';
import * as chatController from '../controllers/chatController.js';
import auth from '../middlewares/authMiddleware.js'

const chatRoutes = express.Router();
chatRoutes.use(auth())
chatRoutes.post('/create', chatController.createChat);
chatRoutes.post('/invite/:id', chatController.chatInvite);
chatRoutes.get('/getChats', chatController.getChats);
chatRoutes.get('/getMessages', chatController.getMessages);
export default chatRoutes;
