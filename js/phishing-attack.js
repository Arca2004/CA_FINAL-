// GLOBAL STATE (move to top for reliability)
let completedSections = [];
let completedQuizzes = [];
let topicOrder = [
  // Will be dynamically built on DOMContentLoaded
];

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded event fired - phishing-attack.js loaded");
  
  // Dynamically build topicOrder from all .target-card[data-target] that contain a .topic-quiz
  topicOrder = Array.from(document.querySelectorAll('.target-card[data-target]'))
    .filter(card => card.querySelector('.topic-quiz'))
    .map(card => card.getAttribute('data-target'));
  
  // Attach reset progress button handler immediately to avoid being overridden
  const resetProgressBtn = document.getElementById("reset-progress");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", function() {
      console.log("[DEBUG] Reset Progress button clicked");
      if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
        completedQuizzes = [];
        completedSections = [];
        // Save to Firebase if user ID is available
        let userId = null;
        // First try to get UID from Firebase auth
        if (firebase && firebase.auth && firebase.auth().currentUser) {
          userId = firebase.auth().currentUser.uid;
        }
        // Fallback to localStorage if Firebase auth is not available
        else {
          const localUser = JSON.parse(localStorage.getItem("currentUser"));
          if (localUser && localUser.uid) {
            userId = localUser.uid;
          }
        }
        if (userId) {
          // Save reset progress to Firebase
          saveProgressToFirebase();
          // Also clear the celebrated flag in Firebase if present
          if (firebase && firebase.database) {
            firebase.database().ref(`userProgress/${userId}/modules/phishingAttacks`).update({
              celebrated: false
            });
          }
        } else {
          // Save to localStorage as backup
          localStorage.setItem("phishingCompletedQuizzes", JSON.stringify(completedQuizzes));
          localStorage.setItem("phishingCompletedSections", JSON.stringify(completedSections));
        }
        // Clear the celebration flag so it can show again after re-completion
        localStorage.removeItem('phishingAttackCelebrated');
        // Hide celebration modal if open
        const celebrationContainer = document.querySelector('.celebration-container');
        if (celebrationContainer && celebrationContainer.classList.contains('active')) {
          celebrationContainer.classList.remove('active');
          setTimeout(() => {
            document.querySelectorAll('.confetti').forEach((el) => el.remove());
          }, 500);
        }
        // Remove navigation section if present
        const content = celebrationContainer ? celebrationContainer.querySelector('.celebration-content') : null;
        if (content) {
          const nav = content.querySelector('.lesson-navigation');
          if (nav) nav.remove();
        }
        updateTopicAccessibility();
        updateProgress();
        // Re-enable all quiz buttons
        document.querySelectorAll(".topic-quiz-btn").forEach(btn => {
          btn.textContent = "Check Answer";
          btn.classList.remove("success");
          btn.disabled = false;
        });
        // Reset all options
        document.querySelectorAll(".option").forEach(opt => {
          opt.classList.remove("selected", "correct", "incorrect");
        });
        // Hide all results
        document.querySelectorAll(".topic-quiz-results").forEach(res => {
          res.style.display = "none";
        });
        // Show notification
        const container = document.querySelector(".container");
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.textContent = "Progress reset successfully!";
        container.insertBefore(notification, container.firstChild);
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
    });
  }
  
  // Immediately fix all clickable elements
  setTimeout(fixAllInteractions, 100);
  
  // Elements for profile dropdown
  const authNavItem = document.getElementById("auth-nav-item");
  const loginLink = document.getElementById("login-link");
  const profileContainer = document.getElementById("profile-container");
  const profileAvatar = document.getElementById("profile-avatar");
  const profileInitial = document.getElementById("profile-initial");
  const profileName = document.getElementById("profile-name");
  const logoutBtn = document.getElementById("logout-btn");

  // Setup logout button event listener with direct onclick
  if (logoutBtn) {
    logoutBtn.onclick = function(e) {
      e.preventDefault();
      logout();
    };
  }
  
  // Fix profile dropdown interaction - use direct onclick for reliability
  if (profileContainer) {
    profileContainer.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = this.querySelector(".profile-dropdown");
      if (dropdown) {
        if (dropdown.style.display === "block") {
          dropdown.style.display = "none";
        } else {
          dropdown.style.display = "block";
        }
      }
    };
    
    // Close dropdown when clicking outside
    document.addEventListener("click", function(e) {
      const dropdown = document.querySelector(".profile-dropdown");
      if (dropdown && dropdown.style.display === "block") {
        dropdown.style.display = "none";
      }
    });
  }

  // Function that fixes all interactions on the page
  function fixAllInteractions() {
    console.log("Fixing all interactions");
    
    // Fix attack item expansion
    document.querySelectorAll(".attack-item").forEach(item => {
      item.style.pointerEvents = "auto";
      item.style.cursor = "pointer";
      
      item.onclick = function() {
        this.classList.toggle("expanded");
        console.log("Attack item clicked, expanded:", this.classList.contains("expanded"));
      };
    });
    
    // Fix quiz options with direct onclick handlers for maximum reliability
    document.querySelectorAll(".topic-quiz .option").forEach(option => {
      option.style.pointerEvents = "auto !important";
      option.style.cursor = "pointer !important";
      
      // Direct property assignment is more reliable than addEventListener
      option.onclick = function(e) {
        e.stopPropagation();
        console.log("Quiz option clicked");
        const questionDiv = this.closest(".question");
        
        // Deselect all options
        questionDiv.querySelectorAll(".option").forEach(opt => {
          opt.classList.remove("selected", "incorrect");
        });
        
        // Select this option
        this.classList.add("selected");
        
        // Reset any previous quiz results
        const quizContainer = this.closest(".topic-quiz");
        const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
        const quizBtn = quizContainer.querySelector(".topic-quiz-btn");
        
        if (resultsDiv) resultsDiv.style.display = "none";
        if (quizBtn && quizBtn.textContent === "Try Again") {
          quizBtn.textContent = "Check Answer";
        }
      };
    });
    
    // Fix quiz buttons with direct onclick handlers
    document.querySelectorAll(".topic-quiz-btn").forEach(button => {
      button.style.pointerEvents = "auto !important";
      button.style.cursor = "pointer !important";
      
      // Direct property assignment is more reliable
      button.onclick = function(e) {
        e.stopPropagation();
        console.log("Quiz button clicked");
        
        const quizContainer = this.closest(".topic-quiz");
        const targetId = this.closest(".target-card").getAttribute("data-target");
        const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
        const correctAnswer = quizContainer.querySelector(".correct-answer");
        const incorrectAnswer = quizContainer.querySelector(".incorrect-answer");
        const selectedOption = quizContainer.querySelector(".option.selected");
        
        if (!selectedOption) {
          alert("Please select an answer first.");
          return;
        }
        
        // Hide both result texts
        if (correctAnswer) correctAnswer.style.display = "none";
        if (incorrectAnswer) incorrectAnswer.style.display = "none";
        
        // Show results container
        if (resultsDiv) resultsDiv.style.display = "block";
        
        if (selectedOption.getAttribute("data-correct") === "true") {
          // Correct answer
          if (correctAnswer) correctAnswer.style.display = "block";
          selectedOption.classList.add("correct");
          this.textContent = "Correct!";
          this.classList.add("success");
          this.disabled = true;
          
          // Mark as completed
          if (!completedQuizzes.includes(targetId)) {
            completedQuizzes.push(targetId);
            // Also mark the section as completed when quiz is completed
            if (!completedSections.includes(targetId)) {
              completedSections.push(targetId);
            }
            saveProgressToFirebase();
            updateProgress();
            updateTopicAccessibility();
            // Unlock the next topic visually (remove lock overlay, enable pointer events)
            const nextIndex = topicOrder.indexOf(targetId) + 1;
            if (nextIndex < topicOrder.length) {
              const nextTopic = topicOrder[nextIndex];
              const nextCard = document.querySelector(`.target-card[data-target="${nextTopic}"]`);
              if (nextCard) {
                nextCard.classList.add("accessible");
                // Hide debug lock overlay if present
                const debugLockOverlay = nextCard.querySelector(".debug-lock-overlay");
                if (debugLockOverlay) debugLockOverlay.style.display = "none";
                // Enable pointer events
                nextCard.querySelectorAll(".attack-item, .topic-quiz .option, .topic-quiz-btn").forEach(el => {
                  el.style.pointerEvents = "auto";
                });
                nextCard.style.filter = "none";
                nextCard.style.pointerEvents = "auto";
              }
            }
          }
        } else {
          // Incorrect answer
          if (incorrectAnswer) incorrectAnswer.style.display = "block";
          selectedOption.classList.add("incorrect");
          selectedOption.classList.add("shake-animation");
          this.textContent = "Try Again";
          
          setTimeout(() => {
            selectedOption.classList.remove("shake-animation");
          }, 800);
        }
      };
    });
  }

  // Call fixAllInteractions after progress is loaded
  loadUserProgress();

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
  if (firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in with Firebase
        if (loginLink) loginLink.style.display = "none";
        if (profileContainer) profileContainer.style.display = "block";
        if (profileInitial) profileInitial.textContent = getUserInitial(user);
        if (profileName) profileName.textContent = "";

        // Store in localStorage for backward compatibility
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            username: user.email,
            fullname: user.displayName || "Cyber Academy User",
            initial: getUserInitial(user),
            uid: user.uid // Store UID for database lookups
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
          if (profileName) profileName.textContent = "";
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
      if (profileName) profileName.textContent = "";
    } else {
      if (loginLink) loginLink.style.display = "block";
      if (profileContainer) profileContainer.style.display = "none";
    }
  }

  // Load progress data from Firebase when the page loads
  loadUserProgress();
  
  // Ensure quiz functionality works
  setTimeout(() => {
    ensureQuizFunctionalityWorks();
  }, 500);
  
  // Multiple calls to fix interactions for reliability
  setTimeout(fixAllInteractions, 1000);
  setTimeout(fixAllInteractions, 2000);

  // Check if user is logged in with Firebase
  function checkUserLoggedIn() {
    // Always return true to enable quiz functionality regardless of login status
    return true;
  }

  // Function to load progress data from Firebase Realtime Database
  function loadUserProgress() {
    console.log("[DEBUG] Loading phishing attacks progress from Firebase");
    
    // Check if user is logged in with Firebase
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      const userId = firebase.auth().currentUser.uid;
      console.log("[DEBUG] Loading progress for Firebase user:", userId);
      
      if (firebase.database) {
        // Load progress from Realtime Database
        loadUserProgress(userId);
      } else {
        console.error("[DEBUG] Firebase Database is not available");
        
        // Fallback to localStorage
        const localSections = JSON.parse(localStorage.getItem("phishingCompletedSections")) || [];
        const localQuizzes = JSON.parse(localStorage.getItem("phishingCompletedQuizzes")) || [];
        
        // Prefer quizzes over sections if both exist
        if (localQuizzes.length > 0) {
          completedQuizzes = localQuizzes;
        } else {
          completedQuizzes = localSections;
        }
        
        completedSections = localSections.length > 0 ? localSections : [...completedQuizzes];
        
        initializeProgressUI();
        updateProgress();
        updateTopicAccessibility();
      }
    } else {
      // Check localStorage for user ID
      const localUser = JSON.parse(localStorage.getItem("currentUser"));
      if (localUser && localUser.uid && firebase && firebase.database) {
        console.log("[DEBUG] Loading progress using localStorage UID:", localUser.uid);
        
        // Load progress from Realtime Database using localStorage UID
        loadUserProgress(localUser.uid);
      } else {
        // Fallback to localStorage if no Firebase or user ID
        console.log("[DEBUG] No user ID available, using localStorage only");
        const localSections = JSON.parse(localStorage.getItem("phishingCompletedSections")) || [];
        const localQuizzes = JSON.parse(localStorage.getItem("phishingCompletedQuizzes")) || [];
        
        // Prefer quizzes over sections if both exist
        if (localQuizzes.length > 0) {
          completedQuizzes = localQuizzes;
        } else {
          completedQuizzes = localSections;
        }
        
        completedSections = localSections.length > 0 ? localSections : [...completedQuizzes];
        
        initializeProgressUI();
        updateProgress();
        updateTopicAccessibility();
      }
    }
  }

  // Function to save progress data to Firebase Realtime Database
  function saveProgressToFirebase() {
    console.log("[DEBUG] Saving phishing attacks progress to Firebase");
    
    // Save to localStorage as backup
    localStorage.setItem("phishingCompletedSections", JSON.stringify(completedSections));
    localStorage.setItem("phishingCompletedQuizzes", JSON.stringify(completedQuizzes));
    
    // Check if user is logged in with Firebase
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      const userId = firebase.auth().currentUser.uid;
      
      if (firebase.database) {
        // Calculate progress percentage
        const totalTopics = topicOrder.length;
        const progressPercentage = Math.round((completedQuizzes.length / totalTopics) * 100);
        
        // Save to Realtime Database
        firebase.database().ref(`userProgress/${userId}/modules/phishingAttacks`).update({
          completedSections: completedSections,
          completedQuizzes: completedQuizzes,
          progressPercentage: progressPercentage,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        })
        .then(() => {
          console.log("[DEBUG] Progress saved successfully to Firebase");
          updateOverallProgress(userId);
        })
        .catch(error => {
          console.error("[DEBUG] Error saving progress to Firebase:", error);
        });
      }
    } else {
      // Try to use user ID from localStorage
      const localUser = JSON.parse(localStorage.getItem("currentUser"));
      if (localUser && localUser.uid && firebase.database) {
        const userId = localUser.uid;
        
        // Calculate progress percentage
        const totalTopics = topicOrder.length;
        const progressPercentage = Math.round((completedQuizzes.length / totalTopics) * 100);
        
        // Save to Realtime Database using localStorage UID
        firebase.database().ref(`userProgress/${userId}/modules/phishingAttacks`).update({
          completedSections: completedSections,
          completedQuizzes: completedQuizzes,
          progressPercentage: progressPercentage,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        })
        .then(() => {
          console.log("[DEBUG] Progress saved successfully using localStorage UID");
          updateOverallProgress(userId);
        })
        .catch(error => {
          console.error("[DEBUG] Error saving progress with localStorage UID:", error);
        });
      }
    }
  }

  // Function to update overall user progress
  function updateOverallProgress(userId) {
    if (!firebase.database || !userId) return;
    
    // Get a reference to the user's progress
    const userProgressRef = firebase.database().ref(`userProgress/${userId}`);
    
    // Get all module data to calculate overall progress
    userProgressRef.once('value')
      .then((snapshot) => {
        const data = snapshot.val() || {};
        const modules = data.modules || {};
        
        // Count completed topics across all modules
        let completedTopics = 0;
        let totalTopics = 0;
        
        // Check each module for completed topics
        if (modules.introCybersec) {
          completedTopics += (modules.introCybersec.completedQuizzes || []).length;
          totalTopics += 5; // Intro has 5 topics
        }
        
        if (modules.attackTargets) {
          completedTopics += (modules.attackTargets.completedQuizzes || []).length;
          totalTopics += 5; // Attack Targets has 5 topics
        }
        
        if (modules.phishingAttacks) {
          completedTopics += (modules.phishingAttacks.completedQuizzes || []).length;
          totalTopics += 4; // Phishing has 4 topics
        }
        
        if (modules.malwareInfections) {
          completedTopics += (modules.malwareInfections.completedQuizzes || []).length;
          totalTopics += 5; // Malware has 5 topics
        }
        
        // Calculate completed modules (a module is complete if progress is 100%)
        let completedModules = 0;
        if (modules.introCybersec && modules.introCybersec.progressPercentage === 100) completedModules++;
        if (modules.attackTargets && modules.attackTargets.progressPercentage === 100) completedModules++;
        if (modules.phishingAttacks && modules.phishingAttacks.progressPercentage === 100) completedModules++;
        if (modules.malwareInfections && modules.malwareInfections.progressPercentage === 100) completedModules++;
        
        // Calculate overall completion percentage
        const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        
        // Estimate time spent (15 minutes per completed topic)
        const totalTimeMinutes = completedTopics * 15;
        
        // Update the overall progress metrics
        userProgressRef.update({
          completedModules,
          totalModules: 4, // Total number of modules in the platform
          completedTopics,
          totalTopics,
          completionPercentage,
          totalTimeMinutes,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        })
        .then(() => {
          console.log("[DEBUG] Overall progress updated successfully");
        })
        .catch(error => {
          console.error("[DEBUG] Error updating overall progress:", error);
        });
      })
      .catch(error => {
        console.error("[DEBUG] Error calculating overall progress:", error);
      });
  }

  // Function to force refresh progress indicators
  function refreshProgressIndicators() {
    // Force repaint of progress bar
    const progressBar = document.getElementById("module-progress");
    if (progressBar) {
      // Calculate progress percentage
      const progressPercentage = (completedQuizzes.length / topicOrder.length) * 100;
      
      // Record the current width
      progressBar.style.width = `${progressPercentage}%`;
      
      // Force browser to acknowledge the change
      void progressBar.offsetWidth;
    }
    
    // Force repaints of progress nodes
    document.querySelectorAll(".progress-node").forEach(node => {
      void node.offsetWidth;
    });
    
    // Force repaints of progress lines
    document.querySelectorAll(".progress-line").forEach(line => {
      void line.offsetWidth;
    });
    
    // Call fixAllInteractions to ensure all interactive elements work
    setTimeout(fixAllInteractions, 100);
  }

  // Function to ensure quiz functionality works properly
  function ensureQuizFunctionalityWorks() {
    console.log("Ensuring quiz functionality works");
    
    // Make sure all quiz options in the first section are clickable
    const techniquesTopic = document.querySelector('.target-card[data-target="techniques"]');
    if (techniquesTopic) {
      console.log("Making techniques topic clickable");
      techniquesTopic.querySelectorAll(".topic-quiz .option").forEach(element => {
        element.style.pointerEvents = "auto";
        // Force enable interaction
        element.style.cursor = "pointer";
        element.style.opacity = "1";
      });
      
      // Make the button clickable too
      const quizBtn = techniquesTopic.querySelector(".topic-quiz-btn");
      if (quizBtn) {
        quizBtn.style.pointerEvents = "auto";
        quizBtn.style.cursor = "pointer";
        quizBtn.style.opacity = "1";
      }
    }
    
    // Force all options to have click functionality
    document.querySelectorAll(".topic-quiz .option").forEach(option => {
      // Remove any potential pointer-events: none
      option.style.pointerEvents = "auto";
      
      // Add a styled class to mark as clickable
      option.classList.add("force-clickable");
      
      // Set style properties with !important (via inline style)
      option.setAttribute("style", "pointer-events: auto !important; cursor: pointer !important;");
      
      // Ensure click functionality works by removing and reattaching
      option.onclick = function(e) {
        e.stopPropagation(); // Prevent event bubbling
        console.log("Quiz option clicked (direct onclick)", this);
        
        // Clear selection of other options in this question
        const questionDiv = this.closest(".question");
        questionDiv.querySelectorAll(".option").forEach(opt => {
          opt.classList.remove("selected", "incorrect");
        });
        
        // Mark this option as selected
        this.classList.add("selected");
        
        // Reset any previous quiz results
        const quizContainer = this.closest(".topic-quiz");
        const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
        const quizBtn = quizContainer.querySelector(".topic-quiz-btn");
        
        if (resultsDiv) resultsDiv.style.display = "none";
        if (quizBtn && quizBtn.textContent === "Try Again") {
          quizBtn.textContent = "Check Answer";
        }
      };
    });
    
    // Force quiz buttons to have click functionality
    document.querySelectorAll(".topic-quiz-btn").forEach(button => {
      button.style.pointerEvents = "auto";
      button.style.cursor = "pointer";
      
      // Add a styled class to mark as clickable
      button.classList.add("force-clickable");
      
      // Set style properties with !important (via inline style)
      button.setAttribute("style", "pointer-events: auto !important; cursor: pointer !important;");
      
      button.onclick = function(e) {
        e.stopPropagation(); // Prevent event bubbling
        console.log("Quiz button clicked (direct onclick)");
        
        const quizContainer = this.closest(".topic-quiz");
        const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
        const correctAnswer = quizContainer.querySelector(".correct-answer");
        const incorrectAnswer = quizContainer.querySelector(".incorrect-answer");
        const selectedOption = quizContainer.querySelector(".option.selected");
        const targetId = this.closest(".target-card").getAttribute("data-target");
        
        console.log("Quiz button check", {
          targetId,
          selectedOption: selectedOption ? true : false
        });
        
        // Must select an option first
        if (!selectedOption) {
          alert("Please select an answer first.");
          return;
        }
        
        // Reset result display
        if (correctAnswer) correctAnswer.style.display = "none";
        if (incorrectAnswer) incorrectAnswer.style.display = "none";
        
        // Show result
        if (resultsDiv) resultsDiv.style.display = "block";
        
        // Check if the selected answer is correct
        if (selectedOption.getAttribute("data-correct") === "true") {
          // Correct answer
          if (correctAnswer) correctAnswer.style.display = "block";
          selectedOption.classList.add("correct");
          
          // Mark as complete
          if (!completedQuizzes.includes(targetId)) {
            completedQuizzes.push(targetId);
            updateProgress();
            updateTopicAccessibility();
            saveProgressToFirebase();
          }
          
          // Update button
          this.textContent = "Correct!";
          this.classList.add("success");
          this.disabled = true;
        } else {
          // Incorrect answer
          if (incorrectAnswer) incorrectAnswer.style.display = "block";
          selectedOption.classList.add("incorrect");
          selectedOption.classList.add("shake-animation");
          this.textContent = "Try Again";
          
          // Remove shake animation after a while
          setTimeout(() => {
            selectedOption.classList.remove("shake-animation");
          }, 800);
        }
      };
    });
    
    // Fix profile dropdown in case it's not working
    const profileContainer = document.getElementById("profile-container");
    if (profileContainer) {
      profileContainer.style.cursor = "pointer";
      profileContainer.style.pointerEvents = "auto";
      
      // Set onclick directly for maximum reliability
      profileContainer.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Profile container clicked");
        
        const dropdown = this.querySelector(".profile-dropdown");
        if (dropdown) {
          if (dropdown.style.display === "block") {
            dropdown.style.display = "none";
          } else {
            dropdown.style.display = "block";
          }
        }
      };
    }
  }

  function initializeProgressUI() {
    // Only show progress for logged in users
    if (!checkUserLoggedIn()) {
      // Reset all progress UI elements to initial state
      document.querySelectorAll(".target-card").forEach((card) => {
        card.classList.remove("completed");
      });

      document.querySelectorAll(".complete-btn").forEach((button) => {
        button.textContent = "Mark as Complete";
        button.disabled = false;
      });

      document.querySelectorAll(".topic-quiz-btn").forEach((button) => {
        button.textContent = "Check Answer";
        button.classList.remove("success");
        button.disabled = false;
      });

      document.querySelectorAll(".topic-quiz-results").forEach((result) => {
        result.style.display = "none";
      });

      document.querySelectorAll(".option").forEach((option) => {
        option.classList.remove("selected", "correct", "incorrect");
      });

      // Reset progress bar
      const progressBar = document.getElementById("module-progress");
      if (progressBar) {
        progressBar.style.width = "0%";
      }

      return;
    }

    console.log("[DEBUG] Initializing progress UI with completedQuizzes:", completedQuizzes);
    
    // Update completed sections (for backward compatibility)
    completedSections.forEach((targetId) => {
      const card = document.querySelector(`.target-card[data-target="${targetId}"]`);
      if (card) {
        card.classList.add("completed");
      }

      document
        .querySelectorAll(`.complete-btn[data-target="${targetId}"]`)
        .forEach((button) => {
          button.textContent = "Completed";
          button.disabled = true;
        });
    });

    // Update completed quizzes (primary progress tracking)
    completedQuizzes.forEach((targetId) => {
      const card = document.querySelector(`.target-card[data-target="${targetId}"]`);
      if (card) {
        card.classList.add("completed");
        // --- Ensure completed topics are always accessible ---
        card.classList.remove("locked");
        card.classList.add("accessible");
        // Hide lock overlays if present
        const debugLockOverlay = card.querySelector(".debug-lock-overlay");
        if (debugLockOverlay) debugLockOverlay.style.display = "none";
        const lockOverlay = card.querySelector(".lock-overlay");
        if (lockOverlay) lockOverlay.style.display = "none";
        // Enable pointer events on all interactive elements
        card.querySelectorAll(".attack-item, .topic-quiz .option, .complete-btn, .topic-quiz-btn").forEach(el => {
          el.style.pointerEvents = "auto";
        });
        card.style.filter = "none";
        card.style.pointerEvents = "auto";
        // --- End ensure accessible ---
        
        const quizContainer = card.querySelector(".topic-quiz");
        if (quizContainer) {
          const quizBtn = quizContainer.querySelector(".topic-quiz-btn");
          const correctOption = quizContainer.querySelector('.option[data-correct="true"]');
          const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
          const correctAnswer = quizContainer.querySelector(".correct-answer");

          if (quizBtn && correctOption && resultsDiv && correctAnswer) {
            correctOption.classList.add("selected", "correct");
            resultsDiv.style.display = "block";
            correctAnswer.style.display = "block";
            quizBtn.textContent = "Correct!";
            quizBtn.classList.add("success");
            quizBtn.disabled = true;
          }
        }
      }
    });

    // Make sure options in the first topic (techniques) are always clickable
    const firstTopicCard = document.querySelector('.target-card[data-target="techniques"]');
    if (firstTopicCard) {
      firstTopicCard
        .querySelectorAll(".topic-quiz .option, .topic-quiz-btn")
        .forEach((element) => {
          element.style.pointerEvents = "auto";
        });
    }

    // Update progress bar
    updateProgress();
    
    // Update progress nodes
    updateProgressNodes();
    
    // Update topic accessibility
    updateTopicAccessibility();
    
    // Make sure quiz functionality works after initializing progress UI
    setTimeout(() => {
      ensureQuizFunctionalityWorks();
    }, 100);

    // At the end of the function, call fixAllInteractions
    setTimeout(fixAllInteractions, 200);
  }

  // Function to determine if a topic should be accessible
  function isTopicAccessible(topicId) {
    const topicIndex = topicOrder.indexOf(topicId);

    // First topic is always accessible
    if (topicIndex === 0) return true;

    // For any other topic, the previous topic must be completed
    const previousTopicId = topicOrder[topicIndex - 1];
    return completedQuizzes.includes(previousTopicId);
  }

  // Update the visual state of all topics based on accessibility
  function updateTopicAccessibility() {
    topicOrder.forEach((topicId, index) => {
      const topicCard = document.querySelector(
        `.target-card[data-target="${topicId}"]`
      );
      if (!topicCard) return;

      const isAccessible = isTopicAccessible(topicId);

      // Update the progress tracker nodes
      const progressNode = document.querySelector(
        `.progress-node[data-topic="${topicId}"]`
      );
      if (progressNode) {
        progressNode.classList.remove("active", "completed", "locked");

        const baseTooltip = progressNode.getAttribute("data-tooltip");

        if (completedQuizzes.includes(topicId)) {
          progressNode.classList.add("completed");
          progressNode.setAttribute(
            "data-tooltip",
            `${baseTooltip} - Completed ✓`
          );
        } else if (isAccessible) {
          progressNode.classList.add("active");
          progressNode.setAttribute(
            "data-tooltip",
            `${baseTooltip} - In Progress`
          );
        } else {
          progressNode.classList.add("locked");
          const prevTopicName =
            index > 0
              ? topicOrder[index - 1].charAt(0).toUpperCase() +
                topicOrder[index - 1].slice(1)
              : "";
          progressNode.setAttribute(
            "data-tooltip",
            `${baseTooltip} - Locked (Complete ${prevTopicName} first)`
          );
        }
      }

      // Update progress tracker lines
      if (index > 0) {
        const prevTopicId = topicOrder[index - 1];
        const progressLine = progressNode?.previousElementSibling;

        if (progressLine && progressLine.classList.contains("progress-line")) {
          progressLine.classList.toggle(
            "completed",
            completedQuizzes.includes(prevTopicId)
          );
        }
      }

      // Handle hardcoded debug-lock-overlay in the HTML
      const debugLockOverlay = topicCard.querySelector(".debug-lock-overlay");
      if (debugLockOverlay) {
        if (isAccessible) {
          // Hide the hardcoded lock overlay when the topic becomes accessible
          debugLockOverlay.style.display = "none";

          // Make sure all interactive elements in this card are clickable
          topicCard
            .querySelectorAll(
              ".attack-item, .topic-quiz .option, .complete-btn, .topic-quiz-btn"
            )
            .forEach((element) => {
              element.style.pointerEvents = "auto";
            });

          // Remove any grayscale filter from the card
          topicCard.style.filter = "none";
          topicCard.style.pointerEvents = "auto";
        } else {
          // Show the hardcoded lock overlay when the topic is not accessible
          debugLockOverlay.style.display = "flex";
        }
      }

      if (!isAccessible && !topicCard.classList.contains("locked")) {
        // Lock the topic
        topicCard.classList.add("locked");

        // Add lock overlay if not already present and there's no debug lock overlay
        if (
          !topicCard.querySelector(".lock-overlay") &&
          !topicCard.querySelector(".debug-lock-overlay")
        ) {
          const lockOverlay = document.createElement("div");
          lockOverlay.className = "lock-overlay";

          const lockIcon = document.createElement("i");
          lockIcon.className = "fas fa-lock";
          lockOverlay.appendChild(lockIcon);

          const lockMessage = document.createElement("p");
          lockMessage.className = "lock-message";
          lockMessage.textContent = `Complete "${
            index > 0
              ? topicOrder[index - 1].charAt(0).toUpperCase() +
                topicOrder[index - 1].slice(1)
              : ""
          }" to unlock`;
          lockOverlay.appendChild(lockMessage);

          topicCard.appendChild(lockOverlay);

          // Disable all interactive elements in locked topics
          topicCard
            .querySelectorAll(
              ".attack-item, .topic-quiz .option, .complete-btn, .topic-quiz-btn"
            )
            .forEach((element) => {
              element.style.pointerEvents = "none";
            });
        }
      } else if (isAccessible && topicCard.classList.contains("locked")) {
        // Unlock the topic
        topicCard.classList.remove("locked");

        // Remove lock overlay
        const lockOverlay = topicCard.querySelector(".lock-overlay");
        if (lockOverlay) {
          lockOverlay.remove();
        }

        // Re-enable all interactive elements
        topicCard
          .querySelectorAll(
            ".attack-item, .topic-quiz .option, .complete-btn, .topic-quiz-btn"
          )
          .forEach((element) => {
            element.style.pointerEvents = "auto";
          });
      }
    });

    // Ensure first topic quiz options are always clickable
    const firstTopicCard = document.querySelector(
      '.target-card[data-target="techniques"]'
    );
    if (firstTopicCard) {
      firstTopicCard
        .querySelectorAll(".topic-quiz .option, .topic-quiz-btn")
        .forEach((element) => {
          element.style.pointerEvents = "auto";
        });
    }
    
    // Ensure quiz functionality works after updating accessibility
    setTimeout(() => {
      ensureQuizFunctionalityWorks();
    }, 100);

    // At the end of the function, make sure to call fixAllInteractions
    setTimeout(fixAllInteractions, 100);
  }

  initializeProgressUI();

  document.querySelectorAll(".complete-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      const targetId = this.getAttribute("data-target");

      // Only allow completion if the topic is accessible
      if (isTopicAccessible(targetId)) {
        markAsComplete(targetId);
      }
    });
  });

  document.querySelectorAll(".topic-quiz-btn").forEach((button) => {
    button.addEventListener("click", function () {
      console.log("Quiz button clicked");
      const quizContainer = this.closest(".topic-quiz");
      const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
      const correctAnswer = quizContainer.querySelector(".correct-answer");
      const incorrectAnswer = quizContainer.querySelector(".incorrect-answer");
      const selectedOption = quizContainer.querySelector(".option.selected");
      const targetId = this.closest(".target-card").getAttribute("data-target");
      
      console.log("Selected option:", selectedOption);
      console.log("Target ID:", targetId);
      console.log("Topic accessible:", isTopicAccessible(targetId));

      // Check if the topic is accessible
      if (!isTopicAccessible(targetId)) {
        return;
      }

      if (completedQuizzes.includes(targetId) && this.disabled) {
        return;
      }

      correctAnswer.style.display = "none";
      incorrectAnswer.style.display = "none";

      if (selectedOption) {
        resultsDiv.style.display = "block";

        if (selectedOption.getAttribute("data-correct") === "true") {
          correctAnswer.style.display = "block";

          if (!completedQuizzes.includes(targetId)) {
            completedQuizzes.push(targetId);
            // Also mark the section as completed when quiz is completed
            if (!completedSections.includes(targetId)) {
              completedSections.push(targetId);
            }
            // Save progress to Firebase and localStorage
            saveProgressToFirebase();
            // Update UI
            updateProgress();
            updateTopicAccessibility();
            setTimeout(() => {
              updateProgress();
              refreshProgressIndicators();
            }, 500);
          }

          this.textContent = "Correct!";
          this.classList.add("success");
          this.disabled = true;
          selectedOption.classList.add("correct");
        } else {
          incorrectAnswer.style.display = "block";
          this.textContent = "Try Again";
          selectedOption.classList.add("incorrect");
          selectedOption.classList.add("shake-animation");
          setTimeout(() => {
            selectedOption.classList.remove("shake-animation");
          }, 800);
        }
      } else {
        alert("Please select an answer first.");
      }
    });
  });

  document.querySelectorAll(".topic-quiz .option").forEach((option) => {
    option.addEventListener("click", function () {
      console.log("Quiz option clicked");
      const targetId = this.closest(".target-card").getAttribute("data-target");
      console.log("Option in target:", targetId);

      // Check if the topic is accessible
      if (!isTopicAccessible(targetId)) {
        return;
      }

      // Make sure all quiz options in the first (techniques) section have pointer-events set to auto
      if (targetId === "techniques") {
        const topicCard = this.closest(".target-card");
        topicCard.querySelectorAll(".topic-quiz .option").forEach((opt) => {
          opt.style.pointerEvents = "auto";
        });
      }

      const questionDiv = this.closest(".question");
      const options = questionDiv.querySelectorAll(".option");

      options.forEach((opt) => {
        opt.classList.remove("selected");
        opt.classList.remove("incorrect");
        opt.classList.remove("shake-animation");
      });

      this.classList.add("selected");

      const quizContainer = this.closest(".topic-quiz");
      const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
      const quizButton = quizContainer.querySelector(".topic-quiz-btn");

      if (quizButton.textContent === "Try Again") {
        resultsDiv.style.display = "none";
        quizButton.textContent = "Check Answer";
      }
    });
  });

  const attackItems = document.querySelectorAll(".attack-item");
  attackItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      const targetId = this.closest(".target-card").getAttribute("data-target");

      // Check if the topic is accessible before expanding
      if (!isTopicAccessible(targetId)) {
        return;
      }

      this.classList.toggle("expanded");
    });
  });

  function markAsComplete(targetId) {
    if (completedSections.includes(targetId)) {
      return;
    }

    completedSections.push(targetId);
    
    // Always add to completedQuizzes as well to maintain consistency
    if (!completedQuizzes.includes(targetId)) {
      completedQuizzes.push(targetId);
    }

    // Save to Firebase and localStorage
    saveProgressToFirebase();

    // Update UI
    const card = document.querySelector(`.target-card[data-target="${targetId}"]`);
    if (card) {
      card.classList.add("completed");
    }

    updateProgress();
    updateTopicAccessibility();
  }

  function updateProgress() {
    const totalTopics = topicOrder.length;
    const progressBar = document.getElementById("module-progress");
    const quizzesPassed = document.getElementById("quizzes-passed");

    // Calculate progress based on completed quizzes (most reliable metric)
    const progressPercentage = Math.round((completedQuizzes.length / totalTopics) * 100);

    // Update progress bar width with a specific style to ensure it's visible
    if (progressBar) {
      progressBar.style.width = `${progressPercentage}%`;
      void progressBar.offsetWidth;
      setTimeout(() => {
        progressBar.style.width = `${progressPercentage}%`;
      }, 50);
    }

    if (quizzesPassed) {
      quizzesPassed.textContent = completedQuizzes.length;
    }
    
    saveProgressToFirebase();
    setTimeout(refreshProgressIndicators, 100);

    // Check if all topics and quizzes are completed
    if (completedQuizzes.length === totalTopics) {
      // Always allow celebration if all quizzes are completed
      localStorage.removeItem('phishingAttackCelebrated');
      console.log('[DEBUG] All quizzes completed, showing celebration modal.');
      setTimeout(() => {
        showCelebration();
      }, 1000);
    }

    // Also update progress nodes
    document.querySelectorAll(".progress-node").forEach((node, index) => {
      const topicId = node.getAttribute("data-topic");
      if (!topicId) return;
      
      if (completedQuizzes.includes(topicId)) {
        node.classList.add("completed");
        
        // Update the progress line before this node
        if (index > 0) {
          const prevNode = document.querySelectorAll(".progress-node")[index-1];
          if (!prevNode) return;
          
          const prevTopicId = prevNode.getAttribute("data-topic");
          if (completedQuizzes.includes(prevTopicId)) {
            const line = node.previousElementSibling;
            if (line && line.classList.contains("progress-line")) {
              line.classList.add("completed");
            }
          }
        }
      }
    });
  }

  // Show celebration modal
  function showCelebration() {
    // Only show if not already celebrated
    if (localStorage.getItem('phishingAttackCelebrated') === 'true') return;
    localStorage.setItem('phishingAttackCelebrated', 'true');
    // Optionally, sync to Firebase for logged-in users
    if (firebase && firebase.auth && firebase.auth().currentUser && firebase.database) {
      const userId = firebase.auth().currentUser.uid;
      firebase.database().ref(`userProgress/${userId}/modules/phishingAttacks`).update({
        celebrated: true
      });
    }
    const celebrationContainer = document.querySelector(
      ".celebration-container"
    );
    if (
      celebrationContainer &&
      !celebrationContainer.classList.contains("active")
    ) {
      celebrationContainer.classList.add("active");
      createConfetti();
      createSparkles();

      // Remove duplicate navigation if present
      const navs = celebrationContainer.querySelectorAll('.lesson-navigation');
      if (navs.length > 1) {
        for (let i = 1; i < navs.length; i++) navs[i].remove();
      }
      // Add navigation section if not present
      const content = celebrationContainer.querySelector('.celebration-content');
      if (content && !content.querySelector('.lesson-navigation')) {
        const navigationSection = document.createElement('div');
        navigationSection.className = 'lesson-navigation';
        navigationSection.innerHTML = `
          <div class="nav-container">
            <a href="learn.html" class="nav-button back">
              <i class="fas fa-arrow-left"></i> Back to Learning Hub
            </a>
            <a href="malware.html" class="nav-button next">
              Next Lesson: Malware Attacks <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        `;
        content.appendChild(navigationSection);
      }
      // Continue button closes the celebration
      const continueBtn = celebrationContainer.querySelector(".celebration-btn");
      if (continueBtn) {
        continueBtn.addEventListener("click", () => {
          celebrationContainer.classList.remove("active");
          setTimeout(() => {
            // Remove confetti to clean up
            document.querySelectorAll(".confetti").forEach((el) => el.remove());
          }, 500);
        });
      }
    }
  }

  // Confetti animation for celebration
  function createConfetti() {
    const colors = ["#5cdb95", "#88ccf1", "#f1c40f", "#e74c3c", "#9b59b6"];
    const confettiCount = 200;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.width = Math.random() * 10 + "px";
      confetti.style.height = Math.random() * 10 + "px";
      confetti.style.opacity = Math.random();
      confetti.style.animation =
        "floatConfetti " + (Math.random() * 3 + 2) + "s ease-in infinite";

      document.querySelector(".celebration-container").appendChild(confetti);
    }
  }

  // Create trophy sparkles
  function createSparkles() {
    const sparkleContainer = document.getElementById("trophy-sparkle");
    if (!sparkleContainer) return;

    for (let i = 0; i < 15; i++) {
      const sparkle = document.createElement("span");
      sparkle.style.width = Math.random() * 4 + 2 + "px";
      sparkle.style.height = sparkle.style.width;
      sparkle.style.top = Math.random() * 100 + "%";
      sparkle.style.left = Math.random() * 100 + "%";
      sparkle.style.animationDelay = Math.random() * 2 + "s";
      sparkleContainer.appendChild(sparkle);
    }
  }

  // Add click event to progress tracker nodes to scroll to corresponding topic
  document.querySelectorAll(".progress-node").forEach((node) => {
    node.onclick = function() {
      const topicId = this.getAttribute("data-topic");
      const topicCard = document.querySelector(
        `.target-card[data-target="${topicId}"]`
      );

      // Only scroll to accessible topics
      if (isTopicAccessible(topicId) && topicCard) {
        topicCard.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Create a pulse animation on the locked topic
        this.classList.add("shake-animation");
        setTimeout(() => {
          this.classList.remove("shake-animation");
        }, 800);

        // Show a tooltip
        const container = document.querySelector(".container");
        const notification = document.createElement("div");
        notification.className = "notification";

        // Get the previous topic name for the message
        const topicIndex = topicOrder.indexOf(topicId);
        const prevTopicName =
          topicIndex > 0
            ? topicOrder[topicIndex - 1].charAt(0).toUpperCase() +
              topicOrder[topicIndex - 1].slice(1)
            : "";

        notification.textContent = `Complete "${prevTopicName}" to unlock this topic!`;
        notification.style.backgroundColor = "#e74c3c"; // Red for locked notification

        container.insertBefore(notification, container.firstChild);

        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
    };
  });

  // Add a delayed call to ensure quiz functionality after everything is loaded
  setTimeout(() => {
    ensureQuizFunctionalityWorks();
  }, 500);

  // Check if quizzes are disabled
  const quizzesDisabled = localStorage.getItem("quizzesDisabled") === "true";
  
  // If quizzes are disabled, hide all quiz sections
  if (quizzesDisabled) {
    const quizSections = document.querySelectorAll('.topic-quiz');
    quizSections.forEach(section => {
      section.style.display = 'none';
    });
    
    // Add a message that quizzes are disabled
    const targetCards = document.querySelectorAll('.target-card');
    targetCards.forEach(card => {
      // Check if message already exists
      if (!card.querySelector('.quizzes-disabled-message')) {
        const message = document.createElement('p');
        message.className = 'quizzes-disabled-message';
        message.innerHTML = '<i class="fas fa-info-circle"></i> Quizzes are currently disabled. You can enable them in your <a href="profile.html">profile settings</a>.';
        message.style.color = '#88ccf1';
        message.style.padding = '10px 15px';
        message.style.backgroundColor = 'rgba(52, 148, 201, 0.1)';
        message.style.borderRadius = '5px';
        message.style.marginTop = '15px';
        card.appendChild(message);
      }
    });
  }
});

