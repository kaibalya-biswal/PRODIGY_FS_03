import React from 'react';
import { Star } from 'lucide-react';

const ReviewStats = ({ stats }) => {
  const renderStars = (rating, size = 'h-5 w-5') => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-3xl font-bold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </span>
            <div className="flex items-center">
              {renderStars(stats.averageRating, 'h-5 w-5')}
            </div>
            <span className="text-gray-600">
              out of 5
            </span>
          </div>
          <p className="text-gray-600">
            Based on {stats.totalReviews} reviews
          </p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-600 w-8">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${stats.totalReviews > 0 
                      ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 
                      : 0}%`
                  }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12">
                {stats.ratingDistribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewStats; 