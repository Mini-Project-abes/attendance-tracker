class AttendanceTracker {
  constructor() {
    this.currentDate = new Date();
    this.attendanceData = this.loadAttendanceData();
    this.userName = this.loadUserName();
    this.currentTheme = this.loadTheme();

    this.attendanceStates = [
      "none",
      "absent",
      "forenoon-present",
      "afternoon-present",
      "full-present",
    ];

    this.classCounts = {
      "full-present": 7,class AttendanceTracker {
  constructor() {
    this.currentDate = new Date();
    this.attendanceData = this.loadAttendanceData();
    this.userName = this.loadUserName();
    this.currentTheme = this.loadTheme();
    this.target = this.loadTarget();

    this.attendanceStates = [
      "none",
      "absent",
      "forenoon-present",
      "afternoon-present",
      "full-present",
    ];

    this.classCounts = {
      "full-present": 8,
      "forenoon-present": 4,
      "afternoon-present": 4,
      absent: 0,
    };

    this.monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    this.initializeEventListeners();
    this.applyTheme();
    this.updateTargetUI();
    this.renderSixMonths();
    this.updateStats();
    this.updateUserName();
  }

  initializeEventListeners() {
    document.getElementById("prevMonth").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderSixMonths();
      this.updateStats();
    });

    document.getElementById("nextMonth").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderSixMonths();
      this.updateStats();
    });

    document
      .getElementById("profileChip")
      .addEventListener("click", () => this.editUserName());

    document
      .getElementById("exportBtn")
      .addEventListener("click", () => this.exportData());
    document
      .getElementById("importFile")
      .addEventListener("change", (e) => this.importData(e));
    document
      .getElementById("settingsBtn")
      .addEventListener("click", () => this.openSettings());
    document
      .getElementById("clearBtn")
      .addEventListener("click", () => this.openClearModal());

    document
      .getElementById("closeSettings")
      .addEventListener("click", () => this.closeSettings());
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.changeTheme(e.target.closest(".theme-btn").dataset.theme)
      );
    });

    document.getElementById("settingsModal").addEventListener("click", (e) => {
      if (e.target.id === "settingsModal") this.closeSettings();
    });

    // Clear modal
    document
      .getElementById("closeClear")
      .addEventListener("click", () => this.closeClearModal());
    document.getElementById("clearModal").addEventListener("click", (e) => {
      if (e.target.id === "clearModal") this.closeClearModal();
    });
    document
      .getElementById("clearRangeBtn")
      .addEventListener("click", () => this.clearCurrentRange());
    document
      .getElementById("clearAllBtn")
      .addEventListener("click", () => this.clearAllData());

    // Target slider
    const targetSlider = document.getElementById("targetSlider");
    if (targetSlider) {
      targetSlider.addEventListener("input", (e) => {
        this.target = parseInt(e.target.value, 10);
        this.saveTarget();
        this.updateTargetUI();
        this.updateStats();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderSixMonths();
        this.updateStats();
      } else if (e.key === "ArrowRight") {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderSixMonths();
        this.updateStats();
      } else if (e.key === "Escape") {
        this.closeSettings();
        this.closeClearModal();
      }
    });
  }

  // User name
  loadUserName() {
    return localStorage.getItem("userName") || "Student Name";
  }

  saveUserName() {
    localStorage.setItem("userName", this.userName);
  }

  updateUserName() {
    const el = document.getElementById("userName");
    if (el) el.textContent = this.userName;
  }

  editUserName() {
    const newName = prompt("Enter your name:", this.userName);
    if (newName && newName.trim()) {
      this.userName = newName.trim();
      this.saveUserName();
      this.updateUserName();
      this.showNotification("Name updated successfully!", "success");
    }
  }

  // Theme
  loadTheme() {
    return localStorage.getItem("theme") || "dark";
  }

  saveTheme() {
    localStorage.setItem("theme", this.currentTheme);
  }

  applyTheme() {
    document.body.setAttribute("data-theme", this.currentTheme);
    this.updateThemeButtons();
  }

  updateThemeButtons() {
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.theme === this.currentTheme) {
        btn.classList.add("active");
      }
    });
  }

  changeTheme(theme) {
    this.currentTheme = theme;
    this.saveTheme();
    this.applyTheme();
    this.showNotification(`Theme changed to ${theme}!`, "success");
  }

  openSettings() {
    const modal = document.getElementById("settingsModal");
    if (modal) modal.style.display = "block";
  }

  closeSettings() {
    const modal = document.getElementById("settingsModal");
    if (modal) modal.style.display = "none";
  }

  // Target attendance
  loadTarget() {
    const saved = localStorage.getItem("targetAttendance");
    const value = saved ? parseInt(saved, 10) : 75;
    return Number.isNaN(value) ? 75 : value;
  }

  saveTarget() {
    localStorage.setItem("targetAttendance", String(this.target));
  }

  updateTargetUI() {
    const targetValue = document.getElementById("targetValue");
    const targetSlider = document.getElementById("targetSlider");
    if (targetValue) targetValue.textContent = `${this.target}%`;
    if (targetSlider) targetSlider.value = this.target;
  }

  // Attendance data
  getAttendanceState(date) {
    const dateKey = this.formatDateKey(date);
    return this.attendanceData[dateKey] || "none";
  }

  setAttendanceState(date, state) {
    const dateKey = this.formatDateKey(date);
    this.attendanceData[dateKey] = state;
    this.saveAttendanceData();
  }

  cycleAttendanceState(date) {
    const currentState = this.getAttendanceState(date);
    const currentIndex = this.attendanceStates.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % this.attendanceStates.length;
    const nextState = this.attendanceStates[nextIndex];
    this.setAttendanceState(date, nextState);
  }

  formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  }

  saveAttendanceData() {
    localStorage.setItem("attendanceData", JSON.stringify(this.attendanceData));
  }

  loadAttendanceData() {
    const saved = localStorage.getItem("attendanceData");
    return saved ? JSON.parse(saved) : {};
  }

  // Rendering
  renderSixMonths() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const startMonth = month;
    const endMonth = (month + 5) % 12;
    const endYear = month + 5 >= 12 ? year + 1 : year;

    const startMonthName = this.monthNames[startMonth];
    const endMonthName = this.monthNames[endMonth];

    const currentMonthEl = document.getElementById("currentMonth");
    if (currentMonthEl) {
      currentMonthEl.textContent = `${startMonthName} - ${endMonthName} ${endYear}`;
    }

    const sixMonthsGrid = document.getElementById("sixMonthsGrid");
    if (!sixMonthsGrid) return;
    sixMonthsGrid.innerHTML = "";

    for (let i = 0; i < 6; i++) {
      const currentMonth = (month + i) % 12;
      const currentYear = month + i >= 12 ? year + 1 : year;
      this.renderMonth(currentMonth, currentYear, i === 0);
    }
  }

  renderMonth(month, year, isFirst) {
    const sixMonthsGrid = document.getElementById("sixMonthsGrid");
    if (!sixMonthsGrid) return;

    const monthContainer = document.createElement("div");
    monthContainer.className = "month-calendar";
    if (
      year === this.currentDate.getFullYear() &&
      month === this.currentDate.getMonth()
    ) {
      monthContainer.classList.add("current-range-month");
    }

    const monthTitle = document.createElement("div");
    monthTitle.className = "month-title";
    monthTitle.textContent = `${this.monthNames[month]} ${year}`;
    monthContainer.appendChild(monthTitle);

    const calendarHeader = document.createElement("div");
    calendarHeader.className = "calendar-header";
    calendarHeader.innerHTML =
      "<div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>";
    monthContainer.appendChild(calendarHeader);

    const calendarGrid = document.createElement("div");
    calendarGrid.className = "calendar-grid";

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const lastDayPrevMonth = new Date(year, month, 0);
    const daysInPrevMonth = lastDayPrevMonth.getDate();

    // Previous month padding
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      this.createCalendarDay(date, day, true, calendarGrid);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.createCalendarDay(date, day, false, calendarGrid);
    }

    // Next month padding to fill 6 rows (42 cells)
    const cellsUsed = startingDayOfWeek + daysInMonth;
    const remainingDays = 42 - cellsUsed;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.createCalendarDay(date, day, true, calendarGrid);
    }

    monthContainer.appendChild(calendarGrid);
    sixMonthsGrid.appendChild(monthContainer);
  }

  createCalendarDay(date, day, isOtherMonth, calendarGrid) {
    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    dayElement.textContent = day;

    if (isOtherMonth) {
      dayElement.classList.add("other-month");
    } else {
      const attendanceState = this.getAttendanceState(date);
      if (attendanceState !== "none") {
        dayElement.classList.add(attendanceState);
        dayElement.setAttribute(
          "data-classes",
          this.classCounts[attendanceState]
        );
      } else {
        dayElement.setAttribute("data-classes", "");
      }

      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        dayElement.classList.add("today");
      }

      dayElement.addEventListener("click", (e) => {
        e.preventDefault();
        this.cycleAttendanceState(date);
        this.renderSixMonths();
        this.updateStats();
      });
    }

    calendarGrid.appendChild(dayElement);
  }

  // Stats and advanced features
  updateStats() {
    let totalDays = 0;
    let totalClassesAttended = 0;
    let absentDays = 0;
    let presentDays = 0;
    let totalPossibleClasses = 0;

    const dataValues = Object.values(this.attendanceData);

    dataValues.forEach((state) => {
      if (state !== "none") {
        totalDays++;
        totalPossibleClasses += 8;
        const classCount = this.classCounts[state];
        totalClassesAttended += classCount;

        if (state === "absent") {
          absentDays++;
        } else {
          presentDays++;
        }
      }
    });

    const absentClasses = totalPossibleClasses - totalClassesAttended;
    const attendancePercentage =
      totalPossibleClasses > 0
        ? Math.round((totalClassesAttended / totalPossibleClasses) * 100)
        : 0;

    const totalDaysEl = document.getElementById("totalDays");
    const presentDaysEl = document.getElementById("presentDays");
    const absentDaysEl = document.getElementById("absentDays");
    const attendancePercentageEl = document.getElementById(
      "attendancePercentage"
    );

    if (totalDaysEl)
      totalDaysEl.textContent = `${totalDays} (${totalPossibleClasses})`;
    if (presentDaysEl)
      presentDaysEl.textContent = `${presentDays} (${totalClassesAttended})`;
    if (absentDaysEl)
      absentDaysEl.textContent = `${absentDays} (${absentClasses})`;
    if (attendancePercentageEl)
      attendancePercentageEl.textContent = `${attendancePercentage}%`;

    this.updateAttendanceGradient(attendancePercentage);
    this.updateEmptyState();
    this.updateTargetDerivedStats(
      totalClassesAttended,
      totalPossibleClasses,
      attendancePercentage
    );
    this.updateStreaks();
  }

  updateAttendanceGradient(percentage) {
    const attendanceElement = document.querySelector(
      ".attendance-percentage-stat"
    );
    if (!attendanceElement) return;

    let color;
    if (percentage <= 33) {
      const intensity = Math.max(0, Math.min(1, percentage / 33));
      const hue = intensity * 25;
      color = `hsl(${hue}, 100%, ${50 + intensity * 10}%)`;
    } else if (percentage <= 66) {
      const intensity = Math.max(0, Math.min(1, (percentage - 33) / 33));
      const hue = 25 + intensity * 35;
      color = `hsl(${hue}, 100%, ${60 + intensity * 5}%)`;
    } else {
      const intensity = Math.max(0, Math.min(1, (percentage - 66) / 34));
      const hue = 60 + intensity * 60;
      const saturation = 100 - intensity * 30;
      const lightness = 65 - intensity * 20;
      color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    attendanceElement.style.setProperty("border-color", color, "important");
    attendanceElement.style.setProperty("border-width", "2px", "important");
  }

  updateEmptyState() {
    const emptyStateEl = document.getElementById("emptyState");
    if (!emptyStateEl) return;
    const hasData = Object.values(this.attendanceData).some(
      (state) => state !== "none"
    );
    emptyStateEl.style.display = hasData ? "none" : "block";
  }

  updateTargetDerivedStats(
    totalClassesAttended,
    totalPossibleClasses,
    attendancePercentage
  ) {
    const classesNeededEl = document.getElementById("classesNeeded");
    const safeDaysEl = document.getElementById("safeDays");
    const riskDateEl = document.getElementById("riskDate");

    if (!classesNeededEl || !safeDaysEl || !riskDateEl) return;

    const target = this.target;

    // Compute extra full-present days needed to reach target
    const fullDayClasses = this.classCounts["full-present"];
    let neededDays = 0;

    if (totalPossibleClasses === 0) {
      neededDays = 0;
    } else if (attendancePercentage >= target) {
      neededDays = 0;
    } else {
      // Solve inequality:
      // (totalClassesAttended + d * fullDayClasses) / (totalPossibleClasses + d * fullDayClasses) >= target/100
      const p = target / 100;
      const numerator = p * totalPossibleClasses - totalClassesAttended;
      const denominator = (1 - p) * fullDayClasses;
      if (denominator <= 0) {
        neededDays = 0;
      } else {
        neededDays = Math.ceil(numerator / denominator);
        if (neededDays < 0) neededDays = 0;
      }
    }

    classesNeededEl.textContent = neededDays;

    // Approx "safe days" if above target:
    let safeDays = 0;
    if (attendancePercentage > target && totalPossibleClasses > 0) {
      // try skipping days until hitting target
      const absentPerDay = fullDayClasses;
      let tempAttended = totalClassesAttended;
      let tempTotal = totalPossibleClasses;
      while (tempTotal > 0) {
        const perc = Math.round((tempAttended / tempTotal) * 100);
        if (perc <= target) break;
        tempTotal += fullDayClasses;
        // skip adds no attended classes
        safeDays++;
      }
    }

    safeDaysEl.textContent = safeDays;

    // Simple risk date: earliest date with non-"none" state (for now)
    const keys = Object.keys(this.attendanceData).filter(
      (k) => this.attendanceData[k] !== "none"
    );
    if (keys.length === 0) {
      riskDateEl.textContent = "–";
    } else {
      keys.sort();
      const first = keys[0];
      riskDateEl.textContent = first;
    }
  }

  updateStreaks() {
    const streakEl = document.getElementById("streakDays");
    if (!streakEl) return;

    const presentStates = new Set([
      "full-present",
      "forenoon-present",
      "afternoon-present",
    ]);

    const keys = Object.keys(this.attendanceData)
      .filter((k) => this.attendanceData[k] !== "none")
      .sort();

    if (keys.length === 0) {
      streakEl.textContent = "0 days";
      return;
    }

    const todayKey = this.formatDateKey(new Date());
    let currentStreak = 0;

    // Build a set of present days
    const presentSet = new Set(
      keys.filter((k) => presentStates.has(this.attendanceData[k]))
    );

    // Count streak backwards from today
    let cursor = new Date();
    while (true) {
      const key = this.formatDateKey(cursor);
      if (presentSet.has(key)) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    streakEl.textContent = `${currentStreak} day${currentStreak === 1 ? "" : "s"}`;
  }

  // Export / import
  exportData() {
    const data = {
      attendanceData: this.attendanceData,
      userName: this.userName,
      theme: this.currentTheme,
      target: this.target,
      exportDate: new Date().toISOString(),
      version: "1.1",
    };

    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    const dateString = now.toISOString().split("T")[0];

    const safeUserName = this.userName
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeUserName}-attendance-data-${dateString}-${timeString}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification("Data exported successfully!", "success");
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.attendanceData) {
          this.attendanceData = data.attendanceData;

          if (data.userName) {
            this.userName = data.userName;
            this.saveUserName();
            this.updateUserName();
          }

          if (data.theme) {
            this.currentTheme = data.theme;
            this.saveTheme();
            this.applyTheme();
          }

          if (typeof data.target === "number") {
            this.target = data.target;
            this.saveTarget();
            this.updateTargetUI();
          }

          this.saveAttendanceData();
          this.renderSixMonths();
          this.updateStats();
          this.showNotification("Data imported successfully!", "success");
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        this.showNotification(
          "Error importing data. Please check the file format.",
          "error"
        );
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  // Clear flow
  openClearModal() {
    const modal = document.getElementById("clearModal");
    if (modal) modal.style.display = "block";
  }

  closeClearModal() {
    const modal = document.getElementById("clearModal");
    if (modal) modal.style.display = "none";
  }

  clearCurrentRange() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 6, 0); // inclusive

    const keys = Object.keys(this.attendanceData);
    keys.forEach((key) => {
      const [y, m, d] = key.split("-").map((v) => parseInt(v, 10));
      const date = new Date(y, m - 1, d);
      if (date >= startDate && date <= endDate) {
        delete this.attendanceData[key];
      }
    });

    this.saveAttendanceData();
    this.renderSixMonths();
    this.updateStats();
    this.showNotification("Current 6 months cleared successfully!", "success");
    this.closeClearModal();
  }

  clearAllData() {
    this.attendanceData = {};
    this.saveAttendanceData();
    this.renderSixMonths();
    this.updateStats();
    this.showNotification("All data cleared successfully!", "success");
    this.closeClearModal();
  }

  // Notifications
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
    `;

    notification.setAttribute("role", "status");
    notification.setAttribute("aria-live", "polite");

    const colors = {
      success: "#48bb78",
      error: "#f56565",
      info: "#4299e1",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AttendanceTracker();
});

      "forenoon-present": 4,
      "afternoon-present": 3,
      absent: 0,
    };

    this.monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    this.initializeEventListeners();
    this.applyTheme();
    this.renderSixMonths();
    this.updateStats();
    this.updateUserName();
  }

  initializeEventListeners() {
    // Navigation
    document.getElementById("prevMonth").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderSixMonths();
    });

    document.getElementById("nextMonth").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderSixMonths();
    });

    // Profile
    document
      .getElementById("profileChip")
      .addEventListener("click", () => this.editUserName());

    // Data controls
    document
      .getElementById("exportBtn")
      .addEventListener("click", () => this.exportData());
    document
      .getElementById("importFile")
      .addEventListener("change", (e) => this.importData(e));
    document
      .getElementById("settingsBtn")
      .addEventListener("click", () => this.openSettings());
    document
      .getElementById("clearBtn")
      .addEventListener("click", () => this.clearAllData());

    // Settings modal
    document
      .getElementById("closeSettings")
      .addEventListener("click", () => this.closeSettings());
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.changeTheme(e.target.closest(".theme-btn").dataset.theme)
      );
    });

    document.getElementById("settingsModal").addEventListener("click", (e) => {
      if (e.target.id === "settingsModal") this.closeSettings();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderSixMonths();
      } else if (e.key === "ArrowRight") {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderSixMonths();
      } else if (e.key === "Escape") {
        this.closeSettings();
      }
    });
  }

  getAttendanceState(date) {
    const dateKey = this.formatDateKey(date);
    return this.attendanceData[dateKey] || "none";
  }

  setAttendanceState(date, state) {
    const dateKey = this.formatDateKey(date);
    this.attendanceData[dateKey] = state;
    this.saveAttendanceData();
  }

  cycleAttendanceState(date) {
    const currentState = this.getAttendanceState(date);
    const currentIndex = this.attendanceStates.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % this.attendanceStates.length;
    const nextState = this.attendanceStates[nextIndex];
    this.setAttendanceState(date, nextState);
  }

  formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  }

  loadUserName() {
    return localStorage.getItem("userName") || "Student Name";
  }

  saveUserName() {
    localStorage.setItem("userName", this.userName);
  }

  updateUserName() {
    document.getElementById("userName").textContent = this.userName;
  }

  editUserName() {
    const newName = prompt("Enter your name:", this.userName);
    if (newName && newName.trim()) {
      this.userName = newName.trim();
      this.saveUserName();
      this.updateUserName();
      this.showNotification("Name updated successfully!", "success");
    }
  }

  loadTheme() {
    return localStorage.getItem("theme") || "dark";
  }

  saveTheme() {
    localStorage.setItem("theme", this.currentTheme);
  }

  applyTheme() {
    document.body.setAttribute("data-theme", this.currentTheme);
    this.updateThemeButtons();
  }

  updateThemeButtons() {
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.theme === this.currentTheme) {
        btn.classList.add("active");
      }
    });
  }

  changeTheme(theme) {
    this.currentTheme = theme;
    this.saveTheme();
    this.applyTheme();
    this.showNotification(`Theme changed to ${theme}!`, "success");
  }

  openSettings() {
    document.getElementById("settingsModal").style.display = "block";
  }

  closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
  }

  renderSixMonths() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const startMonth = month;
    const endMonth = (month + 5) % 12;
    const endYear = month + 5 >= 12 ? year + 1 : year;

    const startMonthName = this.monthNames[startMonth];
    const endMonthName = this.monthNames[endMonth];

    document.getElementById(
      "currentMonth"
    ).textContent = `${startMonthName} - ${endMonthName} ${endYear}`;

    const sixMonthsGrid = document.getElementById("sixMonthsGrid");
    sixMonthsGrid.innerHTML = "";

    for (let i = 0; i < 6; i++) {
      const currentMonth = (month + i) % 12;
      const currentYear = month + i >= 12 ? year + 1 : year;
      this.renderMonth(currentMonth, currentYear);
    }
  }

  renderMonth(month, year) {
    const sixMonthsGrid = document.getElementById("sixMonthsGrid");

    const monthContainer = document.createElement("div");
    monthContainer.className = "month-calendar";

    const monthTitle = document.createElement("div");
    monthTitle.className = "month-title";
    monthTitle.textContent = `${this.monthNames[month]} ${year}`;
    monthContainer.appendChild(monthTitle);

    const calendarHeader = document.createElement("div");
    calendarHeader.className = "calendar-header";
    calendarHeader.innerHTML =
      "<div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>";
    monthContainer.appendChild(calendarHeader);

    const calendarGrid = document.createElement("div");
    calendarGrid.className = "calendar-grid";

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const lastDayPrevMonth = new Date(year, month, 0);
    const daysInPrevMonth = lastDayPrevMonth.getDate();

    // Previous month padding
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      this.createCalendarDay(date, day, true, calendarGrid);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.createCalendarDay(date, day, false, calendarGrid);
    }

    // Next month padding
    const remainingDays = 42 - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.createCalendarDay(date, day, true, calendarGrid);
    }

    monthContainer.appendChild(calendarGrid);
    sixMonthsGrid.appendChild(monthContainer);
  }

  createCalendarDay(date, day, isOtherMonth, calendarGrid) {
    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    dayElement.textContent = day;

    if (isOtherMonth) {
      dayElement.classList.add("other-month");
    } else {
      const attendanceState = this.getAttendanceState(date);
      if (attendanceState !== "none") {
        dayElement.classList.add(attendanceState);
        dayElement.setAttribute(
          "data-classes",
          this.classCounts[attendanceState]
        );
      }

      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        dayElement.classList.add("today");
      }

      dayElement.addEventListener("click", (e) => {
        e.preventDefault();
        this.cycleAttendanceState(date);
        this.renderSixMonths();
        this.updateStats();
      });
    }

    calendarGrid.appendChild(dayElement);
  }

  updateStats() {
    let totalDays = 0;
    let totalClassesAttended = 0;
    let absentDays = 0;
    let presentDays = 0;
    let totalPossibleClasses = 0;

    Object.values(this.attendanceData).forEach((state) => {
      if (state !== "none") {
        totalDays++;
        totalPossibleClasses += 7;
        const classCount = this.classCounts[state];
        totalClassesAttended += classCount;

        if (state === "absent") {
          absentDays++;
        } else {
          presentDays++;
        }
      }
    });

    const absentClasses = totalPossibleClasses - totalClassesAttended;
    const attendancePercentage =
      totalPossibleClasses > 0
        ? Math.round((totalClassesAttended / totalPossibleClasses) * 100)
        : 0;

    document.getElementById(
      "totalDays"
    ).textContent = `${totalDays} (${totalPossibleClasses})`;
    document.getElementById(
      "presentDays"
    ).textContent = `${presentDays} (${totalClassesAttended})`;
    document.getElementById(
      "absentDays"
    ).textContent = `${absentDays} (${absentClasses})`;
    document.getElementById(
      "attendancePercentage"
    ).textContent = `${attendancePercentage}%`;

    this.updateAttendanceGradient(attendancePercentage);
  }

  updateAttendanceGradient(percentage) {
    const attendanceElement = document.querySelector(
      ".attendance-percentage-stat"
    );
    if (!attendanceElement) return;

    let color;
    if (percentage <= 33) {
      const intensity = Math.max(0, Math.min(1, percentage / 33));
      const hue = intensity * 25;
      color = `hsl(${hue}, 100%, ${50 + intensity * 10}%)`;
    } else if (percentage <= 66) {
      const intensity = Math.max(0, Math.min(1, (percentage - 33) / 33));
      const hue = 25 + intensity * 35;
      color = `hsl(${hue}, 100%, ${60 + intensity * 5}%)`;
    } else {
      const intensity = Math.max(0, Math.min(1, (percentage - 66) / 34));
      const hue = 60 + intensity * 60;
      const saturation = 100 - intensity * 30;
      const lightness = 65 - intensity * 20;
      color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    attendanceElement.style.setProperty("border-color", color, "important");
    attendanceElement.style.setProperty("border-width", "2px", "important");
  }

  saveAttendanceData() {
    localStorage.setItem("attendanceData", JSON.stringify(this.attendanceData));
  }

  loadAttendanceData() {
    const saved = localStorage.getItem("attendanceData");
    return saved ? JSON.parse(saved) : {};
  }

  exportData() {
    const data = {
      attendanceData: this.attendanceData,
      userName: this.userName,
      theme: this.currentTheme,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    const dateString = now.toISOString().split("T")[0];

    // Create a safe filename by replacing spaces and special characters
    const safeUserName = this.userName
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeUserName}-attendance-data-${dateString}-${timeString}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification("Data exported successfully!", "success");
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.attendanceData) {
          this.attendanceData = data.attendanceData;

          if (data.userName) {
            this.userName = data.userName;
            this.saveUserName();
            this.updateUserName();
          }

          if (data.theme) {
            this.currentTheme = data.theme;
            this.saveTheme();
            this.applyTheme();
          }

          this.saveAttendanceData();
          this.renderSixMonths();
          this.updateStats();
          this.showNotification("Data imported successfully!", "success");
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        this.showNotification(
          "Error importing data. Please check the file format.",
          "error"
        );
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  clearAllData() {
    if (
      confirm(
        "Are you sure you want to clear all attendance data? This action cannot be undone."
      )
    ) {
      this.attendanceData = {};
      this.saveAttendanceData();
      this.renderSixMonths();
      this.updateStats();
      this.showNotification("All data cleared successfully!", "success");
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
    `;

    const colors = {
      success: "#48bb78",
      error: "#f56565",
      info: "#4299e1",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AttendanceTracker();
});
