import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';

import routes from './routes/indexRoute.js';
import dbConnection from './utils/dbConnection.js';
import message from './utils/messages.js';
import messageModel from './models/messageModel.js';
import userModel from './models/userModel.js';
import callAPi from './utils/openAI.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const HOSTS = process.env.HOSTS || '*';
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/chatapp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
    cors: {
        origin: HOSTS,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
});

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: HOSTS }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routing
app.use('/', routes);

// 404 Error Handling
app.use((req, res, next) => {
    res.status(404).json({ message: message.NOT_FOUND_URL });
});

// Database Connection
dbConnection()
    .then(() => console.log(`Connected to database at ${DB_URL}`))
    .catch((error) => console.error('Database connection error:', error.message));

// WebSocket Setup
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a specific chat room
    socket.on('joinChat', (chatId) => {
        console.log(`User ${socket.id} joined chat ${chatId}`);
        socket.join(chatId);
    });

    // Handle sending a message
    socket.on('sendMessage', async (data) => {
        const { chatId, senderId, content } = data;

        try {
            await messageModel.create({ chatId, sender: senderId, content });
            const sender = await userModel.findById(senderId).select('userName');
            io.to(chatId).emit('newMessage', { content, sender, chatId });
            const getData = await callAPi(content)
            if(getData) {
                io.to(chatId).emit('newMessage', { content: getData.message.content || getData.message, sender: {userName: 'OPENAI'}, chatId });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('messageError', { error: 'Failed to send the message. Please try again.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Exit Handlers
const exitHandler = (message) => {
    console.info(message);
    process.exit(1);
};

const unexpectedErrorHandler = (error) => {
    console.error('Unexpected error:', error);
    exitHandler('Server closed due to an unexpected error.');
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    exitHandler('SIGTERM received. Shutting down gracefully.');
});

// Start the Server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default io;
