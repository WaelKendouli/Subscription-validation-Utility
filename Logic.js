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

      function addDays(start , days)
      {
          const Current = new Date(start);
          Current.setDate(Current.getDate() + days);
      }

      function addCalendarMonths(start , months)
      {
          const Current = new Date(start);
          Current.setMonth(Current.getMonth() + months);
      }

      function addCalendarYears(start , years)
      {
          const Current = new Date(start);
          Current.setFullYear(Current.getFullYear() + years);
      }

      function computeEndDate(start , planValue , fixedDaysMode)
      {
          const planDays = Number(planValue);

          if (fixedDaysMode) {
          return addDays(start, planDays);
        }
        if (planDays === 7) return addDays(start , 7);
        if (planDays === 30) return addCalendarMonths(start,1);
        if (planDays=== 90) return addCalendarMonths(start, 3);
        if (planDays === 365) return addCalendarYears(start , 1); 

        return addDays(start , planDays);
      }

      function getSubscriptionStatus({
        startDate,
        planValue,
        fixedDaysMode,
        inclusiveEnd,
        graceDays,
        soonThresholdDays,
        today,
      })
      {
          const EndDate = stripTime(computeEndDate(startDate,planValue,fixedDaysMode));

        const effectiveEnd = inclusiveEnd ? endDate : addDays(endDate, -1);
        const graceEnd = stripTime(addDays(effectiveEnd, graceDays));
        const t = stripTime(today);
          const daysLeft = Math.floor((effectiveEnd - t) / msPerDay);

          const isActive = t <= effectiveEnd;
        const inGrace = !isActive && graceDays > 0 && t <= graceEnd;

        let status = "EXPIRED";
        let uiType = "bad";

        if (isActive) {
          if (daysLeft <= soonThresholdDays) {
            status = "EXPIRING_SOON";
            uiType = "warn";
          } else {
            status = "ACTIVE";
            uiType = "good";
          }
        } else if (inGrace) {
          status = "IN_GRACE";
          uiType = "warn";
        }
        const finalValidUntil = graceDays > 0 ? graceEnd : effectiveEnd;

        return {
          status,
          uiType,
          endDate,
          effectiveEnd,
          graceEnd: graceDays > 0 ? graceEnd : null,
          finalValidUntil,
          daysLeft,
        };
      }