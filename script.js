
const app = document.getElementById('app');
const toast = document.getElementById('toast');

const state = {
  role:'lecturer',
  currentUser:{studentId:'S1023456',name:'Alex Lim'},
  session:{
    active:false,
    finalized:false,
    course:'Software Engineering',
    code:'SE101',
    room:'E4-301',
    date:'13 Oct 2026',
    start:'09:00',
    end:'10:50',
    duration:15,
    lateThreshold:10,
    secondsLeft:222,
    qrVersion:1
  },
  locationMode:'inside',
  scanMode:'success',
  records:[
    {id:'S1023457',name:'Nur Aisyah',time:'09:02',status:'Present'},
    {id:'S1023458',name:'Daniel Wong',time:'09:08',status:'Present'},
    {id:'S1023459',name:'Priya Sharma',time:'09:12',status:'Late'},
    {id:'S1023460',name:'Kavin Raj',time:null,status:'Unresolved'}
  ],
  studentHistory:[
    {course:'Software Engineering',date:'8 Oct 2026',time:'09:03',status:'Present',canCorrect:true},
    {course:'Database Systems',date:'1 Oct 2026',time:'09:12',status:'Late',canCorrect:true},
    {course:'HCI',date:'24 Sep 2026',time:'—',status:'Absent',canCorrect:true},
    {course:'Software Engineering',date:'17 Sep 2026',time:'09:01',status:'Present',canCorrect:true}
  ],
  corrections:[
    {id:1,student:'Alex Lim',studentId:'S1023456',course:'Software Engineering',date:'8 Oct 2026',from:'Absent',to:'Present',reason:'I attended the class and checked in, but my record shows absent.',status:'Pending'}
  ]
};

function msg(t){
  toast.textContent=t;
  toast.classList.add('show');
  clearTimeout(msg.t);
  msg.t=setTimeout(()=>toast.classList.remove('show'),1800);
}
function statusBadge(s){
  let tone='blue';
  if(s==='Present'||s==='Approved') tone='green';
  if(s==='Late'||s==='Pending'||s==='Unresolved') tone='amber';
  if(s==='Absent'||s==='Rejected') tone='red';
  return `<span class="badge ${tone}">${s}</span>`;
}
function counts(){
  const all=[...state.records];
  const p=all.filter(r=>r.status==='Present').length;
  const l=all.filter(r=>r.status==='Late').length;
  const a=all.filter(r=>r.status==='Absent').length;
  const u=all.filter(r=>r.status==='Unresolved').length;
  return {p,l,a,u,total:all.length};
}
function setRole(role){
  state.role=role;
  document.querySelectorAll('.role').forEach(b=>b.classList.toggle('active',b.dataset.role===role));
  role==='lecturer'?lecturerHome():studentHome();
}
document.querySelectorAll('.role').forEach(b=>b.onclick=()=>setRole(b.dataset.role));
document.getElementById('brandBtn').onclick=()=>setRole(state.role);

function lecturerHome(){
  const c=counts();
  app.innerHTML=`
    <section class="hero">
      <div class="eyebrow">Lecturer demo</div>
      <h1>Good afternoon, Dr. Tan.</h1>
      <p>Start attendance, monitor live check-ins, finalize the class, and review correction requests.</p>
      <div class="grid stats">
        <div class="stat"><b>${state.session.active?'1':'0'}</b><small>Active session</small></div>
        <div class="stat"><b>${c.p}</b><small>Present now</small></div>
        <div class="stat"><b>${c.l}</b><small>Late</small></div>
        <div class="stat"><b>${state.corrections.filter(x=>x.status==='Pending').length}</b><small>Pending corrections</small></div>
      </div>
    </section>

    <section class="section">
      <div class="sectionhead">
        <div><h2>Today's classes</h2><p class="helper">Prototype flow for FR-1 to FR-4.</p></div>
      </div>
      <div class="grid class-grid">
        <article class="card">
          <div class="row between">
            <span class="badge blue">09:00–10:50</span>
            <span class="helper">E4-301</span>
          </div>
          <div style="margin-top:12px"><h3>Software Engineering</h3><p class="helper">SE101 · 38 enrolled</p></div>
          <div style="margin-top:16px">
            ${state.session.active
              ? `<button class="btn primary" onclick="openLive()">Open active session</button>`
              : `<button class="btn primary" onclick="createSession()">Start attendance</button>`}
          </div>
        </article>
        <article class="card">
          <div class="row between"><span class="badge blue">13:00–14:50</span><span class="helper">E4-305</span></div>
          <div style="margin-top:12px"><h3>Database Systems</h3><p class="helper">DB201 · 42 enrolled</p></div>
          <div style="margin-top:16px"><button class="btn" disabled>Not available yet</button></div>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="sectionhead">
        <div><h2>Correction requests</h2><p class="helper">FR-7 — lecturer resolves student requests.</p></div>
      </div>
      <div class="card">
        ${state.corrections.length?state.corrections.map(c=>`
          <div class="row between" style="padding:10px 0">
            <div><b style="color:var(--ink)">${c.student}</b><div class="helper">${c.course} · ${c.date}</div></div>
            <div class="row">${statusBadge(c.status)} <button class="btn small" onclick="openCorrection(${c.id})">Review</button></div>
          </div>
        `).join(''):`<div class="empty">No correction requests.</div>`}
      </div>
    </section>`;
}

