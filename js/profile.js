// Define logout function globally
function logout() {
  // Check if Firebase auth is available
  if (firebase && firebase.auth) {
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Remove current user from localStorage for backward compatibility
        localStorage.removeItem("currentUser");
        // Redirect to login page
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error("Sign out error:", error);

        // Fallback to local logout if Firebase fails
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
      });
  } else {
    // Fallback for older version
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Elements for profile dropdown
  const authNavItem = document.getElementById("auth-nav-item");
  const loginLink = document.getElementById("login-link");
  const profileContainer = document.getElementById("profile-container");
  const profileAvatar = document.getElementById("profile-avatar");
  const profileInitial = document.getElementById("profile-initial");
  const logoutBtn = document.getElementById("logout-btn");

  // Profile page elements
  const profileNameEl = document.getElementById("profile-name");
  const profileEmailEl = document.getElementById("profile-email");
  const largeProfileInitial = document.getElementById("large-profile-initial");
  const joinDateEl = document.getElementById("join-date");

  // Form fields
  const displayNameInput = document.getElementById("display-name");
  const emailInput = document.getElementById("email");
  const profileSettingsForm = document.getElementById("profile-settings-form");

  // Quiz Toggle Functionality
  const disableQuizzesToggle = document.getElementById("disable-quizzes-toggle");
  const quizModal = document.getElementById("quiz-modal");
  const quizModalMessage = document.getElementById("quiz-modal-message");
  const quizCancelBtn = document.getElementById("quiz-cancel");
  const quizConfirmBtn = document.getElementById("quiz-confirm");
  let quizToggleAction = null; // Will store 'enable' or 'disable'

  // Tab functionality - removed since we only have one tab now
  // const tabBtns = document.querySelectorAll(".tab-btn");
  // const tabContents = document.querySelectorAll(".tab-content");

  // Particles.js
  if (document.getElementById("particles-js")) {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            value_area: 1000,
          },
        },
        color: {
          value: "#5cdb95",
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 0.6,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#3494c9",
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.8,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 180,
            line_linked: {
              opacity: 0.8,
            },
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
    });
  }

  // Setup logout button event listener
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }

  // Function to get user initial from name or email
  function getUserInitial(userInfo) {
    if (!userInfo) return "?";

    if (userInfo.displayName) {
      return userInfo.displayName.charAt(0).toUpperCase();
    } else if (userInfo.fullname) {
      return userInfo.fullname.charAt(0).toUpperCase();
    } else if (userInfo.email) {
      return userInfo.email.charAt(0).toUpperCase();
    } else if (userInfo.username) {
      return userInfo.username.charAt(0).toUpperCase();
    }

    return "U";
  }

  // Load user data from Firebase or localStorage
  function loadUserData() {
    if (firebase && firebase.auth) {
      const user = firebase.auth().currentUser;

      if (user) {
        // User is signed in with Firebase
        updateProfileUI(user);

        // Load user progress from Realtime Database
        loadUserProgress(user.uid);

        if (loginLink) loginLink.style.display = "none";
        if (profileContainer) profileContainer.style.display = "block";
        if (profileInitial) profileInitial.textContent = getUserInitial(user);
      } else {
        // Check localStorage for backward compatibility
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
          updateProfileUI(currentUser);

          if (loginLink) loginLink.style.display = "none";
          if (profileContainer) profileContainer.style.display = "block";
          if (profileInitial)
            profileInitial.textContent = getUserInitial(currentUser);
          
          // Fall back to localStorage progress data
          updateProgressFromLocalStorage();
        } else {
          // No user is signed in, redirect to login
          window.location.href = "login.html";
        }
      }
    } else {
      // Fallback for older version
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        updateProfileUI(currentUser);

        if (loginLink) loginLink.style.display = "none";
        if (profileContainer) profileContainer.style.display = "block";
        if (profileInitial)
          profileInitial.textContent = getUserInitial(currentUser);
        
        // Fall back to localStorage progress data
        updateProgressFromLocalStorage();
      } else {
        // No user is signed in, redirect to login
        window.location.href = "login.html";
      }
    }
  }

  // Update profile UI with user data
  function updateProfileUI(user) {
    // Set profile name and email
    if (profileNameEl)
      profileNameEl.textContent = user.displayName || user.fullname || user.email || "Cybersec Academy User";
    
    if (profileEmailEl) profileEmailEl.textContent = user.email || "";
    
    if (displayNameInput)
      displayNameInput.value =
        user.displayName || user.fullname || user.email || "";
    
    if (emailInput) emailInput.value = user.email || "";
    
    if (largeProfileInitial)
      largeProfileInitial.textContent = getUserInitial(user);
    
    if (joinDateEl) {
      // Format join date or use placeholder
      const joinDate = user.createdAt || user.metadata?.creationTime || "2025";
      joinDateEl.textContent = formatDate(joinDate);
    }
  }
  
  // Format date to user-friendly format
  function formatDate(dateStr) {
    if (!dateStr || dateStr === "2025") return "2025";
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "2025"; // Fallback
    }
  }
  
  // Simplified loadUserProgress function
  function loadUserProgress(userId) {
    // We only need quiz settings now
    updateProgressUI({});
  }
  
  // Simplified updateProgressUI function
  function updateProgressUI(data) {
    // Only handle quiz settings since other progress elements were removed
    if (disableQuizzesToggle) {
      const quizzesDisabled = localStorage.getItem("quizzesDisabled") === "true";
      disableQuizzesToggle.checked = quizzesDisabled;
    }
  }

  // Simplified updateProgressFromLocalStorage function
  function updateProgressFromLocalStorage() {
    // Only handle quiz settings since other progress elements were removed
    if (disableQuizzesToggle) {
      const quizzesDisabled = localStorage.getItem("quizzesDisabled") === "true";
      disableQuizzesToggle.checked = quizzesDisabled;
    }
  }

  // Handle profile settings form submission
  if (profileSettingsForm) {
    profileSettingsForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const newDisplayName = displayNameInput.value.trim();

      if (firebase && firebase.auth) {
        const user = firebase.auth().currentUser;

        if (user) {
          user
            .updateProfile({
              displayName: newDisplayName,
            })
            .then(() => {
              alert("Profile updated successfully!");
              loadUserData(); // Reload user data
            })
            .catch((error) => {
              console.error("Error updating profile:", error);
              alert("Error updating profile. Please try again.");
            });
        } else {
          // Update in localStorage
          const currentUser =
            JSON.parse(localStorage.getItem("currentUser")) || {};
          currentUser.fullname = newDisplayName;
          localStorage.setItem("currentUser", JSON.stringify(currentUser));

          alert("Profile updated successfully!");
          loadUserData(); // Reload user data
        }
      } else {
        // Update in localStorage
        const currentUser =
          JSON.parse(localStorage.getItem("currentUser")) || {};
        currentUser.fullname = newDisplayName;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        alert("Profile updated successfully!");
        loadUserData(); // Reload user data
      }
    });
  }

  // Initialize quiz toggle state from localStorage
  if (disableQuizzesToggle) {
    const quizzesDisabled = localStorage.getItem("quizzesDisabled") === "true";
    disableQuizzesToggle.checked = quizzesDisabled;
    
    // Add event listener for toggle change
    disableQuizzesToggle.addEventListener("change", function() {
      // Determine if we're enabling or disabling quizzes
      quizToggleAction = this.checked ? 'disable' : 'enable';
      
      // Update modal message based on action
      quizModalMessage.textContent = quizToggleAction === 'disable' ? 
        "Are you sure you want to disable quizzes across all modules? This will hide quiz sections so you can focus solely on the learning content." :
        "Are you sure you want to enable quizzes across all modules? This will show quiz sections again.";
      
      // Show confirmation modal
      quizModal.classList.add("active");
    });
  }

  // Quiz confirmation modal handling
  if (quizCancelBtn) {
    quizCancelBtn.addEventListener("click", function() {
      // Reset the toggle to its previous state
      if (quizToggleAction === 'disable') {
        disableQuizzesToggle.checked = false;
      } else {
        disableQuizzesToggle.checked = true;
      }
      
      // Hide modal
      quizModal.classList.remove("active");
    });
  }

  if (quizConfirmBtn) {
    quizConfirmBtn.addEventListener("click", function() {
      // Apply the quiz setting
      const isDisabled = quizToggleAction === 'disable';
      
      // Save to localStorage
      localStorage.setItem("quizzesDisabled", isDisabled);
      
      // Show feedback message
      const message = isDisabled ? 
        "Quizzes have been disabled across all modules." : 
        "Quizzes have been enabled across all modules.";
      
      alert(message);
      
      // Hide modal
      quizModal.classList.remove("active");
    });
  }

  // Function to handle the quiz settings linking from the dropdown
  function handleQuizSettingsLink() {
    // Get hash from URL
    const hash = window.location.hash;
    
    // If the hash is for settings content
    if (hash === '#settings-content') {
      // Find the quiz disable toggle in settings and highlight it
      const quizToggle = document.querySelector('.learning-preferences');
      if (quizToggle) {
        quizToggle.style.transition = 'all 0.3s ease';
        quizToggle.style.boxShadow = '0 0 15px rgba(92, 219, 149, 0.5)';
        
        // Scroll to the quiz toggle section with smooth animation
        setTimeout(() => {
          quizToggle.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after some time
          setTimeout(() => {
            quizToggle.style.boxShadow = '';
          }, 3000);
        }, 300);
      }
    }
  }

  // Call the handler when page loads
  handleQuizSettingsLink();
  
  // Also set up listener for hash changes (in case user navigates back/forward)
  window.addEventListener('hashchange', handleQuizSettingsLink);

  // Initial load
  loadUserData();
});
