import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="home-page">
            <section className="welcome-banner">
                <h1>Welcome to Cash Out Gaming</h1>
                <p>Discover, play, and compete in various games.</p>
                <Link to="/login" className="cta-button">Start Playing</Link>
            </section>
            <section className="feature-section">
                <h2>Why Choose Us?</h2>
                <ul className="feature-list">
                    <li>Compete in Real-Time Challenges</li>
                    <li>Win Real Money</li>
                    <li>Engage with a Community of Gamers</li>
                    <li>Explore a Variety of Games</li>
                </ul>
            </section>
        </div>
    );
}

export default Home;