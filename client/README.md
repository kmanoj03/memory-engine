# Memory-Informed Incident Resolution System

A comprehensive React application built for the MongoDB Hackathon that demonstrates AI-powered incident resolution with memory-informed insights. This system helps teams quickly find and apply solutions to incidents by leveraging a memory of past resolutions.

## 🚀 Features

### Search Tab
- **Intelligent Search**: Describe your incident in natural language and find similar past incidents
- **Advanced Filtering**: Filter by service, environment, version, and tags
- **Similarity Scoring**: AI-powered matching with confidence scores
- **Why Matched**: Explanations for why incidents were matched
- **Patch Diff Viewer**: View the actual code changes that resolved similar issues
- **Apply Fix**: One-click application of proven solutions

### Resolve Tab
- **Incident Management**: View and manage all unresolved incidents
- **Detailed Investigation**: Comprehensive incident details with error logs and related incidents
- **Resolution Documentation**: Structured forms for documenting root causes and fixes
- **Memory Storage**: Save resolutions to help with future incidents

### Demo Features
- **Sample Data**: Quick population with realistic incident data
- **Help Tours**: Interactive guides for both search and resolve workflows
- **Keyboard Shortcuts**: Power user shortcuts for faster navigation
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM
- **HTTP Client**: Axios

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd memory-incident-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 Usage

### Getting Started
1. **Search for Similar Incidents**
   - Go to the Search tab
   - Describe your incident in the text area
   - Apply filters if needed
   - Review matching incidents and their similarity scores
   - Click "Apply This Fix" to use a proven solution

2. **Resolve New Incidents**
   - Go to the Resolve tab
   - View unresolved incidents in the table
   - Click on any incident to see details
   - Document the resolution with root cause and fix details
   - Save to memory for future searches

### Keyboard Shortcuts
- `⌘ + K`: Focus search input
- `Esc`: Close modals
- `⌘ + R`: Refresh data
- `?`: Show help tour

### Demo Features
- Click "Add Sample Data" to populate with realistic incidents
- Use the help tours to learn the workflow
- Try the example search queries for quick demos

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── Search/           # Search functionality
│   ├── Resolve/          # Incident resolution
│   ├── shared/           # Reusable components
│   └── Layout/           # App layout and navigation
├── hooks/                # Custom React hooks
├── services/             # API and type definitions
└── utils/                # Helper functions
```

### Key Components
- **SearchForm**: Natural language incident description
- **SearchFilters**: Advanced filtering options
- **ResultCard**: Display search results with similarity scores
- **PatchDiffModal**: Code diff viewer
- **UnresolvedTable**: Incident management table
- **IncidentDetailModal**: Comprehensive incident details
- **MarkResolvedForm**: Resolution documentation

### Data Flow
1. User describes incident in Search tab
2. AI searches memory for similar incidents
3. Results ranked by similarity with explanations
4. User can view patch diffs and apply fixes
5. New incidents saved to memory for future searches

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb)
- **Success**: Green (#16a34a)
- **Danger**: Red (#dc2626)
- **Warning**: Orange (#ea580c)

### Typography
- **Font**: System UI stack
- **Sizes**: Responsive scale from 12px to 48px

### Components
- **Buttons**: Primary, secondary, ghost, danger variants
- **Cards**: Consistent shadows and hover effects
- **Modals**: Backdrop blur with smooth animations
- **Forms**: Clear validation and error states

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Consistent naming conventions
- Comprehensive prop interfaces

### Performance
- Lazy loading for modals
- Optimized re-renders with useCallback
- Efficient state management
- Responsive images and assets

## 🌟 Key Features Demonstrated

### AI-Powered Search
- Natural language processing simulation
- Similarity scoring algorithms
- Contextual matching explanations

### Memory System
- Incident storage and retrieval
- Resolution pattern recognition
- Learning from past solutions

### User Experience
- Intuitive workflows
- Comprehensive help system
- Responsive design
- Accessibility considerations

### Developer Experience
- Clean, maintainable code
- Comprehensive TypeScript types
- Modular component architecture
- Extensive documentation

## 🚀 Future Enhancements

- **Real AI Integration**: Connect to actual ML models
- **Team Collaboration**: Multi-user incident management
- **Advanced Analytics**: Resolution patterns and insights
- **Integration APIs**: Connect to monitoring tools
- **Mobile App**: Native mobile experience

## 📄 License

Built for the MongoDB Hackathon. This project demonstrates modern React development practices and AI-powered incident resolution concepts.

## 🤝 Contributing

This is a hackathon project, but feedback and suggestions are welcome! The codebase is designed to be easily extensible and maintainable.

---

**Built with ❤️ for the MongoDB Hackathon**