const API = "https://script.google.com/macros/s/AKfycbzB_v032CCSj4w19Y5snUZL-Il6Ehwsb_Qp_7KbRl9JtwdDVfls_TFd8UC8CkKHyq9OOA/exec";


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

  if(document.getElementById("repYear")){

    let y = new Date().getFullYear();

    for(let i = y - 2; i <= y + 1; i++){
      repYear.innerHTML += `<option value="${i}">${i}</option>`;
    }

  }

});

function loadReportSubjects(){

  if(!repBranch.value || !repSem.value){
    alert("Select Branch and Semester");
    return;
  }

  fetch(`${API}?action=subjects&branch=${repBranch.value}&sem=${repSem.value}`)
  .then(r=>r.json())
  .then(data=>{
    let h="<option value=''>Select Subject</option>";
    data.forEach(s=>{
      h+=`<option value="${s.code}">${s.code} - ${s.name}</option>`;
    });
    repSubject.innerHTML=h;
  });
}


function generateReport(){

  if(!repMonth.value || !repYear.value || !repSubject.value){
    alert("Fill all fields");
    return;
  }

  fetch(`${API}?action=report
  &month=${repMonth.value}
  &year=${repYear.value}
  &branch=${repBranch.value}
  &sem=${repSem.value}
  &subject=${repSubject.value}`)
  .then(r=>r.json())
  .then(data=>{

    reportData=data;

    let h="<table border=1>";
    h+="<tr><th>Roll</th><th>Present</th><th>Total</th><th>%</th></tr>";

    for(let roll in data){

      let p=data[roll].present;
      let t=data[roll].total;
      let per=((p/t)*100).toFixed(2);

      h+=`<tr>
      <td>${roll}</td>
      <td>${p}</td>
      <td>${t}</td>
      <td>${per}%</td>
      </tr>`;
    }

    h+="</table>";

    reportDiv.innerHTML=h;
  });
}


