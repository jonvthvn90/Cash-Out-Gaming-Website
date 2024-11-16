import React, { useState } from 'react';

const NewPostForm = ({ onSubmit }) => {
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('text'); // default to text
    const [mediaUrl, setMediaUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate form here if needed
        if (content.trim() === '' && mediaType === 'text') {
            alert('Post content cannot be empty');
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
            <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Write something..."
                required={mediaType === 'text'}
                className="post-content"
            />
            <div>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="media-type-select">
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="gif">GIF</option>
                    <option value="audio">Audio</option>
                </select>
                {mediaType !== 'text' && (
                    <input 
                        type="text"
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

export default NewPostForm;