import React, { useState } from 'react';
import axios from 'axios';
import { useUser, updateUser } from '../context/UserContext';

function ProfileAvatar() {
    const[file, setFile] = useState(null);
    const[error, setError] = useState(null);
    const { user } = useUser();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const uploadAvatar = async () => {
        if (!file) {
            setError('Please select an image file.');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.post('/api/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            updateUser({ ...user, avatar: response.data.avatar }); // Update user avatar in context
            alert('Avatar uploaded successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred uploading the avatar.');
        }
    };

    return (
        <div>
            <h2>Profile Avatar</h2>
            <img src={user.avatar} alt="Profile Avatar" style={{ maxWidth: '200px' }} />
            <input type="file" onChange={handleFileChange} accept="image/*" />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={uploadAvatar}>Upload Avatar</button>
        </div>
    );
}

export default ProfileAvatar;