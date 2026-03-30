import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

/* ── Google Fonts ── */
const fontLink = document.createElement('link')
fontLink.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap'
fontLink.rel = 'stylesheet'
document.head.appendChild(fontLink)

/* ── Global Styles ── */
const style = document.createElement('style')
style.textContent = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'DM Sans',sans-serif; background:#F4F3FF; color:#1a1a2e; }
  h1,h2,h3,h4 { font-family:'Sora',sans-serif; }
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-thumb { background:#c4c0ff; border-radius:8px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
  .fade { animation: fadeUp 0.4s ease both; }
  .pop { animation: popIn 0.3s cubic-bezier(.34,1.56,.64,1) both; }
  input,textarea { font-family:'DM Sans',sans-serif; }
  .row { display:flex; align-items:center; gap:12px; }
  .hovcard:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(108,99,255,0.15) !important; }
  .hovcard { transition: all 0.2s; }
  .navitem { display:flex;align-items:center;gap:10px;padding:11px 16px;border-radius:10px;cursor:pointer;color:#6b6b8a;font-size:14px;font-weight:500;transition:all 0.15s;text-decoration:none;margin-bottom:3px; }
  .navitem:hover { background:#F4F3FF; color:#6C63FF; }
  .navitem.active { background:rgba(108,99,255,0.1); color:#6C63FF; font-weight:700; }
  .star { cursor:pointer; font-size:17px; transition:opacity 0.15s; }
  .chkbox { width:20px;height:20px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;border:2px solid #ddd; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left;padding:12px 16px;font-size:11px;font-weight:700;color:#6b6b8a;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #eee;font-family:'Sora',sans-serif; }
  td { padding:13px 16px;border-bottom:1px solid #f0f0f0;font-size:14px; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:#fafafe; }
`
document.head.appendChild(style)

/* ── Storage Helpers ── */
const USERS_KEY = 'sf_users'
const SESSION_KEY = 'sf_session'
const dataKey = email => `sf_data_${email}`

function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') }
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)) }
function getData(email) {
  const raw = localStorage.getItem(dataKey(email))
  return raw ? JSON.parse(raw) : { courses: [] }
}
function saveData(email, data) { localStorage.setItem(dataKey(email), JSON.stringify(data)) }

/* ── Colors ── */
const COLORS = ['#6C63FF','#FF6584','#43C6AC','#FFB347','#A78BFA','#F472B6','#34D399','#60A5FA']

/* ── Helpers ── */
function daysUntil(d) {
  if (!d) return null
  return Math.ceil((new Date(d) - new Date()) / 86400000)
}
function courseProgress(course) {
  let t = 0, d = 0
  ;(course.subjects || []).forEach(s => (s.chapters || []).forEach(c => { t++; if (c.done) d++ }))
  return t === 0 ? 0 : Math.round(d / t * 100)
}

/* ════════════════════════════════════════════
   AUTH PAGE
════════════════════════════════════════════ */
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  const submit = () => {
    setErr('')
    if (!email || !pass || (mode === 'signup' && !name)) { setErr('Please fill all fields.'); return }
    const users = getUsers()
    if (mode === 'signup') {
      if (users.find(u => u.email === email)) { setErr('Email already registered.'); return }
      const u = { name, email, pass }
      saveUsers([...users, u])
      onLogin({ name, email })
    } else {
      const u = users.find(u => u.email === email && u.pass === pass)
      if (!u) { setErr('Invalid email or password.'); return }
      onLogin({ name: u.name, email })
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'linear-gradient(135deg,#6C63FF,#43C6AC)' }}>
      {/* Left */}
      <div className="fade" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:48, color:'white' }}>
        <div style={{ fontSize:56, marginBottom:12 }}>📚</div>
        <h1 style={{ fontSize:42, fontWeight:800, marginBottom:10 }}>StudyFlow</h1>
        <p style={{ fontSize:17, opacity:0.9, textAlign:'center', maxWidth:300, lineHeight:1.7 }}>Your personal study planner & tracker. Ace every exam. 🎯</p>
        <div style={{ marginTop:40, display:'flex', flexDirection:'column', gap:14 }}>
          {['📋 Track courses & chapters','📊 Visualize your progress','⏳ Countdown to exam day','✅ Done · Revise · Mock tracker'].map(f => (
            <div key={f} style={{ fontSize:15, opacity:0.92 }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="pop" style={{ width:460, background:'white', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 40px', boxShadow:'-8px 0 40px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>{mode === 'login' ? 'Welcome back 👋' : 'Create account ✨'}</h2>
        <p style={{ color:'#6b6b8a', marginBottom:28, fontSize:14 }}>{mode === 'login' ? 'Sign in to continue.' : 'Start tracking today.'}</p>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {mode === 'signup' && <Input label="Full Name" placeholder="Your name" value={name} onChange={setName} />}
          <Input label="Email" type="email" placeholder="you@email.com" value={email} onChange={setEmail} />
          <Input label="Password" type="password" placeholder="••••••••" value={pass} onChange={setPass} onEnter={submit} />
          {err && <div style={{ background:'#FFF0F3', border:'1px solid #FF6584', borderRadius:10, padding:'10px 14px', color:'#FF6584', fontSize:13 }}>⚠️ {err}</div>}
          <button onClick={submit} style={{ width:'100%', padding:15, background:'#6C63FF', color:'white', border:'none', borderRadius:50, fontFamily:'Sora', fontWeight:700, fontSize:15, cursor:'pointer', marginTop:6, boxShadow:'0 4px 16px rgba(108,99,255,0.3)' }}>
            {mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
          </button>
        </div>

        <p style={{ textAlign:'center', marginTop:22, color:'#6b6b8a', fontSize:14 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={{ color:'#6C63FF', fontWeight:700, cursor:'pointer' }} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr('') }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   LAYOUT
════════════════════════════════════════════ */
function Layout({ user, page, setPage, children }) {
  const nav = [['dashboard','🏠','Dashboard'],['courses','📚','My Courses'],['progress','📊','Progress']]
  const active = page === 'course' || page === 'subject' ? 'courses' : page

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <div style={{ width:250, background:'white', borderRight:'1px solid #eee', display:'flex', flexDirection:'column', padding:'24px 14px', position:'fixed', top:0, left:0, height:'100vh', zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36, paddingLeft:8 }}>
          <span style={{ fontSize:26 }}>📚</span>
          <span style={{ fontFamily:'Sora', fontWeight:800, fontSize:19, color:'#6C63FF' }}>StudyFlow</span>
        </div>
        <nav style={{ flex:1 }}>
          <p style={{ fontSize:10, fontWeight:700, color:'#aaa', textTransform:'uppercase', letterSpacing:1, paddingLeft:16, marginBottom:8 }}>Menu</p>
          {nav.map(([id, icon, label]) => (
            <div key={id} className={`navitem ${active === id ? 'active' : ''}`} onClick={() => setPage(id)}>
              <span style={{ fontSize:17 }}>{icon}</span><span>{label}</span>
            </div>
          ))}
        </nav>
        <div style={{ borderTop:'1px solid #eee', paddingTop:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#F4F3FF', borderRadius:12, marginBottom:8 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#6C63FF,#43C6AC)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:15, flexShrink:0 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{user.name}</div>
              <div style={{ fontSize:11, color:'#aaa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <div className="navitem" style={{ color:'#FF6584' }} onClick={() => { localStorage.removeItem(SESSION_KEY); window.location.reload() }}>
            <span>🚪</span><span>Sign Out</span>
          </div>
        </div>
      </div>
      {/* Main */}
      <main style={{ marginLeft:250, flex:1, padding:32, minHeight:'100vh' }}>{children}</main>
    </div>
  )
}

/* ════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════ */
function Dashboard({ user, setPage, setSelCourse }) {
  const [data, setData] = useState(() => getData(user.email))
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name:'', examDate:'', color:'#6C63FF' })
  const courses = data.courses || []
  const PALETTE = ['#6C63FF','#FF6584','#43C6AC','#FFB347','#A78BFA','#F472B6','#34D399']

  const addCourse = () => {
    if (!form.name.trim()) return
    const c = { id: Date.now(), name: form.name.trim(), examDate: form.examDate, color: form.color, subjects: [] }
    const updated = { ...data, courses: [...courses, c] }
    setData(updated); saveData(user.email, updated)
    setForm({ name:'', examDate:'', color:'#6C63FF' }); setModal(false)
  }
  const delCourse = id => {
    if (!confirm('Delete this course?')) return
    const updated = { ...data, courses: courses.filter(c => c.id !== id) }
    setData(updated); saveData(user.email, updated)
  }

  return (
    <div>
      <div className="row fade" style={{ justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800 }}>Hey, {user.name.split(' ')[0]} 👋</h1>
          <p style={{ color:'#6b6b8a', marginTop:2 }}>Here's your study overview.</p>
        </div>
        <Btn onClick={() => setModal(true)}>+ Add Course</Btn>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
        {[
          { icon:'📚', val: courses.length, label:'Total Courses', color:'#6C63FF' },
          { icon:'✅', val: courses.filter(c => courseProgress(c) === 100).length, label:'Completed', color:'#43C6AC' },
          { icon:'⏳', val: courses.filter(c => { const d = daysUntil(c.examDate); return d !== null && d >= 0 && d <= 7 }).length, label:'Exams This Week', color:'#FF6584' },
        ].map(s => (
          <div key={s.label} style={{ background:'white', borderRadius:16, padding:'18px 22px', border:'1px solid #eee', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:26, fontWeight:800, fontFamily:'Sora', color:s.color }}>{s.val}</div>
              <div style={{ fontSize:12, color:'#6b6b8a', fontWeight:500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses */}
      {courses.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'56px 32px' }}>
          <div style={{ fontSize:56, marginBottom:12 }}>📭</div>
          <h3 style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>No courses yet</h3>
          <p style={{ color:'#6b6b8a', marginBottom:20 }}>Add your first course to get started!</p>
          <Btn onClick={() => setModal(true)}>+ Add Course</Btn>
        </Card>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:18 }}>
          {courses.map(course => {
            const prog = courseProgress(course)
            const days = daysUntil(course.examDate)
            return (
              <div key={course.id} className="hovcard" onClick={() => { setSelCourse(course.id); setPage('course') }}
                style={{ background:'white', borderRadius:16, padding:22, border:'1px solid #eee', borderTop:`4px solid ${course.color}`, cursor:'pointer' }}>
                <div className="row" style={{ justifyContent:'space-between', marginBottom:10 }}>
                  <div>
                    <h3 style={{ fontWeight:700, fontSize:16 }}>{course.name}</h3>
                    <span style={{ fontSize:12, color:'#6b6b8a' }}>{course.subjects?.length || 0} subjects</span>
                  </div>
                  {days !== null && (
                    <div style={{ background:'linear-gradient(135deg,#FF6584,#FFB347)', color:'white', borderRadius:50, padding:'5px 12px', fontSize:12, fontWeight:700, whiteSpace:'nowrap' }}>
                      {days < 0 ? '🎉 Done!' : days === 0 ? '🔥 Today!' : `⏳ ${days}d`}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#6b6b8a', marginBottom:6 }}>
                  <span>Progress</span><span style={{ fontWeight:700, color:course.color }}>{prog}%</span>
                </div>
                <div style={{ height:7, background:'#eee', borderRadius:99, overflow:'hidden', marginBottom:12 }}>
                  <div style={{ height:'100%', width:`${prog}%`, background:course.color, borderRadius:99, transition:'width 0.5s' }} />
                </div>
                {course.examDate && <div style={{ fontSize:12, color:'#6b6b8a' }}>📅 {new Date(course.examDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>}
                <div className="row" style={{ justifyContent:'flex-end', marginTop:14 }}>
                  <button style={{ background:'#F4F3FF', color:'#6C63FF', border:'none', borderRadius:50, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}
                    onClick={e => { e.stopPropagation(); setSelCourse(course.id); setPage('course') }}>Open →</button>
                  <button style={{ background:'#FFF0F3', color:'#FF6584', border:'none', borderRadius:50, padding:'7px 12px', fontSize:13, cursor:'pointer' }}
                    onClick={e => { e.stopPropagation(); delCourse(course.id) }}>🗑</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title="Add New Course 📚" onClose={() => setModal(false)}>
          <Input label="Course Name *" placeholder="e.g. Mathematics, Physics..." value={form.name} onChange={v => setForm({...form,name:v})} />
          <div style={{ marginTop:14 }}>
            <Input label="Exam Date" type="date" value={form.examDate} onChange={v => setForm({...form,examDate:v})} />
          </div>
          <div style={{ marginTop:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'#6b6b8a', display:'block', marginBottom:10 }}>Color</label>
            <div className="row" style={{ flexWrap:'wrap' }}>
              {PALETTE.map(c => (
                <div key={c} onClick={() => setForm({...form,color:c})}
                  style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer', border: form.color===c ? '3px solid #1a1a2e' : '3px solid transparent', transform: form.color===c ? 'scale(1.2)' : 'scale(1)', transition:'all 0.15s' }} />
              ))}
            </div>
          </div>
          <div className="row" style={{ justifyContent:'flex-end', marginTop:22 }}>
            <GhostBtn onClick={() => setModal(false)}>Cancel</GhostBtn>
            <Btn onClick={addCourse}>Add Course</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════
   COURSE PAGE
════════════════════════════════════════════ */
function CoursePage({ user, courseId, setPage, setSelSubject }) {
  const [data, setData] = useState(() => getData(user.email))
  const [modal, setModal] = useState(false)
  const [subName, setSubName] = useState('')

  const course = (data.courses || []).find(c => c.id === courseId)
  if (!course) return <div style={{ padding:40 }}><Btn onClick={() => setPage('dashboard')}>← Back</Btn><p style={{ marginTop:16 }}>Course not found.</p></div>

  const subjects = course.subjects || []

  const saveUpdated = updated => { setData(updated); saveData(user.email, updated) }

  const addSubject = () => {
    if (!subName.trim()) return
    const s = { id: Date.now(), name: subName.trim(), chapters: [], notes: '' }
    const updCourse = { ...course, subjects: [...subjects, s] }
    saveUpdated({ ...data, courses: data.courses.map(c => c.id === courseId ? updCourse : c) })
    setSubName(''); setModal(false)
  }
  const delSubject = id => {
    if (!confirm('Delete subject?')) return
    const updCourse = { ...course, subjects: subjects.filter(s => s.id !== id) }
    saveUpdated({ ...data, courses: data.courses.map(c => c.id === courseId ? updCourse : c) })
  }

  const totalCh = subjects.reduce((a,s) => a + (s.chapters?.length||0), 0)
  const doneCh  = subjects.reduce((a,s) => a + (s.chapters?.filter(c=>c.done).length||0), 0)
  const overall = totalCh === 0 ? 0 : Math.round(doneCh/totalCh*100)

  const pieData = subjects.filter(s=>s.chapters?.length).map((s,i) => ({ name:s.name, value:s.chapters.length, color:COLORS[i%COLORS.length] }))
  const barData = subjects.map((s,i) => ({ name: s.name.length>9?s.name.slice(0,9)+'…':s.name, Done: s.chapters?.filter(c=>c.done).length||0, Total: s.chapters?.length||0, color:COLORS[i%COLORS.length] }))

  return (
    <div>
      <div className="row fade" style={{ justifyContent:'space-between', marginBottom:28 }}>
        <div className="row">
          <GhostBtn onClick={() => setPage('dashboard')}>← Back</GhostBtn>
          <div>
            <div className="row" style={{ gap:8 }}>
              <div style={{ width:12, height:12, borderRadius:'50%', background:course.color }} />
              <h1 style={{ fontSize:24, fontWeight:800 }}>{course.name}</h1>
            </div>
            {course.examDate && <p style={{ color:'#6b6b8a', fontSize:13, marginTop:2 }}>📅 Exam: {new Date(course.examDate).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>}
          </div>
        </div>
        <div className="row" style={{ gap:16 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'Sora', fontSize:30, fontWeight:800, color:course.color }}>{overall}%</div>
            <div style={{ fontSize:11, color:'#6b6b8a' }}>Overall</div>
          </div>
          <Btn onClick={() => setModal(true)}>+ Add Subject</Btn>
        </div>
      </div>

      {/* Charts */}
      {pieData.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:18, marginBottom:28 }}>
          <Card>
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>📊 Syllabus Breakdown</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v,n) => [v+' chapters', n]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
              {pieData.map((d,i) => (
                <div key={i} className="row" style={{ gap:5, fontSize:11, color:'#6b6b8a' }}>
                  <div style={{ width:8,height:8,borderRadius:'50%',background:d.color }} />{d.name}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>✅ Chapters Completed</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#6b6b8a' }} />
                <YAxis tick={{ fontSize:11, fill:'#6b6b8a' }} />
                <Tooltip />
                <Bar dataKey="Done" fill="#6C63FF" radius={[5,5,0,0]} />
                <Bar dataKey="Total" fill="#E8E6FF" radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Subjects */}
      <h2 style={{ fontSize:17, fontWeight:700, marginBottom:14 }}>Subjects</h2>
      {subjects.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'48px 32px' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📖</div>
          <h3 style={{ fontWeight:700, marginBottom:8 }}>No subjects yet</h3>
          <p style={{ color:'#6b6b8a', marginBottom:20 }}>Add subjects to track chapters.</p>
          <Btn onClick={() => setModal(true)}>+ Add Subject</Btn>
        </Card>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
          {subjects.map((s,i) => {
            const color = COLORS[i%COLORS.length]
            const done = s.chapters?.filter(c=>c.done).length||0
            const total = s.chapters?.length||0
            const prog = total===0?0:Math.round(done/total*100)
            return (
              <div key={s.id} className="hovcard" onClick={() => { setSelSubject({subjectId:s.id,courseId}); setPage('subject') }}
                style={{ background:'white', borderRadius:16, padding:20, border:'1px solid #eee', borderLeft:`4px solid ${color}`, cursor:'pointer' }}>
                <div className="row" style={{ justifyContent:'space-between', marginBottom:10 }}>
                  <h3 style={{ fontWeight:700, fontSize:15 }}>{s.name}</h3>
                  <button style={{ background:'none', border:'none', cursor:'pointer', color:'#FF6584', fontSize:15 }}
                    onClick={e => { e.stopPropagation(); delSubject(s.id) }}>🗑</button>
                </div>
                <div style={{ fontSize:12, color:'#6b6b8a', marginBottom:10 }}>{done}/{total} chapters done</div>
                <div style={{ height:6, background:'#eee', borderRadius:99, overflow:'hidden', marginBottom:8 }}>
                  <div style={{ height:'100%', width:`${prog}%`, background:color, borderRadius:99, transition:'width 0.5s' }} />
                </div>
                <div className="row" style={{ justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, color:'#6b6b8a' }}>{prog}%</span>
                  <span style={{ fontSize:12, color, fontWeight:600 }}>Open →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal title="Add Subject 📖" onClose={() => setModal(false)}>
          <Input label={`Subject for "${course.name}"`} placeholder="e.g. Algebra, Organic Chemistry..." value={subName} onChange={setSubName} onEnter={addSubject} />
          <div className="row" style={{ justifyContent:'flex-end', marginTop:20 }}>
            <GhostBtn onClick={() => setModal(false)}>Cancel</GhostBtn>
            <Btn onClick={addSubject}>Add Subject</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════
   SUBJECT PAGE
════════════════════════════════════════════ */
function SubjectPage({ user, subjectId, courseId, setPage }) {
  const [data, setData] = useState(() => getData(user.email))
  const [modal, setModal] = useState(false)
  const [chName, setChName] = useState('')

  const course  = (data.courses||[]).find(c=>c.id===courseId)
  const subject = course?.subjects?.find(s=>s.id===subjectId)
  if (!subject) return <div style={{ padding:40 }}><Btn onClick={()=>setPage('course')}>← Back</Btn></div>

  const chapters = subject.chapters || []

  const persist = updSubject => {
    const updCourse = { ...course, subjects: course.subjects.map(s=>s.id===subjectId?updSubject:s) }
    const updated = { ...data, courses: data.courses.map(c=>c.id===courseId?updCourse:c) }
    setData(updated); saveData(user.email, updated)
  }

  const updCh = (id, field, val) => persist({ ...subject, chapters: chapters.map(c=>c.id===id?{...c,[field]:val}:c) })
  const addCh = () => {
    if (!chName.trim()) return
    persist({ ...subject, chapters: [...chapters, { id:Date.now(), name:chName.trim(), done:false, revise:false, mock:false, confidence:0 }] })
    setChName(''); setModal(false)
  }
  const delCh = id => { if(confirm('Delete chapter?')) persist({ ...subject, chapters: chapters.filter(c=>c.id!==id) }) }
  const saveNotes = val => persist({ ...subject, notes: val })

  const done = chapters.filter(c=>c.done).length
  const revised = chapters.filter(c=>c.revise).length
  const mocked = chapters.filter(c=>c.mock).length
  const avgConf = chapters.length ? (chapters.reduce((a,c)=>a+(c.confidence||0),0)/chapters.length).toFixed(1) : 0

  const radData = [
    { name:'Done',    val: chapters.length?Math.round(done/chapters.length*100):0,    color:'#6C63FF' },
    { name:'Revised', val: chapters.length?Math.round(revised/chapters.length*100):0, color:'#43C6AC' },
    { name:'Mocked',  val: chapters.length?Math.round(mocked/chapters.length*100):0,  color:'#FFB347' },
  ]

  return (
    <div>
      <div className="row fade" style={{ justifyContent:'space-between', marginBottom:28 }}>
        <div className="row">
          <GhostBtn onClick={() => setPage('course')}>← Back</GhostBtn>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800 }}>{subject.name}</h1>
            <p style={{ color:'#6b6b8a', fontSize:13 }}>{course.name} · {chapters.length} chapters</p>
          </div>
        </div>
        <Btn onClick={() => setModal(true)}>+ Add Chapter</Btn>
      </div>

      {/* Top row */}
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:18, marginBottom:24 }}>
        {/* Stats card */}
        <Card>
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>📈 Progress Stats</h3>
          {radData.map(d => (
            <div key={d.name} style={{ marginBottom:14 }}>
              <div className="row" style={{ justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:13, color:'#6b6b8a' }}>{d.name}</span>
                <span style={{ fontSize:13, fontWeight:700, color:d.color }}>{d.val}%</span>
              </div>
              <div style={{ height:7, background:'#eee', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${d.val}%`, background:d.color, borderRadius:99, transition:'width 0.6s' }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop:'1px solid #eee', paddingTop:12, marginTop:4, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, color:'#6b6b8a' }}>Avg Confidence</span>
            <span style={{ fontSize:13, fontWeight:700, color:'#6C63FF' }}>{avgConf}/5 ⭐</span>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>📝 Notes & Comments</h3>
          <textarea defaultValue={subject.notes||''} onBlur={e=>saveNotes(e.target.value)}
            placeholder="Add notes, formulas, reminders..."
            style={{ width:'100%', height:150, padding:14, border:'2px solid #eee', borderRadius:12, fontSize:14, resize:'none', outline:'none', lineHeight:1.6, color:'#1a1a2e', fontFamily:'DM Sans,sans-serif' }} />
          <p style={{ fontSize:11, color:'#aaa', marginTop:5 }}>Auto-saved when you click away</p>
        </Card>
      </div>

      {/* Chapter table */}
      <Card style={{ padding:0, overflow:'hidden' }}>
        <div className="row" style={{ justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid #eee' }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>Chapter Tracker</h3>
          <div className="row" style={{ gap:8 }}>
            {[['#6C63FF',`${done} Done`],['#43C6AC',`${revised} Revised`],['#FFB347',`${mocked} Mocked`]].map(([c,l])=>(
              <span key={l} style={{ background:`${c}18`, color:c, borderRadius:50, padding:'4px 12px', fontSize:12, fontWeight:600 }}>{l}</span>
            ))}
          </div>
        </div>
        {chapters.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 32px' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
            <h3 style={{ fontWeight:700, marginBottom:8 }}>No chapters yet</h3>
            <p style={{ color:'#6b6b8a', marginBottom:20 }}>Add chapters to start tracking.</p>
            <Btn onClick={() => setModal(true)}>+ Add Chapter</Btn>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ paddingLeft:24 }}>Chapter</th>
                  <th style={{ textAlign:'center' }}>✅ Done</th>
                  <th style={{ textAlign:'center' }}>🔁 Revise</th>
                  <th style={{ textAlign:'center' }}>📝 Mock</th>
                  <th style={{ textAlign:'center' }}>⭐ Confidence</th>
                  <th style={{ textAlign:'center' }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map(ch => (
                  <tr key={ch.id}>
                    <td style={{ paddingLeft:24, fontWeight:500 }}>{ch.name}</td>
                    <td style={{ textAlign:'center' }}>
                      <div style={{ display:'flex', justifyContent:'center' }}>
                        <Checkbox checked={ch.done} color="#6C63FF" onChange={() => updCh(ch.id,'done',!ch.done)} />
                      </div>
                    </td>
                    <td style={{ textAlign:'center' }}>
                      <div style={{ display:'flex', justifyContent:'center' }}>
                        <Checkbox checked={ch.revise} color="#43C6AC" onChange={() => updCh(ch.id,'revise',!ch.revise)} />
                      </div>
                    </td>
                    <td style={{ textAlign:'center' }}>
                      <div style={{ display:'flex', justifyContent:'center' }}>
                        <Checkbox checked={ch.mock} color="#FFB347" onChange={() => updCh(ch.id,'mock',!ch.mock)} />
                      </div>
                    </td>
                    <td style={{ textAlign:'center' }}>
                      <div style={{ display:'flex', justifyContent:'center', gap:3 }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className="star" style={{ opacity: ch.confidence>=s?1:0.2 }}
                            onClick={() => updCh(ch.id,'confidence', ch.confidence===s?0:s)}>⭐</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign:'center' }}>
                      <button style={{ background:'none', border:'none', cursor:'pointer', color:'#FF6584', fontSize:15 }} onClick={() => delCh(ch.id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <Modal title="Add Chapter 📋" onClose={() => setModal(false)}>
          <Input label={`Chapter for "${subject.name}"`} placeholder="e.g. Chapter 1: Introduction..." value={chName} onChange={setChName} onEnter={addCh} />
          <div className="row" style={{ justifyContent:'flex-end', marginTop:20 }}>
            <GhostBtn onClick={() => setModal(false)}>Cancel</GhostBtn>
            <Btn onClick={addCh}>Add Chapter</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════
   PROGRESS PAGE
════════════════════════════════════════════ */
function ProgressPage({ user, setPage, setSelCourse }) {
  const data = getData(user.email)
  const courses = data.courses || []

  const stats = courses.map((course,i) => {
    let t=0,d=0,r=0,m=0,tc=0,cc=0
    ;(course.subjects||[]).forEach(s=>(s.chapters||[]).forEach(c=>{t++;if(c.done)d++;if(c.revise)r++;if(c.mock)m++;if(c.confidence){tc+=c.confidence;cc++}}))
    return { ...course, total:t, done:d, revised:r, mocked:m, prog:t?Math.round(d/t*100):0, avgConf:cc?(tc/cc).toFixed(1):0, daysLeft:daysUntil(course.examDate), barColor:COLORS[i%COLORS.length] }
  })

  const totals = stats.reduce((a,s) => ({ t:a.t+s.total, d:a.d+s.done, r:a.r+s.revised, m:a.m+s.mocked }), {t:0,d:0,r:0,m:0})

  return (
    <div>
      <div className="fade" style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800 }}>Progress Overview 📊</h1>
        <p style={{ color:'#6b6b8a', marginTop:2 }}>Track your performance across all courses.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {[
          { icon:'📋', val:totals.t, label:'Total Chapters', color:'#6C63FF' },
          { icon:'✅', val:totals.d, label:'Done', color:'#43C6AC' },
          { icon:'🔁', val:totals.r, label:'Revised', color:'#6C63FF' },
          { icon:'📝', val:totals.m, label:'Mocked', color:'#FFB347' },
        ].map(s => (
          <div key={s.label} style={{ background:'white', borderRadius:16, padding:'16px 20px', border:'1px solid #eee', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42,height:42,borderRadius:12,background:`${s.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:24,fontWeight:800,fontFamily:'Sora',color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11,color:'#6b6b8a',fontWeight:500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'56px 32px' }}>
          <div style={{ fontSize:56, marginBottom:12 }}>📭</div>
          <p style={{ color:'#6b6b8a', marginBottom:20 }}>No data yet. Add courses to see progress.</p>
          <Btn onClick={() => setPage('dashboard')}>Go to Dashboard</Btn>
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom:20 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Course Progress (%)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.map(s=>({ name:s.name.length>10?s.name.slice(0,10)+'…':s.name, Progress:s.prog, color:s.color }))}>
                <XAxis dataKey="name" tick={{ fontSize:12, fill:'#6b6b8a' }} />
                <YAxis domain={[0,100]} tick={{ fontSize:11, fill:'#6b6b8a' }} />
                <Tooltip formatter={v=>[`${v}%`,'Progress']} />
                <Bar dataKey="Progress" radius={[7,7,0,0]}>
                  {stats.map((s,i) => <Cell key={i} fill={s.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {stats.map(s => (
              <Card key={s.id} className="hovcard" style={{ borderLeft:`4px solid ${s.color}`, cursor:'pointer' }}
                onClick={() => { setSelCourse(s.id); setPage('course') }}>
                <div className="row" style={{ justifyContent:'space-between', marginBottom:14 }}>
                  <div>
                    <h3 style={{ fontWeight:700, fontSize:15 }}>{s.name}</h3>
                    <span style={{ fontSize:12, color:'#6b6b8a' }}>{s.subjects?.length||0} subjects · {s.total} chapters</span>
                  </div>
                  <div className="row" style={{ gap:12 }}>
                    {s.daysLeft !== null && (
                      <div style={{ background:'linear-gradient(135deg,#FF6584,#FFB347)', color:'white', borderRadius:50, padding:'5px 12px', fontSize:12, fontWeight:700 }}>
                        {s.daysLeft<0?'🎉 Done':s.daysLeft===0?'🔥 Today!': `⏳ ${s.daysLeft}d`}
                      </div>
                    )}
                    <div style={{ fontFamily:'Sora', fontSize:26, fontWeight:800, color:s.color }}>{s.prog}%</div>
                  </div>
                </div>
                <div style={{ height:7, background:'#eee', borderRadius:99, overflow:'hidden', marginBottom:12 }}>
                  <div style={{ height:'100%', width:`${s.prog}%`, background:s.color, borderRadius:99, transition:'width 0.5s' }} />
                </div>
                <div className="row" style={{ gap:20, flexWrap:'wrap' }}>
                  {[['✅ Done',s.done,s.total],['🔁 Revised',s.revised,s.total],['📝 Mocked',s.mocked,s.total]].map(([l,v,t])=>(
                    <span key={l} style={{ fontSize:12, color:'#6b6b8a' }}>{l}: <strong style={{ color:'#1a1a2e' }}>{v}/{t}</strong></span>
                  ))}
                  <span style={{ fontSize:12, color:'#6b6b8a' }}>⭐ Avg: <strong style={{ color:'#1a1a2e' }}>{s.avgConf}/5</strong></span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════
   REUSABLE COMPONENTS
════════════════════════════════════════════ */
function Card({ children, style, className }) {
  return <div className={className} style={{ background:'white', borderRadius:16, padding:22, border:'1px solid #eee', boxShadow:'0 2px 12px rgba(108,99,255,0.07)', ...style }}>{children}</div>
}
function Btn({ children, onClick, style }) {
  return <button onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'11px 22px', background:'#6C63FF', color:'white', border:'none', borderRadius:50, fontFamily:'Sora', fontWeight:600, fontSize:14, cursor:'pointer', boxShadow:'0 4px 14px rgba(108,99,255,0.28)', transition:'all 0.2s', ...style }}
    onMouseEnter={e=>e.currentTarget.style.background='#5a52e0'}
    onMouseLeave={e=>e.currentTarget.style.background='#6C63FF'}>{children}</button>
}
function GhostBtn({ children, onClick }) {
  return <button onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'11px 22px', background:'transparent', color:'#6C63FF', border:'2px solid #eee', borderRadius:50, fontFamily:'Sora', fontWeight:600, fontSize:14, cursor:'pointer', transition:'all 0.2s' }}
    onMouseEnter={e=>e.currentTarget.style.borderColor='#6C63FF'}
    onMouseLeave={e=>e.currentTarget.style.borderColor='#eee'}>{children}</button>
}
function Input({ label, type='text', placeholder, value, onChange, onEnter }) {
  return (
    <div>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'#6b6b8a', display:'block', marginBottom:6 }}>{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        onKeyDown={e=>e.key==='Enter'&&onEnter?.()}
        style={{ width:'100%', padding:'13px 16px', border:'2px solid #eee', borderRadius:12, fontSize:14, outline:'none', background:'#fafafe', color:'#1a1a2e', transition:'border 0.2s' }}
        onFocus={e=>e.target.style.borderColor='#6C63FF'}
        onBlur={e=>e.target.style.borderColor='#eee'} />
    </div>
  )
}
function Checkbox({ checked, color, onChange }) {
  return (
    <div className="chkbox" style={{ background:checked?color:'transparent', borderColor:checked?color:'#ddd' }} onClick={onChange}>
      {checked && <span style={{ color:'white', fontSize:12, fontWeight:700 }}>✓</span>}
    </div>
  )
}
function Modal({ title, children, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(26,26,46,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }}
      onClick={onClose}>
      <div className="pop" style={{ background:'white', borderRadius:20, padding:32, width:460, maxWidth:'94vw', boxShadow:'0 24px 60px rgba(0,0,0,0.18)' }}
        onClick={e=>e.stopPropagation()}>
        <h3 style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>{title}</h3>
        <div style={{ marginTop:16 }}>{children}</div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   ROOT APP
════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem(SESSION_KEY)
    return s ? JSON.parse(s) : null
  })
  const [page, setPage] = useState('dashboard')
  const [selCourse, setSelCourse] = useState(null)
  const [selSubject, setSelSubject] = useState(null)

  const login = u => { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); setUser(u) }

  if (!user) return <AuthPage onLogin={login} />

  const renderPage = () => {
    if (page === 'course' && selCourse)   return <CoursePage user={user} courseId={selCourse} setPage={setPage} setSelSubject={setSelSubject} />
    if (page === 'subject' && selSubject) return <SubjectPage user={user} subjectId={selSubject.subjectId} courseId={selSubject.courseId} setPage={setPage} />
    if (page === 'progress')              return <ProgressPage user={user} setPage={setPage} setSelCourse={setSelCourse} />
    return <Dashboard user={user} setPage={setPage} setSelCourse={setSelCourse} />
  }

  return (
    <Layout user={user} page={page} setPage={setPage}>
      {renderPage()}
    </Layout>
  )
}



