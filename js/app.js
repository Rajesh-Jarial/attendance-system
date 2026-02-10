const API = "https://script.google.com/macros/s/AKfycbyESbLPdBKMLVCjVmb-KOzrue-FjFXB9EvBZ5z8KRJkcpTAYzoRCp0jEPo9DV39JWy8sg/exec";

let students = [];

function loadSubjects() {
  fetch(`${API}?action=subjects&branch=${branch.value}&sem=${sem.value}`)
    .then(res => res.json())
    .then(data => {
      subject.innerHTML = '<option value="">-- Select Subject --</option>';
      data.forEach(s => {
        let opt = document.createElement("option");
        opt.value = s.code;
        opt.textContent = s.code + " - " + s.name;
        opt.dataset.type = s.type;
        opt.dataset.groups = s.groups;
        subject.appendChild(opt);
      });
    });
}

function loadStudents() {
  fetch(`${API}?action=students&branch=${branch.value}&sem=${sem.value}&group=${group.value}`)
    .then(res => res.json())
    .then(data => {
      students = data;
      const tb = document.getElementById("studentTableBody");
      tb.innerHTML = "";

      data.forEach((s, i) => {
        tb.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>${s.roll}</td>
          <td>${s.name}</td>
          <td><input type="checkbox" checked></td>
        </tr>`;
      });
    });
}

function selectAll(state) {
  document.querySelectorAll("#studentTableBody input")
    .forEach(cb => cb.checked = state);
}

function submitAttendance() {
  const date = new Date().toISOString().split("T")[0];
  let payload = [];

  document.querySelectorAll("#studentTableBody tr").forEach((row, i) => {
    payload.push({
      date,
      branch: branch.value,
      sem: sem.value,
      subject: subject.value,
      group: group.value,
      roll: students[i].roll,
      status: row.querySelector("input").checked ? "P" : "A"
    });
  });

  fetch(API, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(() => {
    alert("Attendance Saved Successfully");
    document.querySelectorAll("input, button, select")
      .forEach(el => el.disabled = true);
  });
}
