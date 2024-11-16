import React from 'react';
import './ActivityFeed.css';

const Post = ({ post }) => {
    const renderMedia = () => {
        let mediaElement;
        switch (post.mediaType) {
            case 'image':
                mediaElement = <img src={post.mediaUrl} alt={post.content} className="post-media" />;
                break;
            case 'video':
                mediaElement = (
                    <video controls className="post-media">
                        <source src={post.mediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                );
                break;
            case 'gif':
                mediaElement = <img src={post.mediaUrl} alt={post.content} className="post-media" />;
                break;
            case 'audio':
                mediaElement = (
                    <audio controls className="post-media">
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

export default Post;