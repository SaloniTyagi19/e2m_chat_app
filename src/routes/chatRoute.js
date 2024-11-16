import express from 'express';
import * as chatController from '../controllers/chatController.js';
import auth from '../middlewares/authMiddleware.js'

const chatRoutes = express.Router();
chatRoutes.use(auth())
chatRoutes.post('/create', chatController.createChat);
chatRoutes.post('/invite/:id', chatController.chatInvite);
chatRoutes.post('/getChats', chatController.getChats);
export default chatRoutes;
