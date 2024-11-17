const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Store connected user IDs
let connectedUsers = new Set();

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    // User joins their room
    socket.on('join', (userId) => {
        socket.join(userId);
        connectedUsers.add(userId);
        console.log(`User ${userId} joined their room`);
    });

    // User joins a game room
    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        console.log(`User joined game room: ${gameId}`);
    });

    // User joins a tournament room
    socket.on('joinTournament', (tournamentId) => {
        socket.join(tournamentId);
        console.log(`User joined tournament room: ${tournamentId}`);
    });

    // Game state update
    socket.on('updateGameState', ({ gameId, gameState }) => {
        io.to(gameId).emit('gameStateUpdated', gameState);
    });

    // Sending messages within a tournament
    socket.on('sendMessage', ({ tournamentId, message }) => {
        io.to(tournamentId).emit('receiveMessage', message);
    });

    // Emit challenge invitation
    socket.on('challengeInvite', (challenge) => {
        io.to(challenge.opponent).emit('challengeReceived', challenge);
    });

    // Handle challenge response
    socket.on('challengeResponse', ({ challengeId, response }) => {
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

    // Disconnection
    socket.on('disconnect', () => {
        for (let [userId, socketId] of io.sockets.adapter.rooms) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
        console.log('Client disconnected');
    });
});

// Dummy function to represent database update
async function updateChallengeStatusInDB(challengeId, status) {
    // Your database logic here
    return { _id: challengeId, status: status };
}

module.exports = io;