import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import aiService from '../services/aiService';
import { MODERATION_STATUSES } from '../utils/constants';
import toast from 'react-hot-toast';

function ContentModerator({ content, contentType = 'post', onModerationComplete, showDetails = false }) {
  const [moderationResult, setModerationResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(showDetails);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (content && content.trim()) {
      analyzeContent();
    }
  }, [content]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    try {
      // Analyze content for moderation
      const moderationResponse = await aiService.moderateContent(content, contentType);
      
      if (moderationResponse.success) {
        const analysis = moderationResponse.data;
        const status = aiService.getModerationStatus(analysis);
        const reason = aiService.getModerationReason(analysis);
        
        const result = {
          status,
          reason,
          analysis,
          timestamp: new Date().toISOString()
        };
        
        setModerationResult(result);
        
        // Generate suggestions if content is flagged
        if (status === MODERATION_STATUSES.FLAGGED || status === MODERATION_STATUSES.REJECTED) {
          generateSuggestions();
        }
        
        if (onModerationComplete) {
          onModerationComplete(result);
        }
      } else {
        toast.error('Failed to analyze content');
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Error analyzing content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSuggestions = async () => {
    try {
      const suggestionResponse = await aiService.enhancePost(content, 'tone');
      if (suggestionResponse.success) {
        setSuggestions([suggestionResponse.data]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case MODERATION_STATUSES.APPROVED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case MODERATION_STATUSES.PENDING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case MODERATION_STATUSES.FLAGGED:
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case MODERATION_STATUSES.REJECTED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case MODERATION_STATUSES.APPROVED:
        return 'bg-green-50 border-green-200 text-green-800';
      case MODERATION_STATUSES.PENDING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case MODERATION_STATUSES.FLAGGED:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case MODERATION_STATUSES.REJECTED:
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRiskLevel = (analysis) => {
    const maxScore = Math.max(
      analysis.toxicity || 0,
      analysis.hate_speech || 0,
      analysis.violence || 0,
      analysis.sexual_content || 0
    );

    if (maxScore > 0.7) return 'High';
    if (maxScore > 0.4) return 'Medium';
    return 'Low';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-orange-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!content || !content.trim()) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Moderation Status */}
      {moderationResult && (
        <div className={`p-4 rounded-lg border ${getStatusColor(moderationResult.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(moderationResult.status)}
              <div>
                <h3 className="font-medium">
                  Content {moderationResult.status.charAt(0).toUpperCase() + moderationResult.status.slice(1)}
                </h3>
                {moderationResult.reason && (
                  <p className="text-sm opacity-80">{moderationResult.reason}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setShowFullAnalysis(!showFullAnalysis)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              {showFullAnalysis ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Detailed Analysis */}
          {showFullAnalysis && moderationResult.analysis && (
            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
              <h4 className="font-medium mb-3">Content Analysis</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {Math.round((moderationResult.analysis.toxicity || 0) * 100)}%
                  </div>
                  <div className="text-xs opacity-80">Toxicity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {Math.round((moderationResult.analysis.hate_speech || 0) * 100)}%
                  </div>
                  <div className="text-xs opacity-80">Hate Speech</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {Math.round((moderationResult.analysis.violence || 0) * 100)}%
                  </div>
                  <div className="text-xs opacity-80">Violence</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {Math.round((moderationResult.analysis.sexual_content || 0) * 100)}%
                  </div>
                  <div className="text-xs opacity-80">Sexual Content</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm opacity-80">Risk Level: </span>
                  <span className={`font-medium ${getRiskColor(getRiskLevel(moderationResult.analysis))}`}>
                    {getRiskLevel(moderationResult.analysis)}
                  </span>
                </div>
                <div className="text-xs opacity-60">
                  Analyzed {new Date(moderationResult.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4" />
                <h4 className="font-medium">AI Suggestions</h4>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-white bg-opacity-50 rounded-lg">
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="font-medium text-blue-800">Analyzing Content</h3>
              <p className="text-sm text-blue-600">Checking for inappropriate content...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isAnalyzing && !moderationResult && content && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">Analysis Failed</h3>
              <p className="text-sm text-red-600">Unable to analyze content. Please try again.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentModerator;