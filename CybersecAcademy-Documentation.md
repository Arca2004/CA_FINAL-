# Cybersec Academy - Project Documentation

## Project Overview
Cybersec Academy is a web-based cybersecurity learning platform designed to make cybersecurity education accessible and engaging. The platform offers interactive learning modules on various cybersecurity topics, including attack targets, phishing attacks, malware infections, password security, and more.

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript
- **Authentication**: Firebase Authentication with localStorage fallback
- **Database**: Firebase Firestore
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome 6.4.0

## Project Structure

### Root Directory
- `index.html` - Landing page and entry point for the application
- `learn.html` - Main learning hub page displaying available modules
- `login.html` / `signup.html` - Authentication pages
- `profile.html` - User profile page showing progress and achievements
- `template.html` - Basic template for creating new pages

### Learning Modules
- `intro-cybersec.html` - Introduction to cybersecurity concepts
- `attack-targets.html` - Targets of cyber attacks
- `phishing-attack.html` - Phishing attack techniques and prevention
- `malware.html` - Types of malware and protection measures
- `password-theft.html` - Password security and protection
- `cloud-security.html` - Cloud security concepts and best practices

### Assets
- `/css` - Stylesheets (module-specific and shared styles)
- `/js` - JavaScript files (module-specific and shared functionality)
- `/img` - Images and media resources

## Authentication System

The platform implements a dual-authentication system:

1. **Firebase Authentication** (Primary):
   - Used for email/password authentication
   - User data is stored in Firebase
   - Profile information and learning progress are synced

2. **LocalStorage Authentication** (Fallback):
   - Functions when Firebase is unavailable
   - Stores user credentials locally in the browser
   - Allows the application to work even without a backend connection

Authentication flow:
1. User registers or logs in via the login/signup forms
2. Firebase authenticates the user if available
3. User information is stored in both Firebase and localStorage
4. Authentication state is checked on each page load
5. UI updates to show profile avatar or login button based on auth state

## Learning System

### Module Structure
Each learning module follows a similar structure:
- Hero section with module title and description
- Progress tracker showing completed topics
- Topic sections with interactive content
- Quizzes to test knowledge
- Locked/unlocked sections based on progress

### Progress Tracking
- User progress is tracked for each module
- Quiz completions unlock subsequent sections
- Progress data is stored in:
  - Firebase Firestore (when available)
  - Browser localStorage (as fallback)

### Interactive Features
- Quizzes with multiple-choice questions
- Progress indicators
- Achievement system
- Visual feedback for completed modules

## UI/UX Features

### Responsive Design
- Mobile-first approach with responsive breakpoints
- Hamburger menu for mobile navigation
- Adjustments for different screen sizes and orientations
- Support for touch interactions on mobile devices

### Visual Theme
- Cybersecurity-themed dark design with glowing accents
- Particle effects on hero sections
- Glitching text effects for headings
- Holographic and digital visual elements
- Scanner lines and noise overlay effects

### Navigation
- Main navigation with Home, Learn, and About Us links
- User profile dropdown menu
- Progress tracker in learning modules
- Breadcrumb-style module navigation

## Firebase Integration

The application uses the Firebase v8 SDK for:

1. **Authentication**:
   - Email/password authentication
   - User profile management
   - Authentication state observation

2. **Firestore Database**:
   - Storing user progress data
   - Managing cybersecurity tips and content
   - Admin functions for content management

3. **Analytics** (optional):
   - Usage tracking when available

## Styling System

### CSS Organization
- Module-specific CSS files (`phishing-attacks.css`, `malware.css`, etc.)
- Shared style components:
  - `cyberindex.css` - Core styling for the entire application
  - `responsive.css` - Responsive design rules
  - `profile-dropdown.css` - Profile menu styling

### Responsive Breakpoints
- Mobile: max-width 767px
- Tablet: 768px - 1023px
- Desktop: min-width 1024px
- Special handling for landscape orientation on mobile

## JavaScript Architecture

### Core Functionality
- Authentication state management
- Module progress tracking
- Quiz handling and validation
- UI interactions and animations

### Modular Structure
Each page has its own JavaScript file that handles:
- Page-specific functionality
- Authentication state
- Progress tracking for that module
- Quiz logic
- DOM manipulations

### Shared Functions
Common functionality across pages includes:
- User authentication handling
- Profile UI updates
- Progress data management
- Helper utilities for animations and UI

## Future Improvements
As noted in the project README:
- Server-side authentication
- Additional learning modules
- Interactive exercises and challenges
- User profile customization

## Deployment
The project is designed to be deployed on GitHub Pages or any static web hosting service. For GitHub Pages deployment, the repository can be configured to serve the site from the main branch.

## Local Development
To run the project locally:
1. Clone the repository
2. Open the project folder
3. Open `index.html` in a web browser

Firebase configuration can be updated in `firebase-config.js` to connect to a different Firebase project if needed. 