import React, { useState } from 'react';
import axios from 'axios';
import { useUser, updateUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function ProfileAvatar() {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null); // Clear any previous errors when selecting a new file
    };

    const uploadAvatar = async () => {
        if (!file) {
            setError('Please select an image file.');
            return;
        }

        setLoading(true);
        setError(null); // Clear any previous errors

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.post('/api/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            updateUser({ ...user, avatar: response.data.avatarUrl }); // Assuming the server responds with 'avatarUrl'
            alert('Avatar uploaded successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred uploading the avatar.');
            console.error('Avatar upload error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-avatar">
            <h2>Profile Avatar</h2>
            <img 
                src={user.avatar || '/default-avatar.png'} // Use a default avatar if none is set
                alt="User Avatar" 
                className="user-avatar"
                style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '50%' }} 
            />
            <input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*" 
                className="file-input"
            />
            {error && <p className="error-message">{error}</p>}
            <button 
                onClick={uploadAvatar} 
                disabled={loading || !file}
                className="upload-button"
            >
                {loading ? 'Uploading...' : 'Upload Avatar'}
            </button>
        </div>
    );
}

ProfileAvatar.propTypes = {
    user: PropTypes.shape({
        avatar: PropTypes.string
    }),
    updateUser: PropTypes.func.isRequired
};

export default ProfileAvatar;