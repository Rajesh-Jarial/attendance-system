const API = "https://script.google.com/macros/s/AKfycbxg9dPyfSPt1vo37ohI_Xn-CMVcEd2n8TTbTfEctKk4aEFdD6h3DRuActmYHEYuF9IRJA/exec";


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

function generateReport(){
 fetch(`${API}?action=report&month=${month.value}&subject=${repSubject.value}`)
 .then(r=>r.json())
 .then(data=>{
   reportData=data;
   let h="<table border=1><tr><th>Roll</th><th>%</th></tr>";
   for(let roll in data){
     let per=(data[roll].present/data[roll].total*100).toFixed(2);
     h+=`<tr><td>${roll}</td><td>${per}%</td></tr>`;
   }
   h+="</table>";
   reportDiv.innerHTML=h;
 });
}

function downloadPDF(){
 const {jsPDF}=window.jspdf;
 const doc=new jsPDF();
 doc.text("Attendance Report",20,20);
 doc.text(reportDiv.innerText,20,30);
 doc.save("attendance.pdf");
}