// Define logout function
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

// Function to update progress nodes in the tracking bar
function updateProgressNodes() {
  console.log("[DEBUG] Updating progress nodes");
  topicOrder.forEach((topicId, index) => {
    const progressNode = document.querySelector(
      `.progress-node[data-topic="${topicId}"]`
    );
    
    if (!progressNode) return;
    
    // Remove all state classes first
    progressNode.classList.remove("active", "completed", "locked");
    
    // Get the base tooltip text (without the status part)
    const tooltipParts = progressNode.getAttribute("data-tooltip").split(" - ");
    const baseTooltip = tooltipParts[0];
    
    if (completedQuizzes.includes(topicId)) {
      // Topic is completed
      progressNode.classList.add("completed");
      progressNode.setAttribute("data-tooltip", `${baseTooltip} - Completed ✓`);
    } else if (isTopicAccessible(topicId)) {
      // Topic is accessible but not completed
      progressNode.classList.add("active");
      progressNode.setAttribute("data-tooltip", `${baseTooltip} - In Progress`);
    } else {
      // Topic is locked
      progressNode.classList.add("locked");
      const prevTopicName = index > 0 
        ? topicOrder[index - 1].replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) 
        : "";
      progressNode.setAttribute(
        "data-tooltip", 
        `${baseTooltip} - Locked (Complete ${prevTopicName} first)`
      );
    }
    
    // Update progress lines between nodes
    if (index > 0) {
      const prevTopicId = topicOrder[index - 1];
      const progressLine = progressNode.previousElementSibling;
      
      if (progressLine && progressLine.classList.contains("progress-line")) {
        if (completedQuizzes.includes(prevTopicId)) {
          progressLine.classList.add("completed");
        } else {
          progressLine.classList.remove("completed");
        }
      }
    }
  });
}

