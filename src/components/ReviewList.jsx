import React from 'react';
import { Star, ThumbsUp, Flag, Edit, Trash2 } from 'lucide-react';

const ReviewList = ({ 
  reviews = [], 
  onMarkHelpful, 
  onReport, 
  onEdit, 
  onDelete,
  showUserActions = false,
  currentUserId = null 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating, size = 'h-4 w-4') => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="bg-white rounded-lg p-6 border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {review.user?.first_name?.[0] || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {review.user?.first_name && review.user?.last_name
                    ? `${review.user.first_name} ${review.user.last_name}`
                    : 'Anonymous User'
                  }
                </p>
                <div className="flex items-center space-x-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">
                    {formatDate(review.created_at)}
                  </span>
                  {review.is_verified_purchase && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => onMarkHelpful(review.id)}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                title="Mark as helpful"
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">{review.is_helpful_count || 0}</span>
              </button>
              
              {showUserActions && currentUserId === review.user_id && (
                <>
                  <button
                    onClick={() => onEdit(review)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Edit review"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(review.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              
              {currentUserId !== review.user_id && (
                <button
                  onClick={() => onReport(review.id)}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  title="Report review"
                >
                  <Flag className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {review.title && (
            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
          )}
          <p className="text-gray-600">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList; 