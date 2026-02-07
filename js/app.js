const API = "https://script.google.com/macros/s/AKfycbyESbLPdBKMLVCjVmb-KOzrue-FjFXB9EvBZ5z8KRJkcpTAYzoRCp0jEPo9DV39JWy8sg/exec";

function loadStudents(){
fetch(API+"?action=students&branch=CSE&sem=3&group=A")
.then(r=>r.json())
.then(d=>{
  let t="<tr><th>Roll</th><th>Name</th><th>P</th></tr>";
  d.forEach(s=>{
    t+=`<tr>
      <td>${s.roll}</td>
      <td>${s.name}</td>
      <td><input type="checkbox" data-roll="${s.roll}"></td>
    </tr>`;
  });
  table.innerHTML=t;
});
}

function submitAttendance(){
  let rows=[];
  document.querySelectorAll("input[type=checkbox]").forEach(c=>{
    rows.push({
      roll:c.dataset.roll,
      name:c.parentElement.previousElementSibling.innerText,
      subject:"CSE302P",
      type:"Practical",
      group:"A",
      date:date.value,
      status:c.checked?"P":"A"
    });
  });

fetch(API,{
method:"POST",
body:JSON.stringify(rows)
}).then(()=>alert("Attendance Saved"));
}

loadStudents();
