import React from 'react';
import './ActivityFeed.css';
import PropTypes from 'prop-types';

const Post = ({ post }) => {
    const renderMedia = () => {
        let mediaElement;
        switch (post.mediaType) {
            case 'image':
                mediaElement = (
                    <img 
                        src={post.mediaUrl} 
                        alt={post.content || "Post image"} 
                        className="post-media" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                );
                break;
            case 'video':
                mediaElement = (
                    <video 
                        controls 
                        className="post-media" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    >
                        <source src={post.mediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                );
                break;
            case 'gif':
                mediaElement = (
                    <img 
                        src={post.mediaUrl} 
                        alt={post.content || "Post GIF"} 
                        className="post-media" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                );
                break;
            case 'audio':
                mediaElement = (
                    <audio 
                        controls 
                        className="post-media" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    >
                        <source src={post.mediaUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                );
                break;
            default:
                mediaElement = null;
        }
        return mediaElement;
    };

    return (
        <div className="post">
            <div className="post-header">
                <span className="post-author">{post.user.username}</span>
                <span className="post-date">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <p className="post-content">{post.content}</p>
            {renderMedia()}
        </div>
    );
};

Post.propTypes = {
    post: PropTypes.shape({
        content: PropTypes.string.isRequired,
        mediaType: PropTypes.oneOf(['text', 'image', 'video', 'gif', 'audio']),
        mediaUrl: PropTypes.string,
        user: PropTypes.shape({
            username: PropTypes.string.isRequired
        }).isRequired,
        createdAt: PropTypes.string.isRequired
    }).isRequired
};

export default Post;