import { supabase, dbHelpers } from './supabaseClient';
import toast from 'react-hot-toast';

class ReviewService {
  // Add a new review
  async addReview(userId, productId, reviewData) {
    try {
      // Check if user has already reviewed this product
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existingReview) {
        toast.error('You have already reviewed this product');
        return { success: false, error: 'Already reviewed' };
      }

      const { data, error } = await dbHelpers.addReview(userId, productId, reviewData);
      
      if (error) {
        console.error('Error adding review:', error);
        toast.error('Failed to add review');
        return { success: false, error };
      }

      toast.success('Review added successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Failed to add review');
      return { success: false, error };
    }
  }

  // Update an existing review
  async updateReview(reviewId, reviewData) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        console.error('Error updating review:', error);
        toast.error('Failed to update review');
        return { success: false, error };
      }

      toast.success('Review updated successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
      return { success: false, error };
    }
  }

  // Delete a review
  async deleteReview(reviewId) {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review');
        return { success: false, error };
      }

      toast.success('Review deleted successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
      return { success: false, error };
    }
  }

  // Get reviews for a product
  async getProductReviews(productId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_profiles(first_name, last_name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching reviews:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { success: false, error };
    }
  }

  // Get user's review for a product
  async getUserReview(userId, productId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching user review:', error);
        return { success: false, error };
      }

      return { success: true, data: data || null };
    } catch (error) {
      console.error('Error fetching user review:', error);
      return { success: false, error };
    }
  }

  // Get review statistics for a product
  async getReviewStats(productId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) {
        console.error('Error fetching review stats:', error);
        return { success: false, error };
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          data: {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          }
        };
      }

      const totalReviews = data.length;
      const averageRating = data.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      const ratingDistribution = data.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

      return {
        success: true,
        data: {
          averageRating,
          totalReviews,
          ratingDistribution
        }
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return { success: false, error };
    }
  }

  // Mark review as helpful
  async markReviewHelpful(reviewId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ is_helpful_count: supabase.raw('is_helpful_count + 1') })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        console.error('Error marking review helpful:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error marking review helpful:', error);
      return { success: false, error };
    }
  }

  // Report a review
  async reportReview(reviewId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ is_reported: true })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        console.error('Error reporting review:', error);
        toast.error('Failed to report review');
        return { success: false, error };
      }

      toast.success('Review reported successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error reporting review:', error);
      toast.error('Failed to report review');
      return { success: false, error };
    }
  }

  // Check if user can review a product (has purchased it)
  async canUserReview(userId, productId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_items!inner(product_id)
        `)
        .eq('user_id', userId)
        .eq('status', 'delivered')
        .eq('order_items.product_id', productId);

      if (error) {
        console.error('Error checking review eligibility:', error);
        return { success: false, error };
      }

      return { success: true, canReview: data && data.length > 0 };
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return { success: false, error };
    }
  }
}

export const reviewService = new ReviewService(); 