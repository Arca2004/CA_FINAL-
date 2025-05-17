// Particles.js Configuration
document.addEventListener("DOMContentLoaded", function () {
  // Elements for profile dropdown
  const authNavItem = document.getElementById("auth-nav-item");
  const loginLink = document.getElementById("login-link");
  const profileContainer = document.getElementById("profile-container");
  const profileAvatar = document.getElementById("profile-avatar");
  const profileInitial = document.getElementById("profile-initial");
  const logoutBtn = document.getElementById("logout-btn");

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

  // Check for Firebase auth state
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in with Firebase
        if (loginLink) loginLink.style.display = "none";
        if (profileContainer) profileContainer.style.display = "block";
        if (profileInitial) profileInitial.textContent = getUserInitial(user);

        // Store in localStorage for backward compatibility
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            username: user.email,
            fullname: user.displayName || "Cyber Academy User",
            initial: getUserInitial(user),
          })
        );
      } else {
        // Check localStorage for backward compatibility
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
          if (loginLink) loginLink.style.display = "none";
          if (profileContainer) profileContainer.style.display = "block";
          if (profileInitial)
            profileInitial.textContent = getUserInitial(currentUser);
        } else {
          if (loginLink) loginLink.style.display = "block";
          if (profileContainer) profileContainer.style.display = "none";
        }
      }
    });
  } else {
    // Fallback for older version
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      if (loginLink) loginLink.style.display = "none";
      if (profileContainer) profileContainer.style.display = "block";
      if (profileInitial)
        profileInitial.textContent = getUserInitial(currentUser);
    } else {
      if (loginLink) loginLink.style.display = "block";
      if (profileContainer) profileContainer.style.display = "none";
    }
  }

  // Initialize particles.js if the element exists
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

  // Tab functionality
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Function to set active tab
  function setActiveTab(tabName) {
    // Remove active class from all buttons and contents
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    // Add active class to specified tab button
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (targetBtn) {
      targetBtn.classList.add("active");
    }

    // Show corresponding content
    const targetContent = document.getElementById(`${tabName}-content`);
    if (targetContent) {
      targetContent.classList.add("active");
    }

    // Save selection to localStorage
    localStorage.setItem("selectedLearnTab", tabName);
  }

  // Check if there's a saved tab preference
  const savedTab = localStorage.getItem("selectedLearnTab");
  if (savedTab) {
    setActiveTab(savedTab);
  }

  // Add click event listeners to tab buttons
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      setActiveTab(targetTab);
    });
  });

  // Circular progress animation
  const circularProgress = document.querySelectorAll(".circular-progress");

  circularProgress.forEach((progress) => {
    const value = progress.getAttribute("data-value");
    progress.style.background = `conic-gradient(var(--cyber-green) ${value}%, var(--third-dark) 0)`;
  });

  // Set up module hover effects
  const moduleCards = document.querySelectorAll(".module-card:not(.locked)");

  moduleCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-10px)";
      card.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
    });

    card.addEventListener("mouseleave", () => {
      if (!card.classList.contains("active")) {
        card.style.transform = "";
        card.style.boxShadow = "";
      }
    });
  });

  // Track module progress from all modules
  function updateModuleProgress() {
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      // User is logged in with Firebase, load progress from Firestore
      const userId = firebase.auth().currentUser.uid;
      loadProgressFromFirestore(userId);
    } else {
      // Fallback to localStorage for backward compatibility
      loadProgressFromLocalStorage();
    }
  }

  // New function to load progress from Firestore
  function loadProgressFromFirestore(userId) {
    if (!firebase.firestore) {
      console.error("Firestore is not available");
      loadProgressFromLocalStorage();
      return;
    }

    firebase.firestore().collection("userProgress").doc(userId).get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          updateUIWithProgressData(data);
        } else {
          // Initialize user progress document if it doesn't exist
          const initialData = {
            completedModules: 0,
            totalModules: 4,
            completedTopics: 0,
            totalTimeMinutes: 0,
            completionPercentage: 0,
            lastUpdated: new Date(),
            modules: {
              introCybersec: { completedQuizzes: [], progressPercentage: 0 },
              attackTargets: { completedQuizzes: [], progressPercentage: 0 },
              phishingAttacks: { completedQuizzes: [], progressPercentage: 0 },
              malwareInfections: { completedQuizzes: [], progressPercentage: 0 }
            }
          };
          
          firebase.firestore().collection("userProgress").doc(userId).set(initialData)
            .then(() => {
              console.log("Created new user progress document");
              updateUIWithProgressData(initialData);
            })
            .catch(error => {
              console.error("Error creating user progress document:", error);
              loadProgressFromLocalStorage();
            });
        }
      })
      .catch((error) => {
        console.error("Error loading user progress:", error);
        loadProgressFromLocalStorage();
      });
  }

  // New function to update UI with progress data from either Firestore or localStorage
  function updateUIWithProgressData(data) {
    // Progress from Attack Targets module
    const attackTargetsTopics = document.querySelector(
      ".module-card:nth-child(2)"
    );
    
    if (attackTargetsTopics) {
      // Get attack targets progress from data
      const attackTargetsModule = data.modules?.attackTargets || {};
      const attackTargetsCompletedSections = attackTargetsModule.completedQuizzes || [];
      const attackProgress = attackTargetsModule.progressPercentage || 0;
      
      // Update the attack topics list with check marks if we have progress
      if (attackTargetsCompletedSections.length > 0) {
        const topicsList = attackTargetsTopics.querySelectorAll(".module-topics li");
        
        // Map section IDs to topics in the list
        const sectionToTopicMap = {
          individuals: 0, // Understanding Attack Vectors
          businesses: 1, // Common Target Types
          government: 2, // Defense Strategies
          infrastructure: 3, // CIA Triad
          financial: 4, // 5th topic if any
        };
        
        attackTargetsCompletedSections.forEach((section) => {
          const topicIndex = sectionToTopicMap[section];
          if (topicIndex !== undefined && topicsList[topicIndex]) {
            const icon = topicsList[topicIndex].querySelector("i");
            if (icon) {
              icon.className = "fas fa-check-circle";
            }
          }
        });
        
        // Update progress bar
        const progressBar = attackTargetsTopics.querySelector(".progress");
        if (progressBar) {
          progressBar.style.width = `${attackProgress}%`;
        }
        
        // Update module card visual state based on completion
        if (attackProgress === 100) {
          attackTargetsTopics.classList.add("completed");
          const button = attackTargetsTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
          }
          
          // Add visual indicator for completion
          if (!attackTargetsTopics.querySelector(".completion-badge")) {
            const badge = document.createElement("div");
            badge.className = "completion-badge";
            badge.innerHTML = '<i class="fas fa-medal"></i>';
            attackTargetsTopics.appendChild(badge);
          }
        } else if (attackProgress > 0) {
          // If any progress, update button to "Continue"
          const button = attackTargetsTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
          }
          attackTargetsTopics.classList.add("active");
          
          // Keep card elevated
          attackTargetsTopics.style.transform = "translateY(-10px)";
          attackTargetsTopics.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
        }
      }
    }
    
    // Progress from Phishing Attacks module
    const phishingTopics = document.querySelector(".module-card:nth-child(3)");
    
    if (phishingTopics) {
      // Get phishing attacks progress from data
      const phishingModule = data.modules?.phishingAttacks || {};
      const phishingCompletedSections = phishingModule.completedQuizzes || [];
      const phishingProgress = phishingModule.progressPercentage || 0;
      
      // Update the phishing topics list with check marks if we have progress
      if (phishingCompletedSections.length > 0) {
        const topicsList = phishingTopics.querySelectorAll(".module-topics li");
        
        // Map section IDs to topics in the list
        const sectionToTopicMap = {
          techniques: 0,
          types: 1, 
          prevention: 2,
          simulation: 3
        };
        
        phishingCompletedSections.forEach((section) => {
          const topicIndex = sectionToTopicMap[section];
          if (topicIndex !== undefined && topicsList[topicIndex]) {
            const icon = topicsList[topicIndex].querySelector("i");
            if (icon) {
              icon.className = "fas fa-check-circle";
            }
          }
        });
        
        // Update progress bar
        const progressBar = phishingTopics.querySelector(".progress");
        if (progressBar) {
          progressBar.style.width = `${phishingProgress}%`;
        }
        
        // Update module card visual state based on completion
        if (phishingProgress === 100) {
          phishingTopics.classList.add("completed");
          const button = phishingTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
          }
          
          // Add visual indicator for completion
          if (!phishingTopics.querySelector(".completion-badge")) {
            const badge = document.createElement("div");
            badge.className = "completion-badge";
            badge.innerHTML = '<i class="fas fa-medal"></i>';
            phishingTopics.appendChild(badge);
          }
        } else if (phishingProgress > 0) {
          // If any progress, update button to "Continue"
          const button = phishingTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
          }
          phishingTopics.classList.add("active");
          
          // Keep card elevated
          phishingTopics.style.transform = "translateY(-10px)";
          phishingTopics.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
        }
      }
    }
    
    // Progress from Introduction to Cybersecurity module
    const introTopics = document.querySelector(".module-card:nth-child(1)");
    
    if (introTopics) {
      // Get intro progress from data
      const introModule = data.modules?.introCybersec || {};
      const introProgress = introModule.progressPercentage || 0;
      
      // Update progress bar
      const progressBar = introTopics.querySelector(".progress");
      if (progressBar) {
        progressBar.style.width = `${introProgress}%`;
      }
      
      // Update module card visual state based on completion
      if (introProgress === 100) {
        introTopics.classList.add("completed");
        const button = introTopics.querySelector(".module-btn");
        if (button) {
          button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
        }
        
        // Add visual indicator for completion
        if (!introTopics.querySelector(".completion-badge")) {
          const badge = document.createElement("div");
          badge.className = "completion-badge";
          badge.innerHTML = '<i class="fas fa-medal"></i>';
          introTopics.appendChild(badge);
        }
      } else if (introProgress > 0) {
        // If any progress, update button to "Continue"
        const button = introTopics.querySelector(".module-btn");
        if (button) {
          button.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
        }
        introTopics.classList.add("active");
      }
    }
    
    // Update overall progress based on all modules
    updateOverallProgress(data);
  }

  // Fallback to localStorage for backward compatibility
  function loadProgressFromLocalStorage() {
    // Debug log to show localStorage status
    console.log("localStorage keys:", {
      attackCompletedSections: JSON.parse(
        localStorage.getItem("attackCompletedSections") || "[]"
      ),
      attackCompletedQuizzes: JSON.parse(
        localStorage.getItem("attackCompletedQuizzes") || "[]"
      ),
      phishingCompletedSections: JSON.parse(
        localStorage.getItem("phishingCompletedSections") || "[]"
      ),
      phishingCompletedQuizzes: JSON.parse(
        localStorage.getItem("phishingCompletedQuizzes") || "[]"
      ),
      introCompletedQuizzes: JSON.parse(
        localStorage.getItem("introCompletedQuizzes") || "[]"
      )
    });

    // Get progress data from localStorage
    const introCompletedQuizzes = JSON.parse(
      localStorage.getItem("introCompletedQuizzes") || "[]"
    );
    const attackCompletedSections = JSON.parse(
      localStorage.getItem("attackCompletedSections") || "[]"
    );
    const attackCompletedQuizzes = JSON.parse(
      localStorage.getItem("attackCompletedQuizzes") || "[]"
    );
    const phishingCompletedSections = JSON.parse(
      localStorage.getItem("phishingCompletedSections") || "[]"
    );
    const phishingCompletedQuizzes = JSON.parse(
      localStorage.getItem("phishingCompletedQuizzes") || "[]"
    );

    // Calculate percentages
    const introTopicsTotal = 5;
    const attackTopicsTotal = 5;
    const phishingTopicsTotal = 4;
    
    const introProgress = Math.round(
      (introCompletedQuizzes.length / introTopicsTotal) * 100
    );
    const attackProgress = Math.round(
      (attackCompletedSections.length / attackTopicsTotal) * 100
    );
    const phishingProgress = Math.round(
      (phishingCompletedSections.length / phishingTopicsTotal) * 100
    );

    // Create a data object similar to Firestore structure
    const progressData = {
      completedModules: 0,
      totalModules: 4,
      completedTopics: introCompletedQuizzes.length + attackCompletedSections.length + phishingCompletedSections.length,
      totalTimeMinutes: 0,
      modules: {
        introCybersec: {
          completedQuizzes: introCompletedQuizzes,
          progressPercentage: introProgress
        },
        attackTargets: {
          completedQuizzes: attackCompletedSections,
          progressPercentage: attackProgress
        },
        phishingAttacks: {
          completedQuizzes: phishingCompletedSections,
          progressPercentage: phishingProgress
        },
        malwareInfections: {
          completedQuizzes: [],
          progressPercentage: 0
        }
      }
    };
    
    // Calculate completed modules
    if (introProgress === 100) progressData.completedModules++;
    if (attackProgress === 100) progressData.completedModules++;
    if (phishingProgress === 100) progressData.completedModules++;
    
    // Calculate overall percentage
    progressData.completionPercentage = Math.round(
      (progressData.completedTopics / (introTopicsTotal + attackTopicsTotal + phishingTopicsTotal)) * 100
    );
    
    // Estimate time spent (15 minutes per topic)
    progressData.totalTimeMinutes = progressData.completedTopics * 15;
    
    // Update UI with this data
    updateUIWithProgressData(progressData);
  }

  // Update the updateOverallProgress function to use the Firestore data structure
  function updateOverallProgress(data) {
    // Extract values from data
    const completedModules = data.completedModules || 0;
    const totalModules = data.totalModules || 4;
    const completedTopics = data.completedTopics || 0;
    const completionPercentage = data.completionPercentage || 0;
    
    // Update modules completed counter
    const moduleCounters = document.querySelectorAll(".progress-stat .stat-number");
    if (moduleCounters && moduleCounters[0]) {
      moduleCounters[0].textContent = completedModules;
    }
    
    // Store in localStorage for backward compatibility
    localStorage.setItem("modulesCompleted", completedModules);

    // Update circular progress
    const progressElement = document.querySelector(".circular-progress");
    if (progressElement) {
      progressElement.style.background = `conic-gradient(var(--cyber-green) ${completionPercentage}%, var(--third-dark) 0)`;
      const progressValue = document.querySelector(".progress-value");
      if (progressValue) {
        progressValue.textContent = `${Math.round(completionPercentage)}%`;
      }
    }
    
    // Store in localStorage for backward compatibility
    localStorage.setItem("userProgress", Math.round(completionPercentage));

    // Unlock intermediate path if beginner path is completed
    if (completedModules >= 3) { // If at least the 3 beginner modules are completed
      const lockedModules = document.querySelectorAll(".module-card.locked");
      lockedModules.forEach((module) => {
        if (
          module.querySelector(".lock-message") &&
          module.querySelector(".lock-message").textContent.includes("Complete Beginner Path First")
        ) {
          module.classList.remove("locked");
          module.querySelector(".lock-message").innerHTML =
            '<i class="fas fa-play-circle"></i> Start Module';
        }
      });
    }

    // Get completed sections for the timeline
    const attackCompletedSections = data.modules?.attackTargets?.completedQuizzes || [];
    const phishingCompletedSections = data.modules?.phishingAttacks?.completedQuizzes || [];
    
    // Update progress timeline
    updateProgressTimeline(attackCompletedSections, phishingCompletedSections);
    
    // Update learning goals if that function exists
    if (typeof updateGoals === "function") {
      updateGoals(attackCompletedSections, phishingCompletedSections);
    }
  }

  // Call once on page load
  updateModuleProgress();

  // Add an event listener to force-refresh progress every few seconds for development
  setTimeout(updateModuleProgress, 1000); // Force refresh progress after 1 second

  // Simulated user activity counter
  let userDaysStreak = 21;
  let modulesCompleted = 7;
  let userProgress = 25;

  // Update these values from localStorage if they exist
  if (localStorage.getItem("userDaysStreak")) {
    userDaysStreak = parseInt(localStorage.getItem("userDaysStreak"));
    document.querySelectorAll(".progress-stat .stat-number")[1].textContent =
      userDaysStreak;
  }

  if (localStorage.getItem("modulesCompleted")) {
    modulesCompleted = parseInt(localStorage.getItem("modulesCompleted"));
    document.querySelectorAll(".progress-stat .stat-number")[0].textContent =
      modulesCompleted;
  }

  if (localStorage.getItem("userProgress")) {
    userProgress = parseInt(localStorage.getItem("userProgress"));
    const progressElement = document.querySelector(".circular-progress");
    progressElement.style.background = `conic-gradient(var(--cyber-green) ${userProgress}%, var(--third-dark) 0)`;
    document.querySelector(".progress-value").textContent = userProgress + "%";
  }

  // Event listener for CTA button with glitch effect
  const ctaBtn = document.querySelector(".primary-btn");
  if (ctaBtn) {
    ctaBtn.addEventListener("mouseenter", () => {
      ctaBtn.querySelector(".btn-glitch").style.opacity = "1";
    });

    ctaBtn.addEventListener("mouseleave", () => {
      ctaBtn.querySelector(".btn-glitch").style.opacity = "0.5";
    });
  }

  // Function to create glitch text effect
  function setupGlitchEffect() {
    const glitchTexts = document.querySelectorAll(".glitch, .sub-glitch");

    glitchTexts.forEach((text) => {
      text.addEventListener("mouseenter", () => {
        text.classList.add("glitching");
        setTimeout(() => {
          text.classList.remove("glitching");
        }, 1000);
      });
    });
  }

  setupGlitchEffect();

  // Add refresh progress button functionality
  const refreshProgressBtn = document.getElementById("refresh-progress");
  if (refreshProgressBtn) {
    refreshProgressBtn.addEventListener("click", () => {
      // First, clear console
      console.clear();

      // Force reset for debugging
      if (event.shiftKey) {
        const reset = confirm(
          "RESET ALL PROGRESS DATA? (This will clear all localStorage progress)"
        );
        if (reset) {
          localStorage.removeItem("attackCompletedSections");
          localStorage.removeItem("attackCompletedQuizzes");
          localStorage.removeItem("phishingCompletedSections");
          localStorage.removeItem("phishingCompletedQuizzes");
          console.log("All progress data cleared!");

          // Force recreate test data
          if (confirm("Create test data for both modules?")) {
            localStorage.setItem(
              "attackCompletedSections",
              JSON.stringify(["individuals", "businesses"])
            );
            localStorage.setItem(
              "attackCompletedQuizzes",
              JSON.stringify(["individuals", "businesses"])
            );
            localStorage.setItem(
              "phishingCompletedSections",
              JSON.stringify(["techniques", "types"])
            );
            localStorage.setItem(
              "phishingCompletedQuizzes",
              JSON.stringify(["techniques", "types"])
            );
            console.log("Test data created successfully!");
          }
        }
      }

      updateModuleProgress();
      console.log("Progress refreshed manually");
      console.log("localStorage keys:", {
        attackCompletedSections: JSON.parse(
          localStorage.getItem("attackCompletedSections") || "[]"
        ),
        attackCompletedQuizzes: JSON.parse(
          localStorage.getItem("attackCompletedQuizzes") || "[]"
        ),
        phishingCompletedSections: JSON.parse(
          localStorage.getItem("phishingCompletedSections") || "[]"
        ),
        phishingCompletedQuizzes: JSON.parse(
          localStorage.getItem("phishingCompletedQuizzes") || "[]"
        ),
      });

      // Visual feedback
      refreshProgressBtn.style.opacity = "1";
      setTimeout(() => {
        refreshProgressBtn.style.opacity = "0.7";
      }, 300);
    });
  }
});

// Logout function
function logout() {
  // Clear localStorage
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isLoggedIn");

  // Sign out from Firebase if available
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("User signed out from Firebase");
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  } else {
    // Redirect to home page
    window.location.href = "index.html";
  }
}
