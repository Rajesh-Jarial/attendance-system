const API = "https://script.google.com/macros/s/AKfycbyKXsz1jL94Wg67ZTgSpbuXqYSjWDV6EcXtLLBGHjMdxwSZASpYbGbc_taCd56-HptHUA/exec";


let subjectData=[];
let reportData={};

function login(){
 fetch(`${API}?action=login&u=${u.value}&p=${p.value}`)
 .then(r=>r.json())
 .then(d=>{
   if(d.status=="success") location="attendance.html";
   else alert("Invalid Login");
 });
}

function loadSubjects(){
 fetch(`${API}?action=subjects&branch=${branch.value}&sem=${sem.value}`)
 .then(r=>r.json())
 .then(data=>{
   subjectData=data;
   let h="";
   data.forEach((s,i)=>{
     h+=`<option value="${i}">${s.code} - ${s.name}</option>`;
   });
   subject.innerHTML=h;
   updateGroupOptions();
 });
}

function updateGroupOptions(){
 const s=subjectData[subject.value];
 group.innerHTML="";
 if(s.type=="Theory"){
   group.disabled=true;
   group.innerHTML="<option value=''>NA</option>";
 }else{
   group.disabled=false;
   group.innerHTML="<option value=''>Select Group</option>";
   s.groups.split(",").forEach(g=>{
     group.innerHTML+=`<option value="${g.trim()}">${g.trim()}</option>`;
   });
 }
}

function loadStudents(){
 const s=subjectData[subject.value];
 if(s.type=="Practical" && group.value==""){
   alert("Select Group");
   return;
 }

 fetch(`${API}?action=students&branch=${branch.value}&sem=${sem.value}&group=${group.value}`)
 .then(r=>r.json())
 .then(data=>{
   let h="<tr><th>#</th><th>Roll</th><th>Name</th><th>Present</th></tr>";
   data.forEach((st,i)=>{
     h+=`<tr>
     <td>${i+1}</td>
     <td>${st.roll}</td>
     <td>${st.name}</td>
     <td><input type="checkbox" checked id="c${st.roll}"></td>
     </tr>`;
   });
   tbl.innerHTML=h;
 });
}

function submitAttendance(){
 document.querySelectorAll("input[type=checkbox]").forEach(cb=>{
   fetch(`${API}?action=save&date=${date.value}&branch=${branch.value}&sem=${sem.value}&subject=${subjectData[subject.value].code}&group=${group.value}&roll=${cb.id.slice(1)}&status=${cb.checked?"Present":"Absent"}`);
 });
 submitBtn.disabled=true;
 alert("Saved");
}

function resetForm(){
 submitBtn.disabled=false;
 tbl.innerHTML="";
}

function downloadPDF(){

  if(Object.keys(reportData).length===0){
    alert("Generate report first");
    return;
  }

  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Attendance Report",20,20);

  doc.setFontSize(11);
  doc.text(`Branch: ${repBranch.value}`,20,30);
  doc.text(`Semester: ${repSem.value}`,20,37);
  doc.text(`Month: ${repMonth.options[repMonth.selectedIndex].text}`,20,44);
  doc.text(`Year: ${repYear.value}`,20,51);
  doc.text(`Subject: ${repSubject.value}`,20,58);

  let y=70;

  for(let roll in reportData){

    let p=reportData[roll].present;
    let t=reportData[roll].total;
    let per=((p/t)*100).toFixed(2)+"%";

    doc.text(`Roll: ${roll}  |  ${per}`,20,y);
    y+=8;

    if(y>280){
      doc.addPage();
      y=20;
    }
  }

  doc.save("Attendance_Report.pdf");
}

/* ===== REPORT PAGE INITIALIZATION ===== */

document.addEventListener("DOMContentLoaded", function(){

  const yearSelect = document.getElementById("repYear");

  if(yearSelect){

    const currentYear = new Date().getFullYear();

    for(let i = currentYear - 2; i <= currentYear + 1; i++){
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      yearSelect.appendChild(opt);
    }

  }

});

function loadReportSubjects(){

  const branch = document.getElementById("repBranch").value;
  const sem = document.getElementById("repSem").value;
  const subjectSelect = document.getElementById("repSubject");

  if(!branch || !sem){
    return;  // Do nothing if empty
  }

  fetch(`${API}?action=subjects&branch=${branch}&sem=${sem}`)
  .then(res => res.json())
  .then(data => {

    subjectSelect.innerHTML = "<option value=''>Select Subject</option>";

    data.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.code;
      opt.textContent = s.code + " - " + s.name;
      subjectSelect.appendChild(opt);
    });

  })
  .catch(err => {
    console.log("Subject Load Error:", err);
  });

}

function generateReport(){

  const branch = document.getElementById("repBranch").value;
  const sem = document.getElementById("repSem").value;
  const subject = document.getElementById("repSubject").value;
  const month = document.getElementById("repMonth").value;
  const year = document.getElementById("repYear").value;

  if(!branch || !sem || !subject || !month || !year){
    alert("Please fill all fields.");
    return;
  }

  fetch(`${API}?action=report&branch=${branch}&sem=${sem}&subject=${subject}&month=${month}&year=${year}`)
  .then(res => res.json())
  .then(data => {

    if(data.length === 0){
      alert("No records found.");
      return;
    }

    let output = "<h3>Attendance Report</h3>";
    output += "<table border='1' cellpadding='5'>";
    output += "<tr><th>Roll No</th><th>Name</th><th>Total Classes</th><th>Present</th><th>%</th></tr>";

    data.forEach(r => {
      output += `<tr>
                  <td>${r.roll}</td>
                  <td>${r.name}</td>
                  <td>${r.total}</td>
                  <td>${r.present}</td>
                  <td>${r.percentage}%</td>
                </tr>`;
    });

    output += "</table>";

    document.getElementById("reportResult").innerHTML = output;

  })
  .catch(err => {
    console.log("Report Error:", err);
    alert("Error generating report.");
  });

}