// Function to update UI for completed quiz items
function updateCompletedItems() {
  console.log("[DEBUG] Updating completed items UI with:", completedQuizzes);
  
  // Reset all quiz UI first
  document.querySelectorAll(".topic-quiz").forEach(quiz => {
    const quizBtn = quiz.querySelector(".topic-quiz-btn");
    const resultsDiv = quiz.querySelector(".topic-quiz-results");
    const correctAnswer = quiz.querySelector(".correct-answer");
    const incorrectAnswer = quiz.querySelector(".incorrect-answer");
    const options = quiz.querySelectorAll(".option");
    
    if (quizBtn) {
      quizBtn.textContent = "Check Answer";
      quizBtn.classList.remove("success");
      quizBtn.disabled = false;
    }
    
    if (resultsDiv) resultsDiv.style.display = "none";
    if (correctAnswer) correctAnswer.style.display = "none";
    if (incorrectAnswer) incorrectAnswer.style.display = "none";
    
    options.forEach(opt => {
      opt.classList.remove("selected", "correct", "incorrect");
    });
  });
  
  // Now mark completed quizzes
  completedQuizzes.forEach(targetId => {
    const card = document.querySelector(`.target-card[data-target="${targetId}"]`);
    if (!card) return;
    
    const quizContainer = card.querySelector(".topic-quiz");
    if (!quizContainer) return;
    
    const quizBtn = quizContainer.querySelector(".topic-quiz-btn");
    const correctOption = quizContainer.querySelector('.option[data-correct="true"]');
    const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
    const correctAnswer = quizContainer.querySelector(".correct-answer");
    
    if (quizBtn && correctOption && resultsDiv && correctAnswer) {
      correctOption.classList.add("selected", "correct");
      resultsDiv.style.display = "block";
      correctAnswer.style.display = "block";
      quizBtn.textContent = "Correct!";
      quizBtn.classList.add("success");
      quizBtn.disabled = true;
    }
  });
}

