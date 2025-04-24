document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in and update navigation
  const authNavItem = document.getElementById("auth-nav-item");

  if (authNavItem) {
    // Check for Firebase auth state
    if (typeof firebase !== "undefined" && firebase.auth) {
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          // User is signed in - show profile link and logout
          authNavItem.innerHTML = `
            <div class="nav-dropdown">
              <a href="user-profile.html" class="nav-link">
                <i class="fas fa-user-shield"></i> ${
                  user.displayName || user.email
                }
              </a>
              <div class="dropdown-content">
                <a href="user-profile.html"><i class="fas fa-id-card"></i> My Profile</a>
                <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
              </div>
            </div>
          `;

          // Store in localStorage for backward compatibility
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              username: user.email,
              fullname: user.displayName || "Cyber Academy User",
            })
          );
        } else {
          // No user signed in - show login link
          authNavItem.innerHTML = `
            <a href="login.html" class="nav-link">
              <i class="fas fa-user"></i> Login
            </a>
          `;
        }
      });
    } else {
      // Fallback for older version
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        authNavItem.innerHTML = `
          <div class="nav-dropdown">
            <a href="user-profile.html" class="nav-link">
              <i class="fas fa-user-shield"></i> ${currentUser.username}
            </a>
            <div class="dropdown-content">
              <a href="user-profile.html"><i class="fas fa-id-card"></i> My Profile</a>
              <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
          </div>
        `;
      }
    }
  }

  // Initialize variables for completed sections and quizzes
  let completedSections = [];
  let completedQuizzes = [];

  // Check if user is logged in with Firebase
  function checkUserLoggedIn() {
    // For local testing, return true to enable lock mechanism
    return true;

    // Commented out for local testing
    // if (firebase && firebase.auth) {
    //   return firebase.auth().currentUser !== null;
    // }
    // return false;
  }

  // Function to load progress data from Firebase (placeholder)
  // In a production app, you would load actual progress from Firebase Firestore
  function loadProgressFromFirebase() {
    // Reset progress for not logged in users
    if (!checkUserLoggedIn()) {
      completedSections = [];
      completedQuizzes = [];
      updateProgress();
      return;
    }

    // For now, still use localStorage as a fallback
    // In a real implementation, you would fetch this from Firebase Firestore
    completedSections =
      JSON.parse(localStorage.getItem("phishingCompletedSections")) || [];
    completedQuizzes =
      JSON.parse(localStorage.getItem("phishingCompletedQuizzes")) || [];

    initializeProgressUI();
  }

  // Load progress when page loads
  loadProgressFromFirebase();

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

    // Update UI with progress data for logged in users
    completedSections.forEach((targetId) => {
      const card = document.querySelector(
        `.target-card[data-target="${targetId}"]`
      );
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

    completedQuizzes.forEach((targetId) => {
      const card = document.querySelector(
        `.target-card[data-target="${targetId}"]`
      );
      if (card) {
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

    updateProgress();
  }

  // Define topic progression order
  const topicOrder = ["techniques", "types", "prevention"];

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
              "phishingCompletedQuizzes",
              JSON.stringify(completedQuizzes)
            );

            if (!completedSections.includes(targetId)) {
              markAsComplete(targetId);
            } else {
              // Update accessibility for next topics
              updateTopicAccessibility();
              updateProgress();
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

  function markAsComplete(targetId) {
    if (!completedSections.includes(targetId)) {
      completedSections.push(targetId);
      localStorage.setItem(
        "phishingCompletedSections",
        JSON.stringify(completedSections)
      );

      document
        .querySelectorAll(`.complete-btn[data-target="${targetId}"]`)
        .forEach((button) => {
          button.textContent = "Completed";
          button.disabled = true;
        });

      const card = document.querySelector(
        `.target-card[data-target="${targetId}"]`
      );
      if (card) {
        card.classList.add("completed");
      }

      // Update accessibility for next topics
      updateTopicAccessibility();
      updateProgress();
    }
  }

  function updateProgress() {
    const totalSections = 3;
    const progressBar = document.getElementById("module-progress");
    const overallProgress = document.getElementById("overall-progress");
    const quizzesPassed = document.getElementById("quizzes-passed");

    let progressPercentage = 0;
    const topicsWeight = 60;
    const topicsProgressPercentage =
      (completedSections.length / totalSections) * topicsWeight;
    const quizzesWeight = 40;
    const quizzesProgressPercentage =
      (completedQuizzes.length / totalSections) * quizzesWeight;
    progressPercentage = topicsProgressPercentage + quizzesProgressPercentage;
    progressPercentage = Math.round(progressPercentage);

    progressBar.style.width = `${progressPercentage}%`;

    if (overallProgress) {
      overallProgress.style.width = `${progressPercentage}%`;
    }

    if (quizzesPassed) {
      quizzesPassed.textContent = completedQuizzes.length;
    }

    // Check if all topics and quizzes are completed
    if (
      completedSections.length === totalSections &&
      completedQuizzes.length === totalSections
    ) {
      // Wait a bit to show the celebration
      setTimeout(showCelebration, 1000);
    }
  }

  // Show celebration modal
  function showCelebration() {
    const celebrationContainer = document.querySelector(
      ".celebration-container"
    );
    celebrationContainer.classList.add("active");

    // Create confetti
    createConfetti();

    // Play achievement sound
    playAchievementSound();

    // Create sparkles around the trophy
    createSparkles();

    // Update stats
    const totalSections = 3;
    document.getElementById(
      "topics-completed"
    ).innerText = `${totalSections}/${totalSections}`;
    document.getElementById(
      "quizzes-completed"
    ).innerText = `${totalSections}/${totalSections}`;

    // Continue button closes the celebration
    document.getElementById("continue-btn").addEventListener("click", () => {
      celebrationContainer.classList.remove("active");

      // Clean up confetti
      const confetti = document.querySelectorAll(".confetti");
      confetti.forEach((c) => c.remove());
    });
  }

  // Create confetti elements
  function createConfetti() {
    const celebrationContainer = document.querySelector(
      ".celebration-container"
    );
    const colors = ["#5cdb95", "#88ccf1", "#edf2f7", "#f1c40f", "#e74c3c"];

    for (let i = 0; i < 200; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
      confetti.style.animation = `floatConfetti ${
        Math.random() * 3 + 2
      }s linear forwards`;
      confetti.style.animationDelay = `${Math.random() * 5}s`;

      celebrationContainer.appendChild(confetti);
    }
  }

  // Create sparkles around the trophy
  function createSparkles() {
    const sparkleContainer = document.getElementById("trophy-sparkles");
    const sparkleCount = 12;

    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement("span");
      const size = Math.random() * 8 + 2;
      const angle = (i / sparkleCount) * Math.PI * 2;
      const radius = 60;

      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.top = `${50 + Math.sin(angle) * radius}%`;
      sparkle.style.left = `${50 + Math.cos(angle) * radius}%`;
      sparkle.style.animationDelay = `${Math.random() * 2}s`;

      sparkleContainer.appendChild(sparkle);
    }
  }

  // Play achievement sound
  function playAchievementSound() {
    const audio = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3"
    );
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Audio play failed:", e));
  }

  const resetProgressBtn = document.getElementById("reset-progress");
  resetProgressBtn.addEventListener("click", function () {
    const confirmReset = confirm(
      "Are you sure you want to reset your progress on this module?"
    );
    if (confirmReset) {
      // Clear local storage related to this module
      completedSections = [];
      completedQuizzes = [];

      // Update localStorage
      localStorage.setItem(
        "phishingCompletedSections",
        JSON.stringify(completedSections)
      );
      localStorage.setItem(
        "phishingCompletedQuizzes",
        JSON.stringify(completedQuizzes)
      );

      // Update the UI
      document.querySelectorAll(".target-card").forEach((card) => {
        card.classList.remove("completed");
      });

      document.querySelectorAll(".topic-quiz-btn").forEach((btn) => {
        btn.classList.remove("success");
        btn.disabled = false;
        btn.textContent = "Check Answer";
      });

      document.querySelectorAll(".option").forEach((option) => {
        option.classList.remove("selected", "correct", "incorrect");
      });

      document.querySelectorAll(".topic-quiz-results").forEach((result) => {
        result.style.display = "none";
      });

      document.querySelectorAll(".progress-node").forEach((node) => {
        node.classList.remove("completed");
        if (node.getAttribute("data-topic") === "techniques") {
          node.classList.add("active");
        } else {
          node.classList.add("locked");
        }
      });

      document.querySelectorAll(".progress-line").forEach((line) => {
        line.classList.remove("completed");
      });

      // Reset progress bar
      const progressBar = document.getElementById("module-progress");
      if (progressBar) {
        progressBar.style.width = "0%";
      }

      // Re-initialize topic accessibility
      updateTopicAccessibility();
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
