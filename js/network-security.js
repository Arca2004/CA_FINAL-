document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase Authentication
  firebase.auth().onAuthStateChanged(function (user) {
    const loginLink = document.getElementById("login-link");
    const profileContainer = document.getElementById("profile-container");
    const profileInitial = document.getElementById("profile-initial");
    const profileName = document.getElementById("profile-name");

    if (user) {
      // User is signed in
      loginLink.style.display = "none";
      profileContainer.style.display = "flex";
      
      // Set profile initial
      if (user.displayName) {
        profileInitial.textContent = user.displayName.charAt(0).toUpperCase();
        profileName.textContent = user.displayName;
      } else if (user.email) {
        profileInitial.textContent = user.email.charAt(0).toUpperCase();
        profileName.textContent = user.email.split("@")[0];
      }

      // Setup logout button
      document.getElementById("logout-btn").addEventListener("click", function (e) {
        e.preventDefault();
        firebase.auth().signOut().then(function() {
          window.location.href = "index.html";
        }).catch(function(error) {
          console.error("Error signing out: ", error);
        });
      });
    } else {
      // User is signed out
      loginLink.style.display = "flex";
      profileContainer.style.display = "none";
    }
  });

  // Target card accordion functionality
  const topicQuizBtns = document.querySelectorAll(".topic-quiz-btn");
  
  topicQuizBtns.forEach((button) => {
    button.addEventListener("click", function() {
      const quizSection = this.closest(".topic-quiz");
      const selectedOption = quizSection.querySelector(".option.selected");
      
      if (!selectedOption) {
        alert("Please select an answer first.");
        return;
      }
      
      const resultsDiv = quizSection.querySelector(".topic-quiz-results");
      const correctFeedback = quizSection.querySelector(".correct-answer");
      const incorrectFeedback = quizSection.querySelector(".incorrect-answer");
      
      resultsDiv.style.display = "block";
      
      if (selectedOption.getAttribute("data-correct") === "true") {
        correctFeedback.style.display = "block";
        incorrectFeedback.style.display = "none";
        selectedOption.classList.add("correct");
        
        this.textContent = "Continue";
        this.classList.add("success");
        
        // Set this section as complete if there's a next locked section
        const targetCard = quizSection.closest(".target-card");
        if (targetCard) {
          const targetId = targetCard.getAttribute("data-target");
          const progressNode = document.querySelector(`.progress-node[data-topic="${targetId}"]`);
          
          if (progressNode) {
            progressNode.classList.add("completed");
          }
          
          // Unlock next section if it exists
          const nextCard = targetCard.nextElementSibling;
          if (nextCard && nextCard.classList.contains("target-card") && nextCard.classList.contains("locked")) {
            nextCard.classList.remove("locked");
            
            // Hide the lock overlay
            const lockOverlay = nextCard.querySelector(".lock-overlay");
            if (lockOverlay) {
              lockOverlay.style.display = "none";
            }
            
            // Update progress tracker
            const nextTargetId = nextCard.getAttribute("data-target");
            const nextProgressNode = document.querySelector(`.progress-node[data-topic="${nextTargetId}"]`);
            
            if (nextProgressNode) {
              nextProgressNode.classList.remove("locked");
              nextProgressNode.classList.add("active");
            }
            
            // Show celebration
            const celebrationContainer = document.querySelector(".celebration-container");
            if (celebrationContainer) {
              celebrationContainer.style.display = "flex";
              
              // Update celebration content
              const completedSections = document.querySelectorAll(".progress-node.completed").length;
              const totalSections = document.querySelectorAll(".progress-node").length;
              
              const statValue = celebrationContainer.querySelector(".stat-value");
              if (statValue) {
                statValue.textContent = `${completedSections}/${totalSections}`;
              }
              
              // Close celebration on button click
              const celebrationBtn = celebrationContainer.querySelector(".celebration-btn");
              if (celebrationBtn) {
                celebrationBtn.addEventListener("click", function() {
                  celebrationContainer.style.display = "none";
                  
                  // Scroll to the newly unlocked section
                  nextCard.scrollIntoView({ behavior: "smooth", block: "start" });
                });
              }
            }
          }
        }
      } else {
        correctFeedback.style.display = "none";
        incorrectFeedback.style.display = "block";
        selectedOption.classList.add("incorrect");
      }
    });
  });

  // Handle option selection
  const options = document.querySelectorAll(".option");
  
  options.forEach((option) => {
    option.addEventListener("click", function() {
      const allOptions = this.parentElement.querySelectorAll(".option");
      
      allOptions.forEach((opt) => {
        opt.classList.remove("selected");
      });
      
      this.classList.add("selected");
    });
  });

  // Toggle attack details
  const attackHeaders = document.querySelectorAll(".attack-item h3");
  
  attackHeaders.forEach((header) => {
    header.addEventListener("click", function() {
      const parentItem = this.parentElement;
      const wasExpanded = parentItem.classList.contains("expanded");
      
      // Close all other expanded items
      document.querySelectorAll(".attack-item.expanded").forEach((item) => {
        if (item !== parentItem) {
          item.classList.remove("expanded");
        }
      });
      
      // Toggle current item
      if (wasExpanded) {
        parentItem.classList.remove("expanded");
      } else {
        parentItem.classList.add("expanded");
      }
    });
  });
}); 