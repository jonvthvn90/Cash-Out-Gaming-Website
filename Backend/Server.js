const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/rematch', require('./routes/rematch'));

// WebSocket connection
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

// Stripe payment processing for tournament payouts
app.post('/api/tournaments/:tournamentId/payout', async (req, res) => {
    const tournamentId = req.params.tournamentId;

    try {
        const Tournament = require('./models/tournament'); // Assuming you have a Tournament model
        const tournament = await Tournament.findById(tournamentId);
        if (tournament.payoutStatus !== 'not_paid') {
            return res.status(400).send({ message: 'Payouts already processed or in progress' });
        }

        let payouts = calculatePayouts(tournament);

        for (let payout of payouts) {
            const transfer = await stripe.transfers.create({
                amount: payout.amount * 100, 
                currency: 'usd',
                destination: payout.userId, 
            });
            console.log(`Payout processed for user ${payout.userId}, amount: $${payout.amount}, transfer ID: ${transfer.id}`);
        }

        tournament.payoutStatus = 'completed';
        await tournament.save();

        res.status(200).send({ message: 'Payouts processed successfully' });
    } catch (error) {
        console.error('Error processing payouts:', error);
        res.status(500).send({ message: 'Error processing payouts', error });
    }
});

function calculatePayouts(tournament) {
    let payouts = [];
    let prizePool = tournament.prizePool;

    const winner = tournament.matches[tournament.matches.length - 1].winner;
    payouts.push({ userId: winner, amount: prizePool * 0.5 });

    const runnerUp = tournament.matches[tournament.matches.length - 1].player1 === winner ? tournament.matches[tournament.matches.length - 1].player2 : tournament.matches[tournament.matches.length - 1].player1;
    payouts.push({ userId: runnerUp, amount: prizePool * 0.3 });

    return payouts;
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});