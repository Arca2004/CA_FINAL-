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

  // Elements for profile dropdown
  const authNavItem = document.getElementById("auth-nav-item");
  const loginLink = document.getElementById("login-link");
  const profileContainer = document.getElementById("profile-container");
  const profileAvatar = document.getElementById("profile-avatar");
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

  // Define topic progression order
  const topicOrder = [
    "application-security",
    "cloud-security",
    "identity-management",
    "mobile-security",
    "network-security",
  ];

  // Initialize variables
  let completedQuizzes = [];
  let currentUser = null;

  // Check for Firebase auth state
  if (firebase && firebase.auth) {
    console.log("[DEBUG] Setting up Firebase Auth state listener");
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log("[DEBUG] User signed in:", user.uid);
        // User is signed in with Firebase
        currentUser = user;
        if (loginLink) loginLink.style.display = "none";
        if (profileContainer) profileContainer.style.display = "block";
        if (profileInitial) profileInitial.textContent = getUserInitial(user);
        if (profileName) profileName.textContent = ""; // No account name text

        // Store in localStorage for backward compatibility
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            uid: user.uid, // Store the UID to ensure consistency
            username: user.email,
            fullname: user.displayName || "Cyber Academy User",
            initial: getUserInitial(user),
          })
        );

        // Load user progress from Firebase Realtime Database
        loadUserProgress(user.uid);
        
        // Schedule another UI refresh after a short delay to ensure everything is displayed
        setTimeout(() => {
          console.log("[DEBUG] Running delayed UI refresh");
          updateProgress();
          updateCompletedItems();
          updateProgressNodes();
          updateTopicAccessibility();
          refreshProgressIndicators();
          
          // Apply completed state to progress nodes again
          document.querySelectorAll(".progress-node").forEach(node => {
            const topicId = node.getAttribute("data-topic");
            if (completedQuizzes.includes(topicId)) {
              node.classList.add("completed");
              
              // Also update the connecting line to this node
              const prevLine = node.previousElementSibling;
              if (prevLine && prevLine.classList.contains("progress-line")) {
                prevLine.classList.add("completed");
              }
            }
          });
          
          // Update the main progress bar directly
          const progressBar = document.getElementById("module-progress");
          if (progressBar) {
            const percentage = (completedQuizzes.length / topicOrder.length) * 100;
            progressBar.style.width = `${percentage}%`;
          }
        }, 1000); // Run again after 1 second
      } else {
        console.log("[DEBUG] User is signed out, checking localStorage");
        // Check localStorage for backward compatibility
        const localUser = JSON.parse(localStorage.getItem("currentUser"));
        if (localUser) {
          console.log("[DEBUG] Found user in localStorage:", localUser);
          if (loginLink) loginLink.style.display = "none";
          if (profileContainer) profileContainer.style.display = "block";
          if (profileInitial)
            profileInitial.textContent = getUserInitial(localUser);
          if (profileName) profileName.textContent = ""; // No account name text
          
          // If we have a UID in localStorage, try to load progress from Firebase
          if (localUser.uid) {
            console.log("[DEBUG] Found UID in localStorage, loading progress from Firebase");
            loadUserProgress(localUser.uid);
            
            // Schedule another UI refresh after a short delay
            setTimeout(() => {
              console.log("[DEBUG] Running delayed UI refresh for localStorage user");
              updateProgress();
              updateCompletedItems();
              updateProgressNodes();
              updateTopicAccessibility();
              refreshProgressIndicators();
              
              // Apply completed state to progress nodes again
              document.querySelectorAll(".progress-node").forEach(node => {
                const topicId = node.getAttribute("data-topic");
                if (completedQuizzes.includes(topicId)) {
                  node.classList.add("completed");
                  
                  // Also update the connecting line to this node
                  const prevLine = node.previousElementSibling;
                  if (prevLine && prevLine.classList.contains("progress-line")) {
                    prevLine.classList.add("completed");
                  }
                }
              });
              
              // Update the main progress bar directly
              const progressBar = document.getElementById("module-progress");
              if (progressBar) {
                const percentage = (completedQuizzes.length / topicOrder.length) * 100;
                progressBar.style.width = `${percentage}%`;
              }
            }, 1000); // Run again after 1 second
          } else {
            // Fall back to local storage for progress
            console.log("[DEBUG] No UID in localStorage, using local progress only");
            const storedQuizzes = localStorage.getItem("introCompletedQuizzes");
            if (storedQuizzes) {
              completedQuizzes = JSON.parse(storedQuizzes);
              updateTopicAccessibility();
              updateProgress();
            }
          }
        } else {
          console.log("[DEBUG] No user found, showing login link");
          if (loginLink) loginLink.style.display = "block";
          if (profileContainer) profileContainer.style.display = "none";
        }
      }
    });
  } else {
    // Fallback for older version
    const localUser = JSON.parse(localStorage.getItem("currentUser"));
    if (localUser) {
      if (loginLink) loginLink.style.display = "none";
      if (profileContainer) profileContainer.style.display = "block";
      if (profileInitial)
        profileInitial.textContent = getUserInitial(localUser);
      if (profileName) profileName.textContent = ""; // No account name text
      
      // Fall back to local storage for progress
      const storedQuizzes = localStorage.getItem("introCompletedQuizzes");
      if (storedQuizzes) {
        completedQuizzes = JSON.parse(storedQuizzes);
        updateTopicAccessibility();
        updateProgress();
      }
    } else {
      if (loginLink) loginLink.style.display = "block";
      if (profileContainer) profileContainer.style.display = "none";
    }
  }

  // Load user progress from Firebase Realtime Database
  function loadUserProgress(userId) {
    console.log("[DEBUG] loadUserProgress called with userId:", userId);
    
    if (!firebase.database) {
      console.error("Firebase Realtime Database is not available");
      return;
    }

    // Reference to the user's progress data in RTDB
    const userProgressRef = firebase.database().ref(`userProgress/${userId}/modules/introCybersec`);
    console.log("[DEBUG] Attempting to load from path:", `userProgress/${userId}/modules/introCybersec`);
    
    userProgressRef.once('value')
      .then((snapshot) => {
        const data = snapshot.val();
        console.log("[DEBUG] Firebase data loaded:", data);
        
        if (data && data.completedQuizzes) {
          completedQuizzes = data.completedQuizzes;
          console.log("[DEBUG] Setting completedQuizzes from Firebase:", completedQuizzes);
          
          // Once we have RTDB data, update localStorage as backup
          localStorage.setItem("introCompletedQuizzes", JSON.stringify(completedQuizzes));
        } else {
          console.log("[DEBUG] No data from Firebase, checking localStorage");
          // No data in database, check localStorage
          const localData = JSON.parse(localStorage.getItem("introCompletedQuizzes")) || [];
          
          if (localData.length > 0) {
            console.log("[DEBUG] Found data in localStorage, will use and sync to Firebase");
            completedQuizzes = localData;
            
            // Sync localStorage to Firebase
            userProgressRef.update({
              completedQuizzes: completedQuizzes,
              progressPercentage: (completedQuizzes.length / 5) * 100,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            });
          } else {
            console.log("[DEBUG] No progress data found anywhere, starting fresh");
            completedQuizzes = [];
          }
        }
        
        // Ensure UI is fully updated with the loaded data
        console.log("[DEBUG] Fully updating UI with loaded progress data");
        updateProgress(); // Update the progress bar
        updateCompletedItems(); // Update quiz UI components
        updateProgressNodes(); // Update progress node indicators
        updateTopicAccessibility(); // Update topic locks
        
        // Trigger a full UI refresh for progress indicators
        refreshProgressIndicators();
      })
      .catch((error) => {
        console.error("[DEBUG] Error loading progress from Firebase:", error);
        
        // Fall back to localStorage if Firebase fails
        const localData = JSON.parse(localStorage.getItem("introCompletedQuizzes")) || [];
        completedQuizzes = localData;
        updateProgress();
        updateCompletedItems();
        updateProgressNodes();
        updateTopicAccessibility();
      });
  }

  // Save user progress to Firebase Realtime Database
  function saveUserProgress(userId, topicId) {
    if (!firebase.database || !userId) {
      // Save to localStorage as backup
      localStorage.setItem("introCompletedQuizzes", JSON.stringify(completedQuizzes));
      return;
    }

    // Calculate progress percentage
    const progressPercentage = (completedQuizzes.length / topicOrder.length) * 100;

    // Reference to the user's progress data in RTDB
    const userProgressRef = firebase.database().ref(`userProgress/${userId}/modules/introCybersec`);
    
    // Update the RTDB data
    userProgressRef.update({
      completedQuizzes: completedQuizzes,
      lastUpdated: firebase.database.ServerValue.TIMESTAMP,
      progressPercentage: progressPercentage
    })
    .then(() => {
      console.log("Progress saved to Firebase Realtime Database");
      
      // Also update localStorage as backup
      localStorage.setItem("introCompletedQuizzes", JSON.stringify(completedQuizzes));
      
      // Update user's overall progress in profile
      updateOverallProgress(userId);
    })
    .catch((error) => {
      console.error("Error saving progress:", error);
      // Save to localStorage as backup
      localStorage.setItem("introCompletedQuizzes", JSON.stringify(completedQuizzes));
    });
  }

  // Update overall progress for profile page
  function updateOverallProgress(userId) {
    if (!firebase.database || !userId) return;

    // Get current module data
    const currentModuleData = {
      completedQuizzes: completedQuizzes,
      progressPercentage: (completedQuizzes.length / topicOrder.length) * 100
    };

    // Reference to the user's overall progress data
    const userOverallRef = firebase.database().ref(`userProgress/${userId}`);

    // Get existing data first to calculate overall stats
    userOverallRef.once('value')
      .then((snapshot) => {
        const data = snapshot.val() || {};
        const modules = data.modules || {};
        
        // Update our module data
        modules.introCybersec = currentModuleData;
        
        // Calculate total modules and completed modules
        const modulesStats = {
          total: 4, // Adjust based on your total modules
          completed: 0,
          topics: 0,
          totalTimeMinutes: 0
        };
        
        // Check intro module
        if (modules.introCybersec && modules.introCybersec.completedQuizzes) {
          const introProgress = modules.introCybersec.completedQuizzes.length || 0;
          if (introProgress === topicOrder.length) {
            modulesStats.completed++;
          }
          modulesStats.topics += introProgress;
          modulesStats.totalTimeMinutes += introProgress * 15; // Estimate 15 min per topic
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

  console.log("DOM loaded - applying locks");

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
    console.log("Updating topic accessibility");

    topicOrder.forEach((topicId, index) => {
      const topicCard = document.querySelector(
        `.target-card[data-target="${topicId}"]`
      );
      if (!topicCard) {
        console.log(`Target card for ${topicId} not found`);
        return;
      }

      const isAccessible = isTopicAccessible(topicId);
      console.log(`${topicId} is accessible: ${isAccessible}`);

      // Update progress tracker nodes
      const progressNode = document.querySelector(
        `.progress-node[data-topic="${topicId}"]`
      );
      if (progressNode) {
        progressNode.classList.remove("active", "completed", "locked");

        const baseTooltip = progressNode
          .getAttribute("data-tooltip")
          .split(" - ")[0];

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
              ? topicOrder[index - 1]
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())
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

      // Add/remove lock overlay
      if (!isAccessible && !topicCard.classList.contains("locked")) {
        // Lock the topic
        console.log(`Locking ${topicId}`);
        topicCard.classList.add("locked");

        // Add lock overlay if not already present
        if (!topicCard.querySelector(".lock-overlay")) {
          const lockOverlay = document.createElement("div");
          lockOverlay.className = "lock-overlay";

          const lockIcon = document.createElement("i");
          lockIcon.className = "fas fa-lock";
          lockOverlay.appendChild(lockIcon);

          const lockMessage = document.createElement("p");
          lockMessage.className = "lock-message";
          const prevTopicName =
            index > 0
              ? topicOrder[index - 1]
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              : "";
          lockMessage.textContent = `Complete "${prevTopicName}" to unlock`;
          lockOverlay.appendChild(lockMessage);

          topicCard.appendChild(lockOverlay);

          // Disable all interactive elements in locked topics
          topicCard
            .querySelectorAll(
              ".practical-exercise, .topic-quiz .option, .topic-quiz-btn"
            )
            .forEach((element) => {
              element.style.pointerEvents = "none";
            });
        }
      } else if (isAccessible && topicCard.classList.contains("locked")) {
        // Unlock the topic
        console.log(`Unlocking ${topicId}`);
        topicCard.classList.remove("locked");

        // Remove lock overlay
        const lockOverlay = topicCard.querySelector(".lock-overlay");
        if (lockOverlay) {
          lockOverlay.remove();
        }

        // Re-enable all interactive elements
        topicCard
          .querySelectorAll(
            ".practical-exercise, .topic-quiz .option, .topic-quiz-btn"
          )
          .forEach((element) => {
            element.style.pointerEvents = "auto";
          });
      }
    });
  }

  // Run immediately
  updateTopicAccessibility();

  // Add event listeners for quiz options
  document.querySelectorAll(".topic-quiz .option").forEach((option) => {
    option.addEventListener("click", function () {
      const targetId = this.closest(".target-card").getAttribute("data-target");

      // Check if the topic is accessible
      if (!isTopicAccessible(targetId)) {
        return;
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

  // Reset progress button
  const resetProgressBtn = document.getElementById("reset-progress");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", function() {
      if (confirm("Are you sure you want to reset your progress for this module? This cannot be undone.")) {
        completedQuizzes = [];
        
        // Save to Firebase if user ID is available
        let userId = null;
              
        // First try to get UID from Firebase auth
        if (firebase && firebase.auth && firebase.auth().currentUser) {
          userId = firebase.auth().currentUser.uid;
          console.log("[DEBUG] Got UID from Firebase Auth for reset:", userId);
        }
        // Fallback to localStorage if Firebase auth is not available
        else {
          const localUser = JSON.parse(localStorage.getItem("currentUser"));
          if (localUser && localUser.uid) {
            userId = localUser.uid;
            console.log("[DEBUG] Got UID from localStorage for reset:", userId);
          }
        }
        
        if (userId) {
          console.log("[DEBUG] Saving reset progress for user:", userId);
          saveUserProgress(userId);
          // Also clear the celebrated flag in Firebase if present
          if (firebase && firebase.database) {
            firebase.database().ref(`userProgress/${userId}/modules/introCybersec`).update({
              celebrated: false
            });
          }
        } else {
          console.log("[DEBUG] No user ID found, saving reset to localStorage only");
          localStorage.setItem("introCompletedQuizzes", JSON.stringify(completedQuizzes));
        }
        // Clear the celebration flag so it can show again after re-completion
        localStorage.removeItem('introCybersecCelebrated');
        
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
      }
    });
  }

  // Add event listeners for quiz buttons
  const topicQuizButtons = document.querySelectorAll(".topic-quiz-btn");
  topicQuizButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const quizContainer = this.closest(".topic-quiz");
      const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
      const correctAnswer = quizContainer.querySelector(".correct-answer");
      const incorrectAnswer = quizContainer.querySelector(".incorrect-answer");
      const selectedOption = quizContainer.querySelector(".option.selected");
      const targetId = this.closest(".target-card").getAttribute("data-target");

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
            
            // Save progress to Firebase if user is logged in
            let userId = null;
            
            // First try to get UID from Firebase auth
            if (firebase && firebase.auth && firebase.auth().currentUser) {
              userId = firebase.auth().currentUser.uid;
              console.log("[DEBUG] Got UID from Firebase Auth:", userId);
            }
            // Fallback to localStorage if Firebase auth is not available
            else {
              const localUser = JSON.parse(localStorage.getItem("currentUser"));
              if (localUser && localUser.uid) {
                userId = localUser.uid;
                console.log("[DEBUG] Got UID from localStorage:", userId);
              }
            }
            
            if (userId) {
              console.log("[DEBUG] Saving progress for user:", userId);
              saveUserProgress(userId, targetId);
            } else {
              console.log("[DEBUG] No user ID found, saving to localStorage only");
              localStorage.setItem("introCompletedQuizzes", JSON.stringify(completedQuizzes));
            }

            // Update accessibility for next topics
            updateTopicAccessibility();
            // Update the progress bar
            updateProgress();

            // Check for module completion celebration
            if (completedQuizzes.length === topicOrder.length) {
              setTimeout(() => {
                showCelebration();
              }, 1000);
            }
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

  // Function to update progress bar
  function updateProgress() {
    console.log("[DEBUG] Updating progress bar with completed quizzes:", completedQuizzes.length);
    const totalTopics = topicOrder.length;
    const progressBar = document.getElementById("module-progress");

    if (progressBar) {
      const progressPercentage = (completedQuizzes.length / totalTopics) * 100;
      console.log("[DEBUG] Setting progress bar width to:", progressPercentage + "%");
      
      // Set the width explicitly
      progressBar.style.width = `${progressPercentage}%`;
      
      // Force a style recalculation
      void progressBar.offsetWidth;
      
      // Set it again to ensure it's applied
      setTimeout(() => {
        progressBar.style.width = `${progressPercentage}%`;
      }, 50);
      
      // Also update all progress nodes
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
  }

  // Function to show celebration modal when module is completed
  function showCelebration() {
    // Only show if not already celebrated
    if (localStorage.getItem('introCybersecCelebrated') === 'true') return;
    localStorage.setItem('introCybersecCelebrated', 'true');

    // Optionally, sync to Firebase for logged-in users
    if (firebase && firebase.auth && firebase.auth().currentUser && firebase.database) {
      const userId = firebase.auth().currentUser.uid;
      firebase.database().ref(`userProgress/${userId}/modules/introCybersec`).update({
        celebrated: true
      });
    }

    const celebrationContainer = document.querySelector('.celebration-container');
    if (
      celebrationContainer &&
      !celebrationContainer.classList.contains('active')
    ) {
      celebrationContainer.classList.add('active');

      // Add confetti
      function createConfetti() {
        const colors = ['#5cdb95', '#88ccf1', '#f1c40f', '#e74c3c', '#9b59b6'];
        const confettiCount = 200;
        for (let i = 0; i < confettiCount; i++) {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.left = Math.random() * 100 + 'vw';
          confetti.style.width = Math.random() * 10 + 'px';
          confetti.style.height = Math.random() * 10 + 'px';
          confetti.style.opacity = Math.random();
          confetti.style.animation = 'floatConfetti ' + (Math.random() * 3 + 2) + 's ease-in infinite';
          celebrationContainer.appendChild(confetti);
        }
      }
      createConfetti();

      // Add trophy sparkles
      function createSparkles() {
        const sparkleContainer = document.getElementById('trophy-sparkle');
        if (!sparkleContainer) return;
        for (let i = 0; i < 15; i++) {
          const sparkle = document.createElement('span');
          sparkle.style.width = Math.random() * 4 + 2 + 'px';
          sparkle.style.height = sparkle.style.width;
          sparkle.style.top = Math.random() * 100 + '%';
          sparkle.style.left = Math.random() * 100 + '%';
          sparkle.style.animationDelay = Math.random() * 2 + 's';
          sparkleContainer.appendChild(sparkle);
        }
      }
      createSparkles();

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
            <a href="network-security.html" class="nav-button next">
              Next Lesson: Network Security <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        `;
        content.appendChild(navigationSection);
      }

      // Close celebration on button click
      const celebrationBtn = celebrationContainer.querySelector('.celebration-btn');
      if (celebrationBtn) {
        celebrationBtn.addEventListener('click', () => {
          celebrationContainer.classList.remove('active');
          setTimeout(() => {
            // Remove confetti to clean up
            document.querySelectorAll('.confetti').forEach((el) => el.remove());
          }, 500);
        });
      }
    }
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
    
    // Update topic accessibility after updating completed items
    updateTopicAccessibility();
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
      const baseTooltip = progressNode.getAttribute("data-tooltip").split(" - ")[0];
      
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
  
  // Function to ensure all progress indicators are properly refreshed
  function refreshProgressIndicators() {
    console.log("[DEBUG] Refreshing all progress indicators");
    
    // Refresh the main progress bar
    const progressBar = document.getElementById("module-progress");
    if (progressBar) {
      const progressPercentage = (completedQuizzes.length / topicOrder.length) * 100;
      progressBar.style.width = `${progressPercentage}%`;
      
      // Force a repaint by accessing the computed style
      void progressBar.offsetWidth;
    }
    
    // Force a repaint of all progress nodes
    document.querySelectorAll(".progress-node").forEach(node => {
      void node.offsetWidth;
    });
    
    // Force a repaint of all progress lines
    document.querySelectorAll(".progress-line").forEach(line => {
      void line.offsetWidth;
    });
    
    // Make sure topic cards reflect locked/unlocked state
    topicOrder.forEach(topicId => {
      const card = document.querySelector(`.target-card[data-target="${topicId}"]`);
      if (!card) return;
      
      if (completedQuizzes.includes(topicId)) {
        card.classList.add("completed");
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