function createSession(){
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="lecturerHome()">←</button>
      <div><div class="eyebrow">FR-1</div><h2>Start attendance session</h2><p class="helper">Configure timing before the QR becomes active.</p></div>
    </div>
    <div class="grid two-col">
      <section class="card">
        <h3>Software Engineering</h3>
        <div class="meta" style="margin-top:6px"><span>13 Oct 2026</span><span>09:00–10:50</span><span>E4-301</span></div>
        <div class="field"><label for="duration">Attendance duration</label>
          <select id="duration"><option value="10">10 minutes</option><option value="15" selected>15 minutes</option><option value="20">20 minutes</option></select>
        </div>
        <div class="field"><label for="late">Late threshold</label>
          <select id="late"><option value="5">5 minutes</option><option value="10" selected>10 minutes</option><option value="15">15 minutes</option></select>
        </div>
        <div class="field"><label for="radius">Location proximity</label>
          <select id="radius"><option>Within configured classroom/building zone</option></select>
        </div>
        <div class="alert blue" style="margin-top:14px">Prototype note: QR generation, geolocation, authentication and backend persistence are simulated.</div>
        <button class="btn primary" style="margin-top:14px;width:100%" onclick="startSession()">Start session</button>
      </section>
      <aside class="card">
        <h3>What happens next?</h3>
        <div class="history-list" style="margin-top:12px">
          <div class="history-item"><div><b>1. QR appears</b><div class="helper">Temporary classroom session token.</div></div></div>
          <div class="history-item"><div><b>2. Students scan</b><div class="helper">QR + enrolment + location + duplicate/time checks.</div></div></div>
          <div class="history-item"><div><b>3. Lecturer monitors</b><div class="helper">Present, Late and unresolved status.</div></div></div>
        </div>
      </aside>
    </div>`;
}

function startSession(){
  state.session.duration=parseInt(document.getElementById('duration').value,10);
  state.session.lateThreshold=parseInt(document.getElementById('late').value,10);
  state.session.secondsLeft=state.session.duration*60;
  state.session.active=true;
  state.session.finalized=false;
  msg('Attendance session started');
  openQR();
}
function timeLeft(){
  const m=Math.floor(state.session.secondsLeft/60);
  const s=state.session.secondsLeft%60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function openQR(){
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="lecturerHome()">←</button>
      <div><div class="eyebrow">FR-1</div><h2>Attendance in progress</h2><p class="helper">Display this screen on the classroom projector.</p></div>
    </div>
    <div class="grid two-col">
      <section class="card">
        <div class="row between"><div><h3>Software Engineering</h3><p class="helper">SE101 · E4-301</p></div><span class="badge green">Live</span></div>
        <div style="text-align:center;margin:20px 0 8px">
          <div class="helper">Check-in closes in</div>
          <div class="countdown">${timeLeft()}</div>
          <div class="helper">QR refresh #${state.session.qrVersion}</div>
        </div>
        <div class="qrwrap"><div class="qr" aria-label="Simulated dynamic attendance QR code"></div></div>
        <div class="row" style="margin-top:14px">
          <button class="btn secondary" onclick="refreshQR()">Refresh QR</button>
          <button class="btn primary" onclick="openLive()">Monitor check-ins</button>
          <button class="btn danger" onclick="endSession()">End session</button>
        </div>
      </section>
      <aside class="card">
        <h3>Demo controls</h3>
        <p class="helper" style="margin-top:4px">Use these to demonstrate the student-side happy and error paths.</p>
        <div class="field"><label for="locMode">Student location scenario</label>
          <select id="locMode" onchange="state.locationMode=this.value">
            <option value="inside" ${state.locationMode==='inside'?'selected':''}>Inside allowed area</option>
            <option value="outside" ${state.locationMode==='outside'?'selected':''}>Outside allowed area</option>
            <option value="denied" ${state.locationMode==='denied'?'selected':''}>Location permission denied</option>
          </select>
        </div>
        <div class="field"><label for="scanMode">QR scenario</label>
          <select id="scanMode" onchange="state.scanMode=this.value">
            <option value="success" ${state.scanMode==='success'?'selected':''}>Valid QR</option>
            <option value="expired" ${state.scanMode==='expired'?'selected':''}>Expired QR</option>
            <option value="duplicate" ${state.scanMode==='duplicate'?'selected':''}>Duplicate check-in</option>
          </select>
        </div>
        <button class="btn" style="margin-top:14px;width:100%" onclick="setRole('student')">Switch to Student view</button>
      </aside>
    </div>`;
}
function refreshQR(){
  state.session.qrVersion++;
  msg('New QR token generated');
  openQR();
}
function endSession(){
  state.session.secondsLeft=0;
  msg('Check-in window closed');
  openLive();
}
function openLive(){
  const c=counts();
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="openQR()">←</button>
      <div><div class="eyebrow">FR-3</div><h2>Live attendance</h2><p class="helper">Monitor the active class before finalization.</p></div>
    </div>

    <div class="grid stats">
      <div class="stat"><b>${c.p}</b><small>Present</small></div>
      <div class="stat"><b>${c.l}</b><small>Late</small></div>
      <div class="stat"><b>${c.a}</b><small>Absent</small></div>
      <div class="stat"><b>${c.u}</b><small>Unresolved</small></div>
    </div>

    <section class="section">
      <div class="card">
        <div class="row between">
          <div><h3>Software Engineering</h3><p class="helper">13 Oct 2026 · 09:00–10:50 · E4-301</p></div>
          <span class="badge ${state.session.finalized?'blue':'green'}">${state.session.finalized?'Finalized':'Live'}</span>
        </div>
        <div class="tablewrap" style="margin-top:14px">
          <table>
            <thead><tr><th>Student</th><th>ID</th><th>Check-in</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              ${state.records.map((r,i)=>`
                <tr>
                  <td>${r.name}</td><td>${r.id}</td><td>${r.time||'—'}</td><td>${statusBadge(r.status)}</td>
                  <td>${!state.session.finalized?`<button class="btn small" onclick="manualResolve(${i})">Resolve</button>`:'—'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="row" style="margin-top:14px">
          ${!state.session.finalized?`<button class="btn primary" onclick="reviewFinalize()">Review & finalize</button>`:`<button class="btn" onclick="lecturerHome()">Back to dashboard</button>`}
        </div>
      </div>
    </section>`;
}
function manualResolve(i){
  const r=state.records[i];
  r.status = r.status==='Unresolved'?'Present':r.status;
  if(!r.time) r.time='09:16';
  msg('Manual exception resolved');
  openLive();
}
function reviewFinalize(){
  const c=counts();
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="openLive()">←</button>
      <div><div class="eyebrow">FR-4</div><h2>Finalize attendance</h2><p class="helper">Review the final outcome before locking the session.</p></div>
    </div>
    <div class="grid two-col">
      <section class="card">
        <h3>Summary</h3>
        <div class="grid three-col" style="margin-top:14px">
          <div class="stat"><b>${c.p}</b><small>Present</small></div>
          <div class="stat"><b>${c.l}</b><small>Late</small></div>
          <div class="stat"><b>${c.u}</b><small>Will become Absent</small></div>
        </div>
        <div class="alert amber" style="margin-top:14px">Finalizing will mark remaining unresolved enrolled students as Absent and reject all future scans.</div>
        <button class="btn primary" style="margin-top:14px;width:100%" onclick="finalizeSession()">Finalize attendance</button>
      </section>
      <aside class="card">
        <h3>Rule demonstrated</h3>
        <p class="helper" style="margin-top:8px">Active → Finalized is a one-way session state in this prototype. New student scans after finalization are rejected.</p>
      </aside>
    </div>`;
}
function finalizeSession(){
  state.records.forEach(r=>{if(r.status==='Unresolved') r.status='Absent'});
  state.session.finalized=true;
  state.session.active=false;
  msg('Attendance finalized');
  openLive();
}

function openCorrection(id){
  const c=state.corrections.find(x=>x.id===id);
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="lecturerHome()">←</button>
      <div><div class="eyebrow">FR-7</div><h2>Correction request</h2><p class="helper">${c.course} · ${c.date}</p></div>
    </div>
    <div class="grid two-col">
      <section class="card">
        <div class="row between"><div><h3>${c.student}</h3><p class="helper">${c.studentId}</p></div>${statusBadge(c.status)}</div>
        <hr class="sep">
        <div class="alert red"><b>Recorded:</b> ${c.from}</div>
        <div style="margin-top:14px"><b style="color:var(--ink)">Student reason</b><p class="helper" style="margin-top:6px">${c.reason}</p></div>
        <div class="field"><label for="correctTo">Correct attendance to</label>
          <select id="correctTo"><option>Present</option><option>Late</option><option>Absent</option></select>
        </div>
        ${c.status==='Pending'?`
          <div class="row" style="margin-top:14px">
            <button class="btn danger" onclick="resolveCorrection(${c.id},'Rejected')">Reject</button>
            <button class="btn primary" onclick="resolveCorrection(${c.id},'Approved')">Approve</button>
          </div>`:`<div class="alert ${c.status==='Approved'?'green':'red'}" style="margin-top:14px">This request has been ${c.status.toLowerCase()}.</div>`}
      </section>
    </div>`;
}
function resolveCorrection(id,status){
  const c=state.corrections.find(x=>x.id===id);
  c.status=status;
  if(status==='Approved'){
    c.to=document.getElementById('correctTo').value;
    const h=state.studentHistory.find(x=>x.course===c.course&&x.date===c.date);
    if(h) h.status=c.to;
  }
  msg(`Correction ${status.toLowerCase()}`);
  openCorrection(id);
}

function studentHome(){
  app.innerHTML=`
    <section class="hero">
      <div class="eyebrow">Student demo</div>
      <h1>Hi, ${state.currentUser.name}.</h1>
      <p>Check in to the current class, view your own attendance, and request corrections.</p>
    </section>

    <section class="section">
      <div class="grid two-col">
        <article class="card">
          <div class="row between"><div><h3>Current class</h3><p class="helper">Software Engineering · E4-301</p></div>${state.session.active?'<span class="badge green">Check-in open</span>':'<span class="badge red">Closed</span>'}</div>
          <div class="meta" style="margin-top:12px"><span>09:00–10:50</span><span>SE101</span></div>
          <button class="btn primary" style="margin-top:16px;width:100%" onclick="scanScreen()" ${state.session.active?'':'disabled'}>Scan QR code</button>
          ${!state.session.active?'<div class="alert amber" style="margin-top:12px">No active attendance session is available.</div>':''}
        </article>

        <article class="card">
          <h3>My attendance</h3>
          <p class="helper" style="margin-top:4px">FR-5 — only your own finalized records are shown.</p>
          <button class="btn" style="margin-top:16px;width:100%" onclick="historyScreen()">View history</button>
        </article>
      </div>
    </section>
    <section class="section">
      <div class="alert blue">Demo scenario is controlled from the Lecturer QR screen: valid/expired/duplicate QR and inside/outside/denied location.</div>
    </section>`;
}
function scanScreen(){
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="studentHome()">←</button>
      <div><div class="eyebrow">FR-2</div><h2>Scan attendance QR</h2><p class="helper">Camera scanning is simulated in this prototype.</p></div>
    </div>
    <div class="mobile-frame">
      <div class="mobile-screen">
        <div class="row between"><b style="color:var(--ink)">Scan QR code</b><span class="badge blue">Demo</span></div>
        <div class="scanbox" style="margin-top:14px"><div style="z-index:2;text-align:center"><b>Align QR inside the frame</b><div class="helper" style="color:#d9dee8;margin-top:6px">Then the system checks session + enrolment + location + duplicate.</div></div></div>
        <button class="btn primary" style="width:100%;margin-top:14px" onclick="simulateScan()">Simulate scan</button>
      </div>
    </div>`;
}
function simulateScan(){
  if(state.session.finalized || !state.session.active){
    return scanResult('Session closed','This attendance session is no longer accepting check-ins.','red');
  }
  if(state.scanMode==='expired'){
    return scanResult('QR expired','This QR token is no longer valid. Scan the current code shown by the lecturer.','red');
  }
  if(state.locationMode==='outside'){
    return scanResult('Location check failed','You must be inside the configured classroom/building area to check in.','red');
  }
  if(state.locationMode==='denied'){
    return scanResult('Location permission required','Allow location access for this check-in, then try again. SmartAttend does not continuously track your location.','amber');
  }
  if(state.scanMode==='duplicate' || state.records.some(r=>r.id===state.currentUser.studentId)){
    return scanResult('Already checked in','Only one attendance record is allowed per student for each session.','amber');
  }
  state.records.push({id:state.currentUser.studentId,name:state.currentUser.name,time:'09:03',status:'Present'});
  state.studentHistory.unshift({course:'Software Engineering',date:'13 Oct 2026',time:'09:03',status:'Present',canCorrect:false});
  scanSuccess();
}
function scanResult(title,body,tone){
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="scanScreen()">←</button>
      <div><div class="eyebrow">FR-2 unhappy path</div><h2>${title}</h2></div>
    </div>
    <div class="mobile-frame">
      <div class="mobile-screen" style="display:flex;flex-direction:column;justify-content:center">
        <div class="alert ${tone}" style="font-size:16px"><b>${title}</b><div style="margin-top:6px">${body}</div></div>
        <button class="btn primary" style="margin-top:14px" onclick="scanScreen()">Try again</button>
        <button class="btn" style="margin-top:8px" onclick="studentHome()">Back to home</button>
      </div>
    </div>`;
}
function scanSuccess(){
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="studentHome()">←</button>
      <div><div class="eyebrow">FR-2 happy path</div><h2>Attendance recorded</h2></div>
    </div>
    <div class="mobile-frame">
      <div class="mobile-screen" style="text-align:center">
        <div class="bigcheck">✓</div>
        <h2>Attendance recorded!</h2>
        <p class="helper" style="margin-top:6px">Software Engineering · 13 Oct 2026</p>
        <div class="card" style="margin-top:18px;text-align:left">
          <div class="row between"><span>Check-in time</span><b style="color:var(--ink)">09:03</b></div>
          <hr class="sep">
          <div class="row between"><span>Status</span>${statusBadge('Present')}</div>
          <hr class="sep">
          <div class="row between"><span>Location check</span><span class="badge green">Passed</span></div>
        </div>
        <button class="btn primary" style="width:100%;margin-top:18px" onclick="studentHome()">Done</button>
      </div>
    </div>`;
}
function historyScreen(){
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="studentHome()">←</button>
      <div><div class="eyebrow">FR-5 & FR-6</div><h2>My attendance</h2><p class="helper">Only this student's records are displayed.</p></div>
    </div>
    <div class="card">
      <div class="tabs"><button class="tab active">History</button><button class="tab">Statistics</button></div>
      <div class="history-list">
        ${state.studentHistory.map((h,i)=>`
          <div class="history-item">
            <div><b style="color:var(--ink)">${h.course}</b><div class="helper">${h.date} · ${h.time}</div></div>
            <div class="row">${statusBadge(h.status)} ${h.canCorrect?`<button class="btn small" onclick="requestCorrection(${i})">Request correction</button>`:''}</div>
          </div>`).join('')}
      </div>
    </div>`;
}
function requestCorrection(i){
  const h=state.studentHistory[i];
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="historyScreen()">←</button>
      <div><div class="eyebrow">FR-6</div><h2>Request correction</h2><p class="helper">${h.course} · ${h.date}</p></div>
    </div>
    <div class="grid two-col">
      <section class="card">
        <div class="alert red"><b>Recorded status:</b> ${h.status}</div>
        <div class="field"><label for="reason">Reason for request</label><textarea id="reason" placeholder="Explain why you believe this attendance record is incorrect."></textarea></div>
        <button class="btn primary" style="width:100%;margin-top:14px" onclick="submitCorrection(${i})">Submit request</button>
      </section>
      <aside class="card">
        <h3>What happens next?</h3>
        <p class="helper" style="margin-top:8px">The request becomes Pending and the lecturer can Approve or Reject it. A duplicate request for the same record is blocked.</p>
      </aside>
    </div>`;
}
function submitCorrection(i){
  const reason=document.getElementById('reason').value.trim();
  if(!reason){msg('Enter a reason before submitting');return}
  const h=state.studentHistory[i];
  const existing=state.corrections.find(c=>c.studentId===state.currentUser.studentId&&c.course===h.course&&c.date===h.date&&c.status==='Pending');
  if(existing){msg('A pending request already exists');return}
  state.corrections.push({
    id:Date.now(),student:state.currentUser.name,studentId:state.currentUser.studentId,
    course:h.course,date:h.date,from:h.status,to:h.status,reason,status:'Pending'
  });
  app.innerHTML=`
    <div class="pagehead">
      <button class="back" onclick="historyScreen()">←</button>
      <div><div class="eyebrow">FR-6</div><h2>Request submitted</h2></div>
    </div>
    <div class="card">
      <div class="alert green"><b>Status: Pending</b><div style="margin-top:6px">Your lecturer can now review the request.</div></div>
      <button class="btn primary" style="margin-top:14px" onclick="historyScreen()">Back to attendance</button>
    </div>`;
}

lecturerHome();
