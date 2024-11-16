import { Server } from "socket.io";

const initializeWebSocket = (server) => {
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('joinChat', (chatId) => {
            socket.join(chatId);
        });

        socket.on('new_message', async (message) => {
            console.log('Received message:', message);
    
            try {
                // Send message to OpenAI's API
                const response = await axios.post('https://api.openai.com/v1/completions', {
                    model: 'text-davinci-003',
                    prompt: message,
                    max_tokens: 150
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
    
                const aiResponse = response.data.choices[0].text.trim();
    
                // Emit OpenAI response back to client
                socket.emit('message_response', { response: aiResponse });
    
            } catch (error) {
                console.error('Error communicating with OpenAI:', error);
                socket.emit('message_response', { response: 'Sorry, something went wrong.' });
            }
        })

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

export default initializeWebSocket;
