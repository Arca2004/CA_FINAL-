// Particles.js Configuration
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

  // Initialize particles.js if the element exists
  if (document.getElementById("particles-js")) {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#5cdb95",
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#3494c9",
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1,
            },
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
    });
  }

  // Tab functionality
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked button
      btn.classList.add("active");

      // Show corresponding content
      const targetTab = btn.getAttribute("data-tab");
      document.getElementById(`${targetTab}-content`).classList.add("active");
    });
  });

  // Circular progress animation
  const circularProgress = document.querySelectorAll(".circular-progress");

  circularProgress.forEach((progress) => {
    const value = progress.getAttribute("data-value");
    progress.style.background = `conic-gradient(var(--cyber-green) ${value}%, var(--third-dark) 0)`;
  });

  // Set up module hover effects
  const moduleCards = document.querySelectorAll(".module-card:not(.locked)");

  moduleCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-10px)";
      card.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
    });

    card.addEventListener("mouseleave", () => {
      if (!card.classList.contains("active")) {
        card.style.transform = "";
        card.style.boxShadow = "";
      }
    });
  });

  // Track module progress from all modules
  function updateModuleProgress() {
    // Debug log to show localStorage status
    console.log("localStorage keys:", {
      attackCompletedSections: JSON.parse(
        localStorage.getItem("attackCompletedSections") || "[]"
      ),
      attackCompletedQuizzes: JSON.parse(
        localStorage.getItem("attackCompletedQuizzes") || "[]"
      ),
      phishingCompletedSections: JSON.parse(
        localStorage.getItem("phishingCompletedSections") || "[]"
      ),
      phishingCompletedQuizzes: JSON.parse(
        localStorage.getItem("phishingCompletedQuizzes") || "[]"
      ),
    });

    // Progress from Attack Targets module
    const attackTargetsTopics = document.querySelector(
      ".module-card:nth-child(2)"
    );
    if (attackTargetsTopics) {
      const attackTargetsCompletedSections =
        JSON.parse(localStorage.getItem("attackCompletedSections")) || [];
      const attackTargetsQuizzes =
        JSON.parse(localStorage.getItem("attackCompletedQuizzes")) || [];

      const attackTopicsTotal = 5; // Total number of topics in Attack Targets (updated to 5)
      let attackTopicsCompleted = 0;

      if (attackTargetsCompletedSections.length > 0) {
        // Update the attack topics list with check marks
        const topicsList =
          attackTargetsTopics.querySelectorAll(".module-topics li");

        // Map section IDs to topics in the list
        const sectionToTopicMap = {
          individuals: 0, // Understanding Attack Vectors
          businesses: 1, // Common Target Types
          government: 2, // Defense Strategies
          infrastructure: 3, // CIA Triad
          financial: 4, // 5th topic if any
        };

        attackTargetsCompletedSections.forEach((section) => {
          const topicIndex = sectionToTopicMap[section];
          if (topicIndex !== undefined && topicsList[topicIndex]) {
            const icon = topicsList[topicIndex].querySelector("i");
            if (icon) {
              icon.className = "fas fa-check-circle";
              attackTopicsCompleted++;
            }
          }
        });

        // Calculate progress percentage
        const attackProgress = Math.round(
          (attackTopicsCompleted / attackTopicsTotal) * 100
        );
        const progressBar = attackTargetsTopics.querySelector(".progress");
        if (progressBar) {
          progressBar.style.width = `${attackProgress}%`;
        }

        // Update button text if all topics completed
        if (attackTopicsCompleted === attackTopicsTotal) {
          const button = attackTargetsTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-check"></i> Completed';
          }
          attackTargetsTopics.classList.add("completed");
        } else {
          // Make sure the card is marked as active
          attackTargetsTopics.classList.add("active");

          // Keep card elevated
          attackTargetsTopics.style.transform = "translateY(-10px)";
          attackTargetsTopics.style.boxShadow =
            "0 10px 20px rgba(0, 0, 0, 0.2)";
        }
      }
    }

    // Progress from Phishing Attacks module
    const phishingTopics = document.querySelector(".module-card:nth-child(3)");
    if (phishingTopics) {
      const phishingCompletedSections = JSON.parse(
        localStorage.getItem("phishingCompletedSections") || "[]"
      );
      const phishingQuizzes = JSON.parse(
        localStorage.getItem("phishingCompletedQuizzes") || "[]"
      );

      const phishingTopicsTotal = 4; // Total number of topics in Phishing
      let phishingTopicsCompleted = 0;

      if (phishingCompletedSections.length > 0) {
        // Update the phishing topics list with check marks
        const topicsList = phishingTopics.querySelectorAll(".module-topics li");

        // Map section IDs to topics in the list
        const sectionToTopicMap = {
          techniques: 0, // Phishing Techniques
          types: 1, // Email & Spear Phishing
          prevention: 2, // Smishing & Vishing / Prevention Measures
        };

        phishingCompletedSections.forEach((section) => {
          const topicIndex = sectionToTopicMap[section];
          if (topicIndex !== undefined && topicsList[topicIndex]) {
            const icon = topicsList[topicIndex].querySelector("i");
            if (icon) {
              icon.className = "fas fa-check-circle";
              phishingTopicsCompleted++;
            }
          }
        });

        // Special case: if prevention is completed, mark 4th item as complete too
        if (phishingCompletedSections.includes("prevention") && topicsList[3]) {
          const icon = topicsList[3].querySelector("i");
          if (icon) {
            icon.className = "fas fa-check-circle";
            phishingTopicsCompleted++;
          }
        }

        // Calculate progress percentage
        const phishingProgress = Math.round(
          (phishingTopicsCompleted / phishingTopicsTotal) * 100
        );
        const progressBar = phishingTopics.querySelector(".progress");
        if (progressBar) {
          progressBar.style.width = `${phishingProgress}%`;
        }

        // Update button text if all sections completed
        if (phishingTopicsCompleted === phishingTopicsTotal) {
          const button = phishingTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-check"></i> Completed';
          }
          phishingTopics.classList.add("completed");
        } else if (phishingCompletedSections.length > 0) {
          // If any sections are completed, update button text
          const button = phishingTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
          }
          phishingTopics.classList.add("active");

          // Keep card elevated
          phishingTopics.style.transform = "translateY(-10px)";
          phishingTopics.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
        }
      }
    }

    // Update overall progress
    updateOverallProgress();
  }

  // Update overall user progress
  function updateOverallProgress() {
    const totalModules = 3; // Introduction, Attack Targets, Phishing
    let completedModules = 1; // Introduction is already completed

    // Check if Attack Targets is completed
    const attackTargetsTopics = document.querySelector(
      ".module-card:nth-child(2)"
    );
    if (
      attackTargetsTopics &&
      attackTargetsTopics.classList.contains("completed")
    ) {
      completedModules++;
    }

    // Check if Phishing is completed
    const phishingTopics = document.querySelector(".module-card:nth-child(3)");
    if (phishingTopics && phishingTopics.classList.contains("completed")) {
      completedModules++;
    }

    // Update modules completed counter
    document.querySelectorAll(".progress-stat .stat-number")[0].textContent =
      completedModules;
    localStorage.setItem("modulesCompleted", completedModules);

    // Update overall progress percentage
    const totalTopics = 12; // Assuming 4 topics per module, 3 modules
    const attackCompletedSections =
      JSON.parse(localStorage.getItem("attackCompletedSections")) || [];
    const phishingCompletedSections = JSON.parse(
      localStorage.getItem("phishingCompletedSections") || "[]"
    );

    // Count intro module as 4 completed topics
    let completedTopics = 4;
    completedTopics += attackCompletedSections.length;
    completedTopics += phishingCompletedSections.length;

    // Calculate overall progress percentage
    const overallProgress = Math.round((completedTopics / totalTopics) * 100);

    // Update circular progress
    const progressElement = document.querySelector(".circular-progress");
    if (progressElement) {
      progressElement.style.background = `conic-gradient(var(--cyber-green) ${overallProgress}%, var(--third-dark) 0)`;
      document.querySelector(".progress-value").textContent =
        overallProgress + "%";
    }

    localStorage.setItem("userProgress", overallProgress);

    // Unlock intermediate path if beginner path is completed
    if (completedModules === totalModules) {
      const lockedModules = document.querySelectorAll(".module-card.locked");
      lockedModules.forEach((module) => {
        if (
          module
            .querySelector(".lock-message")
            .textContent.includes("Complete Beginner Path First")
        ) {
          module.classList.remove("locked");
          module.querySelector(".lock-message").innerHTML =
            '<i class="fas fa-play-circle"></i> Start Module';
        }
      });
    }

    // Update progress timeline
    updateProgressTimeline(attackCompletedSections, phishingCompletedSections);
  }

  // Update progress timeline with module completion information
  function updateProgressTimeline(
    attackCompletedSections,
    phishingCompletedSections
  ) {
    const timeline = document.querySelector(".timeline");
    if (!timeline) return;

    // Get current date for new entries
    const currentDate = new Date();
    const dateOptions = { month: "short", day: "numeric" };
    const formattedDate = currentDate.toLocaleDateString("en-US", dateOptions);

    // Create timeline item for Attack Targets progress if needed
    if (attackCompletedSections.length > 0) {
      // Check if we already have an Attack Targets entry
      let attackTimelineItem = Array.from(
        timeline.querySelectorAll(".timeline-content h4")
      ).find((el) => el.textContent.includes("Attack Targets"));

      if (!attackTimelineItem) {
        // Create new timeline item
        const timelineItem = document.createElement("div");
        timelineItem.className = "timeline-item";

        timelineItem.innerHTML = `
                    <div class="timeline-date">${formattedDate}</div>
                    <div class="timeline-content">
                        <h4>Progress in Attack Targets</h4>
                        <p>Completed ${attackCompletedSections.length}/4 sections of the module</p>
                    </div>
                `;

        // Add as the first item (newest)
        if (timeline.firstChild) {
          timeline.insertBefore(timelineItem, timeline.firstChild);
        } else {
          timeline.appendChild(timelineItem);
        }
      } else {
        // Update existing timeline item
        const parentItem = attackTimelineItem.closest(".timeline-item");
        const progressText = parentItem.querySelector("p");
        progressText.textContent = `Completed ${attackCompletedSections.length}/4 sections of the module`;
      }

      // If Attack Targets is fully completed, add or update completion entry
      if (attackCompletedSections.length === 4) {
        let completionItem = Array.from(
          timeline.querySelectorAll(".timeline-content h4")
        ).find((el) => el.textContent.includes("Attack Targets Completed"));

        if (!completionItem) {
          // Create completion entry
          const timelineItem = document.createElement("div");
          timelineItem.className = "timeline-item";

          timelineItem.innerHTML = `
                        <div class="timeline-date">${formattedDate}</div>
                        <div class="timeline-content">
                            <h4>Attack Targets Completed</h4>
                            <p>Finished all lessons and passed quizzes successfully</p>
                        </div>
                    `;

          // Add as the first item (newest)
          if (timeline.firstChild) {
            timeline.insertBefore(timelineItem, timeline.firstChild);
          } else {
            timeline.appendChild(timelineItem);
          }
        }
      }
    }

    // Create timeline item for Phishing Attacks progress if needed
    if (phishingCompletedSections.length > 0) {
      // Check if we already have a Phishing Attacks entry
      let phishingTimelineItem = Array.from(
        timeline.querySelectorAll(".timeline-content h4")
      ).find((el) => el.textContent.includes("Progress in Phishing Attacks"));

      if (!phishingTimelineItem) {
        // Create new timeline item
        const timelineItem = document.createElement("div");
        timelineItem.className = "timeline-item";

        timelineItem.innerHTML = `
                    <div class="timeline-date">${formattedDate}</div>
                    <div class="timeline-content">
                        <h4>Progress in Phishing Attacks</h4>
                        <p>Completed ${phishingCompletedSections.length}/3 sections of the module</p>
                    </div>
                `;

        // Add as the first item (newest)
        if (timeline.firstChild) {
          timeline.insertBefore(timelineItem, timeline.firstChild);
        } else {
          timeline.appendChild(timelineItem);
        }
      } else {
        // Update existing timeline item
        const parentItem = phishingTimelineItem.closest(".timeline-item");
        const progressText = parentItem.querySelector("p");
        progressText.textContent = `Completed ${phishingCompletedSections.length}/3 sections of the module`;
      }

      // If Phishing Attacks is fully completed, add or update completion entry
      if (phishingCompletedSections.length === 3) {
        let completionItem = Array.from(
          timeline.querySelectorAll(".timeline-content h4")
        ).find((el) => el.textContent.includes("Phishing Attacks Completed"));

        if (!completionItem) {
          // Create completion entry
          const timelineItem = document.createElement("div");
          timelineItem.className = "timeline-item";

          timelineItem.innerHTML = `
                        <div class="timeline-date">${formattedDate}</div>
                        <div class="timeline-content">
                            <h4>Phishing Attacks Completed</h4>
                            <p>Finished all lessons and passed quizzes successfully</p>
                        </div>
                    `;

          // Add as the first item (newest)
          if (timeline.firstChild) {
            timeline.insertBefore(timelineItem, timeline.firstChild);
          } else {
            timeline.appendChild(timelineItem);
          }
        }
      }
    }

    // Update goals section
    updateGoals(attackCompletedSections, phishingCompletedSections);
  }

  // Update goals section based on module progress
  function updateGoals(attackCompletedSections, phishingCompletedSections) {
    const goalsSection = document.querySelector(".goals");
    if (!goalsSection) return;

    // Update Attack Targets goal
    const goalHeadings = goalsSection.querySelectorAll(".goal-content h4");
    let attackTargetsGoal = null;
    let phishingAttacksGoal = null;

    // Find the right goals by text content
    goalHeadings.forEach((heading) => {
      if (heading.textContent.includes("Complete Attack Targets Module")) {
        attackTargetsGoal = heading;
      } else if (
        heading.textContent.includes("Start Phishing Attacks Module")
      ) {
        phishingAttacksGoal = heading;
      }
    });

    // Update Attack Targets goal
    if (attackTargetsGoal) {
      const goalItem = attackTargetsGoal.closest(".goal");
      const progressBar = goalItem.querySelector(".progress");
      const progressPercentage = (attackCompletedSections.length / 5) * 100;

      progressBar.style.width = `${progressPercentage}%`;
      goalItem.querySelector("span").textContent = `${Math.round(
        progressPercentage
      )}%`;

      // Update check mark if completed
      if (attackCompletedSections.length === 5) {
        goalItem.querySelector(".goal-check i").className =
          "fas fa-check-circle";
      }
    }

    // Update Phishing Attacks goal
    if (phishingAttacksGoal) {
      const goalItem = phishingAttacksGoal.closest(".goal");

      if (phishingCompletedSections.length > 0) {
        // Already started the module
        goalItem.querySelector(".goal-check i").className =
          "fas fa-check-circle";

        // If not already converted to progress bar, convert
        if (!goalItem.querySelector(".goal-progress")) {
          const deadlineText = goalItem.querySelector("p");
          const progressHtml = `
                        <div class="goal-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: ${
                                  (phishingCompletedSections.length / 3) * 100
                                }%"></div>
                            </div>
                            <span>${Math.round(
                              (phishingCompletedSections.length / 3) * 100
                            )}%</span>
                        </div>
                    `;

          deadlineText.outerHTML = progressHtml;
        } else {
          // Update existing progress bar
          const progressBar = goalItem.querySelector(".progress");
          const progressPercentage =
            (phishingCompletedSections.length / 3) * 100;

          progressBar.style.width = `${progressPercentage}%`;
          goalItem.querySelector("span").textContent = `${Math.round(
            progressPercentage
          )}%`;
        }

        // Update the goal text if needed
        if (phishingCompletedSections.length < 3) {
          phishingAttacksGoal.textContent = "Complete Phishing Attacks Module";
        }
      }
    }
  }

  // Call once on page load
  updateModuleProgress();

  // Add an event listener to force-refresh progress every few seconds for development
  setTimeout(updateModuleProgress, 1000); // Force refresh progress after 1 second

  // Simulated user activity counter
  let userDaysStreak = 21;
  let modulesCompleted = 7;
  let userProgress = 25;

  // Update these values from localStorage if they exist
  if (localStorage.getItem("userDaysStreak")) {
    userDaysStreak = parseInt(localStorage.getItem("userDaysStreak"));
    document.querySelectorAll(".progress-stat .stat-number")[1].textContent =
      userDaysStreak;
  }

  if (localStorage.getItem("modulesCompleted")) {
    modulesCompleted = parseInt(localStorage.getItem("modulesCompleted"));
    document.querySelectorAll(".progress-stat .stat-number")[0].textContent =
      modulesCompleted;
  }

  if (localStorage.getItem("userProgress")) {
    userProgress = parseInt(localStorage.getItem("userProgress"));
    const progressElement = document.querySelector(".circular-progress");
    progressElement.style.background = `conic-gradient(var(--cyber-green) ${userProgress}%, var(--third-dark) 0)`;
    document.querySelector(".progress-value").textContent = userProgress + "%";
  }

  // Event listener for CTA button with glitch effect
  const ctaBtn = document.querySelector(".primary-btn");
  if (ctaBtn) {
    ctaBtn.addEventListener("mouseenter", () => {
      ctaBtn.querySelector(".btn-glitch").style.opacity = "1";
    });

    ctaBtn.addEventListener("mouseleave", () => {
      ctaBtn.querySelector(".btn-glitch").style.opacity = "0.5";
    });
  }

  // Function to create glitch text effect
  function setupGlitchEffect() {
    const glitchTexts = document.querySelectorAll(".glitch, .sub-glitch");

    glitchTexts.forEach((text) => {
      text.addEventListener("mouseenter", () => {
        text.classList.add("glitching");
        setTimeout(() => {
          text.classList.remove("glitching");
        }, 1000);
      });
    });
  }

  setupGlitchEffect();

  // Add refresh progress button functionality
  const refreshProgressBtn = document.getElementById("refresh-progress");
  if (refreshProgressBtn) {
    refreshProgressBtn.addEventListener("click", () => {
      // First, clear console
      console.clear();

      // Force reset for debugging
      if (event.shiftKey) {
        const reset = confirm(
          "RESET ALL PROGRESS DATA? (This will clear all localStorage progress)"
        );
        if (reset) {
          localStorage.removeItem("attackCompletedSections");
          localStorage.removeItem("attackCompletedQuizzes");
          localStorage.removeItem("phishingCompletedSections");
          localStorage.removeItem("phishingCompletedQuizzes");
          console.log("All progress data cleared!");

          // Force recreate test data
          if (confirm("Create test data for both modules?")) {
            localStorage.setItem(
              "attackCompletedSections",
              JSON.stringify(["individuals", "businesses"])
            );
            localStorage.setItem(
              "attackCompletedQuizzes",
              JSON.stringify(["individuals", "businesses"])
            );
            localStorage.setItem(
              "phishingCompletedSections",
              JSON.stringify(["techniques", "types"])
            );
            localStorage.setItem(
              "phishingCompletedQuizzes",
              JSON.stringify(["techniques", "types"])
            );
            console.log("Test data created successfully!");
          }
        }
      }

      updateModuleProgress();
      console.log("Progress refreshed manually");
      console.log("localStorage keys:", {
        attackCompletedSections: JSON.parse(
          localStorage.getItem("attackCompletedSections") || "[]"
        ),
        attackCompletedQuizzes: JSON.parse(
          localStorage.getItem("attackCompletedQuizzes") || "[]"
        ),
        phishingCompletedSections: JSON.parse(
          localStorage.getItem("phishingCompletedSections") || "[]"
        ),
        phishingCompletedQuizzes: JSON.parse(
          localStorage.getItem("phishingCompletedQuizzes") || "[]"
        ),
      });

      // Visual feedback
      refreshProgressBtn.style.opacity = "1";
      setTimeout(() => {
        refreshProgressBtn.style.opacity = "0.7";
      }, 300);
    });
  }
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
