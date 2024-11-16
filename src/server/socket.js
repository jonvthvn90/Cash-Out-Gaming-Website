const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    // Emit invitation
    socket.on('challengeInvite', (challenge) => {
        io.to(challenge.opponent).emit('challengeReceived', challenge);
    });

    // Handle challenge response
    socket.on('challengeResponse', ({ challengeId, response }) => {
        // Here you would update the challenge in the database
        // Assuming you have a function to update challenge status
        updateChallengeStatusInDB(challengeId, response).then(updatedChallenge => {
            // Emit to both challenger and opponent
            io.to(updatedChallenge.challenger).emit('challengeStatusUpdated', updatedChallenge);
            io.to(updatedChallenge.opponent).emit('challengeStatusUpdated', updatedChallenge);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Dummy function to represent database update
async function updateChallengeStatusInDB(challengeId, status) {
    // Your database logic here
    return { _id: challengeId, status: status };
}

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
    });

    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        console.log(`User joined game room: ${gameId}`);
    });

    socket.on('updateGameState', ({ gameId, gameState }) => {
        io.to(gameId).emit('gameStateUpdated', gameState);
    });

    // Handle challenge status updates as before ...

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    // Joining a tournament room
    socket.on('joinTournament', (tournamentId) => {
        socket.join(tournamentId);
        console.log(`User joined tournament room: ${tournamentId}`);
    });

    // Sending messages within a tournament
    socket.on('sendMessage', ({ tournamentId, message }) => {
        io.to(tournamentId).emit('receiveMessage', message);
    });

    // For disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    // User joins their notification room
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their notification room`);
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

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Dummy function to represent database update
async function updateChallengeStatusInDB(challengeId, status) {
    // Your database logic here
    return { _id: challengeId, status: status };
}

module.exports = io;