// New loadUserProgress function (copied/adapted from intro-cybersec.js)
function loadUserProgress(userId) {
  if (!firebase.database) {
    // Fallback to localStorage
    const localQuizzes = JSON.parse(localStorage.getItem("phishingCompletedQuizzes")) || [];
    const localSections = JSON.parse(localStorage.getItem("phishingCompletedSections")) || [];
    completedQuizzes = localQuizzes;
    completedSections = localSections.length > 0 ? localSections : [...localQuizzes];
    updateProgress();
    updateCompletedItems();
    updateProgressNodes();
    updateTopicAccessibility();
    refreshProgressIndicators();
    return;
  }
  const userProgressRef = firebase.database().ref(`userProgress/${userId}/modules/phishingAttacks`);
  userProgressRef.once('value')
    .then((snapshot) => {
      const data = snapshot.val();
      if (data && data.completedQuizzes) {
        completedQuizzes = data.completedQuizzes;
        completedSections = data.completedSections || [...completedQuizzes];
        localStorage.setItem("phishingCompletedQuizzes", JSON.stringify(completedQuizzes));
        localStorage.setItem("phishingCompletedSections", JSON.stringify(completedSections));
      } else {
        // No data in database, check localStorage
        const localQuizzes = JSON.parse(localStorage.getItem("phishingCompletedQuizzes")) || [];
        const localSections = JSON.parse(localStorage.getItem("phishingCompletedSections")) || [];
        completedQuizzes = localQuizzes;
        completedSections = localSections.length > 0 ? localSections : [...localQuizzes];
        // Sync localStorage to Firebase
        userProgressRef.update({
          completedQuizzes: completedQuizzes,
          completedSections: completedSections,
          progressPercentage: (completedQuizzes.length / topicOrder.length) * 100,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
      }
      updateProgress();
      updateCompletedItems();
      updateProgressNodes();
      updateTopicAccessibility();
      refreshProgressIndicators();
    })
    .catch((error) => {
      // Fallback to localStorage
      const localQuizzes = JSON.parse(localStorage.getItem("phishingCompletedQuizzes")) || [];
      const localSections = JSON.parse(localStorage.getItem("phishingCompletedSections")) || [];
      completedQuizzes = localQuizzes;
      completedSections = localSections.length > 0 ? localSections : [...localQuizzes];
      updateProgress();
      updateCompletedItems();
      updateProgressNodes();
      updateTopicAccessibility();
      refreshProgressIndicators();
    });
}
