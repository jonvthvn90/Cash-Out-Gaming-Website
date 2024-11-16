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
            const response = await axios.get('/api/blog');
            setPosts(response.data.blogPosts);
        } catch (error) {
            setError('Failed to fetch blog posts');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading blog...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="blog-list">
            <h2>Blog</h2>
            {posts.map(post => (
                <div key={post._id} className="blog-post-preview">
                    <h3>{post.title}</h3>
                    <p>By: {post.author.username}</p>
                    <Link to={`/blog/${post._id}`}>Read More</Link>
                </div>
            ))}
        </div>
    );
};

export default BlogList;