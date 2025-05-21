document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase auth state listener
  function initAuth() {
    if (firebase && firebase.auth) {
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          // User is logged in, load their data
          loadUserData(user);
        } else {
          // No user is signed in, redirect to login
          window.location.href = "login.html";
        }
      });
    } else {
      // For testing purposes when Firebase is not available
      console.log("Firebase not available, using mock data");
      loadMockData();
    }
  }

  // For testing purposes when Firebase is not available
  function loadMockData() {
    // Simulate loading user data
    document.getElementById("username").textContent = "CyberExplorer";
    document.getElementById("join-date").textContent = "May 2023";
    document.getElementById("modules-completed").textContent = "12";
    document.getElementById("badges-earned").textContent = "8";

    // Add active class to show first panel (overview) by default
    document.getElementById("overview-panel").classList.add("active");
  }

  // Load user data from Realtime Database
  function loadUserData(user) {
    const userId = user.uid;
    const userRef = firebase.database().ref(`users/${userId}`);

    userRef.once('value')
      .then((snapshot) => {
        const userData = snapshot.val();
        
        if (userData) {
          updateProfileUI(userData);
          loadUserBadges(userData.badges || []);
          loadUserCertifications(userData.certifications || []);
          
          // Update form values with user data
          if (displayNameInput) displayNameInput.value = userData.displayName || '';
          if (bioInput) bioInput.value = userData.bio || '';
          if (jobTitleInput) jobTitleInput.value = userData.jobTitle || '';
          if (companyInput) companyInput.value = userData.company || '';
          if (locationInput) locationInput.value = userData.location || '';
          if (websiteInput) websiteInput.value = userData.website || '';
          if (githubInput) githubInput.value = userData.github || '';
          if (linkedinInput) linkedinInput.value = userData.linkedin || '';
          if (twitterInput) twitterInput.value = userData.twitter || '';
        } else {
          console.log("No user data found. Creating default profile.");
          createDefaultUserProfile(userId);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }

  // Create a default user profile
  function createDefaultUserProfile(userId) {
    // Get basic info from auth if available
    const currentUser = firebase.auth().currentUser;
    let displayName = '';
    let email = '';
    let photoURL = '';
    
    if (currentUser) {
      displayName = currentUser.displayName || '';
      email = currentUser.email || '';
      photoURL = currentUser.photoURL || '';
    }
    
    // Create default profile data
    const defaultUserData = {
      displayName: displayName,
      email: email,
      photoURL: photoURL,
      bio: '',
      jobTitle: '',
      company: '',
      location: '',
      website: '',
      github: '',
      linkedin: '',
      twitter: '',
      badges: [],
      certifications: [],
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      lastUpdated: firebase.database.ServerValue.TIMESTAMP,
      settings: {
        emailNotifications: true,
        progressReminders: true,
        achievementNotifications: true,
        newContentAlerts: true
      }
    };
    
    // Save to Realtime Database
    firebase.database().ref(`users/${userId}`).set(defaultUserData)
      .then(() => {
        console.log("Default user profile created");
        updateProfileUI(defaultUserData);
      })
      .catch((error) => {
        console.error("Error creating default user profile:", error);
      });
  }

  // Update user profile
  function updateUserProfile(userId, updatedData) {
    // Reference to the user data
    const userRef = firebase.database().ref(`users/${userId}`);
    
    // Add timestamp
    updatedData.lastUpdated = firebase.database.ServerValue.TIMESTAMP;
    
    // Update only the specified fields
    userRef.update(updatedData)
      .then(() => {
        showNotification("Profile updated successfully!", "success");
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        showNotification("Error updating profile. Please try again.", "error");
      });
  }

  // Helper function to format dates
  function formatDate(timestamp) {
    if (!timestamp) return "New Member";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const options = { year: "numeric", month: "long" };
    return date.toLocaleDateString("en-US", options);
  }

  // Calculate user rank based on XP
  function calculateRank(xp) {
    if (xp >= 5000) return "Expert";
    if (xp >= 3000) return "Advanced";
    if (xp >= 1000) return "Intermediate";
    return "Beginner";
  }

  // Load modules progress from Realtime Database
  function loadModulesProgress(userId) {
    // Implement this to fetch progress data from Realtime Database
    // For now, we're using the static data in the HTML
  }

  // Load badges from Realtime Database
  function loadBadges(userId) {
    // Implement this to fetch badges data from Realtime Database
    // For now, we're using the static data in the HTML
  }

  // Tab navigation for profile sections
  const navItems = document.querySelectorAll(".settings-navigation li");
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all navigation items
      navItems.forEach((navItem) => navItem.classList.remove("active"));
      // Add active class to clicked item
      this.classList.add("active");

      // Get the panel to show
      const panelId = this.getAttribute("data-panel") + "-panel";

      // Hide all panels
      document.querySelectorAll(".profile-panel").forEach((panel) => {
        panel.classList.remove("active");
      });

      // Show the selected panel
      document.getElementById(panelId).classList.add("active");
    });
  });

  // Edit profile button
  const editProfileBtn = document.getElementById("edit-profile-btn");
  const editProfileModal = document.getElementById("edit-profile-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const cancelEditBtn = document.getElementById("cancel-edit");
  const saveProfileBtn = document.getElementById("save-profile");

  // Open modal
  editProfileBtn.addEventListener("click", function () {
    // Populate modal fields with current values
    document.getElementById("modal-display-name").value =
      document.getElementById("username").textContent;
    document.getElementById("modal-bio").value =
      document.getElementById("bio").value;

    // Show the modal
    editProfileModal.classList.add("active");
  });

  // Close modal functions
  function closeModal() {
    editProfileModal.classList.remove("active");
  }

  closeModalBtn.addEventListener("click", closeModal);
  cancelEditBtn.addEventListener("click", closeModal);

  // Close modal if clicking outside content
  editProfileModal.addEventListener("click", function (e) {
    if (e.target === editProfileModal) {
      closeModal();
    }
  });

  // Avatar selection
  const avatarOptions = document.querySelectorAll(".avatar-option");
  avatarOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove selected class from all options
      avatarOptions.forEach((opt) => opt.classList.remove("selected"));
      // Add selected class to clicked option
      this.classList.add("selected");
    });
  });

  // Save profile changes
  saveProfileBtn.addEventListener("click", function () {
    const newUsername = document.getElementById("modal-display-name").value;
    const newBio = document.getElementById("modal-bio").value;
    const selectedAvatar = document.querySelector(
      ".avatar-option.selected i"
    ).className;

    // Update UI immediately
    document.getElementById("username").textContent = newUsername;
    document.getElementById("bio").value = newBio;
    document.querySelector(".user-avatar i").className = selectedAvatar;

    // Save to Realtime Database if available
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      const userId = firebase.auth().currentUser.uid;
      updateUserProfile(userId, {
        displayName: newUsername,
        bio: newBio,
        avatarClass: selectedAvatar,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP,
      });
    } else {
      // For testing when Firebase is not available
      console.log("Changes would be saved to Realtime Database (mock)");
      showNotification("Profile updated successfully", "success");
    }

    // Close the modal
    closeModal();
  });

  // Form submission handlers
  const profileForm = document.getElementById("profile-form");
  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const displayName = document.getElementById("display-name").value;
    const email = document.getElementById("email").value;
    const bio = document.getElementById("bio").value;

    // Save to Realtime Database if available
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      const userId = firebase.auth().currentUser.uid;
      updateUserProfile(userId, {
        displayName: displayName,
        email: email,
        bio: bio,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP,
      });

      // Update auth profile if display name changed
      if (displayName !== firebase.auth().currentUser.displayName) {
        firebase
          .auth()
          .currentUser.updateProfile({
            displayName: displayName,
          })
          .then(() => {
            console.log("Auth profile updated");
          })
          .catch((error) => {
            console.error("Error updating auth profile:", error);
          });
      }

      // Update email if changed
      if (email !== firebase.auth().currentUser.email) {
        firebase
          .auth()
          .currentUser.updateEmail(email)
          .then(() => {
            console.log("Email updated");
          })
          .catch((error) => {
            console.error("Error updating email:", error);
            showNotification(
              "Error updating email. Please verify your credentials.",
              "error"
            );
          });
      }
    } else {
      // For testing when Firebase is not available
      console.log("Changes would be saved to Realtime Database (mock)");
      document.getElementById("username").textContent = displayName;
      showNotification("Profile updated successfully", "success");
    }
  });

  // Password form
  const passwordForm = document.getElementById("password-form");
  passwordForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      showNotification("New passwords do not match", "error");
      return;
    }

    // Update password in Realtime Database if available
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      const user = firebase.auth().currentUser;
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      // Reauthenticate user and then update password
      user
        .reauthenticateWithCredential(credential)
        .then(() => {
          return user.updatePassword(newPassword);
        })
        .then(() => {
          console.log("Password updated successfully");
          showNotification("Password updated successfully", "success");
          passwordForm.reset();
        })
        .catch((error) => {
          console.error("Error updating password:", error);
          showNotification(
            "Error updating password. Please check your current password.",
            "error"
          );
        });
    } else {
      // For testing when Firebase is not available
      console.log("Password would be updated in Realtime Database (mock)");
      showNotification("Password updated successfully", "success");
      passwordForm.reset();
    }
  });

  // Notification system
  function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to document
    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Danger zone - Reset progress
  const resetProgressBtn = document.querySelector(".danger-zone .btn-warning");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", function () {
      if (
        confirm(
          "Are you sure you want to reset all progress? This action cannot be undone."
        )
      ) {
        // Reset progress in Realtime Database if available
        if (firebase && firebase.auth && firebase.auth().currentUser) {
          const userId = firebase.auth().currentUser.uid;
          updateUserProfile(userId, {
            modulesCompleted: 0,
            badgesEarned: 0,
            progress: {},
            lastReset: firebase.database.ServerValue.TIMESTAMP,
          });
        } else {
          // For testing when Firebase is not available
          console.log("Progress would be reset in Realtime Database (mock)");
          showNotification("Progress has been reset", "warning");

          // Update UI to show reset
          document.getElementById("modules-completed").textContent = "0";
          document.getElementById("badges-earned").textContent = "0";

          // Reset progress bars
          document.querySelectorAll(".progress").forEach((progress) => {
            progress.style.width = "0%";
          });
        }
      }
    });
  }

  // Danger zone - Delete account
  const deleteAccountBtn = document.querySelector(".danger-zone .btn-danger");
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", function () {
      if (
        confirm(
          "Are you sure you want to delete your account? This action cannot be undone."
        )
      ) {
        if (
          confirm(
            "All your data will be permanently deleted. Are you absolutely sure?"
          )
        ) {
          // Delete account in Realtime Database if available
          if (firebase && firebase.auth && firebase.auth().currentUser) {
            const user = firebase.auth().currentUser;
            const userId = user.uid;

            // Delete user data from Firestore first
            firebase
              .firestore()
              .collection("users")
              .doc(userId)
              .delete()
              .then(() => {
                // Then delete the user account
                return user.delete();
              })
              .then(() => {
                console.log("Account deleted successfully");
                showNotification("Your account has been deleted", "error");
                // Redirect to home page
                setTimeout(() => {
                  window.location.href = "index.html";
                }, 2000);
              })
              .catch((error) => {
                console.error("Error deleting account:", error);
                showNotification(
                  "Error deleting account. You may need to reauthenticate.",
                  "error"
                );
              });
          } else {
            // For testing when Firebase is not available
            console.log("Account would be deleted in Firebase (mock)");
            showNotification("Your account has been deleted", "error");
            // Redirect to home page
            setTimeout(() => {
              window.location.href = "index.html";
            }, 2000);
          }
        }
      }
    });
  }

  // Initialize the page
  initAuth();
});
