# Progress Tracking System - Implementation Guide

This guide explains how progress tracking is implemented in the Cybersecurity Academy modules using Firebase Realtime Database. The successful implementation from `intro-cybersec.js` can be used as a reference for other modules.

## Key Components

### 1. Define Topic Order

At the top of your JavaScript file, define the ordering of topics:

```javascript
// Define topic progression order
const topicOrder = [
  "application-security",
  "cloud-security",
  "identity-management",
  "mobile-security",
  "network-security"
];
```

### 2. Initialize Progress Variables

Create variables to track completed topics:

```javascript
// Initialize variables
let completedQuizzes = [];
let currentUser = null;
```

### 3. Loading Progress from Firebase

When the page loads, fetch user progress from Firebase:

```javascript
function loadUserProgress(userId) {
  console.log("[DEBUG] Loading progress for user:", userId);
  
  if (!firebase.database) {
    console.error("Firebase Realtime Database is not available");
    return;
  }

  // Reference to the user's progress data in RTDB
  const userProgressRef = firebase.database()
    .ref(`userProgress/${userId}/modules/moduleName`);
  
  userProgressRef.once('value')
    .then((snapshot) => {
      const data = snapshot.val() || {};
      
      // Load progress data
      if (data.completedQuizzes) {
        completedQuizzes = data.completedQuizzes;
        
        // Update localStorage as backup
        localStorage.setItem("moduleCompletedQuizzes", 
          JSON.stringify(completedQuizzes));
      } else {
        // No data in database, check localStorage
        const localData = JSON.parse(localStorage.getItem("moduleCompletedQuizzes")) || [];
        
        if (localData.length > 0) {
          completedQuizzes = localData;
          
          // Sync localStorage to Firebase
          userProgressRef.update({
            completedQuizzes: completedQuizzes,
            progressPercentage: (completedQuizzes.length / topicOrder.length) * 100,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
          });
        } else {
          completedQuizzes = [];
        }
      }
      
      // Update UI
      updateProgress();
      updateCompletedItems();
      updateProgressNodes();
      updateTopicAccessibility();
      refreshProgressIndicators();
    })
    .catch((error) => {
      console.error("Error loading progress:", error);
      
      // Fall back to localStorage
      const localData = JSON.parse(localStorage.getItem("moduleCompletedQuizzes")) || [];
      completedQuizzes = localData;
      updateProgress();
      updateCompletedItems();
      updateProgressNodes();
      updateTopicAccessibility();
    });
}
```

### 4. Saving Progress to Firebase

When a quiz is completed, save the progress:

```javascript
function saveUserProgress(userId, topicId) {
  if (!firebase.database || !userId) {
    // Save to localStorage as backup
    localStorage.setItem("moduleCompletedQuizzes", 
      JSON.stringify(completedQuizzes));
    return;
  }

  // Calculate progress percentage
  const progressPercentage = (completedQuizzes.length / topicOrder.length) * 100;

  // Reference to the user's progress data
  const userProgressRef = firebase.database()
    .ref(`userProgress/${userId}/modules/moduleName`);
  
  // Update the RTDB data
  userProgressRef.update({
    completedQuizzes: completedQuizzes,
    lastUpdated: firebase.database.ServerValue.TIMESTAMP,
    progressPercentage: progressPercentage
  })
  .then(() => {
    console.log("Progress saved to Firebase");
    
    // Also update localStorage as backup
    localStorage.setItem("moduleCompletedQuizzes", 
      JSON.stringify(completedQuizzes));
    
    // Update overall progress in profile
    updateOverallProgress(userId);
  })
  .catch((error) => {
    console.error("Error saving progress:", error);
    // Save to localStorage as backup
    localStorage.setItem("moduleCompletedQuizzes", 
      JSON.stringify(completedQuizzes));
  });
}
```

### 5. Updating Overall Progress

Update the user's overall progress across all modules:

```javascript
function updateOverallProgress(userId) {
  if (!firebase.database || !userId) return;

  // Get current module data
  const currentModuleData = {
    completedQuizzes: completedQuizzes,
    progressPercentage: (completedQuizzes.length / topicOrder.length) * 100
  };

  // Reference to the user's overall progress data
  const userOverallRef = firebase.database().ref(`userProgress/${userId}`);

  // Get existing data to calculate overall stats
  userOverallRef.once('value')
    .then((snapshot) => {
      const data = snapshot.val() || {};
      const modules = data.modules || {};
      
      // Update our module data
      modules.moduleName = currentModuleData;
      
      // Calculate total modules and completed modules
      const modulesStats = {
        total: 4, // Adjust based on your total modules
        completed: 0,
        topics: 0,
        totalTimeMinutes: 0
      };
      
      // Check each module's progress
      if (modules.moduleName && modules.moduleName.completedQuizzes) {
        const moduleProgress = modules.moduleName.completedQuizzes.length;
        if (moduleProgress === topicOrder.length) {
          modulesStats.completed++;
        }
        modulesStats.topics += moduleProgress;
        modulesStats.totalTimeMinutes += moduleProgress * 15; // Estimate 15 min per topic
      }
      
      // Update overall progress
      userOverallRef.update({
        modules: modules,
        completedModules: modulesStats.completed,
        totalModules: modulesStats.total,
        completedTopics: modulesStats.topics,
        totalTimeMinutes: modulesStats.totalTimeMinutes,
        completionPercentage: (modulesStats.completed / modulesStats.total) * 100,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
      });
    })
    .catch(error => console.error("Error updating overall progress:", error));
}
```

### 6. Checking Topic Accessibility

Determine if a topic should be accessible based on previous completions:

