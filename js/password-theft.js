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

  // Clear any previously stored progress to start with no progress
  localStorage.removeItem("passwordCompletedSections");
  localStorage.removeItem("passwordCompletedQuizzes");

  let completedSections = [];
  let completedQuizzes = [];

  // Define topic progression order
  const topicOrder = [
    "password-basics",
    "credential-stuffing",
    "password-spraying",
    "keyloggers",
    "social-engineering",
  ];

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
        const line = document.querySelector(
          `.progress-line:nth-of-type(${index * 2})`
        );
        if (line) {
          line.classList.toggle(
            "completed",
            completedQuizzes.includes(prevTopicId)
          );
        }
      }

      // Early return if card is not found
      if (!topicCard) return;

      // Remove all state classes
      topicCard.classList.remove("active", "completed", "locked");

      // Add appropriate class based on state
      if (completedQuizzes.includes(topicId)) {
        topicCard.classList.add("completed");
        topicCard.classList.remove("locked");

        // Ensure lock overlay is hidden for completed cards
        const lockOverlay = topicCard.querySelector(".lock-overlay");
        if (lockOverlay) {
          lockOverlay.style.display = "none";
        }
      } else if (isAccessible) {
        topicCard.classList.add("active");
        topicCard.classList.remove("locked");

        // Ensure lock overlay is hidden for active cards
        const lockOverlay = topicCard.querySelector(".lock-overlay");
        if (lockOverlay) {
          lockOverlay.style.display = "none";
        }
      } else {
        topicCard.classList.add("locked");

        // Ensure lock overlay is shown for locked cards
        const lockOverlay = topicCard.querySelector(".lock-overlay");
        if (lockOverlay) {
          lockOverlay.style.display = "flex";
        }
      }
    });
  }

  // Update progress percentage and UI elements
  function updateProgress() {
    const totalTopics = topicOrder.length;
    const completedTopics = completedQuizzes.length;
    const progressPercent = (completedTopics / totalTopics) * 100;

    // Update progress bar if it exists
    const progressBar = document.querySelector(".progress-container .progress");
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    // Update completion stats
    document.querySelectorAll(".completion-stat").forEach((stat) => {
      stat.textContent = `${completedTopics}/${totalTopics}`;
    });

    // Update percentage stats
    document.querySelectorAll(".percentage-stat").forEach((stat) => {
      stat.textContent = `${Math.round(progressPercent)}%`;
    });
  }

  // Expandable content functionality
  document.querySelectorAll(".attack-item h3").forEach((header) => {
    header.addEventListener("click", function () {
      this.parentElement.classList.toggle("expanded");
    });
  });

  // Quiz functionality
  document.querySelectorAll(".topic-quiz").forEach((quiz) => {
    const options = quiz.querySelectorAll(".option");
    const checkButton = quiz.querySelector(".topic-quiz-btn");
    const resultsDiv = quiz.querySelector(".topic-quiz-results");
    const correctAnswer = quiz.querySelector(".correct-answer");
    const incorrectAnswer = quiz.querySelector(".incorrect-answer");
    let selectedOption = null;

    // Handle option selection
    options.forEach((option) => {
      option.addEventListener("click", function () {
        // Remove selected class from all options
        options.forEach((opt) => opt.classList.remove("selected"));

        // Add selected class to clicked option
        this.classList.add("selected");
        selectedOption = this;
      });
    });

    // Handle check answer button
    if (checkButton) {
      checkButton.addEventListener("click", function () {
        if (!selectedOption) {
          alert("Please select an answer first");
          return;
        }

        const topicCard = quiz.closest(".target-card");
        const topicId = topicCard.getAttribute("data-target");
        const isCorrect =
          selectedOption.getAttribute("data-correct") === "true";

        if (resultsDiv) resultsDiv.style.display = "block";

        if (isCorrect) {
          selectedOption.classList.add("correct");
          if (correctAnswer) correctAnswer.style.display = "block";
          if (incorrectAnswer) incorrectAnswer.style.display = "none";
          checkButton.textContent = "Correct!";
          checkButton.classList.add("success");
          checkButton.disabled = true;

          // Mark section as completed
          if (!completedQuizzes.includes(topicId)) {
            completedQuizzes.push(topicId);
            localStorage.setItem(
              "passwordCompletedQuizzes",
              JSON.stringify(completedQuizzes)
            );
            completedSections.push(topicId);
            localStorage.setItem(
              "passwordCompletedSections",
              JSON.stringify(completedSections)
            );

            // Update UI for newly completed and unlocked sections
            updateTopicAccessibility();
            updateProgress();

            // Show celebration
            showCelebration();
          }
        } else {
          selectedOption.classList.add("incorrect");
          if (incorrectAnswer) incorrectAnswer.style.display = "block";
          if (correctAnswer) correctAnswer.style.display = "none";

          // Find and highlight the correct answer
          const correctOption = quiz.querySelector(
            '.option[data-correct="true"]'
          );
          if (correctOption) {
            correctOption.classList.add("correct");
          }

          // Shake animation for incorrect answers
          checkButton.classList.add("shake-animation");
          setTimeout(() => {
            checkButton.classList.remove("shake-animation");
          }, 500);
        }
      });
    }
  });

  // Show celebration overlay
  function showCelebration() {
    const celebrationContainer = document.querySelector(
      ".celebration-container"
    );
    const continueBtn = document.querySelector(".celebration-btn");

    // Update stats
    const completedCount = completedQuizzes.length;
    const totalCount = topicOrder.length;
    const statValue = document.querySelector(".stat-value:first-child");

    if (statValue) {
      statValue.textContent = `${completedCount}/${totalCount}`;
    }

    // Show celebration overlay
    if (celebrationContainer) {
      celebrationContainer.classList.add("active");

      createConfetti();

      // Handle continue button
      if (continueBtn) {
        continueBtn.addEventListener("click", function () {
          celebrationContainer.classList.remove("active");
        });
      }
    }
  }

  // Create confetti particles for celebration
  function createConfetti() {
    const celebrationContent = document.querySelector(".celebration-content");
    if (!celebrationContent) return;

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.animationDelay = Math.random() * 3 + "s";
      confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;

      document.querySelector(".celebration-container").appendChild(confetti);

      // Remove confetti after animation
      setTimeout(() => {
        confetti.remove();
      }, 6000);
    }
  }

  // Initialize the UI state on page load
  initializeProgressUI();

  // Handle logout functionality
  function logout() {
    if (firebase && firebase.auth) {
      firebase
        .auth()
        .signOut()
        .then(() => {
          // Clear local storage and redirect to home
          localStorage.removeItem("currentUser");
          localStorage.removeItem("passwordCompletedSections");
          localStorage.removeItem("passwordCompletedQuizzes");
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    } else {
      // Fallback for older version
      localStorage.removeItem("currentUser");
      localStorage.removeItem("passwordCompletedSections");
      localStorage.removeItem("passwordCompletedQuizzes");
      window.location.href = "index.html";
    }
  }
});
