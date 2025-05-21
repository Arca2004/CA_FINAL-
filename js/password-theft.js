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

    // Debug log
    console.log('[DEBUG] updateProgress: completedTopics', completedTopics, 'of', totalTopics, '(', progressPercent + '% )');

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

    // Show celebration only when all quizzes are completed and not already celebrated
    if (
      completedTopics === totalTopics &&
      localStorage.getItem('passwordTheftCelebrated') !== 'true'
    ) {
      console.log('[DEBUG] All topics completed, showing celebration!');
      showCelebration();
      localStorage.setItem('passwordTheftCelebrated', 'true');
    }
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

            // If this was the last topic, call updateProgress again after a short delay
            if (completedQuizzes.length === topicOrder.length) {
              setTimeout(() => {
                console.log('[DEBUG] Delayed updateProgress after last quiz');
                updateProgress();
              }, 300);
            }
          }
        } else {
          selectedOption.classList.add("incorrect");

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
    console.log('[DEBUG] showCelebration called');
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

      // Update stats
      const completedCount = topicOrder.length;
      const totalCount = topicOrder.length;
      const statItems = celebrationContainer.querySelectorAll('.stat-item .stat-value');
      if (statItems.length >= 3) {
        statItems[0].textContent = `${completedCount}/${totalCount}`;
        statItems[1].textContent = `100%`;
        statItems[2].textContent = `${completedCount}/${totalCount}`;
      }

      // Remove duplicate navigation if present
      const navs = celebrationContainer.querySelectorAll('.lesson-navigation');
      if (navs.length > 1) {
        for (let i = 1; i < navs.length; i++) navs[i].remove();
      }

      // Continue button closes the celebration
      const continueBtn = celebrationContainer.querySelector(".celebration-btn");
      if (continueBtn) {
        continueBtn.onclick = function () {
          celebrationContainer.classList.remove("active");
          setTimeout(() => {
            document.querySelectorAll(".confetti").forEach((el) => el.remove());
          }, 500);
        };
      }
    }
  }

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

  function createSparkles() {
    const sparkleContainer = document.getElementById("trophy-sparkle");
    if (!sparkleContainer) return;
    sparkleContainer.innerHTML = '';
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

  // Reset progress button logic (like attack targets)
  const resetProgressBtn = document.getElementById("reset-progress");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", function () {
      if (
        confirm(
          "Are you sure you want to reset all progress? This cannot be undone."
        )
      ) {
        // Clear localStorage
        localStorage.removeItem("passwordCompletedSections");
        localStorage.removeItem("passwordCompletedQuizzes");
        // Reset arrays
        completedSections = [];
        completedQuizzes = [];
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
          option.classList.remove("selected", "correct", "incorrect");
        });
        // Update topic accessibility after reset
        updateTopicAccessibility();
        updateProgress();
        // Show notification
        const container = document.querySelector(".container");
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.textContent = "Progress reset successfully!";
        container.insertBefore(notification, container.firstChild);
        setTimeout(() => {
          notification.remove();
        }, 3000);
        // Clear the celebration flag so it can show again after re-completion
        localStorage.removeItem('passwordTheftCelebrated');
      }
    });
  }
});