```javascript
function isTopicAccessible(topicId) {
  const topicIndex = topicOrder.indexOf(topicId);

  // First topic is always accessible
  if (topicIndex === 0) return true;

  // For any other topic, the previous topic must be completed
  const previousTopicId = topicOrder[topicIndex - 1];
  return completedQuizzes.includes(previousTopicId);
}
```

### 7. Updating Topic Accessibility in UI

Update the UI to reflect which topics are accessible:

```javascript
function updateTopicAccessibility() {
  topicOrder.forEach((topicId, index) => {
    const topicCard = document.querySelector(
      `.target-card[data-target="${topicId}"]`
    );
    if (!topicCard) return;

    const isAccessible = isTopicAccessible(topicId);

    // Update progress tracker nodes
    const progressNode = document.querySelector(
      `.progress-node[data-topic="${topicId}"]`
    );
    if (progressNode) {
      progressNode.classList.remove("active", "completed", "locked");

      const baseTooltip = progressNode.getAttribute("data-tooltip").split(" - ")[0];

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
            ? topicOrder[index - 1]
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
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

    // Add/remove lock overlay
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
        const prevTopicName =
          index > 0
            ? topicOrder[index - 1]
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
            : "";
        lockMessage.textContent = `Complete "${prevTopicName}" to unlock`;
        lockOverlay.appendChild(lockMessage);

        topicCard.appendChild(lockOverlay);

        // Disable all interactive elements in locked topics
        topicCard
          .querySelectorAll(
            ".practical-exercise, .topic-quiz .option, .topic-quiz-btn"
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
          ".practical-exercise, .topic-quiz .option, .topic-quiz-btn"
        )
        .forEach((element) => {
          element.style.pointerEvents = "auto";
        });
    }
  });
}
```

### 8. Updating Progress Bar

Update the progress bar to display completion percentage:

```javascript
function updateProgress() {
  const totalTopics = topicOrder.length;
  const progressBar = document.getElementById("module-progress");

  if (progressBar) {
    const progressPercentage = (completedQuizzes.length / totalTopics) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    
    // Force a style recalculation
    void progressBar.offsetWidth;
    
    // Set it again to ensure it's applied
    setTimeout(() => {
      progressBar.style.width = `${progressPercentage}%`;
    }, 50);
  }
}
```

### 9. Quiz Button Event Handler

Handle quiz completion:

```javascript
// Add event listeners for quiz buttons
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
          
          // Save progress to Firebase if user is logged in
          let userId = null;
          
          // First try to get UID from Firebase auth
          if (firebase && firebase.auth && firebase.auth().currentUser) {
            userId = firebase.auth().currentUser.uid;
          }
          // Fallback to localStorage if Firebase auth is not available
          else {
            const localUser = JSON.parse(localStorage.getItem("currentUser"));
            if (localUser && localUser.uid) {
              userId = localUser.uid;
            }
          }
          
          if (userId) {
            saveUserProgress(userId, targetId);
          } else {
            localStorage.setItem("moduleCompletedQuizzes", 
              JSON.stringify(completedQuizzes));
          }

          // Update accessibility for next topics
          updateTopicAccessibility();
          // Update the progress bar
          updateProgress();

          // Check for module completion celebration
          if (completedQuizzes.length === topicOrder.length) {
            setTimeout(() => {
              showCelebration();
            }, 1000);
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
```

## Data Structure in Firebase

The progress data in Firebase Realtime Database follows this structure:

```
userProgress/
└── [userId]/
    ├── completedModules: 2
    ├── totalModules: 4
    ├── completedTopics: 7
    ├── completionPercentage: 50
    ├── totalTimeMinutes: 105
    ├── lastUpdated: timestamp
    └── modules/
        ├── introCybersec/
        │   ├── completedQuizzes: ["topic1", "topic2", "topic3"]
        │   ├── progressPercentage: 60
        │   └── lastUpdated: timestamp
        ├── attackTargets/
        │   ├── completedQuizzes: ["topic1", "topic2"]
        │   ├── progressPercentage: 40
        │   └── lastUpdated: timestamp
        ├── phishingAttacks/
        │   ├── completedQuizzes: ["topic1", "topic2"]
        │   ├── progressPercentage: 50
        │   └── lastUpdated: timestamp
        └── malwareInfections/
            ├── completedQuizzes: []
            ├── progressPercentage: 0
            └── lastUpdated: timestamp
```

## Implementation Checklist

When implementing progress tracking in a new module:

1. ✅ Define the `topicOrder` array
2. ✅ Initialize `completedQuizzes` array
3. ✅ Implement Firebase authentication detection
4. ✅ Create `loadUserProgress()` function
5. ✅ Create `saveUserProgress()` function
6. ✅ Implement `updateProgress()` to update the UI
7. ✅ Add `isTopicAccessible()` to control topic unlocking
8. ✅ Handle quiz button events to track completions
9. ✅ Add `updateTopicAccessibility()` for UI state management
10. ✅ Update progress nodes and connect with progress lines
11. ✅ Implement `refreshProgressIndicators()` to force UI updates
12. ✅ Add error handling and localStorage fallbacks

## Best Practices

1. **Always save to both Firebase and localStorage** - This provides a fallback if Firebase is unavailable.
2. **Use the Firebase uid when available** - Get the user ID from Firebase Auth first, then fall back to localStorage.
3. **Force UI repaints** - Use techniques like `void element.offsetWidth` to ensure progress bars and indicators update.
4. **Update progress percentage in Firebase** - This helps the learn.js page display correct progress without recalculating.
5. **Handle authentication state changes** - Set up listeners for Firebase authentication state to update UI accordingly.
6. **Keep topic order consistent** - The topic order array is used for both unlocking logic and progress calculation.

By following this implementation guide, you can maintain consistent progress tracking across all modules. 