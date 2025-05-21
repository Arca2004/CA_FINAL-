# Responsive CSS Implementation Guide

This guide explains how to implement responsive design across the Cybersec Academy website.

## Files Structure

The responsive implementation consists of the following key files:

1. **css/responsive.css** - Contains all responsive styles for different screen sizes
2. **css/profile-dropdown.css** - Handles the profile dropdown menu styles
3. **js/mobile-menu.js** - JavaScript to control the mobile menu and profile dropdown behavior
4. **template.html** - Template file showing the proper HTML structure

## How to Apply to a New Page

To make a new page responsive:

1. Include the necessary CSS files in the `<head>` section:

   ```html
   <link rel="stylesheet" href="css/profile-dropdown.css" />
   <link rel="stylesheet" href="css/responsive.css" />
   ```

2. Include the mobile menu JavaScript at the end of the page:

   ```html
   <script src="js/mobile-menu.js"></script>
   ```

3. Use the proper HTML structure for the navigation:

   ```html
   <nav>
     <div class="hamburger-menu">
       <span></span>
       <span></span>
       <span></span>
     </div>
     <ul class="nav-links">
       <!-- Navigation items -->
       <li id="auth-nav-item">
         <!-- Profile container -->
         <div class="profile-container" id="profile-container">
           <div class="profile-link">
             <div class="profile-avatar" id="profile-avatar">
               <span id="profile-initial"></span>
             </div>
             <span class="profile-name" id="profile-name"></span>
             <i class="fas fa-chevron-down dropdown-icon"></i>
           </div>
           <div class="profile-dropdown">
             <!-- Dropdown items -->
           </div>
         </div>
       </li>
     </ul>
   </nav>
   ```

4. Use the proper class names for containers, buttons, and grids to inherit responsive behavior:
   - Use `container` for main content containers
   - Use `btn` class for buttons
   - Use `grid-container` for grid layouts

## Responsive Breakpoints

The responsive design uses these breakpoints:

- **Mobile**: Max-width 767px
- **Tablet**: 768px to 1023px
- **Desktop**: Min-width 1024px

Additional breakpoints:

- **Small mobile**: Max-width 480px
- **Mobile landscape**: Max-width 767px and landscape orientation

## Mobile Menu Functionality

The mobile menu functions as follows:

1. When the hamburger icon is clicked, it toggles the `active` class on the nav-links
2. The menu slides in from the right side of the screen
3. A close button appears in the top-right corner of the menu
4. Body scrolling is disabled when the menu is open
5. The menu closes when clicking outside, on a navigation item, or on the close button

## Profile Dropdown Implementation

The profile dropdown behaves differently based on screen size:

- **Desktop**: Shows on hover, positioned absolutely beneath the profile
- **Mobile**: Opens on click, positioned within the mobile menu flow

## Customizing for Specific Pages

For page-specific responsive styles:

1. Add your styles to the main responsive.css file under the appropriate media query
2. Use specific class names to target only that page's elements
3. Follow the same mobile-first approach

## Testing Your Implementation

Always test your responsive design across multiple devices and screen sizes:

1. Use browser developer tools to test different screen sizes
2. Test on actual mobile devices when possible
3. Test both portrait and landscape orientations
4. Verify that touch interactions work correctly on touch devices

## Troubleshooting

Common issues and solutions:

- **Menu not appearing**: Check if all required CSS and JS files are included
- **Profile dropdown not working**: Verify the correct HTML structure and class names
- **Layout issues on specific devices**: Check for conflicting styles or missing breakpoints

For any questions, refer to the template.html file for the correct implementation.
