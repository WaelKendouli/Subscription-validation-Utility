 const startDateInput = document.getElementById("startDate");
      const planInput = document.getElementById("plan");
      const graceDaysInput = document.getElementById("graceDays");
      const soonDaysInput = document.getElementById("soonDays");

      // Toggles
      const inclusiveEndInput = document.getElementById("inclusiveEnd");
      const fixedDaysModeInput = document.getElementById("fixedDaysMode");

      // Buttons
      const btnCheck = document.getElementById("btnCheck");
      const btnDemo = document.getElementById("btnDemo");
      const btnClear = document.getElementById("btnClear");

      // UI feedback
      const msgBox = document.getElementById("msgBox");
      const statusChip = document.getElementById("statusChip");
      const todayChip = document.getElementById("todayChip");
      const badge = document.getElementById("badge");

      // Outputs
      const outEnd = document.getElementById("outEnd");
      const outDaysLeft = document.getElementById("outDaysLeft");
      const outGraceEnd = document.getElementById("outGraceEnd");
      const outFinalValid = document.getElementById("outFinalValid");
      const detailsLine = document.getElementById("detailsLine");

      const msPerDay = 24 * 60 * 60 * 1000;

      function stripTime(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }

      function parseDateInput(value) {
        const [y, m, d] = value.split("-").map(Number);
        return new Date(y, m - 1, d);
      }

      function formatDate(date) {
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });
      }

       function showMessage(type, text) {
        msgBox.classList.remove("good", "warn", "bad");
        if (type === "good") msgBox.classList.add("good");
        if (type === "warn") msgBox.classList.add("warn");
        if (type === "bad") msgBox.classList.add("bad");
        msgBox.textContent = text;
      }

       function setStatus(text) {
        statusChip.textContent = text;
      }

      function setBadge(type, text) {
        badge.classList.remove("good", "warn", "bad");
        if (type === "good") badge.classList.add("good");
        if (type === "warn") badge.classList.add("warn");
        if (type === "bad") badge.classList.add("bad");
        badge.textContent = text;
      }

       function resetOutputs() {
        outEnd.textContent = "—";
        outDaysLeft.textContent = "—";
        outGraceEnd.textContent = "—";
        outFinalValid.textContent = "—";
        detailsLine.textContent = "Details: —";
        setBadge("neutral", "Status: —");
        setStatus("Waiting…");
      }

      function safeInt(value , fallback = 0)
      {
          const n = Number(value);
          return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
      }

      