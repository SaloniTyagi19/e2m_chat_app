import dotenv from 'dotenv';
import express from 'express';
import routes from './routes/indexRoute.js'
import cors from 'cors';
import dbConnection from './utils/dbConnection.js';
import message from './utils/messages.js';
import initializeWebSocket from './utils/websocket.js';
import http from 'http'

dotenv.config()
const router = express();

// Json Data processing
router.use(express.json());

// Multi platform
router.use(cors({
    origin: process.env.HOSTS,  // allow only this origin to access resources
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // allow only these methods
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse the request
router.use(express.urlencoded({ extended: false }));

// Routing
router.use('/', routes);

// Error Handling
router.use((req, res, next) => {
    return res.status(404).json({
        message: message.NOT_FOUND_URL
    });
});

// connect db
dbConnection().then(()=>{
    console.log(`Connected to db at ${process.env.DB_URL}`)
}).catch((err) => {
    console.error(err.message)
})

// Create an HTTP server to integrate with WebSocket
const server = http.createServer(router);

// Initialize WebSocket
const io = initializeWebSocket(server);

// Server
const PORT = process.env.PORT || 4000;
router.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const exitHandler = (errMessage = 'Some error occured.') => {
    console.info(errMessage)
    process.exit(1);
};

const unExpectedErrorHandler = (error) => {
    exitHandler("Server closed successfully");
}
process.on('uncaughtException', unExpectedErrorHandler);
process.on('unhandledRejection', unExpectedErrorHandler);

process.on('SIGTERM', () => {
    exitHandler('SIGTERM received');
});