document.addEventListener("DOMContentLoaded", function () {
  console.log("[DEBUG] Cloud Security Fixed JS Loading...");
  
  // Elements for profile dropdown
  const authNavItem = document.getElementById("auth-nav-item");
  const loginLink = document.getElementById("login-link");
  const profileContainer = document.getElementById("profile-container");
  const profileAvatar = document.getElementById("profile-avatar");
  const profileInitial = document.getElementById("profile-initial");
  const profileName = document.getElementById("profile-name");
  const logoutBtn = document.getElementById("logout-btn");
  
  // Variables for user data and progress
  let userId = null;
  let userProgress = { completedSections: [] };
  
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
  if (firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in with Firebase
        userId = user.uid;
        console.log("[DEBUG] User signed in with Firebase:", userId);
        
        if (loginLink) loginLink.style.display = "none";
        if (profileContainer) profileContainer.style.display = "block";
        if (profileInitial) profileInitial.textContent = getUserInitial(user);
        if (profileName) profileName.textContent = ""; // No account name text

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
        console.log("[DEBUG] No user from Firebase auth");
        
        // Check localStorage for backward compatibility
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
          console.log("[DEBUG] Found user in localStorage:", currentUser);
          if (loginLink) loginLink.style.display = "none";
          if (profileContainer) profileContainer.style.display = "block";
          if (profileInitial) profileInitial.textContent = getUserInitial(currentUser);
          if (profileName) profileName.textContent = ""; // No account name text
          
          if (currentUser.uid) {
            console.log("[DEBUG] Using UID from localStorage for progress:", currentUser.uid);
            userId = currentUser.uid;
          } else {
            console.log("[DEBUG] No UID in localStorage user data");
          }
        } else {
          console.log("[DEBUG] No user found in localStorage");
          if (loginLink) loginLink.style.display = "block";
          if (profileContainer) profileContainer.style.display = "none";
        }
      }
      
      // Load progress after authentication check
      loadUserProgress();
    });
  } else {
    // Fallback for older version
    console.warn("[DEBUG] Firebase auth is not available!");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      if (loginLink) loginLink.style.display = "none";
      if (profileContainer) profileContainer.style.display = "block";
      if (profileInitial) profileInitial.textContent = getUserInitial(currentUser);
      if (profileName) profileName.textContent = ""; // No account name text
      
      if (currentUser.uid) {
        userId = currentUser.uid;
      }
      
      console.log("[DEBUG] Firebase auth unavailable, using localStorage user");
    } else {
      if (loginLink) loginLink.style.display = "block";
      if (profileContainer) profileContainer.style.display = "none";
      console.log("[DEBUG] No Firebase auth and no localStorage user");
    }
    
    // Load progress after authentication check
    loadUserProgress();
  }

  // Handle the login button
  if (loginLink) {
    loginLink.addEventListener("click", function (e) {
      if (e.target.id === "login-link") {
        window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.href);
      }
    });
  }
  
  // Define topic progression order
  const topicOrder = [
    "cloud-basics",
    "data-breaches",
    "misconfiguration",
    "account-hijacking",
    "insider-threats",
  ];
  
  // Mapping topics from progress tracker to section IDs
  const topicToSection = {
    "cloud-basics": "cloud-basics",
    "data-breaches": "data-breaches",
    "misconfiguration": "misconfiguration",
    "account-hijacking": "account-hijacking",
    "insider-threats": "insider-threats",
  };

  // Load user progress from Firebase
  function loadUserProgress() {
    console.log("[DEBUG] Loading user progress, userId:", userId);
    if (!userId) {
      console.log("[DEBUG] No userId available, can't load progress");
      return;
    }
  
    // Try to use Firebase Realtime Database first (like malware.js)
    if (firebase && firebase.database) {
      try {
        console.log("[DEBUG] Attempting to load from Firebase Realtime Database");
        const userProgressRef = firebase.database().ref(`userProgress/${userId}/modules/cloudSecurity`);
        
        userProgressRef.once('value')
          .then((snapshot) => {
            const data = snapshot.val() || {};
            console.log("[DEBUG] Cloud Security data loaded from Firebase Database:", data);
            
            // Load progress data
            if (data.completedSections) {
              userProgress.completedSections = data.completedSections;
              console.log("[DEBUG] Loaded completedSections:", userProgress.completedSections);
              updateUI();
            } else {
              console.log("[DEBUG] No completedSections found, initializing");
              userProgress = {
                completedSections: [],
              };
              saveUserProgress();
            }
          })
          .catch((error) => {
            console.error("[DEBUG] Error loading from Firebase Database:", error);
            // Fall back to Firestore
            loadFromFirestore();
          });
      } catch (error) {
        console.error("[DEBUG] Exception in loadUserProgress from Database:", error);
        // Fall back to Firestore
        loadFromFirestore();
      }
    } else {
      // Fall back to Firestore
      loadFromFirestore();
    }
  }
  
  // Fallback to load from Firestore
  function loadFromFirestore() {
    console.log("[DEBUG] Attempting to load from Firestore");
    if (!firebase || !firebase.firestore) {
      console.error("[DEBUG] Firestore not available");
      return;
    }
    
    try {
      const db = firebase.firestore();
      db.collection("users")
        .doc(userId)
        .get()
        .then((doc) => {
          console.log("[DEBUG] Got user document:", doc.exists ? "exists" : "does not exist");
          if (
            doc.exists &&
            doc.data().progress &&
            doc.data().progress.cloudSecurity
          ) {
            userProgress = doc.data().progress.cloudSecurity;
            console.log("[DEBUG] Loaded user progress from Firestore:", userProgress);
            updateUI();
          } else {
            // Initialize progress if it doesn't exist
            console.log("[DEBUG] Initializing new progress for user");
            userProgress = {
              completedSections: [],
            };
            saveUserProgress();
          }
        })
        .catch((error) => {
          console.error("[DEBUG] Error loading user progress from Firestore:", error);
        });
    } catch (error) {
      console.error("[DEBUG] Exception in loadFromFirestore:", error);
    }
  }
  
  // Save user progress to Firebase
  function saveUserProgress() {
    console.log("[DEBUG] Saving user progress, userId:", userId);
    if (!userId) {
      console.log("[DEBUG] No userId available, can't save progress");
      return;
    }
  
    // Try to save to Firebase Realtime Database first (like malware.js)
    if (firebase && firebase.database) {
      try {
        console.log("[DEBUG] Attempting to save to Firebase Realtime Database");
        // Calculate progress percentage
        const progressPercentage = userProgress.completedSections.length / 5 * 100;
        
        // Reference to user's progress data
        const userProgressRef = firebase.database().ref(`userProgress/${userId}/modules/cloudSecurity`);
        
        // Update the database
        userProgressRef.update({
          completedSections: userProgress.completedSections,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP,
          progressPercentage: progressPercentage
        })
        .then(() => {
          console.log("[DEBUG] Progress saved successfully to Realtime Database");
          updateUI();
          
          // Update overall user progress
          updateOverallProgress(userId);
        })
        .catch((error) => {
          console.error("[DEBUG] Error saving to Realtime Database:", error);
          // Fall back to Firestore
          saveToFirestore();
        });
      } catch (error) {
        console.error("[DEBUG] Exception in saveUserProgress to Database:", error);
        // Fall back to Firestore
        saveToFirestore();
      }
    } else {
      // Fall back to Firestore
      saveToFirestore();
    }
  }
  
  // Update overall progress in user profile (like in malware.js)
  function updateOverallProgress(userId) {
    if (!firebase.database || !userId) return;
    
    // Get current module data
    const currentModuleData = {
      completedSections: userProgress.completedSections,
      progressPercentage: (userProgress.completedSections.length / topicOrder.length) * 100
    };

    // Reference to user's overall progress
    const userOverallRef = firebase.database().ref(`userProgress/${userId}`);
    
    // Get existing data first to calculate overall stats
    userOverallRef.once('value')
      .then((snapshot) => {
        const data = snapshot.val() || {};
        const modules = data.modules || {};
        
        // Update this module data
        modules.cloudSecurity = currentModuleData;
        
        // Calculate overall progress
        let totalCompleted = 0;
        let totalTopics = 0;
        
        // Count completed topics from each module
        if (modules.introCybersec && modules.introCybersec.completedQuizzes) {
          totalTopics += 5; // Total topics in intro module
          totalCompleted += modules.introCybersec.completedQuizzes.length;
        }
        
        if (modules.attackTargets && modules.attackTargets.completedSections) {
          totalTopics += 5; // Total topics in attack targets module
          totalCompleted += modules.attackTargets.completedSections.length;
        }
        
        if (modules.phishingAttacks && modules.phishingAttacks.completedSections) {
          totalTopics += 4; // Total topics in phishing module
          totalCompleted += modules.phishingAttacks.completedSections.length;
        }
        
        if (modules.malwareInfections && modules.malwareInfections.completedSections) {
          totalTopics += 5; // Total topics in malware module
          totalCompleted += modules.malwareInfections.completedSections.length;
        }
        
        if (modules.cloudSecurity && modules.cloudSecurity.completedSections) {
          totalTopics += 5; // Total topics in cloud security module
          totalCompleted += modules.cloudSecurity.completedSections.length;
        }
        
        // Calculate completed modules count
        const completedModules = [
          modules.introCybersec?.progressPercentage === 100,
          modules.attackTargets?.progressPercentage === 100,
          modules.phishingAttacks?.progressPercentage === 100,
          modules.malwareInfections?.progressPercentage === 100,
          modules.cloudSecurity?.progressPercentage === 100
        ].filter(Boolean).length;
        
        // Update user progress document
        userOverallRef.update({
          modules: modules,
          completedModules: completedModules,
          totalModules: 5,
          completedTopics: totalCompleted,
          totalTopics: totalTopics,
          totalTimeMinutes: totalCompleted * 15, // Estimate 15 min per topic
          completionPercentage: (totalCompleted / totalTopics) * 100,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
      })
      .catch(error => console.error("Error updating overall progress:", error));
  }
  
  // Fallback to save to Firestore
  function saveToFirestore() {
    console.log("[DEBUG] Attempting to save to Firestore");
    if (!firebase || !firebase.firestore) {
      console.error("[DEBUG] Firestore not available");
      return;
    }
    
    try {
      const db = firebase.firestore();
      db.collection("users")
        .doc(userId)
        .set(
          {
            progress: {
              cloudSecurity: userProgress,
            },
          },
          { merge: true }
        )
        .then(() => {
          console.log("[DEBUG] Progress saved successfully to Firestore");
          updateUI();
        })
        .catch((error) => {
          console.error("[DEBUG] Error saving progress to Firestore:", error);
        });
    } catch (error) {
      console.error("[DEBUG] Exception in saveToFirestore:", error);
    }
  }
  
  // Function to determine if a topic should be accessible
  function isTopicAccessible(topicId) {
    const topicIndex = topicOrder.indexOf(topicId);

    // First topic is always accessible
    if (topicIndex === 0) return true;

    // For any other topic, the previous topic must be completed
    const previousTopicId = topicOrder[topicIndex - 1];
    const previousSectionId = topicToSection[previousTopicId];
    return userProgress.completedSections.includes(previousSectionId);
  }
  
  // Update the UI based on the user's progress
  function updateUI() {
    const progressTracker = document.querySelector(".progress-tracker");
    if (!progressTracker) return;
  
    const progressNodes = progressTracker.querySelectorAll(".progress-node");
    const progressLines = progressTracker.querySelectorAll(".progress-line");
  
    // Update progress tracker nodes
    progressNodes.forEach((node, index) => {
      const topicId = node.getAttribute("data-topic");
      const sectionId = topicToSection[topicId];
  
      if (userProgress.completedSections.includes(sectionId)) {
        node.classList.add("completed");
        node.classList.remove("locked", "active");
        if (index > 0 && progressLines[index - 1]) {
          progressLines[index - 1].classList.add("completed");
        }
      } else if (isTopicAccessible(topicId)) {
        node.classList.add("active");
        node.classList.remove("locked", "completed");
      } else {
        node.classList.add("locked");
        node.classList.remove("active", "completed");
      }
    });
  
    // Update overall progress percentage
    const progressElement = document.getElementById("module-progress");
    if (progressElement) {
      const completedCount = userProgress.completedSections.length;
      const totalSections = Object.keys(topicToSection).length;
      const progressPercent =
        totalSections > 0
          ? Math.round((completedCount / totalSections) * 100)
          : 0;
      progressElement.style.width = `${progressPercent}%`;
  
      const progressPercentText = document.getElementById("progress-percent");
      if (progressPercentText) {
        progressPercentText.textContent = `${progressPercent}%`;
      }
    }
  
    // Update locked sections
    document.querySelectorAll(".target-card").forEach((card) => {
      const targetId = card.getAttribute("data-target");
      const lockOverlay = card.querySelector(".lock-overlay");
      
      if (isTopicAccessible(targetId)) {
        card.classList.remove("locked");
        if (lockOverlay) lockOverlay.style.display = "none";
        
        // Make sure any debug lock overlays are also hidden
        const debugLockOverlay = card.querySelector(".debug-lock-overlay");
        if (debugLockOverlay) {
          debugLockOverlay.style.display = "none";
        }
      } else if (!card.classList.contains("active")) {
        card.classList.add("locked");
        if (lockOverlay) lockOverlay.style.display = "flex";
      }
    });
  }
  
  // Set up the accordion functionality
  setupAccordion();
  
  // Set up quizzes
  setupQuizzes();
  
  // Add reset progress button event listener
  const resetProgressBtn = document.getElementById("reset-progress");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", function () {
      if (
        confirm(
          "Are you sure you want to reset your progress for this module? This cannot be undone."
        )
      ) {
        userProgress = { completedSections: [] };
        
        // Save reset progress to Firebase if user is logged in
        if (userId) {
          if (firebase && firebase.database) {
            firebase.database().ref(`userProgress/${userId}/modules/cloudSecurity`).update({
              completedSections: [],
              progressPercentage: 0,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            });
          }
        }
        
        // Update UI
        updateUI();
        
        // Reset quiz UI elements
        document.querySelectorAll(".topic-quiz-btn").forEach(btn => {
          btn.textContent = "Check Answer";
          btn.classList.remove("success");
          btn.disabled = false;
        });
        
        document.querySelectorAll(".option").forEach(opt => {
          opt.classList.remove("selected", "correct", "incorrect");
        });
        
        document.querySelectorAll(".topic-quiz-results").forEach(res => {
          res.style.display = "none";
        });
        
        document.querySelectorAll(".target-card").forEach(card => {
          card.classList.remove("completed");
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
        
        // Clear celebration flag so it can be shown again after completing all sections
        localStorage.removeItem('cloudSecurityCelebrated');
      }
    });
  }
  
  // Set up the accordion functionality
  function setupAccordion() {
    console.log("[DEBUG] Setting up accordion functionality");
    // Check if already initialized to prevent duplicate event handlers
    if (window.accordionInitialized) {
      console.log("[DEBUG] Accordion already initialized, skipping");
      return;
    }
    
    const accordionHeaders = document.querySelectorAll(".attack-item h3");
    
    if (accordionHeaders.length === 0) {
      console.log("[DEBUG] No accordion headers found");
      return;
    }
  
    accordionHeaders.forEach((header) => {
      header.addEventListener("click", function () {
        const parent = this.parentElement;
        const isExpanded = parent.classList.contains("expanded");
  
        // Close all other expanded items
        document.querySelectorAll(".attack-item.expanded").forEach((item) => {
          if (item !== parent) {
            item.classList.remove("expanded");
          }
        });
  
        // Toggle the current item
        parent.classList.toggle("expanded", !isExpanded);
      });
    });
    
    window.accordionInitialized = true;
    console.log("[DEBUG] Accordion initialization complete");
  }
  
  // Set up quizzes
  function setupQuizzes() {
    console.log("[DEBUG] Setting up quiz functionality");
    // Check if already initialized to prevent duplicate event handlers
    if (window.quizzesInitialized) {
      console.log("[DEBUG] Quizzes already initialized, skipping");
      return;
    }
    
    const quizSections = document.querySelectorAll(".topic-quiz");
    
    if (quizSections.length === 0) {
      console.log("[DEBUG] No quiz sections found");
      return;
    }
  
    quizSections.forEach((quiz) => {
      const options = quiz.querySelectorAll(".option");
      const checkButton = quiz.querySelector(".topic-quiz-btn");
      const resultsDiv = quiz.querySelector(".topic-quiz-results");
      const correctFeedback = quiz.querySelector(".correct-answer");
      const incorrectFeedback = quiz.querySelector(".incorrect-answer");
      let selectedOption = null;
  
      // Handle option click
      options.forEach((option) => {
        option.addEventListener("click", function () {
          // Remove selected class from all options
          options.forEach((opt) => opt.classList.remove("selected"));
  
          // Add selected class to clicked option
          this.classList.add("selected");
          selectedOption = this;
        });
      });
  
      // Check answer button
      if (checkButton) {
        checkButton.addEventListener("click", function handleQuizButtonClick() {
          // If the button already says "Continue", it means we're navigating to the next section
          if (checkButton.textContent === "Continue") {
            console.log("[DEBUG] Continue button clicked");
            const currentCard = quiz.closest(".target-card");
            const nextCard = currentCard.nextElementSibling;
  
            if (nextCard && nextCard.classList.contains("target-card")) {
              console.log("[DEBUG] Scrolling to next section:", nextCard.getAttribute("data-target"));
              
              // Unlock the next section first
              const nextTopicId = nextCard.getAttribute("data-target");
              nextCard.classList.remove("locked");
              
              // Hide any lock overlays
              const lockOverlay = nextCard.querySelector(".lock-overlay");
              if (lockOverlay) {
                lockOverlay.style.display = "none";
              }
              
              const debugLockOverlay = nextCard.querySelector(".debug-lock-overlay");
              if (debugLockOverlay) {
                debugLockOverlay.style.display = "none";
              }
              
              // Scroll to the next section
              nextCard.scrollIntoView({ behavior: "smooth" });
  
              // Expand first attack item in next section
              setTimeout(() => {
                const nextAttackItem = nextCard.querySelector(".attack-item");
                if (nextAttackItem) {
                  nextAttackItem.classList.add("expanded");
                }
              }, 800);
            }
            return;
          }
          
          // Normal answer checking flow
          if (!selectedOption) {
            alert("Please select an answer first.");
            return;
          }
  
          resultsDiv.style.display = "block";
  
          if (selectedOption.getAttribute("data-correct") === "true") {
            correctFeedback.style.display = "block";
            incorrectFeedback.style.display = "none";
            selectedOption.classList.add("correct");
            checkButton.textContent = "Continue";
            checkButton.classList.add("success");
  
            // Get the section ID from the target card
            const targetCard = quiz.closest(".target-card");
            if (targetCard) {
              const sectionId = targetCard.getAttribute("data-target");
  
              // Mark section as completed
              if (
                sectionId &&
                !userProgress.completedSections.includes(sectionId)
              ) {
                console.log("[DEBUG] Marking section as completed:", sectionId);
                userProgress.completedSections.push(sectionId);
                saveUserProgress();
                updateUI();
  
                // Show celebration if all sections are completed
                setTimeout(() => {
                  showCelebration();
                }, 1000);
              }
            }
          } else {
            correctFeedback.style.display = "none";
            incorrectFeedback.style.display = "block";
            selectedOption.classList.add("incorrect");
          }
        });
      }
    });
    
    window.quizzesInitialized = true;
    console.log("[DEBUG] Quiz initialization complete");
  }
  
  // Show celebration animation when section is completed
  function showCelebration() {
    const celebrationContainer = document.querySelector(".celebration-container");
    if (!celebrationContainer) return;
    
    // Only show celebration if all sections are completed
    const completedCount = userProgress.completedSections.length;
    const totalSections = 5; // Total sections in module
    
    // Check if all sections are completed and celebration hasn't been shown before
    if (completedCount < totalSections) {
      console.log("[DEBUG] Not showing celebration yet. Completed: " + completedCount + "/" + totalSections);
      return;
    }
    
    // Check if celebration was already shown
    if (localStorage.getItem('cloudSecurityCelebrated') === 'true') {
      console.log("[DEBUG] Celebration already shown before, not showing again");
      return;
    }
    
    // Mark as celebrated to prevent showing again
    localStorage.setItem('cloudSecurityCelebrated', 'true');
  
    celebrationContainer.classList.add("active");
    celebrationContainer.style.opacity = "1";
    celebrationContainer.style.visibility = "visible";
  
    // Update celebration stats
    const statValues = celebrationContainer.querySelectorAll(".stat-value");
  
    if (statValues.length >= 1) {
      statValues[0].textContent = `${completedCount}/${totalSections}`;
    }
  
    // Add confetti effect
    for (let i = 0; i < 100; i++) {
      createConfetti(celebrationContainer);
    }
    
    // Create trophy sparkles
    createSparkles();
  
    // Add click event to continue button
    const continueBtn = celebrationContainer.querySelector(".celebration-btn");
    if (continueBtn) {
      continueBtn.addEventListener("click", function () {
        celebrationContainer.classList.remove("active");
        celebrationContainer.style.opacity = "0";
        celebrationContainer.style.visibility = "hidden";
        
        // Remove confetti to clean up
        setTimeout(() => {
          document.querySelectorAll('.confetti').forEach((el) => el.remove());
        }, 500);
      });
    }
  
    // Auto-hide celebration after 5 seconds
    setTimeout(() => {
      celebrationContainer.classList.remove("active");
      celebrationContainer.style.opacity = "0";
      celebrationContainer.style.visibility = "hidden";
    }, 5000);
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
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `${Math.random() * 40}%`;
    confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
  
    container.appendChild(confetti);
  
    // Remove confetti after animation
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
  
  // Create sparkles for the trophy
  function createSparkles() {
    const sparkleContainer = document.getElementById("trophy-sparkle");
    if (!sparkleContainer) return;

    for (let i = 0; i < 15; i++) {
      const sparkle = document.createElement("span");
      sparkle.style.top = Math.random() * 100 + "%";
      sparkle.style.left = Math.random() * 100 + "%";
      sparkle.style.width = Math.random() * 4 + 2 + "px";
      sparkle.style.height = sparkle.style.width;
      sparkle.style.animationDelay = Math.random() * 2 + "s";
      sparkleContainer.appendChild(sparkle);
    }
  }

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

// Define logout function (accessible globally)
function logout() {
  console.log("[DEBUG] Logging out user");
  if (firebase && firebase.auth) {
    firebase.auth()
      .signOut()
      .then(() => {
        console.log("[DEBUG] User signed out successfully");
        // Remove current user from localStorage for backward compatibility
        localStorage.removeItem("currentUser");
        // Redirect to login page
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error("[DEBUG] Sign out error:", error);
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