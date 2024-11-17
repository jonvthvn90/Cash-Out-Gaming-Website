import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function Header() {
    const { isAuthenticated, user, logout } = useUser();

    const handleLogout = () => {
        logout();
        // Optionally redirect or perform other actions after logout
        // Example: window.location.href = '/';
    };

    return (
        <header className="main-header">
            <nav className="main-nav">
                <ul className="nav-list">
                    <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>
                    {isAuthenticated ? (
                        <>
                            <li className="nav-item"><Link to="/match-history" className="nav-link">Match History</Link></li>
                            <li className="nav-item"><Link to="/ongoing-challenges" className="nav-link">Challenges</Link></li>
                            <li className="nav-item"><Link to="/new-challenge" className="nav-link">New Challenge</Link></li>
                            <li className="nav-item"><Link to="/profile" className="nav-link">Profile</Link></li>
                            <li className="nav-item"><button onClick={handleLogout} className="nav-btn">Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item"><Link to="/login" className="nav-link">Login</Link></li>
                            <li className="nav-item"><Link to="/signup" className="nav-link">Signup</Link></li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

Header.propTypes = {
    isAuthenticated: PropTypes.bool,
    user: PropTypes.shape({
        username: PropTypes.string.isRequired
    }),
    logout: PropTypes.func.isRequired
};

export default Header;