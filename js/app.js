const API = "https://script.google.com/macros/s/AKfycbyESbLPdBKMLVCjVmb-KOzrue-FjFXB9EvBZ5z8KRJkcpTAYzoRCp0jEPo9DV39JWy8sg/exec";

function loadStudents() {
  const branch = document.getElementById("branch").value;
  const sem = document.getElementById("sem").value;
  const group = document.getElementById("group").value;

  if (!branch || !sem) {
    alert("Please select Branch and Semester");
    return;
  }

  const url = API +
    "?action=students" +
    "&branch=" + encodeURIComponent(branch) +
    "&sem=" + encodeURIComponent(sem) +
    "&group=" + encodeURIComponent(group);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      let html =
        "<tr><th>Roll No</th><th>Name</th><th>Present</th></tr>";

      data.forEach(s => {
        html += `
          <tr>
            <td>${s.roll}</td>
            <td>${s.name}</td>
            <td>
              <input type="checkbox"
                     data-roll="${s.roll}"
                     data-name="${s.name}">
            </td>
          </tr>`;
      });

      document.getElementById("table").innerHTML = html;
    });
}


function submitAttendance() {
  const branch = branch.value;
  const sem = sem.value;
  const group = group.value;
  const dateVal = date.value;

  if (!dateVal) {
    alert("Please select date");
    return;
  }

  let rows = [];

  document
    .querySelectorAll("input[type=checkbox]")
    .forEach(cb => {
      rows.push({
        roll: cb.dataset.roll,
        name: cb.dataset.name,
        subject: subject.value,      // from subject dropdown
        type: group === "NA" ? "Theory" : "Practical",
        group: group,
        date: dateVal,
        status: cb.checked ? "P" : "A"
      });
    });

  fetch(API, {
    method: "POST",
    body: JSON.stringify(rows)
  }).then(() => alert("Attendance Saved Successfully"));
}


loadStudents();
