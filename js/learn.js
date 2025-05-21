// Particles.js Configuration
document.addEventListener("DOMContentLoaded", function () {
  // Elements for profile dropdown
  const authNavItem = document.getElementById("auth-nav-item");
  const loginLink = document.getElementById("login-link");
  const profileContainer = document.getElementById("profile-container");
  const profileAvatar = document.getElementById("profile-avatar");
  const profileInitial = document.getElementById("profile-initial");
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
  if (typeof firebase !== "undefined" && firebase.auth) {
    console.log("[DEBUG] Firebase auth is available");
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log("[DEBUG] User is signed in with Firebase:", user.uid);
        // User is signed in with Firebase
        if (loginLink) loginLink.style.display = "none";
        if (profileContainer) profileContainer.style.display = "block";
        if (profileInitial) profileInitial.textContent = getUserInitial(user);

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
        console.log("[DEBUG] Stored user info in localStorage with UID");
      } else {
        console.log("[DEBUG] No Firebase user, checking localStorage");
        // Check localStorage for backward compatibility
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
          console.log("[DEBUG] Found user in localStorage:", currentUser.uid || "no UID");
          if (loginLink) loginLink.style.display = "none";
          if (profileContainer) profileContainer.style.display = "block";
          if (profileInitial)
            profileInitial.textContent = getUserInitial(currentUser);
        } else {
          console.log("[DEBUG] No user found in Firebase or localStorage");
          if (loginLink) loginLink.style.display = "block";
          if (profileContainer) profileContainer.style.display = "none";
        }
      }
    });
  } else {
    console.log("[DEBUG] Firebase auth is not available, using localStorage only");
    // Fallback for older version
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      console.log("[DEBUG] Found user in localStorage:", currentUser.uid || "no UID");
      if (loginLink) loginLink.style.display = "none";
      if (profileContainer) profileContainer.style.display = "block";
      if (profileInitial)
        profileInitial.textContent = getUserInitial(currentUser);
    } else {
      console.log("[DEBUG] No user found in localStorage");
      if (loginLink) loginLink.style.display = "block";
      if (profileContainer) profileContainer.style.display = "none";
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

  // Function to set active tab
  function setActiveTab(tabName) {
    // Remove active class from all buttons and contents
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    // Add active class to specified tab button
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (targetBtn) {
      targetBtn.classList.add("active");
    }

    // Show corresponding content
    const targetContent = document.getElementById(`${tabName}-content`);
    if (targetContent) {
      targetContent.classList.add("active");
    }

    // Save selection to localStorage
    localStorage.setItem("selectedLearnTab", tabName);
  }

  // Check if there's a saved tab preference
  const savedTab = localStorage.getItem("selectedLearnTab");
  if (savedTab) {
    setActiveTab(savedTab);
  }

  // Add click event listeners to tab buttons
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      setActiveTab(targetTab);
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
    console.log("[DEBUG] Updating module progress on learn page...");
    
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      // User is logged in with Firebase, load progress from Realtime Database
      const userId = firebase.auth().currentUser.uid;
      console.log("[DEBUG] Loading progress for logged in user:", userId);
      loadProgressFromDatabase(userId);
    } else {
      // Check if we have a user ID in localStorage
      const localUser = JSON.parse(localStorage.getItem("currentUser"));
      if (localUser && localUser.uid) {
        console.log("[DEBUG] Loading progress using localStorage UID:", localUser.uid);
        loadProgressFromDatabase(localUser.uid);
      } else {
        // Fallback to localStorage for backward compatibility
        console.log("[DEBUG] No user ID found, falling back to localStorage");
        loadProgressFromLocalStorage();
      }
    }
    
    // Schedule another refresh after a delay to ensure progress is shown
    setTimeout(() => {
      console.log("[DEBUG] Running delayed UI refresh on learn page");
      if (firebase && firebase.auth && firebase.auth().currentUser) {
        loadProgressFromDatabase(firebase.auth().currentUser.uid);
      } else {
        const localUser = JSON.parse(localStorage.getItem("currentUser"));
        if (localUser && localUser.uid) {
          loadProgressFromDatabase(localUser.uid);
        } else {
          loadProgressFromLocalStorage();
        }
      }
      
      // Force repaint of all progress bars to ensure they're displayed correctly
      document.querySelectorAll('.progress').forEach(prog => {
        // Get current width
        const currentWidth = prog.style.width;
        // Force a repaint by temporarily setting to 0
        prog.style.width = '0%';
        // Force browser to acknowledge the change
        void prog.offsetWidth;
        // Set back to original value
        prog.style.width = currentWidth;
      });
      
      // Also call our dedicated refresh function
      refreshAllProgressBars();
    }, 1500);
  }

  // Function to load progress from Realtime Database
  function loadProgressFromDatabase(userId) {
    if (!firebase.database) {
      console.error("[DEBUG] Firebase Realtime Database is not available");
      loadProgressFromLocalStorage();
      return;
    }

    console.log("[DEBUG] Loading progress from Realtime Database for user", userId);
    
    firebase.database().ref(`userProgress/${userId}`).once('value')
      .then((snapshot) => {
        const data = snapshot.val();
        console.log("[DEBUG] Loaded user progress data:", data);
        
        if (data) {
          updateUIWithProgressData(data);
        } else {
          console.log("[DEBUG] No data found in Realtime Database, initializing");
          // Initialize user progress document if it doesn't exist
          const initialData = {
            completedModules: 0,
            totalModules: 6,
            completedTopics: 0,
            totalTimeMinutes: 0,
            completionPercentage: 0,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP,
            modules: {
              introCybersec: { completedQuizzes: [], progressPercentage: 0 },
              attackTargets: { completedSections: [], completedQuizzes: [], progressPercentage: 0 },
              phishingAttacks: { completedSections: [], completedQuizzes: [], progressPercentage: 0 },
              malwareInfections: { completedSections: [], completedQuizzes: [], progressPercentage: 0 },
              cloudSecurity: { completedSections: [], progressPercentage: 0 },
              passwordTheft: { completedSections: [], progressPercentage: 0 }
            }
          };
          
          firebase.database().ref(`userProgress/${userId}`).set(initialData)
            .then(() => {
              console.log("[DEBUG] Created new user progress document in Realtime Database");
              updateUIWithProgressData(initialData);
            })
            .catch(error => {
              console.error("[DEBUG] Error creating user progress document:", error);
              loadProgressFromLocalStorage();
            });
        }
      })
      .catch((error) => {
        console.error("[DEBUG] Error loading user progress from Realtime Database:", error);
        loadProgressFromLocalStorage();
      });
  }

  // New function to update UI with progress data from either Realtime Database or localStorage
  function updateUIWithProgressData(data) {
    console.log("[DEBUG] Received progress data to update UI:", data);
    
    // Force all progress bars to be visible by adding a small CSS override
    if (!document.getElementById('progress-force-display')) {
      const style = document.createElement('style');
      style.id = 'progress-force-display';
      style.textContent = '.progress { transition: width 0.3s ease-in-out !important; }';
      document.head.appendChild(style);
    }
    
    // Progress from Attack Targets module
    const attackTargetsTopics = document.querySelector(
      ".module-card:nth-child(2)"
    );
    
    if (attackTargetsTopics) {
      // Get attack targets progress from data
      const attackTargetsModule = data.modules?.attackTargets || {};
      const attackTargetsCompletedSections = attackTargetsModule.completedQuizzes || [];
      const attackProgress = attackTargetsModule.progressPercentage || 0;
      
      console.log("[DEBUG] Attack Targets progress:", attackProgress + "%");
      
      // Update the attack topics list with check marks if we have progress
      if (attackTargetsCompletedSections.length > 0) {
        const topicsList = attackTargetsTopics.querySelectorAll(".module-topics li");
        
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
            }
          }
        });
        
        // Update progress bar
        const progressBar = attackTargetsTopics.querySelector(".progress");
        if (progressBar) {
          progressBar.style.width = `${attackProgress}%`;
          
          // Force a repaint
          void progressBar.offsetWidth;
        }
        
        // Update module card visual state based on completion
        if (attackProgress === 100) {
          attackTargetsTopics.classList.add("completed");
          const button = attackTargetsTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
          }
          
          // Add visual indicator for completion
          if (!attackTargetsTopics.querySelector(".completion-badge")) {
            const badge = document.createElement("div");
            badge.className = "completion-badge";
            badge.innerHTML = '<i class="fas fa-medal"></i>';
            attackTargetsTopics.appendChild(badge);
          }
        } else if (attackProgress > 0) {
          // If any progress, update button to "Continue"
          const button = attackTargetsTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
          }
          attackTargetsTopics.classList.add("active");
          
          // Keep card elevated
          attackTargetsTopics.style.transform = "translateY(-10px)";
          attackTargetsTopics.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
        }
      }
    }
    
    // Progress from Phishing Attacks module
    const phishingTopics = document.querySelector(".module-card:nth-child(3)");
    
    if (phishingTopics) {
      // Get phishing progress from data
      const phishingModule = data.modules?.phishingAttacks || {};
      const phishingCompletedSections = phishingModule.completedSections || [];
      const phishingCompletedQuizzes = phishingModule.completedQuizzes || [];
      // --- Dynamically determine total number of topics/quizzes ---
      let phishingTotalTopics = 3; // fallback default
      // Try to get from DOM if on phishing-attack.html
      if (window.location.pathname.includes('learn.html')) {
        // Try to get from the module-topics list (li with a real topic)
        const topicLis = phishingTopics.querySelectorAll('.module-topics li');
        // Only count those with a real icon and text (not empty li)
        phishingTotalTopics = Array.from(topicLis).filter(li => li.textContent.trim() && li.querySelector('i')).length;
        // Fallback to 3 if not found
        if (phishingTotalTopics < 1) phishingTotalTopics = 3;
      }
      // --- End dynamic topic count ---
      const completedItems = [...new Set([...phishingCompletedSections, ...phishingCompletedQuizzes])];
      let phishingProgress = 0;
      if (phishingTotalTopics > 0) {
        phishingProgress = Math.round((completedItems.length / phishingTotalTopics) * 100);
      }
      // Update the phishing topics list with check marks
      if (completedItems.length > 0) {
        const topicsList = phishingTopics.querySelectorAll(".module-topics li");
        // Map topic IDs to list items
        const topicMap = {
          "techniques": 0,
          "types": 1,
          "prevention": 2
        };
        completedItems.forEach(topicId => {
          const topicIndex = topicMap[topicId];
          if (topicIndex !== undefined && topicsList[topicIndex]) {
            const icon = topicsList[topicIndex].querySelector("i");
            if (icon) {
              icon.className = "fas fa-check-circle";
            }
          }
        });
        // Update progress bar
        const progressBar = phishingTopics.querySelector(".progress");
        if (progressBar) {
          progressBar.style.width = `${phishingProgress}%`;
          void progressBar.offsetWidth;
          setTimeout(() => {
            progressBar.style.width = `${phishingProgress}%`;
          }, 50);
        }
        // Update module card visual state based on completion
        if (phishingProgress === 100) {
          phishingTopics.classList.add("completed");
          const button = phishingTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
          }
          if (!phishingTopics.querySelector(".completion-badge")) {
            const badge = document.createElement("div");
            badge.className = "completion-badge";
            badge.innerHTML = '<i class="fas fa-medal"></i>';
            phishingTopics.appendChild(badge);
          }
        } else if (phishingProgress > 0) {
          const button = phishingTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
          }
          phishingTopics.classList.add("active");
          phishingTopics.style.transform = "translateY(-10px)";
          phishingTopics.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
        }
      }
    }
    
    // Progress from Introduction to Cybersecurity module
    const introTopics = document.querySelector(".module-card:nth-child(1)");
    
    if (introTopics) {
      // Get intro progress from data
      const introModule = data.modules?.introCybersec || {};
      const introCompletedQuizzes = introModule.completedQuizzes || [];
      const introProgress = introModule.progressPercentage || 0;
      
      console.log("[DEBUG] Intro module data:", introModule);
      console.log("[DEBUG] Intro completed quizzes:", introCompletedQuizzes);
      console.log("[DEBUG] Intro progress percentage:", introProgress);
      
      // Update the intro topics list with check marks if we have progress
      if (introCompletedQuizzes.length > 0) {
        const topicsList = introTopics.querySelectorAll(".module-topics li");
        
        // Map quiz IDs to topics in the list
        const quizToTopicMap = {
          "application-security": 0,
          "cloud-security": 1,
          "identity-management": 2,
          "mobile-security": 3,
          "network-security": 4
        };
        
        introCompletedQuizzes.forEach((quizId) => {
          const topicIndex = quizToTopicMap[quizId];
          if (topicIndex !== undefined && topicsList[topicIndex]) {
            const icon = topicsList[topicIndex].querySelector("i");
            if (icon) {
              icon.className = "fas fa-check-circle";
            }
          }
        });
        
        // Update progress bar
        const progressBar = introTopics.querySelector(".progress");
        if (progressBar) {
          console.log("[DEBUG] Setting intro progress bar width to:", introProgress + "%");
          progressBar.style.width = `${introProgress}%`;
          
          // Force a repaint
          void progressBar.offsetWidth;
          
          // Set it again with a small delay to ensure it's applied
          setTimeout(() => {
            progressBar.style.width = `${introProgress}%`;
          }, 50);
        }
        
        // Update module card visual state based on completion
        if (introProgress === 100) {
          introTopics.classList.add("completed");
          const button = introTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
          }
          
          // Add visual indicator for completion
          if (!introTopics.querySelector(".completion-badge")) {
            const badge = document.createElement("div");
            badge.className = "completion-badge";
            badge.innerHTML = '<i class="fas fa-medal"></i>';
            introTopics.appendChild(badge);
          }
        } else if (introProgress > 0) {
          // If any progress, update button to "Continue"
          const button = introTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
          }
          introTopics.classList.add("active");
          
          // Keep card elevated
          introTopics.style.transform = "translateY(-10px)";
          introTopics.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
        }
      }
    }
    
    // Progress from Malware module
    const malwareTopics = document.querySelector(".module-card:nth-child(4)");
    
    if (malwareTopics) {
      // Get malware module progress data
      const malwareModule = data.modules?.malwareInfections || {};
      const malwareCompletedSections = malwareModule.completedSections || [];
      const malwareCompletedQuizzes = malwareModule.completedQuizzes || [];
      const malwareProgress = malwareModule.progressPercentage || 0;
      
      console.log("[DEBUG] Malware module data:", malwareModule);
      console.log("[DEBUG] Malware completed sections:", malwareCompletedSections);
      console.log("[DEBUG] Malware completed quizzes:", malwareCompletedQuizzes);
      console.log("[DEBUG] Malware progress percentage:", malwareProgress);
      
      // Update the malware topics list with check marks
      const completedItems = [...new Set([...malwareCompletedSections, ...malwareCompletedQuizzes])];
      if (completedItems.length > 0) {
        const topicsList = malwareTopics.querySelectorAll(".module-topics li");
        
        // Map topic IDs to list items
        const topicMap = {
          "types-of-malware": 0,
          "ransomware": 1,
          "spyware": 2,
          "trojans": 3,
          "worms": 4
        };
        
        completedItems.forEach(topicId => {
          const topicIndex = topicMap[topicId];
          if (topicIndex !== undefined && topicsList[topicIndex]) {
            const icon = topicsList[topicIndex].querySelector("i");
            if (icon) {
              icon.className = "fas fa-check-circle";
            }
          }
        });
        
        // Update progress bar
        const progressBar = malwareTopics.querySelector(".progress");
        if (progressBar) {
          console.log("[DEBUG] Setting malware progress bar width to:", malwareProgress + "%");
          progressBar.style.width = `${malwareProgress}%`;
          
          // Force a repaint
          void progressBar.offsetWidth;
          
          // Set it again with a small delay to ensure it's applied
          setTimeout(() => {
            progressBar.style.width = `${malwareProgress}%`;
          }, 50);
        }
        
        // Update module card visual state based on completion
        if (malwareProgress === 100) {
          malwareTopics.classList.add("completed");
          const button = malwareTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
          }
          
          // Add visual indicator for completion
          if (!malwareTopics.querySelector(".completion-badge")) {
            const badge = document.createElement("div");
            badge.className = "completion-badge";
            badge.innerHTML = '<i class="fas fa-medal"></i>';
            malwareTopics.appendChild(badge);
          }
        } else if (malwareProgress > 0) {
          // If any progress, update button to "Continue"
          const button = malwareTopics.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
          }
          malwareTopics.classList.add("active");
          
          // Keep card elevated
          malwareTopics.style.transform = "translateY(-10px)";
          malwareTopics.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
        }
      }
    }
    
    // Progress from Cloud Security Fixed module
    // Find cloud security card in intermediate tab content
    let cloudSecurityCard = null;
    const intermediateTab = document.querySelector("#intermediate-content");
    if (intermediateTab) {
      intermediateTab.querySelectorAll(".module-card").forEach(card => {
        const heading = card.querySelector("h3");
        if (heading && heading.textContent.trim() === "Cloud Security") {
          cloudSecurityCard = card;
        }
      });
    }
    
    if (cloudSecurityCard) {
      // Get cloud security progress from data
      const cloudSecurityModule = data.modules?.cloudSecurity || {};
      const cloudSecurityCompletedSections = cloudSecurityModule.completedSections || [];
      const cloudSecurityProgress = cloudSecurityModule.progressPercentage || 0;
      
      console.log("[DEBUG] Cloud Security module data:", cloudSecurityModule);
      console.log("[DEBUG] Cloud Security completed sections:", cloudSecurityCompletedSections);
      console.log("[DEBUG] Cloud Security progress percentage:", cloudSecurityProgress);
      
      // Update the cloud security topics list with check marks if we have progress
      if (cloudSecurityCompletedSections.length > 0) {
        const topicsList = cloudSecurityCard.querySelectorAll(".module-topics li");
        
        // Map section IDs to topics in the list
        const sectionToTopicMap = {
          "cloud-basics": 0,
          "data-breaches": 1,
          "misconfiguration": 2,
          "account-hijacking": 3,
          "insider-threats": 4
        };
        
        cloudSecurityCompletedSections.forEach((section) => {
          const topicIndex = sectionToTopicMap[section];
          if (topicIndex !== undefined && topicsList[topicIndex]) {
            const icon = topicsList[topicIndex].querySelector("i");
            if (icon) {
              icon.className = "fas fa-check-circle";
            }
          }
        });
        
        // Update progress bar
        const progressBar = cloudSecurityCard.querySelector(".progress");
        if (progressBar) {
          console.log("[DEBUG] Setting cloud security progress bar width to:", cloudSecurityProgress + "%");
          progressBar.style.width = `${cloudSecurityProgress}%`;
          
          // Force a repaint
          void progressBar.offsetWidth;
          
          // Set it again with a small delay to ensure it's applied
          setTimeout(() => {
            progressBar.style.width = `${cloudSecurityProgress}%`;
          }, 50);
        }
        
        // Update module card visual state based on completion
        if (cloudSecurityProgress === 100) {
          cloudSecurityCard.classList.add("completed");
          const button = cloudSecurityCard.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
          }
          
          // Add visual indicator for completion
          if (!cloudSecurityCard.querySelector(".completion-badge")) {
            const badge = document.createElement("div");
            badge.className = "completion-badge";
            badge.innerHTML = '<i class="fas fa-medal"></i>';
            cloudSecurityCard.appendChild(badge);
          }
        } else if (cloudSecurityProgress > 0) {
          // If any progress, update button to "Continue"
          const button = cloudSecurityCard.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
          }
          cloudSecurityCard.classList.add("active");
          
          // Keep card elevated
          cloudSecurityCard.style.transform = "translateY(-10px)";
          cloudSecurityCard.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
        }
      }
    }
    
    // Progress from Password Theft module
    // Find password theft card in beginner tab content
    let passwordTheftCard = null;
    const beginnerTab = document.querySelector("#beginner-content");
    if (beginnerTab) {
      beginnerTab.querySelectorAll(".module-card").forEach(card => {
        const heading = card.querySelector("h3");
        if (heading && heading.textContent.trim().includes("Password Theft")) {
          passwordTheftCard = card;
        }
      });
    }
    
    if (passwordTheftCard) {
      // Get password theft progress from data
      const passwordTheftModule = data.modules?.passwordTheft || {};
      const passwordTheftCompletedSections = passwordTheftModule.completedSections || [];
      const passwordTheftProgress = passwordTheftModule.progressPercentage || 0;
      
      console.log("[DEBUG] Password Theft module data:", passwordTheftModule);
      console.log("[DEBUG] Password Theft completed sections:", passwordTheftCompletedSections);
      console.log("[DEBUG] Password Theft progress percentage:", passwordTheftProgress);
      
      // Update the password theft topics list with check marks if we have progress
      if (passwordTheftCompletedSections.length > 0) {
        const topicsList = passwordTheftCard.querySelectorAll(".module-topics li");
        
        // Map section IDs to topics in the list - adjust these based on actual topics in the module
        const sectionToTopicMap = {
          "password-protection": 0,
          "encryption": 1,
          "phishing-password": 2,
          "social-engineering": 3,
          "auth-bypass": 4
        };
        
        passwordTheftCompletedSections.forEach((section) => {
          const topicIndex = sectionToTopicMap[section];
          if (topicIndex !== undefined && topicsList[topicIndex]) {
            const icon = topicsList[topicIndex].querySelector("i");
            if (icon) {
              icon.className = "fas fa-check-circle";
            }
          }
        });
        
        // Update progress bar
        const progressBar = passwordTheftCard.querySelector(".progress");
        if (progressBar) {
          console.log("[DEBUG] Setting password theft progress bar width to:", passwordTheftProgress + "%");
          progressBar.style.width = `${passwordTheftProgress}%`;
          
          // Force a repaint
          void progressBar.offsetWidth;
          
          // Set it again with a small delay to ensure it's applied
          setTimeout(() => {
            progressBar.style.width = `${passwordTheftProgress}%`;
          }, 50);
        }
        
        // Update module card visual state based on completion
        if (passwordTheftProgress === 100) {
          passwordTheftCard.classList.add("completed");
          const button = passwordTheftCard.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
          }
          
          // Add visual indicator for completion
          if (!passwordTheftCard.querySelector(".completion-badge")) {
            const badge = document.createElement("div");
            badge.className = "completion-badge";
            badge.innerHTML = '<i class="fas fa-medal"></i>';
            passwordTheftCard.appendChild(badge);
          }
        } else if (passwordTheftProgress > 0) {
          // If any progress, update button to "Continue"
          const button = passwordTheftCard.querySelector(".module-btn");
          if (button) {
            button.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
          }
          passwordTheftCard.classList.add("active");
          
          // Keep card elevated
          passwordTheftCard.style.transform = "translateY(-10px)";
          passwordTheftCard.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
        }
      }
    }
    
    // Update overall progress based on all modules
    updateOverallProgress(data);
  }

  // Fallback to localStorage for backward compatibility
  function loadProgressFromLocalStorage() {
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
      introCompletedQuizzes: JSON.parse(
        localStorage.getItem("introCompletedQuizzes") || "[]"
      ),
      cloudSecurityCompletedSections: JSON.parse(
        localStorage.getItem("cloudSecurityCompletedSections") || "[]"
      ),
      passwordCompletedSections: JSON.parse(
        localStorage.getItem("passwordCompletedSections") || "[]"
      )
    });

    // Get progress data from localStorage
    const introCompletedQuizzes = JSON.parse(
      localStorage.getItem("introCompletedQuizzes") || "[]"
    );
    const attackCompletedSections = JSON.parse(
      localStorage.getItem("attackCompletedSections") || "[]"
    );
    const attackCompletedQuizzes = JSON.parse(
      localStorage.getItem("attackCompletedQuizzes") || "[]"
    );
    const phishingCompletedSections = JSON.parse(
      localStorage.getItem("phishingCompletedSections") || "[]"
    );
    const phishingCompletedQuizzes = JSON.parse(
      localStorage.getItem("phishingCompletedQuizzes") || "[]"
    );
    const cloudSecurityCompletedSections = JSON.parse(
      localStorage.getItem("cloudSecurityCompletedSections") || "[]"
    );
    const passwordCompletedSections = JSON.parse(
      localStorage.getItem("passwordCompletedSections") || "[]"
    );

    // Calculate percentages
    const introTopicsTotal = 5;
    const attackTopicsTotal = 5;
    const phishingTopicsTotal = 4;
    const cloudSecurityTopicsTotal = 5;
    const passwordTheftTopicsTotal = 5;
    
    const introProgress = Math.round(
      (introCompletedQuizzes.length / introTopicsTotal) * 100
    );
    const attackProgress = Math.round(
      (attackCompletedSections.length / attackTopicsTotal) * 100
    );
    const phishingProgress = Math.round(
      (phishingCompletedSections.length / phishingTopicsTotal) * 100
    );
    const cloudSecurityProgress = Math.round(
      (cloudSecurityCompletedSections.length / cloudSecurityTopicsTotal) * 100
    );
    const passwordTheftProgress = Math.round(
      (passwordCompletedSections.length / passwordTheftTopicsTotal) * 100
    );

    // Create a data object similar to Realtime Database structure
    const progressData = {
      completedModules: 0,
      totalModules: 6,
      completedTopics: introCompletedQuizzes.length + attackCompletedSections.length + 
                      phishingCompletedSections.length + cloudSecurityCompletedSections.length +
                      passwordCompletedSections.length,
      totalTimeMinutes: 0,
      modules: {
        introCybersec: {
          completedQuizzes: introCompletedQuizzes,
          progressPercentage: introProgress
        },
        attackTargets: {
          completedQuizzes: attackCompletedSections,
          progressPercentage: attackProgress
        },
        phishingAttacks: {
          completedQuizzes: phishingCompletedSections,
          progressPercentage: phishingProgress
        },
        malwareInfections: {
          completedQuizzes: [],
          progressPercentage: 0
        },
        cloudSecurity: {
          completedSections: cloudSecurityCompletedSections,
          progressPercentage: cloudSecurityProgress
        },
        passwordTheft: {
          completedSections: passwordCompletedSections,
          progressPercentage: passwordTheftProgress
        }
      }
    };
    
    // Calculate completed modules
    if (introProgress === 100) progressData.completedModules++;
    if (attackProgress === 100) progressData.completedModules++;
    if (phishingProgress === 100) progressData.completedModules++;
    if (cloudSecurityProgress === 100) progressData.completedModules++;
    if (passwordTheftProgress === 100) progressData.completedModules++;
    
    // Calculate overall percentage
    progressData.completionPercentage = Math.round(
      (progressData.completedTopics / (introTopicsTotal + attackTopicsTotal + phishingTopicsTotal + cloudSecurityTopicsTotal + passwordTheftTopicsTotal)) * 100
    );
    
    // Estimate time spent (15 minutes per topic)
    progressData.totalTimeMinutes = progressData.completedTopics * 15;
    
    // Update UI with this data
    updateUIWithProgressData(progressData);
  }

  // Update the updateOverallProgress function to use the Realtime Database data structure
  function updateOverallProgress(data) {
    // Extract values from data
    const completedModules = data.completedModules || 0;
    const totalModules = data.totalModules || 6;
    const completedTopics = data.completedTopics || 0;
    const completionPercentage = data.completionPercentage || 0;
    
    // Update modules completed counter
    const moduleCounters = document.querySelectorAll(".progress-stat .stat-number");
    if (moduleCounters && moduleCounters[0]) {
      moduleCounters[0].textContent = completedModules;
    }
    
    // Store in localStorage for backward compatibility
    localStorage.setItem("modulesCompleted", completedModules);

    // Update circular progress
    const progressElement = document.querySelector(".circular-progress");
    if (progressElement) {
      progressElement.style.background = `conic-gradient(var(--cyber-green) ${completionPercentage}%, var(--third-dark) 0)`;
      const progressValue = document.querySelector(".progress-value");
      if (progressValue) {
        progressValue.textContent = `${Math.round(completionPercentage)}%`;
      }
    }
    
    // Store in localStorage for backward compatibility
    localStorage.setItem("userProgress", Math.round(completionPercentage));

    // Unlock intermediate path if beginner path is completed
    if (completedModules >= 3) { // If at least the 3 beginner modules are completed
      const lockedModules = document.querySelectorAll(".module-card.locked");
      lockedModules.forEach((module) => {
        if (
          module.querySelector(".lock-message") &&
          module.querySelector(".lock-message").textContent.includes("Complete Beginner Path First")
        ) {
          module.classList.remove("locked");
          module.querySelector(".lock-message").innerHTML =
            '<i class="fas fa-play-circle"></i> Start Module';
        }
      });
    }

    // Get completed sections for the timeline
    const attackCompletedSections = data.modules?.attackTargets?.completedQuizzes || [];
    const phishingCompletedSections = data.modules?.phishingAttacks?.completedQuizzes || [];
    
    // Update progress timeline
    updateProgressTimeline(attackCompletedSections, phishingCompletedSections);
    
    // Update learning goals if that function exists
    if (typeof updateGoals === "function") {
      updateGoals(attackCompletedSections, phishingCompletedSections);
    }
  }

  // Initialize module progress when the page loads
  updateModuleProgress();

  // Call it again after a delay for better reliability
  setTimeout(updateModuleProgress, 1500);
  setTimeout(refreshAllProgressBars, 2000);

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

  // Function to force refresh all progress bars
  function refreshAllProgressBars() {
    console.log("[DEBUG] Forcibly refreshing all progress bars");
    
    // Force all progress bars to be re-rendered
    document.querySelectorAll('.progress').forEach(progressBar => {
      // Get current width
      const currentWidth = progressBar.style.width || '0%';
      console.log("[DEBUG] Progress bar current width:", currentWidth);
      
      // Force a repaint by temporarily setting to 0
      progressBar.style.width = '0%';
      
      // Force browser to acknowledge the change
      void progressBar.offsetWidth;
      
      // Set back to original value
      progressBar.style.width = currentWidth;
      
      // Log the refreshed state
      console.log("[DEBUG] Progress bar refreshed to:", progressBar.style.width);
    });
    
    // Specifically check for phishing progress
    const phishingCard = document.querySelector(".module-card:nth-child(3)");
    if (phishingCard) {
      const progressBar = phishingCard.querySelector(".progress");
      if (progressBar) {
        // Get progress data specifically for phishing
        let phishingProgress = 0;
        
        if (firebase && firebase.auth && firebase.auth().currentUser) {
          // Try to get data from Firebase
          firebase.database().ref(`userProgress/${firebase.auth().currentUser.uid}/modules/phishingAttacks`).once('value')
            .then(snapshot => {
              const data = snapshot.val() || {};
              phishingProgress = data.progressPercentage || 0;
              console.log("[DEBUG] Phishing progress from Firebase:", phishingProgress);
              progressBar.style.width = `${phishingProgress}%`;
            })
            .catch(error => {
              console.error("[DEBUG] Error loading phishing progress:", error);
            });
        } else {
          // Fallback to localStorage
          const localData = JSON.parse(localStorage.getItem("phishingCompletedQuizzes")) || [];
          if (localData.length > 0) {
            // Calculate approximate progress based on number of completed quizzes (3 topics total)
            phishingProgress = Math.round((localData.length / 3) * 100);
            console.log("[DEBUG] Phishing progress from localStorage:", phishingProgress);
            progressBar.style.width = `${phishingProgress}%`;
          }
        }
        
        // Apply visual state based on progress
        if (phishingProgress === 100) {
          phishingCard.classList.add("completed");
        } else if (phishingProgress > 0) {
          phishingCard.classList.add("active");
        }
      }
    }
  }

  // Add a small delay to refresh all progress bars after the page has fully loaded
  setTimeout(() => {
    refreshAllProgressBars();
  }, 500);
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
