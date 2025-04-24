 // Define logout function globally
 function logout() {
    // Check if Firebase auth is available
    if (firebase && firebase.auth) {
      firebase.auth().signOut().then(() => {
        // Remove current user from localStorage for backward compatibility
        localStorage.removeItem("currentUser");
        // Redirect to login page
        window.location.href = "login.html";
      }).catch((error) => {
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

  document.addEventListener("DOMContentLoaded", function () {
    // Check if user is logged in and update nav
    const authNavItem = document.getElementById("auth-nav-item");
    
    // Check for Firebase auth state
    if (firebase && firebase.auth) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in with Firebase
          authNavItem.innerHTML = `
            <a href="#" class="nav-link" onclick="logout()">
              <i class="fas fa-sign-out-alt"></i> Logout (${user.displayName || user.email})
            </a>
          `;
          
          // Store in localStorage for backward compatibility
          localStorage.setItem('currentUser', JSON.stringify({
            username: user.email,
            fullname: user.displayName || 'Cyber Academy User'
          }));
        } else {
          // Check localStorage for backward compatibility
          const currentUser = JSON.parse(localStorage.getItem("currentUser"));
          if (currentUser) {
            authNavItem.innerHTML = `
              <a href="#" class="nav-link" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout (${currentUser.username})
              </a>
            `;
          }
        }
      });
    } else {
      // Fallback for older version
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        authNavItem.innerHTML = `
          <a href="#" class="nav-link" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i> Logout (${currentUser.username})
          </a>
        `;
      }
    }
    
    // Load cybersecurity tips from Firestore
    function loadCybersecurityTips() {
      const tipsContainer = document.getElementById('tips-container');
      
      // Check if Firestore is available
      if (firebase && firebase.firestore) {
        const db = firebase.firestore();
        
        // Reference to tips collection
        db.collection('cybersecurity-tips')
          .orderBy('createdAt', 'desc')
          .limit(6)
          .get()
          .then((querySnapshot) => {
            // Clear loading message
            tipsContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
              // If no tips exist yet, add sample tips to Firestore
              addSampleTips().then(() => {
                // Try loading tips again after adding samples
                setTimeout(loadCybersecurityTips, 1000);
              });
            } else {
              // Display tips from Firestore
              querySnapshot.forEach((doc) => {
                const tip = doc.data();
                const tipCard = createTipCard(tip, doc.id);
                tipsContainer.appendChild(tipCard);
              });
            }
          })
          .catch((error) => {
            console.error("Error getting cybersecurity tips:", error);
            tipsContainer.innerHTML = `
              <div class="tip-loading" style="color: #ff6b6b;">
                <i class="fas fa-exclamation-triangle"></i> 
                Error loading tips. Please check your Firebase configuration.
              </div>
            `;
            
            // Add sample tips directly to the UI if Firestore fails
            displaySampleTips();
          });
      } else {
        // Firestore not available, display sample tips directly
        displaySampleTips();
      }
    }
    
    // Create HTML for a tip card
    function createTipCard(tip, id) {
      const div = document.createElement('div');
      div.className = 'tip-card';
      div.dataset.id = id;
      
      // Format the date
      const date = tip.createdAt ? new Date(tip.createdAt.seconds * 1000) : new Date();
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
      
      div.innerHTML = `
        <h3>${tip.title}</h3>
        <p>${tip.content}</p>
        <div class="tip-metadata">
          <span><i class="fas fa-user-shield"></i> ${tip.author || 'Cyber Academy'}</span>
          <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
        </div>
      `;
      
      return div;
    }
    
    // Add sample tips to Firestore if none exist
    function addSampleTips() {
      const db = firebase.firestore();
      const batch = db.batch();
      const tipsCollection = db.collection('cybersecurity-tips');
      
      const sampleTips = [
        {
          title: 'Use Strong, Unique Passwords',
          content: 'Create complex passwords with a mix of letters, numbers, and symbols. Use a different password for each account to prevent credential stuffing attacks.',
          author: 'Security Team',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
          title: 'Enable Two-Factor Authentication',
          content: 'Always use 2FA when available. It adds an extra layer of security by requiring something you know (password) and something you have (like your phone).',
          author: 'Authentication Expert',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
          title: 'Keep Software Updated',
          content: 'Regularly update your operating system, applications, and antivirus software to patch security vulnerabilities that could be exploited by attackers.',
          author: 'System Admin',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
          title: 'Beware of Phishing Attempts',
          content: 'Be cautious of unexpected emails, messages, or calls asking for personal information. Verify the source before clicking links or downloading attachments.',
          author: 'Threat Analyst',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
          title: 'Secure Your Home Network',
          content: 'Change default router passwords, use WPA3 encryption if available, create a guest network for visitors, and regularly update firmware.',
          author: 'Network Security',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
          title: 'Use VPN on Public Wi-Fi',
          content: 'Always use a Virtual Private Network (VPN) when connecting to public Wi-Fi to encrypt your connection and protect your data from eavesdroppers.',
          author: 'Privacy Expert',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }
      ];
      
      // Add each tip to the batch
      sampleTips.forEach(tip => {
        const newTipRef = tipsCollection.doc();
        batch.set(newTipRef, tip);
      });
      
      // Commit the batch
      return batch.commit();
    }
    
    // Display sample tips directly in the UI when Firestore is unavailable
    function displaySampleTips() {
      const tipsContainer = document.getElementById('tips-container');
      tipsContainer.innerHTML = '';
      
      const sampleTips = [
        {
          title: 'Use Strong, Unique Passwords',
          content: 'Create complex passwords with a mix of letters, numbers, and symbols. Use a different password for each account to prevent credential stuffing attacks.',
          author: 'Security Team',
          date: 'Apr 24, 2025'
        },
        {
          title: 'Enable Two-Factor Authentication',
          content: 'Always use 2FA when available. It adds an extra layer of security by requiring something you know (password) and something you have (like your phone).',
          author: 'Authentication Expert',
          date: 'Apr 23, 2025'
        },
        {
          title: 'Keep Software Updated',
          content: 'Regularly update your operating system, applications, and antivirus software to patch security vulnerabilities that could be exploited by attackers.',
          author: 'System Admin',
          date: 'Apr 22, 2025'
        },
        {
          title: 'Beware of Phishing Attempts',
          content: 'Be cautious of unexpected emails, messages, or calls asking for personal information. Verify the source before clicking links or downloading attachments.',
          author: 'Threat Analyst',
          date: 'Apr 21, 2025'
        },
        {
          title: 'Secure Your Home Network',
          content: 'Change default router passwords, use WPA3 encryption if available, create a guest network for visitors, and regularly update firmware.',
          author: 'Network Security',
          date: 'Apr 20, 2025'
        },
        {
          title: 'Use VPN on Public Wi-Fi',
          content: 'Always use a Virtual Private Network (VPN) when connecting to public Wi-Fi to encrypt your connection and protect your data from eavesdroppers.',
          author: 'Privacy Expert',
          date: 'Apr 19, 2025'
        }
      ];
      
      sampleTips.forEach((tip, i) => {
        const div = document.createElement('div');
        div.className = 'tip-card';
        div.dataset.id = `sample-${i}`;
        
        div.innerHTML = `
          <h3>${tip.title}</h3>
          <p>${tip.content}</p>
          <div class="tip-metadata">
            <span><i class="fas fa-user-shield"></i> ${tip.author}</span>
            <span><i class="far fa-calendar-alt"></i> ${tip.date}</span>
          </div>
        `;
        
        tipsContainer.appendChild(div);
      });
    }
    
    // Call loadCybersecurityTips on page load
    loadCybersecurityTips();

    // Update module progress cards based on localStorage
    function updateModuleProgress() {
      // Only show progress if a user is logged in
      let isUserLoggedIn = false;
      
      // Check Firebase authentication first
      if (firebase && firebase.auth && firebase.auth().currentUser) {
        isUserLoggedIn = true;
      } else {
        // Fallback to localStorage check for backward compatibility
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        isUserLoggedIn = !!currentUser;
      }
      
      // If no user is logged in, ensure all progress bars show 0%
      if (!isUserLoggedIn) {
        document.querySelectorAll(".module-card .progress-fill").forEach(fill => {
          fill.style.width = "0%";
        });
        
        document.querySelectorAll(".module-card .stat-counter").forEach(counter => {
          counter.textContent = "0";
          counter.setAttribute("data-target", "0");
        });
        
        return; // Exit early - don't show any progress for visitors
      }
      
      // Only proceed with updating progress if a user is logged in
      
      // Attack Targets module
      const attackTargetsCard = document.querySelector(
        ".module-card:nth-child(2)"
      );
      if (attackTargetsCard) {
        const attackCompletedSections = JSON.parse(
          localStorage.getItem("attackCompletedSections") || "[]"
        );
        const progressPercentage = Math.round(
          (attackCompletedSections.length / 5) * 100
        );

        const progressFill =
          attackTargetsCard.querySelector(".progress-fill");
        if (progressFill) {
          progressFill.style.width = `${progressPercentage}%`;
        }

        const completionRate = attackTargetsCard.querySelector(
          ".completion-rate .stat-counter"
        );
        if (completionRate) {
          completionRate.textContent = progressPercentage;
          completionRate.setAttribute("data-target", progressPercentage);
        }
      }

      // Phishing Attacks module
      const phishingCard = document.querySelector(
        ".module-card:nth-child(3)"
      );
      if (phishingCard) {
        const phishingCompletedSections = JSON.parse(
          localStorage.getItem("phishingCompletedSections") || "[]"
        );
        const progressPercentage = Math.round(
          (phishingCompletedSections.length / 3) * 100
        );

        const progressFill = phishingCard.querySelector(".progress-fill");
        if (progressFill) {
          progressFill.style.width = `${progressPercentage}%`;
        }

        const completionRate = phishingCard.querySelector(
          ".completion-rate .stat-counter"
        );
        if (completionRate) {
          completionRate.textContent = progressPercentage;
          completionRate.setAttribute("data-target", progressPercentage);
        }
      }
    }

    // Call once on page load
    updateModuleProgress();

    // Particle.js initialization
    if (typeof particlesJS !== "undefined") {
      particlesJS("particles-js", {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#5cdb95" },
          shape: { type: "circle" },
          opacity: { value: 0.5, random: true },
          size: { value: 3, random: true },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#88ccf1",
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: true, mode: "push" },
            resize: true,
          },
          modes: {
            grab: { distance: 140, line_linked: { opacity: 1 } },
            push: { particles_nb: 4 },
          },
        },
        retina_detect: true,
      });
    }

    // Advanced counter animation with intersection observer
    const counters = document.querySelectorAll(".counter, .stat-counter");

    // Function to animate counter
    const animateCounter = (counter, target, duration = 2000) => {
      let startTime = null;
      const startValue = 0;

      // Easing function for smooth animation
      const easeOutQuart = (t) => 1 - --t * t * t * t;

      // Animation function
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easedProgress = easeOutQuart(progress);

        // Calculate current value based on easing
        let currentValue;
        if (target > 1000) {
          // For large numbers use more dramatic effect
          currentValue = Math.floor(easedProgress * target * 1.5);
          if (currentValue > target) currentValue = target;
        } else {
          currentValue = Math.floor(
            startValue + (target - startValue) * easedProgress
          );
        }

        counter.textContent = currentValue.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    // Use Intersection Observer to trigger counter animation when in view
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute("data-target"));

          // Stagger the animation for module card stats
          if (counter.classList.contains("stat-counter")) {
            const delay =
              counter.closest(".module-card").dataset.index || 0;
            setTimeout(() => {
              animateCounter(counter, target, 1500);
            }, delay * 150);
          } else {
            animateCounter(counter, target);
          }

          observer.unobserve(counter);
        }
      });
    }, observerOptions);

    // Add data-index to module cards for staggered animations
    document.querySelectorAll(".module-card").forEach((card, index) => {
      card.dataset.index = index;
    });

    counters.forEach((counter) => {
      observer.observe(counter);
    });

    // Testimonial slider
    const slides = document.querySelectorAll(".testimonial-slide");
    const navButtons = document.querySelectorAll(".testimonial-nav");

    navButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        slides.forEach((slide) => slide.classList.remove("active"));
        navButtons.forEach((btn) => btn.classList.remove("active"));

        slides[index].classList.add("active");
        button.classList.add("active");
      });
    });

    // Auto-rotate testimonials
    let currentSlide = 0;
    const totalSlides = slides.length;

    function rotateTestimonials() {
      currentSlide = (currentSlide + 1) % totalSlides;
      slides.forEach((slide) => slide.classList.remove("active"));
      navButtons.forEach((btn) => btn.classList.remove("active"));

      slides[currentSlide].classList.add("active");
      navButtons[currentSlide].classList.add("active");
    }

    const slideInterval = setInterval(rotateTestimonials, 5000);

    // Clear interval when user interacts with navigation
    document
      .querySelector(".testimonial-controls")
      .addEventListener("click", () => {
        clearInterval(slideInterval);
      });

    // Start button behavior
    document
      .getElementById("start-btn")
      .addEventListener("click", function () {
        window.location.href = "learn.html";
      });

    document
      .getElementById("join-btn")
      .addEventListener("click", function () {
        window.location.href = "learn.html";
      });
  });