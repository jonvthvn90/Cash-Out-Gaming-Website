import React, { useState } from 'react';
import PropTypes from 'prop-types';

const NewPostForm = ({ onSubmit }) => {
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('text'); // default to text
    const [mediaUrl, setMediaUrl] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validate form
        if (content.trim() === '' && mediaType === 'text') {
            setError('Post content cannot be empty');
            return;
        } else if (mediaType !== 'text' && !mediaUrl.trim()) {
            setError(`Please provide a ${mediaType} URL`);
            return;
        }

        onSubmit({ content, mediaType, mediaUrl });
        
        // Clear form after submission
        setContent('');
        setMediaType('text');
        setMediaUrl('');
    };

    return (
        <form onSubmit={handleSubmit} className="new-post-form">
            <h3>Create a New Post</h3>
            {error && <p className="error-message">{error}</p>}
            <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Write something..."
                required={mediaType === 'text'}
                className="post-content"
                rows="4"
            />
            <div className="media-options">
                <select 
                    value={mediaType} 
                    onChange={(e) => setMediaType(e.target.value)} 
                    className="media-type-select"
                >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="gif">GIF</option>
                    <option value="audio">Audio</option>
                </select>
                {mediaType !== 'text' && (
                    <input 
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder={`URL for ${mediaType}`}
                        required={mediaType !== 'text'}
                        className="media-url"
                    />
                )}
            </div>
            <button type="submit" className="post-button">Post</button>
        </form>
    );
};

NewPostForm.propTypes = {
    onSubmit: PropTypes.func.isRequired
};

export default NewPostForm;