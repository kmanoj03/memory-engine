import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ArrowRight, Search, CheckCircle2, Lightbulb } from 'lucide-react';
import Button from './Button';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
}

const SearchTourSteps: TourStep[] = [
  {
    id: 'search-form',
    title: 'Describe Your Incident',
    description: 'Start by describing the issue you\'re facing. Be as specific as possible - include error messages, affected services, and environment details.',
    icon: <Search className="w-6 h-6 text-blue-600" />
  },
  {
    id: 'filters',
    title: 'Apply Filters',
    description: 'Use the filters to narrow down results by service, environment, version, or tags. This helps find more relevant matches.',
    icon: <HelpCircle className="w-6 h-6 text-purple-600" />
  },
  {
    id: 'results',
    title: 'Review Matches',
    description: 'The AI will show you similar incidents with similarity scores and explain why they matched. Click "View Patch Diff" to see the actual fix.',
    icon: <Lightbulb className="w-6 h-6 text-yellow-600" />
  },
  {
    id: 'apply-fix',
    title: 'Apply the Fix',
    description: 'When you find a relevant solution, click "Apply This Fix" to use it for your current incident. The system will track this for future learning.',
    icon: <CheckCircle2 className="w-6 h-6 text-green-600" />
  }
];

const ResolveTourSteps: TourStep[] = [
  {
    id: 'incident-list',
    title: 'View Unresolved Incidents',
    description: 'This table shows all incidents that need attention. You can sort, filter, and search through them easily.',
    icon: <HelpCircle className="w-6 h-6 text-blue-600" />
  },
  {
    id: 'incident-details',
    title: 'Investigate Details',
    description: 'Click on any incident to view full details including error logs, related incidents, and service information.',
    icon: <Search className="w-6 h-6 text-purple-600" />
  },
  {
    id: 'mark-resolved',
    title: 'Document Resolution',
    description: 'When you resolve an incident, document the root cause, applied fix, and any relevant tags. This helps the AI learn for future searches.',
    icon: <CheckCircle2 className="w-6 h-6 text-green-600" />
  }
];

interface HelpTourProps {
  currentPage: 'search' | 'resolve';
}

const HelpTour: React.FC<HelpTourProps> = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = currentPage === 'search' ? SearchTourSteps : ResolveTourSteps;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  return (
    <>
      {/* Help Button */}
      <Button
        variant="ghost"
        size="sm"
        icon={<HelpCircle className="w-4 h-4" />}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 shadow-lg"
      >
        Help
      </Button>

      {/* Tour Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentPage === 'search' ? 'Search Guide' : 'Resolve Guide'}
                </h3>
                <button
                  onClick={handleClose}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Content */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-6"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {currentStepData.icon}
                </div>
                
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentStepData.title}
                </h4>
                
                <p className="text-gray-600 leading-relaxed">
                  {currentStepData.description}
                </p>
              </motion.div>

              {/* Progress */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentStep ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <div className="text-sm text-gray-500">
                  {currentStep + 1} of {steps.length}
                </div>
                
                <Button
                  variant="primary"
                  onClick={handleNext}
                  icon={currentStep === steps.length - 1 ? undefined : <ArrowRight className="w-4 h-4" />}
                >
                  {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpTour;
