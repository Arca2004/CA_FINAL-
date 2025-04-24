# TEAM-E.R.A
A student project to create a website providing information and tips on various cybersecurity topics, including attack targets, phishing attacks, malware infections, password thefts, network tapping, and more.

# Cybersec Academy

A web-based cybersecurity learning platform designed to make cybersecurity education accessible and engaging.

## Features

- Interactive learning modules on various cybersecurity topics
- User authentication with localStorage
- Progress tracking
- Modern, responsive UI with cybersecurity-themed design

## Hosting on GitHub Pages

To host this site on GitHub Pages, follow these steps:

1. Create a new GitHub repository
2. Upload all project files to the repository
3. Go to the repository Settings
4. Navigate to "Pages" from the left sidebar
5. Under "Source," select "Deploy from a branch"
6. Select the branch (usually "main" or "master")
7. Save the settings

GitHub will provide a URL where your site is published (usually in the format `https://[username].github.io/[repository-name]/`).

## Local Development

To run this project locally:

1. Clone the repository
2. Open the project folder
3. Open `index.html` in your browser

## Authentication

The project uses localStorage for user authentication:

- Default admin account: username "admin", password "password123"
- Users can create new accounts through the sign-up page
- User credentials are stored in browser localStorage

## Project Structure

- `index.html` - Main landing page
- `learn.html` - Learning modules page (requires authentication)
- `login.html` - User login page
- `signup.html` - User registration page
- `about-us.html` - Information about the team
- CSS and JavaScript files supporting the site functionality

## Authors

Team E.R.A - as detailed in the About Us page.

## Future Improvements

- Server-side authentication
- More learning modules
- Interactive exercises and challenges
- User profile customization
