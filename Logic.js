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

      function checkStatus()
      {
          const startVal = startDateInput.value;

          if (!startVal) {
          showMessage("bad", "❌ Please select a start date.");
          resetOutputs();
          return;
        }

        const startDate = stripTime(parseDateInput(startVal));
        const planValue = planInput.value;

        const graceDays = safeInt(graceDaysInput.value , 0);
        const soonDays = safeInt(soonDaysInput.value , 7);

        const inclusiveEnd = inclusiveEndInput.checked;
        const fixedDaysMode = fixedDaysModeInput.checked;

        const today = new Date();
        const result = getSubscriptionStatus({
          startDate,
          planValue,
          fixedDaysMode,
          inclusiveEnd,
          graceDays,
          soonThresholdDays: soonDays,
          today,
        });

                outEnd.textContent = formatDate(result.endDate);
                outDaysLeft.textContent = result.daysLeft.toLocaleString();
        outGraceEnd.textContent = result.graceEnd
          ? formatDate(result.graceEnd)
          : "—";
        outFinalValid.textContent = formatDate(result.finalValidUntil);

         if (result.status === "ACTIVE") {
          setBadge("good", "Status: ACTIVE ✅");
          showMessage("good", "✅ Subscription is active.");
        } else if (result.status === "EXPIRING_SOON") {
          setBadge("warn", "Status: EXPIRING SOON ⚠️");
          showMessage(
            "warn",
            `⚠️ Subscription will expire soon (≤ ${soonDays} days left).`
          );
        } else if (result.status === "IN_GRACE") {
          setBadge("warn", "Status: IN GRACE 🕒");
          showMessage(
            "warn",
            "🕒 Subscription expired, but user is still within grace period."
          );
        } else {
          setBadge("bad", "Status: EXPIRED ❌");
          showMessage("bad", "❌ Subscription is expired.");
        }

        const planLabel = planInput.options[planInput.selectedIndex].text;
        const modeLabel = fixedDaysMode ? "Fixed-days" : "Calendar-based";
        const endRule = inclusiveEnd
          ? "Inclusive end date"
          : "Exclusive end date";

           detailsLine.textContent =
          `Details: Plan = ${planLabel} | Mode = ${modeLabel} | ` +
          `${endRule} | Grace = ${graceDays} day(s) | Soon threshold = ${soonDays} day(s)`;

        setStatus("Checked ✅");
      } 

      todayChip.textContent = `Today: ${formatDate(new Date())}`;
      btnCheck.addEventListener("click", checkStatus);

      btnDemo.addEventListener("click" , () => {
          const t = new Date();
          t.setDate(t.getDate() - 20);

          const yyyy = t.getFullYear();
        const mm = String(t.getMonth() + 1).padStart(2, "0");
        const dd = String(t.getDate()).padStart(2, "0");
        startDateInput.value = `${yyyy}-${mm}-${dd}`;

        planInput.value = "30"; // monthly
        graceDaysInput.value = "5";
        soonDaysInput.value = "7";
        inclusiveEndInput.checked = true;
        fixedDaysModeInput.checked = true;
        setStatus("Ready…");
        showMessage("neutral", "📌 Demo values set. Click “Check Status”.");

      })

      btnClear.addEventListener("click", () => {
        startDateInput.value = "";
        planInput.value = "30";
        graceDaysInput.value = "0";
        soonDaysInput.value = "7";
        inclusiveEndInput.checked = true;
        fixedDaysModeInput.checked = true;

        resetOutputs();
        showMessage(
          "neutral",
          "Tip: Choose a start date, plan, then click “Check Status”."
        );
      });

       [
        startDateInput,
        planInput,
        graceDaysInput,
        soonDaysInput,
        inclusiveEndInput,
        fixedDaysModeInput,
      ].forEach((el)=> {
el.addEventListener("change" , () => {
setStatus("Ready...");
          })
      });

      resetOutputs();