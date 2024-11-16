const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Add this for Cross-Origin Resource Sharing
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('joinTournament', (tournamentId) => {
        socket.join(tournamentId);
    });

    socket.on('updateScore', (data) => {
        io.to(data.tournamentId).emit('scoreUpdate', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Routes
app.use('/api/auth', require('./routes/auth'));

// Update your server to listen on the HTTP server instead
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use('/api/tournaments', require('./routes/tournaments'));

app.post('/api/tournaments/:tournamentId/payout', async (req, res) => {
    const tournamentId = req.params.tournamentId;

    try {
        const tournament = await Tournament.findById(tournamentId);
        if (tournament.payoutStatus !== 'not_paid') {
            return res.status(400).send({ message: 'Payouts already processed or in progress' });
        }

        // Calculate payouts
        let payouts = calculatePayouts(tournament);

        // Process payouts
        for (let payout of payouts) {
            const transfer = await stripe.transfers.create({
                amount: payout.amount * 100, // Stripe expects amount in cents
                currency: 'usd',
                destination: payout.userId, // This would typically be the Stripe connected account ID for the user
            });
            console.log(`Payout processed for user ${payout.userId}, amount: $${payout.amount}, transfer ID: ${transfer.id}`);
        }

        // Update tournament payout status
        tournament.payoutStatus = 'completed';
        await tournament.save();

        res.status(200).send({ message: 'Payouts processed successfully' });
    } catch (error) {
        console.error('Error processing payouts:', error);
        res.status(500).send({ message: 'Error processing payouts', error });
    }
});

function calculatePayouts(tournament) {
    // This function would define how the prize pool is distributed
    // For simplicity, let's say the winner gets 50%, runner-up gets 30%, and the rest goes to participants
    let payouts = [];
    let prizePool = tournament.prizePool;

    // Assuming winnerId is set after the tournament's final match
    const winner = tournament.matches[tournament.matches.length - 1].winner;
    payouts.push({ userId: winner, amount: prizePool * 0.5 });

    // For simplicity, assuming runner-up is the other player in the final match
    const runnerUp = tournament.matches[tournament.matches.length - 1].player1 === winner ? tournament.matches[tournament.matches.length - 1].player2 : tournament.matches[tournament.matches.length - 1].player1;
    payouts.push({ userId: runnerUp, amount: prizePool * 0.3 });

    // Remaining 20% distributed among other participants or kept for platform fees, etc.
    return payouts;
}

app.use('/api/challenges', require('./routes/challenges'));

router.post('/:rematchId/:action', async (req, res) => {
    const rematchId = req.params.rematchId;
    const action = req.params.action; // 'accept' or 'reject'

    if (action !== 'accept' && action !== 'reject') {
        return res.status(400).send({ message: 'Invalid action. Use "accept" or "reject".' });
    }

    try {
        const rematch = await Challenge.findById(rematchId);
        if (!rematch || !rematch.isRematch) {
            return res.status(404).send({ message: 'Rematch challenge not found' });
        }

        if (rematch.status !== 'pending') {
            return res.status(400).send({ message: 'Rematch is not in a pending state to be accepted or rejected' });
        }

        rematch.status = action === 'accept' ? 'accepted' : 'rejected';
        await rematch.save();

        // Emit an event to notify both the challenger and the opponent about the response
        const io = req.app.get('socketio');
        io.to(rematch.challenger.toString()).emit('rematchResponse', { rematchId, status: rematch.status });
        io.to(rematch.opponent.toString()).emit('rematchResponse', { rematchId, status: rematch.status });

        res.status(200).json({ message: `Rematch ${action}ed successfully.`, rematch: rematch });
    } catch (error) {
        console.error('Error handling rematch request:', error);
        res.status(500).send({ message: 'Error processing rematch request', error: error.message });
    }
});

module.exports = router;

// Database Connection
mongoose.connect('mongodb://localhost:27017/yourDbName', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(bodyParser.json());

// Make io accessible to our routes
app.set('socketio', io);

// Routes
const challengeRoutes = require('./routes/challenges');
const rematchRoutes = require('./routes/rematch');

app.use('/api/challenges', challengeRoutes);
app.use('/api/rematch', rematchRoutes);

// WebSocket connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// In your middleware or wherever you handle authentication
const isInvolvedInChallenge = (req, res, next) => {
    Challenge.findById(req.params.challengeId)
        .then(challenge => {
            if (!challenge) {
                return res.status(404).send({ message: 'Challenge not found' });
            }
            if (!challenge.challenger.equals(req.user._id) && !challenge.opponent.equals(req.user._id)) {
                return res.status(403).send({ message: 'You are not involved in this challenge' });
            }
            next();
        })
        .catch(next);
};

// Use this middleware in your routes
router.post('/:challengeId/request', isAuthenticated, isInvolvedInChallenge, (req, res) => {
    // Your rematch request logic
});

router.post('/:rematchId/:action', isAuthenticated, isInvolvedInChallenge, (req, res) => {
    // Your rematch response logic
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('subscribe', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('unsubscribe', (room) => {
        socket.leave(room);
        console.log(`User left room: ${room}`);
    });

    socket.on('rematchStatusUpdate', (data) => {
        io.to(data.rematchId).emit('rematchStatusUpdate', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


