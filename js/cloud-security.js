// Initialize Firebase Authentication
let auth;
let db;
let userId;
let userProgress = {};

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase
  auth = firebase.auth();
  db = firebase.firestore();

  // Authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      userId = user.uid;
      loadUserProgress();
      document.getElementById("user-name").textContent =
        user.displayName || user.email;
      document
        .querySelectorAll(".login-required")
        .forEach((el) => el.classList.remove("hidden"));
      document
        .querySelectorAll(".logout-required")
        .forEach((el) => el.classList.add("hidden"));
    } else {
      userId = null;
      document.getElementById("user-name").textContent = "";
      document
        .querySelectorAll(".login-required")
        .forEach((el) => el.classList.add("hidden"));
      document
        .querySelectorAll(".logout-required")
        .forEach((el) => el.classList.remove("hidden"));
      resetProgress();
    }
  });

  // Handle the login button
  document.querySelector("#login-link").addEventListener("click", function (e) {
    if (e.target.id === "login-link") {
      window.location.href =
        "login.html?redirect=" + encodeURIComponent(window.location.href);
    }
  });

  // Handle the logout button
  if (document.getElementById("logout-btn")) {
    document
      .getElementById("logout-btn")
      .addEventListener("click", function () {
        auth
          .signOut()
          .then(() => {
            console.log("User signed out");
          })
          .catch((error) => {
            console.error("Error signing out:", error);
          });
      });
  }

  // Set up the accordion functionality for attack items
  setupAccordion();

  // Set up quiz functionality
  setupQuizzes();
});

// Load user progress from Firestore
function loadUserProgress() {
  if (!userId) return;

  db.collection("users")
    .doc(userId)
    .get()
    .then((doc) => {
      if (
        doc.exists &&
        doc.data().progress &&
        doc.data().progress.cloudSecurity
      ) {
        userProgress = doc.data().progress.cloudSecurity;
        updateUI();
      } else {
        // Initialize progress if it doesn't exist
        userProgress = {
          completedSections: [],
        };
        saveUserProgress();
      }
    })
    .catch((error) => {
      console.error("Error loading user progress:", error);
    });
}

// Save user progress to Firestore
function saveUserProgress() {
  if (!userId) return;

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
      console.log("Progress saved successfully");
    })
    .catch((error) => {
      console.error("Error saving progress:", error);
    });
}

// Reset UI to initial state
function resetProgress() {
  userProgress = { completedSections: [] };
  updateUI();
}

// Update the UI based on the user's progress
function updateUI() {
  const progressTracker = document.querySelector(".progress-tracker");
  if (!progressTracker) return;

  const progressNodes = progressTracker.querySelectorAll(".progress-node");
  const progressLines = progressTracker.querySelectorAll(".progress-line");

  // Mapping topics from progress tracker to section IDs
  const topicToSection = {
    "cloud-basics": "cloud-overview",
    "data-breaches": "data-breaches",
    misconfiguration: "misconfigurations",
    "account-hijacking": "account-hijacking",
    "insider-threats": "api-insecurity",
  };

  // Update progress tracker nodes
  progressNodes.forEach((node, index) => {
    const topicId = node.getAttribute("data-topic");
    const sectionId = topicToSection[topicId];

    if (userProgress.completedSections.includes(sectionId)) {
      node.classList.add("completed");
      node.classList.remove("locked");
      if (index > 0 && progressLines[index - 1]) {
        progressLines[index - 1].classList.add("completed");
      }
    } else if (index > 0) {
      const prevTopic = progressNodes[index - 1].getAttribute("data-topic");
      const prevSectionId = topicToSection[prevTopic];

      if (!userProgress.completedSections.includes(prevSectionId)) {
        node.classList.add("locked");
      } else {
        node.classList.remove("locked");
      }
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
  document.querySelectorAll(".target-card.locked").forEach((card) => {
    const targetId = card.getAttribute("data-target");
    const lockOverlay = card.querySelector(".lock-overlay");

    // Check if previous section is completed to unlock this one
    const sections = Object.values(topicToSection);
    const currentIndex = sections.indexOf(targetId);

    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      if (userProgress.completedSections.includes(prevSection)) {
        card.classList.remove("locked");
        if (lockOverlay) lockOverlay.style.display = "none";
      } else {
        if (lockOverlay) lockOverlay.style.display = "flex";
      }
    }
  });
}

// Set up the accordion functionality
function setupAccordion() {
  const accordionHeaders = document.querySelectorAll(".attack-item h3");

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
}

// Set up quizzes
function setupQuizzes() {
  const quizSections = document.querySelectorAll(".topic-quiz");

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
      checkButton.addEventListener("click", function () {
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
              userProgress.completedSections.push(sectionId);
              saveUserProgress();
              updateUI();

              // Show celebration
              setTimeout(() => {
                showCelebration();
              }, 1000);
            }
          }

          // Update check button to navigate to next section
          checkButton.removeEventListener("click", arguments.callee);
          checkButton.addEventListener("click", function () {
            const currentCard = quiz.closest(".target-card");
            const nextCard = currentCard.nextElementSibling;

            if (nextCard && nextCard.classList.contains("target-card")) {
              nextCard.scrollIntoView({ behavior: "smooth" });

              // Expand first attack item in next section
              setTimeout(() => {
                const nextAttackItem = nextCard.querySelector(".attack-item");
                if (nextAttackItem) {
                  nextAttackItem.classList.add("expanded");
                }
              }, 800);
            }
          });
        } else {
          correctFeedback.style.display = "none";
          incorrectFeedback.style.display = "block";
          selectedOption.classList.add("incorrect");
        }
      });
    }
  });
}

// Show celebration animation when section is completed
function showCelebration() {
  const celebrationContainer = document.querySelector(".celebration-container");
  if (!celebrationContainer) return;

  celebrationContainer.classList.add("active");
  celebrationContainer.style.opacity = "1";
  celebrationContainer.style.visibility = "visible";

  // Update celebration stats
  const completedCount = userProgress.completedSections.length;
  const totalSections = 5; // Total sections in module
  const statValues = celebrationContainer.querySelectorAll(".stat-value");

  if (statValues.length >= 1) {
    statValues[0].textContent = `${completedCount}/${totalSections}`;
  }

  // Add confetti effect
  for (let i = 0; i < 100; i++) {
    createConfetti(celebrationContainer);
  }

  // Add click event to continue button
  const continueBtn = celebrationContainer.querySelector(".celebration-btn");
  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      celebrationContainer.classList.remove("active");
      celebrationContainer.style.opacity = "0";
      celebrationContainer.style.visibility = "hidden";
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
