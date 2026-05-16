document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select options before repopulating
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants section as a bulleted list
        const participants = details.participants || [];
        let participantsHtml = '<div class="participants"><strong>Participants:</strong>';
        if (participants.length === 0) {
          participantsHtml += '<ul class="participants-list"><li class="no-participants">No participants yet</li></ul>';
        } else {
          participantsHtml += '<ul class="participants-list">';
          participants.forEach(p => {
            const safeEmail = encodeURIComponent(p);
            participantsHtml += `<li><span class="participant-name">${p}</span> <button class="participant-delete" aria-label="Remove ${p}" data-activity="${name}" data-email="${p}">✖</button></li>`;
          });
          participantsHtml += '</ul>';
        }
        participantsHtml += '</div>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHtml}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the new participant appears immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();

  // Delegate click handler for participant delete buttons
  activitiesList.addEventListener('click', async (event) => {
    const btn = event.target.closest('.participant-delete');
    if (!btn) return;

    const li = btn.closest('li');
    const activityName = btn.dataset.activity;
    const email = btn.dataset.email;

    try {
      const resp = await fetch(`/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });

      if (resp.ok) {
        // Refresh activities to reflect change
        fetchActivities();
      } else {
        const err = await resp.json();
        messageDiv.textContent = err.detail || 'Failed to remove participant';
        messageDiv.className = 'error';
        messageDiv.classList.remove('hidden');
        setTimeout(() => messageDiv.classList.add('hidden'), 5000);
      }
    } catch (e) {
      console.error('Error removing participant:', e);
    }
  });
});
