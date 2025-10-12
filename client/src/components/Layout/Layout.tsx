import React from 'react';
import { motion } from 'framer-motion';
import TabNavigation from './TabNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="py-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Incident Memory System
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  AI-powered incident resolution with memory-informed insights
                </p>
              </div>
              
              {/* Optional: Add user menu or help button here */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-sm text-gray-500">
                  Powered by MongoDB & AI
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Navigation */}
      <TabNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Built for the MongoDB Hackathon • 
              <span className="ml-1">
                Memory-Informed Incident Resolution System
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
