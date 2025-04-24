document.addEventListener("DOMContentLoaded", function () {
    // Clear any previously stored progress to start with no progress
    localStorage.removeItem("attackCompletedSections");
    localStorage.removeItem("attackCompletedQuizzes");

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
                const resultsDiv = quizContainer.querySelector(
                  ".topic-quiz-results"
                );
                const correctAnswer =
                  quizContainer.querySelector(".correct-answer");

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

              if (
                progressLine &&
                progressLine.classList.contains("progress-line")
              ) {
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
            const resultsDiv = quizContainer.querySelector(
              ".topic-quiz-results"
            );
            const correctAnswer =
              quizContainer.querySelector(".correct-answer");
            const incorrectAnswer =
              quizContainer.querySelector(".incorrect-answer");
            const selectedOption =
              quizContainer.querySelector(".option.selected");
            const targetId =
              this.closest(".target-card").getAttribute("data-target");

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
            const targetId =
              this.closest(".target-card").getAttribute("data-target");

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
            const resultsDiv = quizContainer.querySelector(
              ".topic-quiz-results"
            );
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
            const targetId =
              this.closest(".target-card").getAttribute("data-target");

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

          // Check if all topics are completed and show celebration
          if (completedQuizzes.length === totalSections) {
            setTimeout(() => {
              showCelebration();
            }, 1000);
          }
        }

        // Confetti animation for celebration
        function createConfetti() {
          const colors = [
            "#5cdb95",
            "#88ccf1",
            "#f1c40f",
            "#e74c3c",
            "#9b59b6",
          ];
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

            document
              .querySelector(".celebration-container")
              .appendChild(confetti);
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

            // Play celebration sound if available
            const audio = new Audio(
              "https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3"
            );
            audio.volume = 0.5;
            audio.play().catch((e) => console.log("Audio play failed:", e));

            // Close celebration on button click
            document
              .querySelector(".celebration-btn")
              .addEventListener("click", () => {
                celebrationContainer.classList.remove("active");
                setTimeout(() => {
                  // Remove confetti to clean up
                  document
                    .querySelectorAll(".confetti")
                    .forEach((el) => el.remove());
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
            localStorage.removeItem("attackCompletedSections");
            localStorage.removeItem("attackCompletedQuizzes");
            completedSections = [];
            completedQuizzes = [];

            document.querySelectorAll(".topic-quiz-btn").forEach((button) => {
              button.textContent = "Check Answer";
              button.classList.remove("success");
              button.disabled = false;
            });

            document
              .querySelectorAll(".topic-quiz-results")
              .forEach((result) => {
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