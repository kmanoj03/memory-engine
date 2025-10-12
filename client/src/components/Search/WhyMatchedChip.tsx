import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import type { WhyMatchedChipProps } from '../../services/types';

const WhyMatchedChip: React.FC<WhyMatchedChipProps> = ({ match }) => {
  const getChipConfig = (type: string) => {
    switch (type) {
      case 'similar_error':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '🔍'
        };
      case 'same_service':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '🏢'
        };
      case 'matching_keywords':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '🔤'
        };
      case 'recent_occurrence':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '⏰'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: 'ℹ️'
        };
    }
  };

  const getTooltipText = (type: string) => {
    switch (type) {
      case 'similar_error':
        return 'This incident has a similar error pattern to your search query.';
      case 'same_service':
        return 'This incident occurred in the same service you mentioned.';
      case 'matching_keywords':
        return `This incident contains matching keywords: ${match.keywords?.join(', ')}.`;
      case 'recent_occurrence':
        return 'This incident occurred recently and may be related to current issues.';
      default:
        return match.description;
    }
  };

  const config = getChipConfig(match.type);
  const tooltipText = getTooltipText(match.type);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="relative group"
    >
      <div className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
        ${config.color}
        transition-all duration-200 hover:shadow-sm
      `}>
        <span className="mr-1">{config.icon}</span>
        <span>{match.description}</span>
        <div className="ml-1 relative">
          <HelpCircle className="w-3 h-3 opacity-60" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            {tooltipText}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
      
      {/* Confidence indicator */}
      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white border border-gray-300">
        <div 
          className={`w-full h-full rounded-full ${
            match.confidence >= 0.8 ? 'bg-green-400' :
            match.confidence >= 0.6 ? 'bg-yellow-400' :
            'bg-red-400'
          }`}
        />
      </div>
    </motion.div>
  );
};

export default WhyMatchedChip;
