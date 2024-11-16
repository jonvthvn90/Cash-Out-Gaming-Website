import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(response.data);
        } catch (error) {
            setError('Failed to fetch notifications');
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
        }
    };

    if (loading) return <div>Loading notifications...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="notifications">
            <h2>Notifications</h2>
            <button onClick={async () => {
                try {
                    await axios.put('/api/notifications/read', {}, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    setNotifications(notifications.map(n => ({ ...n, read: true })));
                } catch (error) {
                    setError('Failed to mark all notifications as read');
                }
            }}>Mark All as Read</button>

            <ul>
                {notifications.map(notification => (
                    <li 
                        key={notification._id} 
                        className={notification.read ? 'read' : 'unread'}
                        onClick={() => markAsRead(notification._id)}
                    >
                        {notification.content}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;