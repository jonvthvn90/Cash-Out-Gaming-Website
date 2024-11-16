import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const BlogPost = () => {
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { postId } = useParams();

    useEffect(() => {
        fetchBlogPost();
    }, [postId]);

    const fetchBlogPost = async () => {
        try {
            const response = await axios.get(`/api/blog/${postId}`);
            setPost(response.data.blogPost);
        } catch (error) {
            setError('Failed to fetch blog post');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading blog post...</div>;
    if (error) return <div>{error}</div>;
    if (!post) return <div>Post not found</div>;

    return (
        <div className="blog-post">
            <h1>{post.title}</h1>
            <p>By: {post.author.username} - {new Date(post.createdAt).toLocaleDateString()}</p>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
    );
};

export default BlogPost;