import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(response.data.notifications);
        } catch (error) {
            setError('Failed to fetch notifications');
            console.error('Notification fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`/api/notifications/${notificationId}/read`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(notifications.map(n => 
                n._id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            setError('Failed to mark notification as read');
            console.error('Notification mark as read error:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/api/notifications/read', {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            setError('Failed to mark all notifications as read');
            console.error('Mark all notifications as read error:', error);
        }
    };

    if (!user) {
        return <div>Please log in to view notifications.</div>;
    }

    if (loading) return <div className="loading">Loading notifications...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="notifications">
            <h2>Notifications</h2>
            <button onClick={markAllAsRead} className="mark-all-read">Mark All as Read</button>

            <ul className="notification-list">
                {notifications.length === 0 ? (
                    <li>No notifications yet.</li>
                ) : (
                    notifications.map(notification => (
                        <li 
                            key={notification._id} 
                            className={notification.read ? 'read' : 'unread'}
                            onClick={() => markAsRead(notification._id)}
                        >
                            {notification.content}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

Notifications.propTypes = {
    user: PropTypes.shape({
        // Add relevant user properties here if needed
    })
};

export default Notifications;