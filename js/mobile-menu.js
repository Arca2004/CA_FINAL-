/**
 * Mobile Menu and Profile Dropdown Handler
 * For Cybersec Academy
 */

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks = document.querySelector(".nav-links");
  const profileContainer = document.querySelector(".profile-container");
  const profileDropdown = document.querySelector(".profile-dropdown");
  const body = document.body;

  // Check if we're on about-us.html page
  const isAboutUsPage = window.location.pathname.includes("about-us.html");

  // Create and append close button if it doesn't exist and we're not on about-us.html
  if (navLinks && !document.querySelector(".close-menu") && !isAboutUsPage) {
    const closeButton = document.createElement("span");
    closeButton.className = "close-menu";
    closeButton.innerHTML = "&times;";
    navLinks.appendChild(closeButton);

    // Add event listener to close button
    closeButton.addEventListener("click", function () {
      navLinks.classList.remove("active");
      hamburgerMenu.classList.remove("open");
      body.style.overflow = "auto"; // Enable scrolling again
    });
  }

  // Hamburger menu toggle
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", function (e) {
      e.stopPropagation();

      // Toggle hamburger animation
      this.classList.toggle("open");

      // Toggle navigation menu
      if (navLinks) {
        navLinks.classList.toggle("active");

        // Disable body scroll when menu is open
        if (navLinks.classList.contains("active")) {
          body.style.overflow = "hidden";
        } else {
          body.style.overflow = "auto";
        }
      }
    });
  }

  // Profile dropdown toggle (for mobile)
  if (profileContainer) {
    profileContainer.addEventListener("click", function (e) {
      // Only handle click for mobile view
      if (window.innerWidth <= 767) {
        e.stopPropagation();

        if (profileDropdown) {
          profileDropdown.classList.toggle("active");
          profileContainer.classList.toggle("active");
        }
      }
    });
  }

  // Close menu when clicking anywhere else on the page
  document.addEventListener("click", function (e) {
    // Close mobile menu when clicking outside
    if (navLinks && navLinks.classList.contains("active")) {
      if (!navLinks.contains(e.target) && e.target !== hamburgerMenu) {
        navLinks.classList.remove("active");
        hamburgerMenu.classList.remove("open");
        body.style.overflow = "auto";
      }
    }

    // Close profile dropdown when clicking outside (mobile only)
    if (window.innerWidth <= 767) {
      if (profileDropdown && profileDropdown.classList.contains("active")) {
        if (!profileContainer.contains(e.target)) {
          profileDropdown.classList.remove("active");
          profileContainer.classList.remove("active");
        }
      }
    }
  });

  // Close menu when clicking on navigation links (except profile)
  const navItems = document.querySelectorAll(".nav-links a:not(.profile-link)");
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      if (navLinks) {
        navLinks.classList.remove("active");
        hamburgerMenu.classList.remove("open");
        body.style.overflow = "auto";
      }
    });
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    if (window.innerWidth > 767) {
      // Reset mobile menu state for desktop view
      if (navLinks && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        hamburgerMenu.classList.remove("open");
        body.style.overflow = "auto";
      }

      // Reset profile dropdown for desktop view
      if (profileContainer && profileContainer.classList.contains("active")) {
        profileContainer.classList.remove("active");
      }
    }
  });
});
