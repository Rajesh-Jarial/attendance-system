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
  const subjSel = subject.options[subject.selectedIndex];

  if (!subject.value || !date.value) {
    alert("Please select Subject and Date");
    return;
  }

  let rows = [];

  document.querySelectorAll("input[type=checkbox]").forEach(cb => {
    rows.push({
      roll: cb.dataset.roll,
      name: cb.dataset.name,
      subject: subject.value,
      type: subjSel.dataset.type,
      group: group.value,
      date: date.value,
      status: cb.checked ? "P" : "A"
    });
  });

  fetch(API, {
    method: "POST",
    body: JSON.stringify(rows)
  }).then(() => alert("Attendance Saved Successfully"));
}


function loadSubjects() {
  const branch = document.getElementById("branch").value;
  const sem = document.getElementById("sem").value;

  if (!branch || !sem) {
    alert("Please select Branch and Semester");
    return;
  }

  fetch(API + `?action=subjects&branch=${branch}&sem=${sem}`)
    .then(res => res.json())
    .then(data => {
      const subj = document.getElementById("subject");
      subj.innerHTML = '<option value="">-- Select Subject --</option>';

      data.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.code;
        opt.textContent = `${s.code} - ${s.name}`;
        opt.dataset.type = s.type;     // Theory / Practical
        opt.dataset.groups = s.groups; // NA or A,B
        subj.appendChild(opt);
      });
    });
}

function onSubjectChange() {
  const subj = document.getElementById("subject");
  const grp = document.getElementById("group");
  const selected = subj.options[subj.selectedIndex];

  if (!selected.dataset.type) return;

  if (selected.dataset.type === "Theory") {
    grp.value = "NA";
    grp.disabled = true;
  } else {
    grp.disabled = false;
  }
}



loadStudents();
