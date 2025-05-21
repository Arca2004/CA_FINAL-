document.addEventListener("DOMContentLoaded", function () {
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

  // Define topic order and progress tracking
  const topicOrder = [
    "network-security", 
    "network-tapping", 
    "wireless-network-pirating",
    "advanced-network-forensics",
    "zero-trust-architechture"
  ];
  
  // Initialize user progress object
  let userProgress = {
    completedSections: []
  };
  
  // Elements for profile dropdown
  const authNavItem = document.getElementById("auth-nav-item");
  const loginLink = document.getElementById("login-link");
  const profileContainer = document.getElementById("profile-container");
  const profileInitial = document.getElementById("profile-initial");
  const profileName = document.getElementById("profile-name");
  const logoutBtn = document.getElementById("logout-btn");

  // Setup logout button event listener
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }
  
  // Load initial progress - first try from localStorage as a quick start
  const storedSections = localStorage.getItem("networkSecurityCompleted");
  if (storedSections) {
    try {
      userProgress.completedSections = JSON.parse(storedSections);
      console.log("[DEBUG] Loaded initial progress from localStorage:", userProgress.completedSections);
    } catch (e) {
      console.error("[DEBUG] Error parsing localStorage data:", e);
      userProgress.completedSections = [];
    }
  }
  
  // Initialize UI immediately with localStorage data
  updateUI();
  
  // Check for Firebase auth state
  let currentUser = null;
  if (firebase && firebase.auth) {
    console.log("[DEBUG] Setting up Firebase Auth state listener");
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log("[DEBUG] User signed in:", user.uid);
        // User is signed in with Firebase
        currentUser = user;
        
        if (loginLink) loginLink.style.display = "none";
        if (profileContainer) profileContainer.style.display = "flex";
        if (profileInitial) profileInitial.textContent = getUserInitial(user);
        
        // Store in localStorage for backward compatibility
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            uid: user.uid,
            username: user.email,
            fullname: user.displayName || "Cyber Academy User",
            initial: getUserInitial(user),
          })
        );
  
        // Load user progress from Firebase Realtime Database
        loadUserProgress(user.uid);
      } else {
        console.log("[DEBUG] User is signed out, checking localStorage");
        // Not signed in with Firebase, check localStorage for backward compatibility
        const localUser = JSON.parse(localStorage.getItem("currentUser"));
        if (localUser) {
          console.log("[DEBUG] Found user in localStorage:", localUser);
          
          if (loginLink) loginLink.style.display = "none";
          if (profileContainer) profileContainer.style.display = "flex";
          if (profileInitial) profileInitial.textContent = getUserInitial(localUser);
          
          // If we have a UID in localStorage, try to load progress from Firebase
          if (localUser.uid) {
            console.log("[DEBUG] Found UID in localStorage, loading progress from Firebase");
            loadUserProgress(localUser.uid);
          }
        } else {
          console.log("[DEBUG] No user found, showing login link");
          if (loginLink) loginLink.style.display = "block";
          if (profileContainer) profileContainer.style.display = "none";
        }
      }
    });
  } else {
    // Fallback when Firebase is not available
    console.log("[DEBUG] Firebase auth not available, using localStorage only");
    const localUser = JSON.parse(localStorage.getItem("currentUser"));
    if (localUser) {
      if (loginLink) loginLink.style.display = "none";
      if (profileContainer) profileContainer.style.display = "flex";
      if (profileInitial) profileInitial.textContent = getUserInitial(localUser);
    } else {
      if (loginLink) loginLink.style.display = "block";
      if (profileContainer) profileContainer.style.display = "none";
    }
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
  
  // Load user progress from Firebase
  function loadUserProgress(userId) {
    console.log("[DEBUG] loadUserProgress called with userId:", userId);
    
    if (!firebase.database) {
      console.error("Firebase Realtime Database is not available");
      return;
    }

    // Reference to the user's progress data in RTDB
    const userProgressRef = firebase.database().ref(`userProgress/${userId}/modules/networkSecurity`);
    console.log("[DEBUG] Attempting to load from path:", `userProgress/${userId}/modules/networkSecurity`);
    
    userProgressRef.once('value')
      .then((snapshot) => {
        const data = snapshot.val();
        console.log("[DEBUG] Firebase data loaded:", data);
        
        if (data && data.completedSections) {
          userProgress.completedSections = data.completedSections;
          console.log("[DEBUG] Setting completedSections from Firebase:", userProgress.completedSections);
          
          // Once we have RTDB data, update localStorage as backup
          localStorage.setItem("networkSecurityCompleted", JSON.stringify(userProgress.completedSections));
          
          // Log the progress to verify it's being saved
          console.log("[DEBUG] Saved completedSections to localStorage:", 
                      JSON.stringify(userProgress.completedSections));
        } else {
          console.log("[DEBUG] No data from Firebase, checking localStorage");
          // No data in database, check localStorage
          const localData = JSON.parse(localStorage.getItem("networkSecurityCompleted")) || [];
          
          if (localData.length > 0) {
            console.log("[DEBUG] Found data in localStorage, will use and sync to Firebase:", localData);
            userProgress.completedSections = localData;
            
            // Sync localStorage to Firebase
            userProgressRef.update({
              completedSections: userProgress.completedSections,
              progressPercentage: (userProgress.completedSections.length / topicOrder.length) * 100,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            });
          } else {
            console.log("[DEBUG] No progress data found anywhere, starting fresh");
            userProgress.completedSections = [];
          }
        }
        
        // Ensure UI is fully updated with the loaded data
        console.log("[DEBUG] Fully updating UI with loaded progress data");
        updateUI(); // Update the progress bar and UI
      })
      .catch((error) => {
        console.error("[DEBUG] Error loading progress from Firebase:", error);
        
        // Fall back to localStorage if Firebase fails
        const localData = JSON.parse(localStorage.getItem("networkSecurityCompleted")) || [];
        userProgress.completedSections = localData;
        updateUI();
      });
  }
  
  // Save user progress to Firebase Realtime Database
  function saveUserProgress(userId) {
    if (!firebase.database || !userId) {
      // Save to localStorage as backup
      localStorage.setItem("networkSecurityCompleted", JSON.stringify(userProgress.completedSections));
      return;
    }

    // Calculate progress percentage
    const progressPercentage = (userProgress.completedSections.length / topicOrder.length) * 100;

    // Reference to the user's progress data in RTDB
    const userProgressRef = firebase.database().ref(`userProgress/${userId}/modules/networkSecurity`);
    
    // Update the RTDB data
    userProgressRef.update({
      completedSections: userProgress.completedSections,
      lastUpdated: firebase.database.ServerValue.TIMESTAMP,
      progressPercentage: progressPercentage
    })
    .then(() => {
      console.log("Progress saved to Firebase Realtime Database");
      
      // Also update localStorage as backup
      localStorage.setItem("networkSecurityCompleted", JSON.stringify(userProgress.completedSections));
      
      // Update user's overall progress in profile
      updateOverallProgress(userId);
    })
    .catch((error) => {
      console.error("Error saving progress:", error);
      // Save to localStorage as backup
      localStorage.setItem("networkSecurityCompleted", JSON.stringify(userProgress.completedSections));
    });
  }
  
  // Update overall user progress
  function updateOverallProgress(userId) {
    if (!firebase.database || !userId) return;
    
    // Get current module data
    const currentModuleData = {
      completedSections: userProgress.completedSections,
      progressPercentage: (userProgress.completedSections.length / topicOrder.length) * 100
    };

    // Reference to the user's overall progress data
    const userOverallRef = firebase.database().ref(`userProgress/${userId}`);

    // Get existing data first to calculate overall stats
    userOverallRef.once('value')
      .then((snapshot) => {
        const data = snapshot.val() || {};
        const modules = data.modules || {};
        
        // Update our module data
        modules.networkSecurity = currentModuleData;
        
        // Calculate total modules and completed modules
        const modulesStats = {
          total: 4, // Adjust based on your total modules
          completed: 0,
          topics: 0,
          totalTimeMinutes: 0
        };
        
        // Check network security module
        if (modules.networkSecurity && modules.networkSecurity.completedSections) {
          const networkProgress = modules.networkSecurity.completedSections.length || 0;
          if (networkProgress === topicOrder.length) {
            modulesStats.completed++;
          }
          modulesStats.topics += networkProgress;
          modulesStats.totalTimeMinutes += networkProgress * 15; // Estimate 15 min per topic
        }
        
        // Check other modules as needed
        if (modules.introCybersec && modules.introCybersec.completedQuizzes) {
          const introProgress = modules.introCybersec.completedQuizzes.length || 0;
          if (introProgress === 5) { // 5 topics in intro module
            modulesStats.completed++;
          }
          modulesStats.topics += introProgress;
          modulesStats.totalTimeMinutes += introProgress * 15;
        }
        
        // Check other modules as needed
        // if (modules.attackTargets) { ... }
        // if (modules.phishingAttacks) { ... }
        // if (modules.malwareInfections) { ... }
        
        // Update overall progress
        userOverallRef.update({
          modules: modules,
          completedModules: modulesStats.completed,
          totalModules: modulesStats.total,
          completedTopics: modulesStats.topics,
          totalTimeMinutes: modulesStats.totalTimeMinutes,
          completionPercentage: (modulesStats.completed / modulesStats.total) * 100,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
      })
      .catch(error => console.error("Error updating overall progress:", error));
  }
  
  // Function to update the UI based on progress
  function updateUI() {
    console.log("[DEBUG] Updating UI with completed sections:", userProgress.completedSections);
    
    // Update progress bar
    const progressBar = document.getElementById("module-progress");
    if (progressBar) {
      const percentage = Math.min(100, Math.max(0, 
        (userProgress.completedSections.length / topicOrder.length) * 100));
      progressBar.style.width = `${percentage}%`;
      console.log("[DEBUG] Setting progress bar width to:", percentage + "%");
    }

    // Update progress nodes
    topicOrder.forEach((topicId, index) => {
      const node = document.querySelector(`.progress-node[data-topic="${topicId}"]`);
      if (!node) return;
      
      const isCompleted = userProgress.completedSections.includes(topicId);
      const isAvailable = isTopicAvailable(topicId);
      
      // Reset all classes first
      node.classList.remove("active", "completed", "locked");
      
      if (isCompleted) {
        node.classList.add("completed");
      } else if (isAvailable) {
        node.classList.add("active");
      } else {
        node.classList.add("locked");
      }
      
      // Update progress lines as well
      if (index > 0) {
        const prevTopicId = topicOrder[index - 1];
        const line = node.previousElementSibling;
        if (line && line.classList.contains("progress-line")) {
          if (userProgress.completedSections.includes(prevTopicId)) {
            line.classList.add("completed");
          } else {
            line.classList.remove("completed");
          }
        }
      }
    });

    // Update cards
    topicOrder.forEach((topicId, index) => {
      const card = document.querySelector(`.target-card[data-target="${topicId}"]`);
      if (!card) return;

      const isCompleted = userProgress.completedSections.includes(topicId);
      const isAvailable = isTopicAvailable(topicId);
      
      // Update completed state
      if (isCompleted) {
        card.classList.add("completed");
      } else {
        card.classList.remove("completed");
      }
      
      // Update lock state
      if (!isAvailable) {
        card.classList.add("locked");
        
        // Make sure there's a lock overlay
        if (!card.querySelector(".lock-overlay")) {
          const lockOverlay = document.createElement("div");
          lockOverlay.className = "lock-overlay";
          
          const lockIcon = document.createElement("i");
          lockIcon.className = "fas fa-lock";
          lockOverlay.appendChild(lockIcon);
          
          const lockMessage = document.createElement("div");
          lockMessage.className = "lock-message";
          const prevTopicName = index > 0 
            ? topicOrder[index - 1].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
            : "";
          lockMessage.textContent = `Complete ${prevTopicName} to unlock`;
          lockOverlay.appendChild(lockMessage);
          
          card.appendChild(lockOverlay);
        }
      } else {
        card.classList.remove("locked");
        
        // Remove lock overlay if it exists
        const lockOverlay = card.querySelector(".lock-overlay");
        if (lockOverlay) {
          lockOverlay.remove();
        }
      }
    });
    
    // Update quiz UI for completed sections
    userProgress.completedSections.forEach(topicId => {
      const card = document.querySelector(`.target-card[data-target="${topicId}"]`);
      if (!card) return;
      
      const quiz = card.querySelector(".topic-quiz");
      if (!quiz) return;
      
      const correctOption = quiz.querySelector('.option[data-correct="true"]');
      const resultsDiv = quiz.querySelector(".topic-quiz-results");
      const correctFeedback = quiz.querySelector(".correct-answer");
      const button = quiz.querySelector(".topic-quiz-btn");
      
      if (correctOption && resultsDiv && correctFeedback && button) {
        correctOption.classList.add("selected", "correct");
        resultsDiv.style.display = "block";
        correctFeedback.style.display = "block";
        button.textContent = "Correct!";
        button.classList.add("success");
        button.disabled = true;
      }
    });
    
    // Log current progress state after update
    console.log("[DEBUG] Current progress after UI update:", {
      completedSections: userProgress.completedSections,
      progressPercentage: (userProgress.completedSections.length / topicOrder.length) * 100
    });
  }

  // Reset progress button functionality
  const resetProgressBtn = document.getElementById("reset-progress");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", function () {
      if (
        confirm(
          "Are you sure you want to reset your progress for this module? This cannot be undone."
        )
      ) {
        // Reset progress
        userProgress.completedSections = [];
        
        // Get user ID for saving to Firebase
        let userId = null;
        if (firebase && firebase.auth && firebase.auth().currentUser) {
          userId = firebase.auth().currentUser.uid;
          console.log("[DEBUG] Got Firebase auth user ID for reset:", userId);
        } else {
          const localUser = JSON.parse(localStorage.getItem("currentUser"));
          if (localUser && localUser.uid) {
            userId = localUser.uid;
            console.log("[DEBUG] Got localStorage user ID for reset:", userId);
          }
        }
        
        // Clear localStorage
        localStorage.removeItem("networkSecurityCompleted");
        console.log("[DEBUG] Removed networkSecurityCompleted from localStorage");
        
        // Force saving reset progress to Firebase
        if (userId) {
          console.log("[DEBUG] Saving reset progress to Firebase for user:", userId);
          if (firebase && firebase.database) {
            firebase.database().ref(`userProgress/${userId}/modules/networkSecurity`).update({
              completedSections: [],
              progressPercentage: 0,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP,
              celebrated: false
            })
            .then(() => {
              console.log("[DEBUG] Successfully reset progress in Firebase");
            })
            .catch(error => {
              console.error("[DEBUG] Error resetting progress in Firebase:", error);
            });
          }
        } else {
          console.log("[DEBUG] No user ID found, only cleared localStorage");
        }
        
        // Clear the celebration flag so it can show again after re-completion
        localStorage.removeItem('networkSecurityCelebrated');
        
        // Reset quiz UI
        document.querySelectorAll(".topic-quiz").forEach(quiz => {
          const resultsDiv = quiz.querySelector(".topic-quiz-results");
          const button = quiz.querySelector(".topic-quiz-btn");
          const options = quiz.querySelectorAll(".option");
          
          if (resultsDiv) resultsDiv.style.display = "none";
          if (button) {
            button.textContent = "Check Answer";
            button.classList.remove("success");
            button.disabled = false;
          }
          
          options.forEach(option => {
            option.classList.remove("selected", "correct", "incorrect");
          });
        });
        
        // Update UI to reflect reset progress
        updateUI();
        
        // Show notification
        const container = document.querySelector(".container");
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.style.backgroundColor = "#27ae60";
        notification.style.color = "white";
        notification.style.padding = "15px";
        notification.style.borderRadius = "5px";
        notification.style.marginBottom = "20px";
        notification.style.textAlign = "center";
        notification.textContent = "Progress reset successfully!";
        container.insertBefore(notification, container.firstChild);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
    });
  }

  // Add event listeners to options for selecting answers
  document.querySelectorAll('.topic-quiz .option').forEach(option => {
    option.addEventListener('click', function() {
      // First remove selected class from all sibling options
      const allOptions = this.closest('.options').querySelectorAll('.option');
      allOptions.forEach(opt => {
        opt.classList.remove('selected', 'incorrect', 'shake-animation');
      });
      
      // Add selected class to clicked option
      this.classList.add('selected');
      
      console.log("[DEBUG] Option selected:", this.querySelector('.option-text').textContent);
    });
  });
  
  // Add event listener to quiz buttons
  document.querySelectorAll('.topic-quiz-btn').forEach(button => {
    button.addEventListener('click', function() {
      const quizContainer = this.closest(".topic-quiz");
      
      if (!quizContainer) {
        console.error("[DEBUG] Could not find quiz container");
        return;
      }
      
      const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
      const correctFeedback = quizContainer.querySelector(".correct-answer");
      const incorrectFeedback = quizContainer.querySelector(".incorrect-answer");
      const selectedOption = quizContainer.querySelector(".option.selected");
      
      console.log("[DEBUG] Quiz button clicked, selected option:", selectedOption);
      
      // Check if option is selected
      if (!selectedOption) {
        alert("Please select an answer first.");
        return;
      }
      
      if (resultsDiv) resultsDiv.style.display = "block";
      
      // Check if answer is correct
      if (selectedOption.getAttribute("data-correct") === "true") {
        if (correctFeedback) correctFeedback.style.display = "block";
        if (incorrectFeedback) incorrectFeedback.style.display = "none";
        selectedOption.classList.add("correct");
        
        this.textContent = "Correct!";
        this.classList.add("success");
        this.disabled = true;
        
        // Mark section as completed
        const targetCard = quizContainer.closest(".target-card");
        if (targetCard) {
          const targetId = targetCard.getAttribute("data-target");
          
          if (targetId && !userProgress.completedSections.includes(targetId)) {
            console.log("[DEBUG] Adding completed section:", targetId);
            userProgress.completedSections.push(targetId);
            
            // Save to localStorage immediately
            localStorage.setItem("networkSecurityCompleted", JSON.stringify(userProgress.completedSections));
            console.log("[DEBUG] Saved to localStorage:", JSON.stringify(userProgress.completedSections));
            
            // Get user ID for saving to Firebase
            let userId = null;
            if (firebase && firebase.auth && firebase.auth().currentUser) {
              userId = firebase.auth().currentUser.uid;
              console.log("[DEBUG] Got Firebase auth user ID:", userId);
            } else {
              const localUser = JSON.parse(localStorage.getItem("currentUser"));
              if (localUser && localUser.uid) {
                userId = localUser.uid;
                console.log("[DEBUG] Got localStorage user ID:", userId);
              }
            }
            
            // Save updated progress
            if (userId) {
              console.log("[DEBUG] Saving progress for user:", userId);
              saveUserProgress(userId);
            } else {
              console.log("[DEBUG] No user ID found, only saved to localStorage");
            }
            
            // Update UI to reflect completed section
            updateUI();
            
            // Show celebration if all sections are completed
            if (userProgress.completedSections.length === topicOrder.length) {
              setTimeout(() => {
                showCelebration();
              }, 500);
            }
          } else if (targetId) {
            console.log("[DEBUG] Section already completed:", targetId);
          }
        }
      } else {
        if (correctFeedback) correctFeedback.style.display = "none";
        if (incorrectFeedback) incorrectFeedback.style.display = "block";
        selectedOption.classList.add("incorrect");
        // Add shake animation
        selectedOption.classList.add("shake-animation");
        setTimeout(() => {
          selectedOption.classList.remove("shake-animation");
        }, 800);
      }
    });
  });

  // Show celebration when all sections are completed
  function showCelebration() {
    console.log("[DEBUG] Showing celebration");
    const celebrationContainer = document.querySelector(".celebration-container");
    if (!celebrationContainer) {
      console.error("[DEBUG] Celebration container not found");
      return;
    }
    
    // Check if celebration was already shown
    if (localStorage.getItem('networkSecurityCelebrated') === 'true') {
      console.log("[DEBUG] Celebration already shown before, not showing again");
      return;
    }
    
    // Mark as celebrated to prevent showing again
    localStorage.setItem('networkSecurityCelebrated', 'true');
    
    // Optionally, sync to Firebase for logged-in users
    if (firebase && firebase.auth && firebase.auth().currentUser && firebase.database) {
      const userId = firebase.auth().currentUser.uid;
      firebase.database().ref(`userProgress/${userId}/modules/networkSecurity`).update({
        celebrated: true
      });
    }
    
    celebrationContainer.classList.add("active");
    celebrationContainer.style.opacity = "1";
    celebrationContainer.style.visibility = "visible";
    
    // Update celebration stats
    const statValues = celebrationContainer.querySelectorAll(".stat-value");
    
    if (statValues.length >= 1) {
      statValues[0].textContent = `${userProgress.completedSections.length}/${topicOrder.length}`;
    }
    
    // Add confetti effect
    for (let i = 0; i < 100; i++) {
      createConfetti(celebrationContainer);
    }
    
    // Create sparkles for trophy
    createSparkles();
    
    // Close celebration on button click
    const celebrationBtn = celebrationContainer.querySelector(".celebration-btn");
    if (celebrationBtn) {
      celebrationBtn.addEventListener("click", function() {
        celebrationContainer.classList.remove("active");
        celebrationContainer.style.opacity = "0";
        celebrationContainer.style.visibility = "hidden";
        
        // Remove confetti to clean up
        setTimeout(() => {
          document.querySelectorAll('.confetti').forEach((el) => el.remove());
        }, 500);
      });
    }
  }
  
  // Create a confetti element
  function createConfetti(container) {
    const colors = [
      "#f94144",
      "#f3722c",
      "#f8961e",
      "#f9c74f",
      "#90be6d",
      "#43aa8b",
      "#577590",
    ];
  
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.position = "absolute";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `${Math.random() * 40}%`;
    confetti.style.width = `${Math.random() * 10 + 5}px`;
    confetti.style.height = `${Math.random() * 10 + 5}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
    confetti.style.opacity = Math.random() + 0.5;
    confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
    
    // Create and append a style element if it doesn't exist yet
    if (!document.querySelector('#confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.innerHTML = `
        @keyframes fall {
          0% {
            transform: translateY(-5vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  
    container.appendChild(confetti);
  
    // Remove confetti after animation
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
  
  // Create sparkles for trophy animation
  function createSparkles() {
    const sparkleContainer = document.getElementById("trophy-sparkle");
    if (!sparkleContainer) return;
    
    sparkleContainer.innerHTML = '';
    
    for (let i = 0; i < 15; i++) {
      const sparkle = document.createElement("span");
      sparkle.style.position = "absolute";
      sparkle.style.background = "white";
      sparkle.style.borderRadius = "50%";
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.width = `${Math.random() * 4 + 2}px`;
      sparkle.style.height = sparkle.style.width;
      sparkle.style.animation = `sparkle 2s infinite ${Math.random() * 2}s`;
      sparkleContainer.appendChild(sparkle);
    }
    
    // Create and append a style element if it doesn't exist yet
    if (!document.querySelector('#sparkle-style')) {
      const style = document.createElement('style');
      style.id = 'sparkle-style';
      style.innerHTML = `
        @keyframes sparkle {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Handle option selection
  const options = document.querySelectorAll(".option");
  
  options.forEach((option) => {
    option.addEventListener("click", function() {
      const allOptions = this.parentElement.querySelectorAll(".option");
      
      allOptions.forEach((opt) => {
        opt.classList.remove("selected");
      });
      
      this.classList.add("selected");
    });
  });

  // Toggle attack details
  const attackHeaders = document.querySelectorAll(".attack-item h3");
  
  attackHeaders.forEach((header) => {
    header.addEventListener("click", function(e) {
      e.stopPropagation();
      const parentItem = this.parentElement;
      const wasExpanded = parentItem.classList.contains("expanded");
      
      // Close all other expanded items
      document.querySelectorAll(".attack-item.expanded").forEach((item) => {
        if (item !== parentItem) {
          item.classList.remove("expanded");
        }
      });
      
      // Toggle current item
      if (wasExpanded) {
        parentItem.classList.remove("expanded");
      } else {
        parentItem.classList.add("expanded");
      }
    });
  });

  // Function to check if a topic is available
  function isTopicAvailable(topicId) {
    const index = topicOrder.indexOf(topicId);
    
    // First topic is always available
    if (index === 0) return true;
    
    // For any other topic, the previous topic must be completed
    const prevTopicId = topicOrder[index - 1];
    return userProgress.completedSections.includes(prevTopicId);
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