import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function UserReviews({ userId }) {
    const [reviews, setReviews] = useState({
        averageRating: 0,
        reviews: [],
        totalRatings: 0
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const { user } = useUser();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUserReviews();
    }, [userId]);

    const fetchUserReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/reviews/${userId}`);
            setReviews(response.data);
        } catch (error) {
            setError('Failed to fetch reviews');
            console.error('Reviews fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async () => {
        if (!reviewRating || !reviewComment.trim()) {
            setError('Please provide a rating and a comment');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await axios.post('/api/reviews', { 
                revieweeId: userId, 
                rating: reviewRating, 
                comment: reviewComment.trim()
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.status === 201) {
                setReviewRating(5);
                setReviewComment('');
                fetchUserReviews(); // Refresh reviews after submission
                alert('Review submitted successfully!');
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred submitting the review');
            console.error('Review submission error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading reviews...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="user-reviews">
            <h3>Reviews</h3>
            <p>Average Rating: {reviews.averageRating.toFixed(2)} (Total: {reviews.totalRatings})</p>

            {user && user._id !== userId && (
                <div className="review-form">
                    <select 
                        value={reviewRating} 
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="rating-select"
                    >
                        {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} stars</option>
                        ))}
                    </select>
                    <textarea 
                        value={reviewComment} 
                        onChange={(e) => setReviewComment(e.target.value)} 
                        placeholder="Write your review here..."
                        className="comment-textarea"
                        required
                    />
                    <button 
                        onClick={submitReview} 
                        className="submit-review"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            )}

            <ul className="reviews-list">
                {reviews.reviews.map(review => (
                    <li key={review._id} className="review-item">
                        <strong>{review.reviewer.username}: </strong>
                        <span className="review-rating">{review.rating}/5 - </span>
                        {review.comment}
                    </li>
                ))}
            </ul>
        </div>
    );
}

UserReviews.propTypes = {
    userId: PropTypes.string.isRequired
};

export default UserReviews;