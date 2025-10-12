import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import SearchPage from './components/Search/SearchPage';
import ResolvePage from './components/Resolve/ResolvePage';

function App() {
  const [currentTab, setCurrentTab] = useState('search');

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ padding: '1.5rem 0' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Memory-Informed Incident Resolution System
            </h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem', margin: 0 }}>
              AI-powered incident resolution with memory-based solutions
            </p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <button
              onClick={() => handleTabChange('search')}
              style={{
                padding: '1rem 0.25rem',
                borderBottom: currentTab === 'search' ? '2px solid #3b82f6' : '2px solid transparent',
                fontWeight: '500',
                fontSize: '0.875rem',
                color: currentTab === 'search' ? '#3b82f6' : '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              🔍 Search Memories
            </button>
            <button
              onClick={() => handleTabChange('resolve')}
              style={{
                padding: '1rem 0.25rem',
                borderBottom: currentTab === 'resolve' ? '2px solid #3b82f6' : '2px solid transparent',
                fontWeight: '500',
                fontSize: '0.875rem',
                color: currentTab === 'resolve' ? '#3b82f6' : '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              🛠️ Resolve Incidents
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {currentTab === 'search' && <SearchPage />}
        {currentTab === 'resolve' && <ResolvePage />}
      </main>
      
      {/* Global Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxWidth: '400px',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;