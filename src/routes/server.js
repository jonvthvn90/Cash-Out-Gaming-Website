const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Adjust this to your frontend URL
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose.connect('mongodb://localhost/yourDatabaseName', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Models
const User = require('../models/User');
const Match = require('../models/Match');
const Achievement = require('./models/Achievement'); // Add this line for achievements

let connectedClients = [];

io.on('connection', (socket) => {
    connectedClients.push(socket.id);
    console.log('New client connected');

    // Join user's notification room
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their notification room`);
    });

    // Join match room for live updates
    socket.on('joinMatchRoom', (matchId) => {
        socket.join(matchId);
        console.log(`Socket ${socket.id} joined room: ${matchId}`);
    });

    // Join chat room for live chat during matches
    socket.on('joinChatRoom', (matchId) => {
        socket.join(`chat_${matchId}`);
        console.log(`Socket ${socket.id} joined chat room: chat_${matchId}`);
    });

    // Challenge invitations
    socket.on('challengeInvite', (challenge) => {
        io.to(challenge.opponent).emit('challengeReceived', challenge);
    });

    socket.on('challengeResponse', ({ challengeId, response }) => {
        // Here you would update the challenge in the database
        // Assuming you have a function to update challenge status
        updateChallengeStatusInDB(challengeId, response).then(updatedChallenge => {
            io.to(updatedChallenge.challenger).emit('challengeStatusUpdated', updatedChallenge);
            io.to(updatedChallenge.opponent).emit('challengeStatusUpdated', updatedChallenge);
        });
    });

    // Tournament updates
    socket.on('tournamentUpdate', (tournament) => {
        tournament.players.forEach(playerId => {
            io.to(playerId).emit('tournamentUpdate', tournament);
        });
    });

    // Financial transaction notifications
    socket.on('financialTransaction', ({ userId, message }) => {
        io.to(userId).emit('transactionNotification', message);
    });

    // Chat messages
    socket.on('chatMessage', (data) => {
        const { matchId, message, userId } = data;
        io.to(`chat_${matchId}`).emit('chatMessage', { message, userId });
    });

    // Disconnection
    socket.on('disconnect', () => {
        connectedClients = connectedClients.filter(id => id !== socket.id);
        console.log('Client disconnected');
    });
});

// Function to broadcast match updates
function broadcastMatchUpdate(matchId, update) {
    io.to(matchId).emit('matchUpdate', update);
}

// Function to send messages to chat rooms
function sendChatMessage(matchId, message, userId) {
    io.to(`chat_${matchId}`).emit('chatMessage', { message, userId });
}

// This function could be called from other parts of your application
async function updateMatchStatus(matchId, status, score) {
    try {
        const match = await Match.findByIdAndUpdate(matchId, {
            status: status,
            score: score
        }, { new: true });
        if (match) {
            broadcastMatchUpdate(matchId, { status: match.status, score: match.score });
        }
    } catch (error) {
        console.error('Error updating match status:', error);
    }
}

// Routes
app.use('/api/users', require('./users'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/challenges', require('./challenges'));
app.use('/api/tournaments', require('./tournaments'));
app.use('/api/bets', require('./bets'));
app.use('/api/predictions', require('./predictions'));
app.use('/api/admin', require('./admin'));
app.use('/api/achievements', require('./achievements')); // Add this route for achievements

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});