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
  document
    .getElementById("login-button")
    .addEventListener("click", function () {
      window.location.href =
        "login.html?redirect=" + encodeURIComponent(window.location.href);
    });

  // Handle the logout button
  document
    .getElementById("logout-button")
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
  const sections = [
    "cloud-overview",
    "data-breaches",
    "misconfigurations",
    "account-hijacking",
    "api-insecurity",
  ];

  sections.forEach((section, index) => {
    const sectionElement = document.getElementById(section);
    const completed = userProgress.completedSections.includes(section);

    // Update completion status
    if (completed) {
      sectionElement.classList.add("completed");
      document
        .querySelector(`.progress-item[data-section="${section}"]`)
        .classList.add("completed");
    } else {
      sectionElement.classList.remove("completed");
      document
        .querySelector(`.progress-item[data-section="${section}"]`)
        .classList.remove("completed");
    }

    // Handle locks (unlock the next section if the current one is completed)
    if (index > 0) {
      const prevSection = sections[index - 1];
      const isLocked = !userProgress.completedSections.includes(prevSection);

      const lockOverlay = sectionElement.querySelector(".lock-overlay");
      if (lockOverlay) {
        if (isLocked) {
          lockOverlay.classList.remove("hidden");
        } else {
          lockOverlay.classList.add("hidden");
        }
      }
    }
  });

  // Update overall progress percentage
  const completedCount = userProgress.completedSections.length;
  const totalSections = sections.length;
  const progressPercent =
    totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

  document.getElementById(
    "progress-percent"
  ).textContent = `${progressPercent}%`;
  document.getElementById("progress-bar").style.width = `${progressPercent}%`;
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
  const quizForms = document.querySelectorAll(".quiz-form");

  quizForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const sectionId = this.getAttribute("data-section");
      const selectedOption = this.querySelector(
        'input[name="quiz-option"]:checked'
      );

      if (!selectedOption) {
        alert("Please select an answer.");
        return;
      }

      const feedbackCorrect = this.querySelector(".feedback-correct");
      const feedbackIncorrect = this.querySelector(".feedback-incorrect");
      const submitButton = this.querySelector('button[type="submit"]');
      const continueButton = this.querySelector(".continue-button");

      if (selectedOption.value === "correct") {
        feedbackCorrect.classList.remove("hidden");
        feedbackIncorrect.classList.add("hidden");
        submitButton.classList.add("hidden");
        continueButton.classList.remove("hidden");

        // Mark section as completed
        if (!userProgress.completedSections.includes(sectionId)) {
          userProgress.completedSections.push(sectionId);
          saveUserProgress();
          updateUI();
        }
      } else {
        feedbackCorrect.classList.add("hidden");
        feedbackIncorrect.classList.remove("hidden");
      }
    });

    // Continue button functionality
    const continueButton = form.querySelector(".continue-button");
    if (continueButton) {
      continueButton.addEventListener("click", function () {
        const sectionId = form.getAttribute("data-section");
        const currentIndex = [
          "cloud-overview",
          "data-breaches",
          "misconfigurations",
          "account-hijacking",
          "api-insecurity",
        ].indexOf(sectionId);

        if (currentIndex < 4) {
          // If not the last section
          const nextSection = document.getElementById(
            [
              "cloud-overview",
              "data-breaches",
              "misconfigurations",
              "account-hijacking",
              "api-insecurity",
            ][currentIndex + 1]
          );
          const nextHeader = nextSection.querySelector("h3");

          // Scroll to next section
          nextSection.scrollIntoView({ behavior: "smooth" });

          // Expand next section after scrolling
          setTimeout(() => {
            if (nextHeader) {
              nextHeader.click();
            }
          }, 800);
        } else {
          // Last section completed, show celebration
          showCelebration();
        }
      });
    }
  });
}

// Show celebration animation when all sections are completed
function showCelebration() {
  const celebrationContainer = document.getElementById("celebration-container");
  celebrationContainer.classList.remove("hidden");

  // Create confetti
  for (let i = 0; i < 100; i++) {
    createConfetti(celebrationContainer);
  }

  // Hide celebration after 5 seconds
  setTimeout(() => {
    celebrationContainer.classList.add("hidden");
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
  confetti.style.left = Math.random() * 100 + "vw";
  confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
  confetti.style.backgroundColor =
    colors[Math.floor(Math.random() * colors.length)];

  container.appendChild(confetti);

  // Remove confetti after animation
  setTimeout(() => {
    confetti.remove();
  }, 5000);
}
