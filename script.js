const checkInForm = document.getElementById("checkInForm");
const attendeeName = document.getElementById("attendeeName");
const greeting = document.getElementById("greeting");
const attendeeCountDisplay = document.getElementById("attendeeCount");
const attendanceGoalDisplay = document.getElementById("attendanceGoal");
const progressBar = document.getElementById("progressBar");
const progressPercentageDisplay = document.getElementById("progressPercentage");
const celebrationMessage = document.getElementById("celebrationMessage");
const attendeeList = document.getElementById("attendeeList");
const teamSelect = document.getElementById("teamSelect");
const teamCountDisplays = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};
const teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};
const attendanceGoal = 50;
const storageKey = "intelSummitCheckInData";
const attendees = [];
let totalAttendance = 0;
let celebrationShown = false;

function celebrateAttendance() {
  let highestCount = 0;
  const winningTeams = [];

  for (const team in teamCounts) {
    if (teamCounts[team] > highestCount) {
      highestCount = teamCounts[team];
      winningTeams.length = 0;
      winningTeams.push(teamNames[team]);
    } else if (teamCounts[team] === highestCount) {
      winningTeams.push(teamNames[team]);
    }
  }

  for (const team in teamCounts) {
    if (teamCounts[team] === highestCount) {
      teamCountDisplays[team].parentElement.classList.add("winning-team");
    }
  }

  celebrationMessage.textContent = `The summit goal is reached! Highest attendance: ${winningTeams.join(", ")} (${highestCount} attendees).`;
  celebrationMessage.hidden = false;
}

function updateAttendanceDisplay() {
  attendeeCountDisplay.textContent = totalAttendance;

  for (const team in teamCounts) {
    teamCountDisplays[team].textContent = teamCounts[team];
  }

  const progressPercentage = Math.min((totalAttendance / attendanceGoal) * 100, 100);
  progressBar.style.width = `${progressPercentage}%`;
  progressPercentageDisplay.textContent = `${progressPercentage}%`;
}

function isValidTeam(team) {
  return Object.prototype.hasOwnProperty.call(teamCounts, team);
}

function displayAttendee(attendee) {
  const attendeeRow = document.createElement("tr");
  const nameCell = document.createElement("td");
  const teamCell = document.createElement("td");

  nameCell.textContent = attendee.name;
  teamCell.textContent = teamNames[attendee.team];
  attendeeRow.appendChild(nameCell);
  attendeeRow.appendChild(teamCell);
  attendeeList.appendChild(attendeeRow);
}

function showFormMessage(message, messageType) {
  greeting.textContent = message;
  greeting.className = messageType;
}

function loadAttendance() {
  try {
    const savedDataText = localStorage.getItem(storageKey);

    if (savedDataText === null) {
      return;
    }

    const savedData = JSON.parse(savedDataText);

    if (
      !savedData ||
      !Number.isInteger(savedData.totalAttendance) ||
      savedData.totalAttendance < 0 ||
      !Array.isArray(savedData.attendees) ||
      !savedData.teamCounts
    ) {
      return;
    }

    const savedTeamCounts = {};
    const attendeeTeamCounts = {
      water: 0,
      zero: 0,
      power: 0,
    };
    let teamTotal = 0;

    for (const team in teamCounts) {
      const teamCount = savedData.teamCounts[team];

      if (!Number.isInteger(teamCount) || teamCount < 0) {
        return;
      }

      savedTeamCounts[team] = teamCount;
      teamTotal = teamTotal + teamCount;
    }

    if (
      teamTotal !== savedData.totalAttendance ||
      savedData.attendees.length !== savedData.totalAttendance
    ) {
      return;
    }

    for (let index = 0; index < savedData.attendees.length; index = index + 1) {
      const attendee = savedData.attendees[index];

      if (
        !attendee ||
        typeof attendee.name !== "string" ||
        attendee.name.trim() === "" ||
        !isValidTeam(attendee.team)
      ) {
        return;
      }

      attendeeTeamCounts[attendee.team] = attendeeTeamCounts[attendee.team] + 1;
    }

    for (const team in teamCounts) {
      if (attendeeTeamCounts[team] !== savedTeamCounts[team]) {
        return;
      }
    }

    totalAttendance = savedData.totalAttendance;

    for (const team in teamCounts) {
      teamCounts[team] = savedTeamCounts[team];
    }

    for (let index = 0; index < savedData.attendees.length; index = index + 1) {
      attendees.push({
        name: savedData.attendees[index].name,
        team: savedData.attendees[index].team,
      });
    }
  } catch (error) {
    return;
  }
}

function saveAttendance() {
  try {
    const attendanceData = {
      totalAttendance: totalAttendance,
      teamCounts: teamCounts,
      attendees: attendees,
    };

    localStorage.setItem(storageKey, JSON.stringify(attendanceData));
  } catch (error) {
    return;
  }
}

attendanceGoalDisplay.textContent = attendanceGoal;
loadAttendance();
updateAttendanceDisplay();

for (let index = 0; index < attendees.length; index = index + 1) {
  displayAttendee(attendees[index]);
}

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = attendeeName.value.trim();
  const team = teamSelect.value;
  const teamIsInvalid = !isValidTeam(team);

  if (name === "" && teamIsInvalid) {
    showFormMessage("Please enter your name and select a team to check in.", "error-message");
    attendeeName.focus();
    return;
  }

  if (name === "") {
    showFormMessage("Please enter your name to check in.", "error-message");
    attendeeName.focus();
    return;
  }

  if (teamIsInvalid) {
    showFormMessage("Please select a team to check in.", "error-message");
    teamSelect.focus();
    return;
  }

  showFormMessage(
    `Welcome to the Intel Summit, ${name}! You are checked in with ${teamNames[team]}.`,
    "success-message"
  );
  teamCounts[team] = teamCounts[team] + 1;
  totalAttendance = totalAttendance + 1;
  attendees.push({ name: name, team: team });
  displayAttendee(attendees[attendees.length - 1]);
  updateAttendanceDisplay();

  if (totalAttendance === attendanceGoal && celebrationShown === false) {
    celebrationShown = true;
    celebrateAttendance();
  }

  saveAttendance();
  checkInForm.reset();
  attendeeName.focus();
});
