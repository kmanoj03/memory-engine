import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PatchDiffModalProps {
  patchDiff: string;
  onClose: () => void;
}

const PatchDiffModal: React.FC<PatchDiffModalProps> = ({ patchDiff, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(patchDiff);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatPatchDiff = (diff: string) => {
    return diff.split('\n').map((line, index) => {
      const isAddition = line.startsWith('+');
      const isDeletion = line.startsWith('-');
      const isContext = line.startsWith(' ');
      
      return (
        <div
          key={index}
          className={`font-mono text-sm px-2 py-1 ${
            isAddition 
              ? 'bg-green-50 text-green-800 border-l-2 border-green-500' 
              : isDeletion 
              ? 'bg-red-50 text-red-800 border-l-2 border-red-500'
              : isContext
              ? 'bg-gray-50 text-gray-700'
              : 'text-gray-600'
          }`}
        >
          {line}
        </div>
      );
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Patch Diff
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Patch
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Patch Content */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Before/After Changes</h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {formatPatchDiff(patchDiff)}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border-l-2 border-green-500 mr-2"></div>
                  <span className="text-green-800">Added lines</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border-l-2 border-red-500 mr-2"></div>
                  <span className="text-red-800">Removed lines</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-50 mr-2"></div>
                  <span className="text-gray-700">Context lines</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default PatchDiffModal;