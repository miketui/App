import { aiAPI } from './api';
import { MODERATION_STATUSES } from '../utils/constants';

class AIService {
  // Content Generation
  async generateCaption(content, mediaType = 'text') {
    try {
      const response = await aiAPI.generateCaption(content, mediaType);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error generating caption:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate caption'
      };
    }
  }

  async generatePostSuggestion(topic, tone = 'casual') {
    try {
      const response = await aiAPI.generateCaption(`Generate a ${tone} post about ${topic}`, 'text');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error generating post suggestion:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate post suggestion'
      };
    }
  }

  async generateHashtags(content) {
    try {
      const response = await aiAPI.generateCaption(`Generate relevant hashtags for: ${content}`, 'text');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error generating hashtags:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate hashtags'
      };
    }
  }

  // Content Moderation
  async moderateContent(content, contentType = 'post') {
    try {
      const response = await aiAPI.moderateContent(content, contentType);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error moderating content:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to moderate content'
      };
    }
  }

  async analyzeSentiment(content) {
    try {
      const response = await aiAPI.moderateContent(content, 'sentiment');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to analyze sentiment'
      };
    }
  }

  // Content Enhancement
  async enhancePost(content, enhancementType = 'grammar') {
    try {
      const prompt = `Enhance this ${enhancementType} of the following content: ${content}`;
      const response = await aiAPI.generateCaption(prompt, 'text');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error enhancing post:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to enhance post'
      };
    }
  }

  async translateContent(content, targetLanguage = 'Spanish') {
    try {
      const prompt = `Translate the following content to ${targetLanguage}: ${content}`;
      const response = await aiAPI.generateCaption(prompt, 'text');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error translating content:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to translate content'
      };
    }
  }

  // Community Insights
  async generateCommunityInsights(posts, timeRange = 'week') {
    try {
      const prompt = `Analyze these community posts from the last ${timeRange} and provide insights about trending topics, sentiment, and engagement patterns: ${JSON.stringify(posts)}`;
      const response = await aiAPI.generateCaption(prompt, 'text');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error generating community insights:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate community insights'
      };
    }
  }

  async suggestTopics(communityData) {
    try {
      const prompt = `Based on this community data, suggest trending topics for posts: ${JSON.stringify(communityData)}`;
      const response = await aiAPI.generateCaption(prompt, 'text');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error suggesting topics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to suggest topics'
      };
    }
  }

  // Ballroom-Specific Features
  async generateBallroomContext(content) {
    try {
      const prompt = `Provide ballroom culture context and background for: ${content}`;
      const response = await aiAPI.generateCaption(prompt, 'text');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error generating ballroom context:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate ballroom context'
      };
    }
  }

  async suggestBallroomCategories(content) {
    try {
      const prompt = `Suggest relevant ballroom categories for this content: ${content}`;
      const response = await aiAPI.generateCaption(prompt, 'text');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error suggesting ballroom categories:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to suggest ballroom categories'
      };
    }
  }

  // Moderation Helpers
  getModerationStatus(analysis) {
    if (!analysis) return MODERATION_STATUSES.PENDING;

    const { toxicity, hate_speech, violence, sexual_content } = analysis;
    
    // High risk content
    if (toxicity > 0.8 || hate_speech > 0.7 || violence > 0.7 || sexual_content > 0.8) {
      return MODERATION_STATUSES.REJECTED;
    }
    
    // Medium risk content
    if (toxicity > 0.6 || hate_speech > 0.5 || violence > 0.5 || sexual_content > 0.6) {
      return MODERATION_STATUSES.FLAGGED;
    }
    
    // Low risk content
    if (toxicity > 0.3 || hate_speech > 0.2 || violence > 0.2 || sexual_content > 0.3) {
      return MODERATION_STATUSES.PENDING;
    }
    
    return MODERATION_STATUSES.APPROVED;
  }

  getModerationReason(analysis) {
    const reasons = [];
    
    if (analysis.toxicity > 0.6) reasons.push('High toxicity detected');
    if (analysis.hate_speech > 0.5) reasons.push('Hate speech detected');
    if (analysis.violence > 0.5) reasons.push('Violent content detected');
    if (analysis.sexual_content > 0.6) reasons.push('Inappropriate sexual content');
    
    return reasons.join(', ');
  }

  // Utility Methods
  async batchProcessContent(contentArray, processType = 'moderate') {
    const results = [];
    
    for (const content of contentArray) {
      try {
        let result;
        switch (processType) {
          case 'moderate':
            result = await this.moderateContent(content);
            break;
          case 'caption':
            result = await this.generateCaption(content);
            break;
          case 'hashtags':
            result = await this.generateHashtags(content);
            break;
          default:
            result = { success: false, error: 'Unknown process type' };
        }
        results.push({ content, ...result });
      } catch (error) {
        results.push({ content, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Rate Limiting
  async withRateLimit(operation, delay = 1000) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await operation();
        resolve(result);
      }, delay);
    });
  }
}

export default new AIService();