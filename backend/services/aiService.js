const axios = require('axios');

class AIService {
  constructor() {
    this.claudeApiKey = process.env.CLAUDE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.copyleaksApiKey = process.env.COPYLEAKS_API_KEY;
    this.copyleaksEmail = process.env.COPYLEAKS_EMAIL;
  }

  // Generate AI-powered post captions
  async generatePostCaption(content, mediaType = 'text', userProfile = null) {
    try {
      if (!this.claudeApiKey) {
        return { success: false, error: 'Claude API key not configured' };
      }

      const prompt = this.buildCaptionPrompt(content, mediaType, userProfile);
      
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }, {
        headers: {
          'Authorization': `Bearer ${this.claudeApiKey}`,
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        }
      });

      const caption = response.data.content[0].text.trim();
      
      return {
        success: true,
        caption,
        suggestions: this.extractHashtagSuggestions(caption)
      };
    } catch (error) {
      console.error('Caption generation error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: 'Failed to generate caption',
        fallback: this.generateFallbackCaption(content, mediaType)
      };
    }
  }

  // Content moderation using OpenAI
  async moderateContent(content, type = 'text') {
    try {
      if (!this.openaiApiKey) {
        return { success: false, error: 'OpenAI API key not configured' };
      }

      const response = await axios.post('https://api.openai.com/v1/moderations', {
        input: content
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const moderation = response.data.results[0];
      
      return {
        success: true,
        flagged: moderation.flagged,
        categories: moderation.categories,
        categoryScores: moderation.category_scores,
        action: this.determineModerationAction(moderation)
      };
    } catch (error) {
      console.error('Content moderation error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: 'Failed to moderate content',
        action: 'manual_review' // Default to manual review on error
      };
    }
  }

  // Plagiarism detection with Copyleaks
  async checkPlagiarism(content, documentId = null) {
    try {
      if (!this.copyleaksApiKey || !this.copyleaksEmail) {
        return { success: false, error: 'Copyleaks API credentials not configured' };
      }

      // First, get access token
      const authResponse = await axios.post('https://id.copyleaks.com/v3/account/login/api', {
        email: this.copyleaksEmail,
        key: this.copyleaksApiKey
      });

      const accessToken = authResponse.data.access_token;
      const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Submit scan
      const scanResponse = await axios.put(`https://api.copyleaks.com/v3/education/${scanId}/start`, {
        base64: Buffer.from(content).toString('base64'),
        filename: documentId ? `document_${documentId}.txt` : 'content.txt',
        properties: {
          webhooks: {
            status: `${process.env.CLIENT_URL}/api/webhooks/copyleaks/status/${scanId}`
          },
          includeHtml: false,
          charsPerPage: 500,
          generatePdf: false
        }
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        scanId,
        status: 'submitted',
        message: 'Plagiarism check initiated'
      };
    } catch (error) {
      console.error('Plagiarism check error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: 'Failed to initiate plagiarism check'
      };
    }
  }

  // AI-powered content summarization
  async summarizeContent(content, maxLength = 200) {
    try {
      if (!this.claudeApiKey) {
        return { success: false, error: 'Claude API key not configured' };
      }

      const prompt = `Please provide a concise summary of the following content in ${maxLength} characters or less. Focus on the key points and main message:\n\n${content}`;
      
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: Math.ceil(maxLength / 3),
        messages: [{
          role: 'user',
          content: prompt
        }]
      }, {
        headers: {
          'Authorization': `Bearer ${this.claudeApiKey}`,
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        }
      });

      const summary = response.data.content[0].text.trim();
      
      return {
        success: true,
        summary,
        originalLength: content.length,
        summaryLength: summary.length
      };
    } catch (error) {
      console.error('Content summarization error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: 'Failed to summarize content'
      };
    }
  }

  // Generate hashtag suggestions
  async generateHashtags(content, count = 5) {
    try {
      if (!this.claudeApiKey) {
        return { success: false, error: 'Claude API key not configured' };
      }

      const prompt = `Based on the following content, suggest ${count} relevant hashtags for a ballroom/voguing community social platform. Focus on ballroom culture, voguing, performance, community, and related themes. Return only the hashtags, one per line, including the # symbol:\n\n${content}`;
      
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }, {
        headers: {
          'Authorization': `Bearer ${this.claudeApiKey}`,
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        }
      });

      const hashtagText = response.data.content[0].text.trim();
      const hashtags = hashtagText.split('\n')
        .map(tag => tag.trim())
        .filter(tag => tag.startsWith('#'))
        .slice(0, count);
      
      return {
        success: true,
        hashtags
      };
    } catch (error) {
      console.error('Hashtag generation error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: 'Failed to generate hashtags',
        fallback: ['#ballroom', '#voguing', '#community', '#performance', '#hausofbasquiat']
      };
    }
  }

  // Sentiment analysis
  async analyzeSentiment(content) {
    try {
      if (!this.claudeApiKey) {
        return { success: false, error: 'Claude API key not configured' };
      }

      const prompt = `Analyze the sentiment of the following text and respond with a JSON object containing:
- sentiment: "positive", "negative", or "neutral"
- confidence: a number between 0 and 1
- emotions: array of detected emotions
- tone: description of the overall tone

Text to analyze: "${content}"

Respond only with valid JSON.`;
      
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }, {
        headers: {
          'Authorization': `Bearer ${this.claudeApiKey}`,
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        }
      });

      const analysisText = response.data.content[0].text.trim();
      const analysis = JSON.parse(analysisText);
      
      return {
        success: true,
        ...analysis
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: 'Failed to analyze sentiment'
      };
    }
  }

  // Helper methods
  buildCaptionPrompt(content, mediaType, userProfile) {
    const basePrompt = `Generate an engaging social media caption for a ballroom/voguing community platform. The content should be authentic, celebratory, and community-focused.`;
    
    let contextPrompt = '';
    if (userProfile) {
      contextPrompt += `\nUser context: ${userProfile.display_name}`;
      if (userProfile.house?.name) {
        contextPrompt += ` from ${userProfile.house.name}`;
      }
      if (userProfile.pronouns) {
        contextPrompt += ` (${userProfile.pronouns})`;
      }
    }

    let contentPrompt = '';
    if (mediaType === 'image') {
      contentPrompt = `\nThis post includes images. Original text: "${content}"`;
    } else {
      contentPrompt = `\nOriginal content: "${content}"`;
    }

    const stylePrompt = `\n\nStyle guidelines:
- Use ballroom/voguing terminology authentically
- Be celebratory and empowering
- Include relevant emojis
- Keep it under 280 characters
- Make it engaging and shareable
- Honor the culture and community`;

    return basePrompt + contextPrompt + contentPrompt + stylePrompt;
  }

  extractHashtagSuggestions(caption) {
    const hashtags = caption.match(/#\w+/g) || [];
    return hashtags.slice(0, 5);
  }

  generateFallbackCaption(content, mediaType) {
    const emojis = ['✨', '💫', '🔥', '👑', '💖', '🌟'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    if (mediaType === 'image') {
      return `Serving looks and living my truth ${randomEmoji} #ballroom #voguing #community`;
    }
    
    return `${content.substring(0, 200)}... ${randomEmoji} #ballroom #community`;
  }

  determineModerationAction(moderation) {
    if (!moderation.flagged) {
      return 'approve';
    }

    const highRiskCategories = ['hate', 'harassment/threatening', 'self-harm'];
    const hasHighRisk = highRiskCategories.some(category => 
      moderation.categories[category] && moderation.category_scores[category] > 0.7
    );

    if (hasHighRisk) {
      return 'reject';
    }

    const mediumRiskCategories = ['sexual', 'violence'];
    const hasMediumRisk = mediumRiskCategories.some(category => 
      moderation.categories[category] && moderation.category_scores[category] > 0.5
    );

    if (hasMediumRisk) {
      return 'flag_for_review';
    }

    return 'manual_review';
  }
}

module.exports = new AIService();