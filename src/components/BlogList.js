import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
        try {
            const response = await axios.get('/api/blog', {
                // You might need to add headers here if authentication is required
            });
            setPosts(response.data.blogPosts);
        } catch (error) {
            setError('Failed to fetch blog posts');
            console.error('Error fetching blog posts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading blog...</div>;
    if (error) return <div>Error: {error}</div>;
    if (posts.length === 0) return <div>No blog posts found.</div>;

    return (
        <div className="blog-list">
            <h2>Blog</h2>
            {posts.map(post => (
                <div key={post._id} className="blog-post-preview">
                    <h3>{post.title}</h3>
                    <p>By: {post.author.username || "Unknown Author"}</p>
                    <p>Published on: {new Date(post.createdAt).toLocaleDateString()}</p>
                    <p>{post.content.slice(0, 100)}{post.content.length > 100 ? '...' : ''}</p>
                    <Link to={`/blog/${post._id}`} className="read-more-link">
                        Read More &rarr;
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default BlogList;