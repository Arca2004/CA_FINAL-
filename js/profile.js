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

  // Tab functionality
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked button
      btn.classList.add("active");

      // Show corresponding content
      const targetTab = btn.getAttribute("data-tab");
      document.getElementById(`${targetTab}-content`).classList.add("active");
    });
  });

  // Particles.js
  if (document.getElementById("particles-js")) {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800,
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
          value: 0.5,
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
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
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
            distance: 140,
            line_linked: {
              opacity: 1,
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
      } else {
        // No user is signed in, redirect to login
        window.location.href = "login.html";
      }
    }
  }

  // Update profile UI with user data
  function updateProfileUI(user) {
    // Update profile name and email
    if (profileNameEl) {
      profileNameEl.textContent =
        user.displayName || user.fullname || "Cybersec Academy User";
    }

    if (profileEmailEl) {
      profileEmailEl.textContent =
        user.email || user.username || "No email provided";
    }

    // Update large profile initial
    if (largeProfileInitial) {
      largeProfileInitial.textContent = getUserInitial(user);
    }

    // Update form fields
    if (displayNameInput) {
      displayNameInput.value = user.displayName || user.fullname || "";
    }

    if (emailInput) {
      emailInput.value = user.email || user.username || "";
    }

    // Update progress data
    updateProgressData();
  }

  // Update progress data
  function updateProgressData() {
    // Get progress data from localStorage
    const attackCompletedSections =
      JSON.parse(localStorage.getItem("attackCompletedSections")) || [];
    const attackCompletedQuizzes =
      JSON.parse(localStorage.getItem("attackCompletedQuizzes")) || [];
    const phishingCompletedSections =
      JSON.parse(localStorage.getItem("phishingCompletedSections")) || [];
    const phishingCompletedQuizzes =
      JSON.parse(localStorage.getItem("phishingCompletedQuizzes")) || [];

    // Calculate completion percentages
    const introTopicsTotal = 4;
    const attackTopicsTotal = 5;
    const phishingTopicsTotal = 4;
    const malwareTopicsTotal = 4;

    // Just placeholder data for now - would need to integrate with actual learning progress tracking
    const introCompletion = 0;
    const attackCompletion = Math.round(
      (attackCompletedSections.length / attackTopicsTotal) * 100
    );
    const phishingCompletion = Math.round(
      (phishingCompletedSections.length / phishingTopicsTotal) * 100
    );
    const malwareCompletion = 0;

    // Update progress bars
    const introProg = document.getElementById("intro-progress");
    const attackProg = document.getElementById("attack-progress");
    const phishingProg = document.getElementById("phishing-progress");
    const malwareProg = document.getElementById("malware-progress");

    if (introProg) {
      introProg.style.width = `${introCompletion}%`;
      introProg.parentElement.nextElementSibling.textContent = `${introCompletion}% complete`;
    }

    if (attackProg) {
      attackProg.style.width = `${attackCompletion}%`;
      attackProg.parentElement.nextElementSibling.textContent = `${attackCompletion}% complete`;
    }

    if (phishingProg) {
      phishingProg.style.width = `${phishingCompletion}%`;
      phishingProg.parentElement.nextElementSibling.textContent = `${phishingCompletion}% complete`;
    }

    if (malwareProg) {
      malwareProg.style.width = `${malwareCompletion}%`;
      malwareProg.parentElement.nextElementSibling.textContent = `${malwareCompletion}% complete`;
    }

    // Update overview stats
    const completedModules = document.getElementById("completed-modules");
    const completedTopics = document.getElementById("completed-topics");
    const totalTime = document.getElementById("total-time");
    const completionPercentage = document.getElementById(
      "completion-percentage"
    );

    const modulesCompleted =
      (introCompletion > 0 ? 1 : 0) +
      (attackCompletion > 0 ? 1 : 0) +
      (phishingCompletion > 0 ? 1 : 0) +
      (malwareCompletion > 0 ? 1 : 0);

    const topicsCompleted =
      attackCompletedSections.length + phishingCompletedSections.length;

    const averageCompletion = Math.round(
      (introCompletion +
        attackCompletion +
        phishingCompletion +
        malwareCompletion) /
        4
    );

    if (completedModules)
      completedModules.textContent = `${modulesCompleted}/4`;
    if (completedTopics) completedTopics.textContent = topicsCompleted;
    if (totalTime)
      totalTime.textContent = `${Math.round(topicsCompleted * 0.5)}h`;
    if (completionPercentage)
      completionPercentage.textContent = `${averageCompletion}%`;

    // Update achievements
    // This would need to be integrated with a proper achievements system
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

  // Initial load
  loadUserData();
});
