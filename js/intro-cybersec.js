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
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
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
            username: user.email,
            fullname: user.displayName || "Cyber Academy User",
            initial: getUserInitial(user),
          })
        );

        // Load user progress from Firestore
        loadUserProgress(user.uid);
      } else {
        // Check localStorage for backward compatibility
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

  // Load user progress from Firestore
  function loadUserProgress(userId) {
    if (!firebase.firestore) {
      console.error("Firestore is not available");
      return;
    }

    firebase.firestore().collection("userProgress").doc(userId).get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data.modules && data.modules.introCybersec && data.modules.introCybersec.completedQuizzes) {
            completedQuizzes = data.modules.introCybersec.completedQuizzes;
          } else {
            completedQuizzes = [];
          }
        } else {
          // Create a new document for the user if it doesn't exist
          firebase.firestore().collection("userProgress").doc(userId).set({
            modules: {
              introCybersec: {
                completedQuizzes: [],
                lastUpdated: new Date()
              }
            },
            lastLogin: new Date()
          });
          completedQuizzes = [];
        }
        updateTopicAccessibility();
        updateProgress();
      })
      .catch((error) => {
        console.error("Error loading user progress:", error);
        // Fall back to local storage
        const storedQuizzes = localStorage.getItem("introCompletedQuizzes");
        if (storedQuizzes) {
          completedQuizzes = JSON.parse(storedQuizzes);
          updateTopicAccessibility();
          updateProgress();
        }
      });
  }

  // Save user progress to Firestore
  function saveUserProgress(userId, topicId) {
    if (!firebase.firestore || !userId) {
      // Save to localStorage as backup
      localStorage.setItem("introCompletedQuizzes", JSON.stringify(completedQuizzes));
      return;
    }

    // Update the Firestore document
    firebase.firestore().collection("userProgress").doc(userId).update({
      [`modules.introCybersec.completedQuizzes`]: completedQuizzes,
      [`modules.introCybersec.lastUpdated`]: new Date(),
      [`modules.introCybersec.progressPercentage`]: (completedQuizzes.length / topicOrder.length) * 100
    })
    .then(() => {
      console.log("Progress saved to Firestore");
      
      // Also update user's overall progress in profile
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
    if (!firebase.firestore || !userId) return;

    firebase.firestore().collection("userProgress").doc(userId).get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          const modules = data.modules || {};
          
          // Calculate total modules and completed modules
          const modulesStats = {
            total: 4, // Adjust based on your total modules
            completed: 0,
            topics: 0,
            totalTimeMinutes: 0
          };
          
          // Check intro module
          if (modules.introCybersec) {
            const introProgress = modules.introCybersec.completedQuizzes?.length || 0;
            if (introProgress === topicOrder.length) {
              modulesStats.completed++;
            }
            modulesStats.topics += introProgress;
            modulesStats.totalTimeMinutes += introProgress * 15; // Estimate 15 min per topic
          }
          
          // Check other modules (add more as they're implemented)
          // if (modules.attackTargets) { ... }
          // if (modules.phishingAttacks) { ... }
          // if (modules.malwareInfections) { ... }
          
          // Update overall progress in user profile
          firebase.firestore().collection("userProgress").doc(userId).update({
            completedModules: modulesStats.completed,
            totalModules: modulesStats.total,
            completedTopics: modulesStats.topics,
            totalTimeMinutes: modulesStats.totalTimeMinutes,
            completionPercentage: (modulesStats.completed / modulesStats.total) * 100,
            lastUpdated: new Date()
          });
        }
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
        
        // Save to Firebase if logged in
        if (currentUser && currentUser.uid) {
          saveUserProgress(currentUser.uid);
        } else {
          localStorage.setItem("introCompletedQuizzes", JSON.stringify(completedQuizzes));
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
            
            // Save progress to Firestore if user is logged in
            if (currentUser && currentUser.uid) {
              saveUserProgress(currentUser.uid, targetId);
            } else {
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
    const totalTopics = topicOrder.length;
    const progressBar = document.getElementById("module-progress");

    if (progressBar) {
      const progressPercentage = (completedQuizzes.length / totalTopics) * 100;
      progressBar.style.width = `${progressPercentage}%`;
    }
  }

  // Function to show celebration modal when module is completed
  function showCelebration() {
    const celebrationContainer = document.querySelector(".celebration-container");
    if (celebrationContainer) {
      celebrationContainer.classList.add("active");
      
      // Create sparkles for trophy
      const trophySparkle = document.getElementById("trophy-sparkle");
      if (trophySparkle) {
        for (let i = 0; i < 10; i++) {
          const sparkle = document.createElement("span");
          sparkle.style.left = `${Math.random() * 100}%`;
          sparkle.style.top = `${Math.random() * 100}%`;
          sparkle.style.width = `${Math.random() * 5 + 2}px`;
          sparkle.style.height = sparkle.style.width;
          sparkle.style.animationDelay = `${Math.random() * 2}s`;
          trophySparkle.appendChild(sparkle);
        }
      }
      
      // Close button for celebration
      const celebrationBtn = document.querySelector(".celebration-btn");
      if (celebrationBtn) {
        celebrationBtn.addEventListener("click", function() {
          celebrationContainer.classList.remove("active");
        });
      }
    }
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
