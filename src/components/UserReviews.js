import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function UserReviews({ userId }) {
    const[reviews, setReviews] = useState([]);
    const[error, setError] = useState(null);
    const[loading, setLoading] = useState(true);
    const[reviewRating, setReviewRating] = useState(5);
    const[reviewComment, setReviewComment] = useState('');
    const { user } = useUser();

    useEffect(() => {
        fetchUserReviews();
    }, [userId]);

    const fetchUserReviews = async () => {
        try {
            const response = await axios.get(`/api/reviews/${userId}`);
            setReviews(response.data);
        } catch (error) {
            setError('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async () => {
        if (!reviewRating || !reviewComment) {
            setError('Please provide a rating and a comment');
            return;
        }

        try {
            await axios.post('/api/reviews', { 
                revieweeId: userId, 
                rating: reviewRating, 
                comment: reviewComment 
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setReviewRating(5);
            setReviewComment('');
            fetchUserReviews(); // Refresh reviews after submission
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred submitting the review');
        }
    };

    if (loading) return <div>Loading reviews...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="user-reviews">
            <h3>Reviews</h3>
            <p>Average Rating: {reviews.averageRating.toFixed(2)} (Total: {reviews.totalRatings})</p>
            
            {user._id !== userId && (
                <div>
                    <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                        {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} stars</option>)}
                    </select>
                    <textarea 
                        value={reviewComment} 
                        onChange={(e) => setReviewComment(e.target.value)} 
                        placeholder="Write your review here..."
                    />
                    <button onClick={submitReview}>Submit Review</button>
                </div>
            )}

            <ul>
                {reviews.reviews.map(review => (
                    <li key={review._id}>
                        <strong>{review.reviewer.username}: </strong>
                        {review.rating}/5 - {review.comment}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserReviews;