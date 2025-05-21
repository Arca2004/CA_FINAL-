document.addEventListener("DOMContentLoaded", function () {
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

  // Check for Firebase auth state
  if (firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in with Firebase
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
        // Check localStorage for backward compatibility
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
          if (loginLink) loginLink.style.display = "none";
          if (profileContainer) profileContainer.style.display = "block";
          if (profileInitial)
            profileInitial.textContent = getUserInitial(currentUser);
          if (profileName) profileName.textContent = ""; // No account name text
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
      if (profileName) profileName.textContent = ""; // No account name text
    } else {
      if (loginLink) loginLink.style.display = "block";
      if (profileContainer) profileContainer.style.display = "none";
    }
  }

  // Initialize arrays to track progress
  let completedSections = [];
  let completedQuizzes = [];
  
  // Define topic progression order
  const topicOrder = [
    "individuals",
    "businesses",
    "government",
    "infrastructure",
    "financial",
  ];
  
  // Load progress data from Firebase when the page loads
  loadProgressFromFirebase();

  // Function to load progress data from Firebase Realtime Database
  function loadProgressFromFirebase() {
    console.log("[DEBUG] Loading attack targets progress from Firebase");
    
    // Check if user is logged in with Firebase
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      const userId = firebase.auth().currentUser.uid;
      console.log("[DEBUG] Loading progress for Firebase user:", userId);
      
      if (firebase.database) {
        // Load progress from Realtime Database
        firebase.database().ref(`userProgress/${userId}/modules/attackTargets`).once('value')
          .then((snapshot) => {
            const data = snapshot.val() || {};
            console.log("[DEBUG] Attack targets data loaded:", data);
            
            // Load progress data
            completedSections = data.completedSections || [];
            completedQuizzes = data.completedQuizzes || [];
            
            // Update localStorage as backup
            localStorage.setItem("attackCompletedSections", JSON.stringify(completedSections));
            localStorage.setItem("attackCompletedQuizzes", JSON.stringify(completedQuizzes));
            
            // If Firebase has no data but localStorage does, sync to Firebase
            if (completedSections.length === 0 && completedQuizzes.length === 0) {
              const localSections = JSON.parse(localStorage.getItem("attackCompletedSections")) || [];
              const localQuizzes = JSON.parse(localStorage.getItem("attackCompletedQuizzes")) || [];
              
              if (localSections.length > 0 || localQuizzes.length > 0) {
                console.log("[DEBUG] Found data in localStorage, syncing to Firebase");
                completedSections = localSections;
                completedQuizzes = localQuizzes;
                
                // Save to Firebase
                saveProgressToFirebase();
              }
            }
            
            initializeProgressUI();
            refreshProgressIndicators(); // Force a UI refresh
          })
          .catch((error) => {
            console.error("[DEBUG] Error loading progress from Firebase:", error);
            
            // Fallback to localStorage
            completedSections = JSON.parse(localStorage.getItem("attackCompletedSections")) || [];
            completedQuizzes = JSON.parse(localStorage.getItem("attackCompletedQuizzes")) || [];
            initializeProgressUI();
          });
      } else {
        console.error("[DEBUG] Firebase Database is not available");
        // Fallback to localStorage
        completedSections = JSON.parse(localStorage.getItem("attackCompletedSections")) || [];
        completedQuizzes = JSON.parse(localStorage.getItem("attackCompletedQuizzes")) || [];
        initializeProgressUI();
      }
    } else {
      // Check localStorage for user ID
      const localUser = JSON.parse(localStorage.getItem("currentUser"));
      if (localUser && localUser.uid && firebase.database) {
        console.log("[DEBUG] Loading progress using localStorage UID:", localUser.uid);
        
        // Load progress from Realtime Database using localStorage UID
        firebase.database().ref(`userProgress/${localUser.uid}/modules/attackTargets`).once('value')
          .then((snapshot) => {
            const data = snapshot.val() || {};
            
            // Load progress data
            completedSections = data.completedSections || [];
            completedQuizzes = data.completedQuizzes || [];
            
            // Update localStorage as backup
            localStorage.setItem("attackCompletedSections", JSON.stringify(completedSections));
            localStorage.setItem("attackCompletedQuizzes", JSON.stringify(completedQuizzes));
            
            initializeProgressUI();
            refreshProgressIndicators(); // Force a UI refresh
          })
          .catch(error => {
            console.error("[DEBUG] Error loading progress with localStorage UID:", error);
            
            // Fallback to localStorage
            completedSections = JSON.parse(localStorage.getItem("attackCompletedSections")) || [];
            completedQuizzes = JSON.parse(localStorage.getItem("attackCompletedQuizzes")) || [];
            initializeProgressUI();
          });
      } else {
        // Fallback to localStorage if no Firebase or user ID
        console.log("[DEBUG] No user ID available, using localStorage only");
        completedSections = JSON.parse(localStorage.getItem("attackCompletedSections")) || [];
        completedQuizzes = JSON.parse(localStorage.getItem("attackCompletedQuizzes")) || [];
        initializeProgressUI();
      }
    }
  }
  
  // Function to save progress data to Firebase Realtime Database
  function saveProgressToFirebase() {
    console.log("[DEBUG] Saving attack targets progress to Firebase");
    
    // Save to localStorage as backup
    localStorage.setItem("attackCompletedSections", JSON.stringify(completedSections));
    localStorage.setItem("attackCompletedQuizzes", JSON.stringify(completedQuizzes));
    
    // Check if user is logged in with Firebase
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      const userId = firebase.auth().currentUser.uid;
      
      if (firebase.database) {
        // Calculate progress percentage
        const totalTopics = topicOrder.length;
        const progressPercentage = Math.round((completedQuizzes.length / totalTopics) * 100);
        
        // Save to Realtime Database
        firebase.database().ref(`userProgress/${userId}/modules/attackTargets`).update({
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
        firebase.database().ref(`userProgress/${userId}/modules/attackTargets`).update({
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
      // Record the current width
      const currentWidth = progressBar.style.width;
      
      // Reset width to force a repaint
      progressBar.style.width = '0%';
      
      // Force browser to acknowledge the change
      void progressBar.offsetWidth;
      
      // Set back to original value
      progressBar.style.width = currentWidth;
    }
  }

  function initializeProgressUI() {
    // Update the UI with completed sections from completed quizzes
    completedQuizzes.forEach((targetId) => {
      // When a quiz is completed, mark the section as completed too
      if (!completedSections.includes(targetId)) {
        completedSections.push(targetId);
      }

      const card = document.querySelector(
        `.target-card[data-target="${targetId}"]`
      );
      if (card) {
        card.classList.add("completed");

        const quizContainer = card.querySelector(".topic-quiz");
        if (quizContainer) {
          const quizBtn = quizContainer.querySelector(".topic-quiz-btn");
          const correctOption = quizContainer.querySelector(
            '.option[data-correct="true"]'
          );
          const resultsDiv = quizContainer.querySelector(".topic-quiz-results");
          const correctAnswer = quizContainer.querySelector(".correct-answer");

          if (quizBtn && correctOption && resultsDiv && correctAnswer) {
            correctOption.classList.add("selected");
            resultsDiv.style.display = "block";
            correctAnswer.style.display = "block";
            quizBtn.textContent = "Correct!";
            quizBtn.classList.add("success");
            quizBtn.disabled = true;
          }
        }
      }
    });

    // Initialize topic locking based on progression
    updateTopicAccessibility();
    updateProgress();
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

      if (!isAccessible && !topicCard.classList.contains("locked")) {
        // Lock the topic
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
              ".attack-item, .topic-quiz .option, .topic-quiz-btn"
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
            ".attack-item, .topic-quiz .option, .topic-quiz-btn"
          )
          .forEach((element) => {
            element.style.pointerEvents = "auto";
          });
      }
    });
  }

  initializeProgressUI();

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
            localStorage.setItem(
              "attackCompletedQuizzes",
              JSON.stringify(completedQuizzes)
            );

            // Also mark the section as completed when quiz is completed
            if (!completedSections.includes(targetId)) {
              completedSections.push(targetId);
              localStorage.setItem(
                "attackCompletedSections",
                JSON.stringify(completedSections)
              );

              // Mark the card as completed
              const card = document.querySelector(
                `.target-card[data-target="${targetId}"]`
              );
              if (card) {
                card.classList.add("completed");
              }
            }

            // Update accessibility for next topics
            updateTopicAccessibility();
            updateProgress();
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

  function updateProgress() {
    const totalSections = 5;
    const progressBar = document.getElementById("module-progress");
    const overallProgress = document.getElementById("overall-progress");
    const topicsCompleted = document.getElementById("topics-completed");
    const quizzesPassed = document.getElementById("quizzes-passed");

    let progressPercentage = 0;
    // Since we're basing completion only on quizzes, simplify the calculation
    progressPercentage = (completedQuizzes.length / totalSections) * 100;
    progressPercentage = Math.round(progressPercentage);

    progressBar.style.width = `${progressPercentage}%`;

    if (overallProgress) {
      overallProgress.style.width = `${progressPercentage}%`;
    }

    if (topicsCompleted) {
      topicsCompleted.textContent = completedQuizzes.length;
    }

    if (quizzesPassed) {
      quizzesPassed.textContent = completedQuizzes.length;
    }

    // Save progress to Firebase and localStorage
    saveProgressToFirebase();
    
    // Force repaint of progress indicators
    setTimeout(refreshProgressIndicators, 100);

    // Check if all topics are completed and show celebration
    if (completedQuizzes.length === totalSections) {
      // Only show if not already celebrated
      if (localStorage.getItem('attackTargetsCelebrated') !== 'true') {
        setTimeout(() => {
          showCelebration();
        }, 1000);
        localStorage.setItem('attackTargetsCelebrated', 'true');
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

  function showCelebration() {
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

      // Add navigation buttons
      const navigationSection = document.createElement('div');
      navigationSection.className = 'lesson-navigation';
      navigationSection.innerHTML = `
        <div class="nav-container">
          <a href="learn.html" class="nav-button back">
            <i class="fas fa-arrow-left"></i> Back to Learning Hub
          </a>
          <a href="phishing-attack.html" class="nav-button next">
            Next Lesson: Phishing Attacks <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      `;
      celebrationContainer.querySelector('.celebration-content').appendChild(navigationSection);

      // Close celebration on button click
      document
        .querySelector(".celebration-btn")
        .addEventListener("click", () => {
          celebrationContainer.classList.remove("active");
          setTimeout(() => {
            // Remove confetti to clean up
            document.querySelectorAll(".confetti").forEach((el) => el.remove());
          }, 500);
        });
    }
  }

  const resetProgressBtn = document.getElementById("reset-progress");
  resetProgressBtn.addEventListener("click", function () {
    if (
      confirm(
        "Are you sure you want to reset all progress? This cannot be undone."
      )
    ) {
      // Clear localStorage
      localStorage.removeItem("attackCompletedSections");
      localStorage.removeItem("attackCompletedQuizzes");
      
      // Reset arrays
      completedSections = [];
      completedQuizzes = [];
      
      // Reset in Firebase if user is logged in
      if (firebase && firebase.auth) {
        if (firebase.auth().currentUser) {
          const userId = firebase.auth().currentUser.uid;
          if (firebase.database) {
            // Reset data in Firebase
            firebase.database().ref(`userProgress/${userId}/modules/attackTargets`).update({
              completedSections: [],
              completedQuizzes: [],
              progressPercentage: 0,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            })
            .then(() => {
              console.log("[DEBUG] Progress reset in Firebase");
              updateOverallProgress(userId); // Update overall progress
            })
            .catch(error => {
              console.error("[DEBUG] Error resetting progress in Firebase:", error);
            });
          }
        } else {
          // Try using UID from localStorage
          const localUser = JSON.parse(localStorage.getItem("currentUser"));
          if (localUser && localUser.uid && firebase.database) {
            firebase.database().ref(`userProgress/${localUser.uid}/modules/attackTargets`).update({
              completedSections: [],
              completedQuizzes: [],
              progressPercentage: 0,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            })
            .then(() => {
              console.log("[DEBUG] Progress reset in Firebase using localStorage UID");
              updateOverallProgress(localUser.uid);
            })
            .catch(error => {
              console.error("[DEBUG] Error resetting progress using localStorage UID:", error);
            });
          }
        }
      }

      // Reset UI elements
      document.querySelectorAll(".topic-quiz-btn").forEach((button) => {
        button.textContent = "Check Answer";
        button.classList.remove("success");
        button.disabled = false;
      });

      document.querySelectorAll(".topic-quiz-results").forEach((result) => {
        result.style.display = "none";
      });

      document.querySelectorAll(".target-card").forEach((card) => {
        card.classList.remove("completed");
      });

      document.querySelectorAll(".option").forEach((option) => {
        option.classList.remove("selected");
      });

      // Update topic accessibility after reset
      updateTopicAccessibility();
      updateProgress();

      const container = document.querySelector(".container");
      const notification = document.createElement("div");
      notification.className = "notification";
      notification.textContent = "Progress reset successfully!";
      container.insertBefore(notification, container.firstChild);

      setTimeout(() => {
        notification.remove();
      }, 3000);

      // Clear the celebration flag so it can show again after re-completion
      localStorage.removeItem('attackTargetsCelebrated');
    }
  });

  // Add click event to progress tracker nodes to scroll to corresponding topic
  document.querySelectorAll(".progress-node").forEach((node) => {
    node.addEventListener("click", function () {
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
    });
  });

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
