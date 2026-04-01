import { useState, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

/* ── Fonts ── */
const fl = document.createElement('link')
fl.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap'
fl.rel = 'stylesheet'
document.head.appendChild(fl)

/* ── CSS ── */
const st = document.createElement('style')
st.textContent = `
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;}
h1,h2,h3,h4{font-family:'Sora',sans-serif;}
input,textarea,button,select{font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:#c4c0ff;border-radius:8px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
@keyframes timerRing{0%,100%{box-shadow:0 0 0 0 rgba(108,99,255,0.5)}70%{box-shadow:0 0 0 20px rgba(108,99,255,0)}}
.fade{animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;}
.fade2{animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) 0.08s both;}
.fade3{animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) 0.16s both;}
.pop{animation:popIn 0.3s cubic-bezier(.34,1.56,.64,1) both;}
.hov{transition:transform 0.18s,box-shadow 0.18s;}
.hov:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(108,99,255,0.14)!important;}
.navitem{display:flex;align-items:center;gap:10px;padding:11px 16px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:500;transition:all 0.15s;margin-bottom:3px;}
.chk{width:20px;height:20px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;}
.star{cursor:pointer;font-size:16px;transition:transform 0.1s;display:inline-block;}
.star:hover{transform:scale(1.3);}
table{width:100%;border-collapse:collapse;}
th{text-align:left;padding:11px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;font-family:'Sora',sans-serif;}
td{padding:12px 16px;font-size:14px;}
.tab-btn{padding:7px 18px;border-radius:50px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.18s;font-family:'Sora',sans-serif;}
.cal-day{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;margin:0 auto;transition:all 0.15s;}
.timer-pulse{animation:timerRing 1.5s infinite;}
`
document.head.appendChild(st)

/* ── Theme ── */
const THEMES = {
  light:{'--bg':'#F4F3FF','--bg2':'#FAFAFE','--card':'#FFFFFF','--text':'#1a1a2e','--text2':'#6b6b8a','--border':'#EEECFF','--hover':'#FAFAFE','--sidebar':'#FFFFFF','--input':'#F4F3FF','--shadow':'0 2px 16px rgba(108,99,255,0.08)','--primary':'#6C63FF','--accent':'#FF6584','--success':'#43C6AC','--warning':'#FFB347'},
  dark:{'--bg':'#0f0f1a','--bg2':'#1a1a2e','--card':'#1e1e30','--text':'#e8e6ff','--text2':'#9b99b8','--border':'#2e2e48','--hover':'#252540','--sidebar':'#15152a','--input':'#252540','--shadow':'0 2px 16px rgba(0,0,0,0.4)','--primary':'#7B74FF','--accent':'#FF6584','--success':'#43C6AC','--warning':'#FFB347'}
}
function applyTheme(t){Object.entries(THEMES[t]).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));document.body.style.background=THEMES[t]['--bg'];document.body.style.color=THEMES[t]['--text']}

/* ── Storage ── */
const SESS='sf_sess'
const dataKey=e=>`sf_data_${e}`
const getUsers=()=>JSON.parse(localStorage.getItem('sf_users')||'[]')
const saveUsers=u=>localStorage.setItem('sf_users',JSON.stringify(u))
const getData=e=>{try{return JSON.parse(localStorage.getItem(dataKey(e)))||{courses:[],planner:[],sessions:[],pomoBg:'gradient1',pomoSession:25,pomoBreak:5,theme:'light',dailyGoal:120,weeklyGoal:600}}catch{return{courses:[],planner:[],sessions:[],pomoBg:'gradient1',pomoSession:25,pomoBreak:5,theme:'light',dailyGoal:120,weeklyGoal:600}}}
const saveData=(e,d)=>localStorage.setItem(dataKey(e),JSON.stringify(d))

/* ── Constants ── */
const COLORS=['#6C63FF','#FF6584','#43C6AC','#FFB347','#A78BFA','#F472B6','#34D399','#60A5FA']
const POMO_BGS={gradient1:'linear-gradient(135deg,#667eea,#764ba2)',gradient2:'linear-gradient(135deg,#f093fb,#f5576c)',gradient3:'linear-gradient(135deg,#4facfe,#00f2fe)',gradient4:'linear-gradient(135deg,#43e97b,#38f9d7)',solid1:'#1a1a2e',solid2:'#2d1b69',solid3:'#0f3460',solid4:'#16213e',lofi1:'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80) center/cover',lofi2:'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80) center/cover',lofi3:'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80) center/cover'}
const BG_LABELS={gradient1:'Purple Dream',gradient2:'Pink Sunset',gradient3:'Ocean Blue',gradient4:'Mint Fresh',solid1:'Midnight',solid2:'Deep Purple',solid3:'Navy',solid4:'Dark Blue',lofi1:'Mountain Night',lofi2:'Mountain Lake',lofi3:'Forest'}

const daysUntil=d=>{if(!d)return null;return Math.ceil((new Date(d)-new Date())/86400000)}
const courseProgress=c=>{let t=0,d=0;(c.subjects||[]).forEach(s=>(s.chapters||[]).forEach(ch=>{t++;if(ch.done)d++}));return t?Math.round(d/t*100):0}
const fmtTime=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']

/* ════════ AUTH ════════ */
function AuthPage({onLogin}){
  const[mode,setMode]=useState('login')
  const[name,setName]=useState('')
  const[email,setEmail]=useState('')
  const[pass,setPass]=useState('')
  const[err,setErr]=useState('')
  useEffect(()=>{applyTheme('light')},[])
  const submit=()=>{
    setErr('')
    if(!email||!pass||(mode==='signup'&&!name)){setErr('Please fill all fields.');return}
    const users=getUsers()
    if(mode==='signup'){
      if(users.find(u=>u.email===email)){setErr('Email already registered.');return}
      saveUsers([...users,{name,email,pass}]);onLogin({name,email})
    }else{
      const u=users.find(u=>u.email===email&&u.pass===pass)
      if(!u){setErr('Invalid email or password.');return}
      onLogin({name:u.name,email})
    }
  }
  return(
    <div style={{minHeight:'100vh',display:'flex',background:'linear-gradient(135deg,#6C63FF,#43C6AC)'}}>
      <div className="fade" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:48,color:'white'}}>
        <div style={{fontSize:56,marginBottom:12}}>📚</div>
        <h1 style={{fontSize:42,fontWeight:800,marginBottom:10}}>StudyFlow</h1>
        <p style={{fontSize:17,opacity:0.9,textAlign:'center',maxWidth:300,lineHeight:1.7}}>Your personal study planner & tracker. Ace every exam. 🎯</p>
        <div style={{marginTop:40,display:'flex',flexDirection:'column',gap:14}}>
          {['📋 Track courses & chapters','📊 Visualize your progress','⏳ Countdown to exam day','🍅 Pomodoro focus timer','✅ Done · Revise · Mock tracker'].map(f=><div key={f} style={{fontSize:15,opacity:0.92}}>{f}</div>)}
        </div>
      </div>
      <div className="pop" style={{width:460,background:'white',display:'flex',flexDirection:'column',justifyContent:'center',padding:'48px 40px',boxShadow:'-8px 0 40px rgba(0,0,0,0.1)'}}>
        <h2 style={{fontSize:26,fontWeight:800,marginBottom:6,color:'#1a1a2e'}}>{mode==='login'?'Welcome back 👋':'Create account ✨'}</h2>
        <p style={{color:'#6b6b8a',marginBottom:28,fontSize:14}}>{mode==='login'?'Sign in to continue.':'Start tracking today.'}</p>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {mode==='signup'&&<SI label="Full Name" placeholder="Your name" value={name} onChange={setName}/>}
          <SI label="Email" type="email" placeholder="you@email.com" value={email} onChange={setEmail}/>
          <SI label="Password" type="password" placeholder="••••••••" value={pass} onChange={setPass} onEnter={submit}/>
          {err&&<div style={{background:'#FFF0F3',border:'1px solid #FF6584',borderRadius:10,padding:'10px 14px',color:'#FF6584',fontSize:13}}>⚠️ {err}</div>}
          <Btn onClick={submit} style={{width:'100%',justifyContent:'center',padding:15,fontSize:15,marginTop:4}}>{mode==='login'?'🚀 Sign In':'✨ Create Account'}</Btn>
        </div>
        <p style={{textAlign:'center',marginTop:22,color:'#6b6b8a',fontSize:14}}>
          {mode==='login'?"Don't have an account? ":"Already have an account? "}
          <span style={{color:'#6C63FF',fontWeight:700,cursor:'pointer'}} onClick={()=>{setMode(mode==='login'?'signup':'login');setErr('')}}>{mode==='login'?'Sign up':'Sign in'}</span>
        </p>
      </div>
    </div>
  )
}

/* ════════ LAYOUT ════════ */
function Layout({user,page,setPage,theme,setTheme,data,saveD,children}){
  const nav=[['dashboard','🏠','Dashboard'],['courses','📚','My Courses'],['progress','📊','Progress'],['pomodoro','🍅','Pomodoro']]
  const active=page==='course'||page==='subject'?'courses':page
  return(
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
      <div style={{width:252,background:'var(--sidebar)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',padding:'22px 14px',position:'fixed',top:0,left:0,height:'100vh',zIndex:100,transition:'background 0.3s'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:32,paddingLeft:8}}>
          <span style={{fontSize:26}}>📚</span>
          <span style={{fontFamily:'Sora',fontWeight:800,fontSize:19,color:'var(--primary)'}}>StudyFlow</span>
        </div>
        <nav style={{flex:1}}>
          <p style={{fontSize:10,fontWeight:700,color:'var(--text2)',textTransform:'uppercase',letterSpacing:1,paddingLeft:16,marginBottom:8}}>Menu</p>
          {nav.map(([id,icon,label])=>(
            <div key={id} className="navitem" style={{color:active===id?'var(--primary)':'var(--text2)',background:active===id?'rgba(108,99,255,0.1)':'transparent',fontWeight:active===id?700:500}} onClick={()=>setPage(id)}>
              <span style={{fontSize:17}}>{icon}</span><span>{label}</span>
            </div>
          ))}
        </nav>
        <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:600,color:'var(--text2)'}}>🌙 Dark Mode</span>
            <div onClick={()=>{const t=theme==='light'?'dark':'light';setTheme(t);applyTheme(t);saveD({...data,theme:t})}}
              style={{width:40,height:22,borderRadius:50,background:theme==='dark'?'var(--primary)':'#ddd',cursor:'pointer',position:'relative',transition:'background 0.3s'}}>
              <div style={{width:18,height:18,borderRadius:'50%',background:'white',position:'absolute',top:2,left:theme==='dark'?20:2,transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'var(--bg)',borderRadius:12,marginBottom:8}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#6C63FF,#43C6AC)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:15,flexShrink:0}}>{user.name?.[0]?.toUpperCase()}</div>
            <div style={{overflow:'hidden'}}>
              <div style={{fontWeight:600,fontSize:13,color:'var(--text)'}}>{user.name}</div>
              <div style={{fontSize:11,color:'var(--text2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email}</div>
            </div>
          </div>
          <div className="navitem" style={{color:'#FF6584'}} onClick={()=>{localStorage.removeItem(SESS);window.location.reload()}}>
            <span>🚪</span><span>Sign Out</span>
          </div>
        </div>
      </div>
      <main style={{marginLeft:252,flex:1,padding:32,minHeight:'100vh',background:'var(--bg)',transition:'background 0.3s'}}>{children}</main>
    </div>
  )
}

/* ════════ DASHBOARD ════════ */
function Dashboard({user,data,saveD,setPage,setSelCourse}){
  const[plannerView,setPlannerView]=useState('daily')
  const[newTask,setNewTask]=useState('')
  const[calMonth,setCalMonth]=useState(new Date().getMonth())
  const[calYear,setCalYear]=useState(new Date().getFullYear())
  const courses=data.courses||[]
  const planner=data.planner||[]
  const now=new Date()
  const today=now.toISOString().split('T')[0]
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate()
  const firstDay=new Date(calYear,calMonth,1).getDay()

  // Exam dates on calendar
  const examDates={}
  courses.forEach(c=>(c.exams||[]).forEach(ex=>{
    if(ex.date){const d=new Date(ex.date);if(d.getMonth()===calMonth&&d.getFullYear()===calYear){const day=d.getDate();if(!examDates[day])examDates[day]=[];examDates[day].push({name:ex.name,course:c.name,color:c.color||'#FF6584'})}}
  }))

  // Study days
  const studyDays=new Set((data.sessions||[]).map(s=>s.date?.split('T')[0]))

  // Nearest exam
  let nearestExam=null,nearestDays=Infinity
  courses.forEach(c=>(c.exams||[]).forEach(ex=>{if(ex.date){const d=daysUntil(ex.date);if(d!==null&&d>=0&&d<nearestDays){nearestDays=d;nearestExam={...ex,courseName:c.name,color:c.color}}}}))

  // Planner
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-now.getDay())
  const weekEnd=new Date(weekStart);weekEnd.setDate(weekStart.getDate()+6)
  const todayTasks=planner.filter(t=>t.date===today)
  const weekTasks=planner.filter(t=>{const d=new Date(t.date);return d>=weekStart&&d<=weekEnd})
  const shownTasks=plannerView==='daily'?todayTasks:weekTasks

  const addTask=()=>{if(!newTask.trim())return;saveD({...data,planner:[...planner,{id:Date.now(),text:newTask.trim(),done:false,date:today}]});setNewTask('')}
  const toggleTask=id=>saveD({...data,planner:planner.map(t=>t.id===id?{...t,done:!t.done}:t)})
  const delTask=id=>saveD({...data,planner:planner.filter(t=>t.id!==id)})

  // Goals
  const dailyGoal=data.dailyGoal||120,weeklyGoal=data.weeklyGoal||600
  const todaySessions=(data.sessions||[]).filter(s=>s.date?.split('T')[0]===today)
  const todayMins=todaySessions.reduce((a,s)=>a+(s.mins||0),0)
  const weekSessions=(data.sessions||[]).filter(s=>{const d=new Date(s.date);return d>=weekStart&&d<=weekEnd})
  const weekMins=weekSessions.reduce((a,s)=>a+(s.mins||0),0)

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}} className="fade">
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)'}}>Hey, {user.name.split(' ')[0]} 👋</h1>
          <p style={{color:'var(--text2)',marginTop:2,fontSize:14}}>{now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <Btn onClick={()=>setPage('courses')}>+ Add Course</Btn>
      </div>

      {/* Row 1: Calendar + Nearest Exam + Goals */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:18,marginBottom:20}}>
        {/* Calendar */}
        <Card className="fade">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <h3 style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>📅 {MONTHS[calMonth]} {calYear}</h3>
            <div style={{display:'flex',gap:5}}>
              <button onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1)}} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,width:24,height:24,cursor:'pointer',color:'var(--text)',fontSize:12}}>‹</button>
              <button onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1)}} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,width:24,height:24,cursor:'pointer',color:'var(--text)',fontSize:12}}>›</button>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1,marginBottom:4}}>
            {['S','M','T','W','T','F','S'].map((d,i)=><div key={i} style={{textAlign:'center',fontSize:10,fontWeight:700,color:'var(--text2)',padding:'3px 0'}}>{d}</div>)}
            {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`}/>)}
            {Array(daysInMonth).fill(null).map((_,i)=>{
              const day=i+1
              const isToday=day===now.getDate()&&calMonth===now.getMonth()&&calYear===now.getFullYear()
              const hasExam=examDates[day]
              const dateStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const studied=studyDays.has(dateStr)
              return(
                <div key={day} className="cal-day" title={hasExam?hasExam.map(e=>`${e.name} (${e.course})`).join(', '):''}
                  style={{background:isToday?'var(--primary)':hasExam?hasExam[0].color:studied?'rgba(67,198,172,0.2)':'transparent',color:isToday||hasExam?'white':'var(--text)',fontWeight:isToday?800:hasExam?700:400,fontSize:11}}>
                  {day}
                </div>
              )
            })}
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:8}}>
            {[['var(--primary)','Today'],['#FF6584','Exam'],['rgba(67,198,172,0.5)','Studied']].map(([c,l])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'var(--text2)'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:c}}/>{l}
              </div>
            ))}
          </div>
        </Card>

        {/* Nearest Exam */}
        <Card className="fade2">
          <h3 style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:14}}>⏳ Next Exam</h3>
          {nearestExam?(
            <div style={{textAlign:'center',padding:'4px 0'}}>
              <div style={{fontSize:54,fontWeight:800,fontFamily:'Sora',color:nearestExam.color||'var(--primary)',lineHeight:1}}>{nearestDays}</div>
              <div style={{fontSize:13,color:'var(--text2)',marginTop:4,marginBottom:12}}>days left</div>
              <div style={{background:'var(--bg)',borderRadius:12,padding:'10px 14px',textAlign:'left'}}>
                <div style={{fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:2}}>{nearestExam.name}</div>
                <div style={{fontSize:12,color:'var(--text2)'}}>{nearestExam.courseName}</div>
                <div style={{fontSize:11,color:'var(--text2)',marginTop:3}}>📅 {new Date(nearestExam.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
              </div>
              {nearestDays<=3&&<div style={{marginTop:10,background:'#FFF0F3',color:'#FF6584',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:600}}>🔥 Exam very soon!</div>}
            </div>
          ):(
            <div style={{textAlign:'center',padding:'20px 0',color:'var(--text2)'}}>
              <div style={{fontSize:36,marginBottom:8}}>🎉</div>
              <p style={{fontSize:13}}>No upcoming exams</p>
              <p style={{fontSize:11,marginTop:4}}>Add exams to your courses!</p>
            </div>
          )}
        </Card>

        {/* Goals */}
        <Card className="fade3">
          <h3 style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:14}}>🎯 Study Goals</h3>
          {[{label:'Daily Goal',cur:todayMins,goal:dailyGoal,color:'var(--primary)'},{label:'Weekly Goal',cur:weekMins,goal:weeklyGoal,color:'var(--success)'}].map(g=>(
            <div key={g.label} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:12,color:'var(--text2)'}}>{g.label}</span>
                <span style={{fontSize:12,fontWeight:700,color:g.color}}>{g.cur}/{g.goal} min</span>
              </div>
              <div style={{height:7,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min(g.cur/g.goal*100,100)}%`,background:g.color,borderRadius:99,transition:'width 0.6s'}}/>
              </div>
            </div>
          ))}
          <div style={{display:'flex',gap:8}}>
            <div style={{flex:1,background:'var(--bg)',borderRadius:10,padding:'8px 10px',textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:800,color:'var(--primary)',fontFamily:'Sora'}}>{todaySessions.length}</div>
              <div style={{fontSize:10,color:'var(--text2)'}}>Today</div>
            </div>
            <div style={{flex:1,background:'var(--bg)',borderRadius:10,padding:'8px 10px',textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:800,color:'var(--success)',fontFamily:'Sora'}}>{weekSessions.length}</div>
              <div style={{fontSize:10,color:'var(--text2)'}}>This Week</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Planner + Course Progress */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:18}}>
        <Card>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <h3 style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>📋 Planner</h3>
            <div style={{display:'flex',gap:3,background:'var(--bg)',borderRadius:50,padding:3}}>
              {['daily','weekly'].map(v=>(
                <button key={v} className="tab-btn" onClick={()=>setPlannerView(v)}
                  style={{background:plannerView===v?'var(--primary)':'transparent',color:plannerView===v?'white':'var(--text2)',padding:'5px 12px',fontSize:12}}>
                  {v==='daily'?'Today':'Week'}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTask()}
              placeholder="Add a task..." style={{flex:1,padding:'8px 12px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:13,outline:'none'}}
              onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            <button onClick={addTask} style={{padding:'8px 14px',background:'var(--primary)',color:'white',border:'none',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:14}}>+</button>
          </div>
          <div style={{maxHeight:220,overflowY:'auto',display:'flex',flexDirection:'column',gap:5}}>
            {shownTasks.length===0?(
              <div style={{textAlign:'center',padding:'20px 0',color:'var(--text2)',fontSize:13}}>{plannerView==='daily'?'No tasks today! 🎉':'No tasks this week.'}</div>
            ):shownTasks.map(t=>(
              <div key={t.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',background:'var(--bg)',borderRadius:10,opacity:t.done?0.5:1}}>
                <div className="chk" style={{background:t.done?'var(--primary)':'transparent',borderColor:t.done?'var(--primary)':'#ddd',border:'2px solid'}} onClick={()=>toggleTask(t.id)}>
                  {t.done&&<span style={{color:'white',fontSize:11,fontWeight:700}}>✓</span>}
                </div>
                <span style={{flex:1,fontSize:13,color:'var(--text)',textDecoration:t.done?'line-through':'none'}}>{t.text}</span>
                {plannerView==='weekly'&&<span style={{fontSize:10,color:'var(--text2)'}}>{new Date(t.date+'T12:00').toLocaleDateString('en-IN',{weekday:'short'})}</span>}
                <button onClick={()=>delTask(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text2)',fontSize:14}}>×</button>
              </div>
            ))}
          </div>
          <div style={{marginTop:8,fontSize:11,color:'var(--text2)',textAlign:'right'}}>{shownTasks.filter(t=>t.done).length}/{shownTasks.length} done</div>
        </Card>

        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h3 style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>📚 Course Progress</h3>
            <button onClick={()=>setPage('courses')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--primary)',fontSize:13,fontWeight:600}}>View all →</button>
          </div>
          {courses.length===0?(
            <div style={{textAlign:'center',padding:'28px 0',color:'var(--text2)'}}>
              <div style={{fontSize:36,marginBottom:8}}>📭</div>
              <p style={{fontSize:13}}>No courses yet. <span style={{color:'var(--primary)',cursor:'pointer',fontWeight:600}} onClick={()=>setPage('courses')}>Add one →</span></p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:10,maxHeight:260,overflowY:'auto'}}>
              {courses.map((c,i)=>{
                const prog=courseProgress(c)
                const nearExam=(c.exams||[]).filter(e=>daysUntil(e.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date))[0]
                const days=nearExam?daysUntil(nearExam.date):null
                return(
                  <div key={c.id} className="hov" onClick={()=>{setSelCourse(c.id);setPage('course')}}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'var(--bg)',borderRadius:12,cursor:'pointer',border:'1px solid var(--border)'}}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:c.color||COLORS[i%COLORS.length],flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:13,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</span>
                        <span style={{fontSize:12,fontWeight:700,color:c.color||COLORS[i%COLORS.length],flexShrink:0,marginLeft:8}}>{prog}%</span>
                      </div>
                      <div style={{height:5,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${prog}%`,background:c.color||COLORS[i%COLORS.length],borderRadius:99,transition:'width 0.5s'}}/>
                      </div>
                    </div>
                    {days!==null&&(
                      <div style={{background:days<=3?'#FF6584':days<=7?'#FFB347':'var(--primary)',color:'white',borderRadius:50,padding:'3px 8px',fontSize:11,fontWeight:700,flexShrink:0}}>
                        {days===0?'Today!':days<0?'Done':`${days}d`}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ════════ COURSES ════════ */
function CoursesPage({user,data,saveD,setPage,setSelCourse}){
  const[modal,setModal]=useState(false)
  const[form,setForm]=useState({name:'',color:'#6C63FF'})
  const courses=data.courses||[]
  const PALETTE=['#6C63FF','#FF6584','#43C6AC','#FFB347','#A78BFA','#F472B6','#34D399','#60A5FA']
  const addCourse=()=>{if(!form.name.trim())return;const c={id:Date.now(),name:form.name.trim(),color:form.color,subjects:[],exams:[]};saveD({...data,courses:[...courses,c]});setForm({name:'',color:'#6C63FF'});setModal(false)}
  const delCourse=id=>{if(!confirm('Delete?'))return;saveD({...data,courses:courses.filter(c=>c.id!==id)})}
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}} className="fade">
        <div><h1 style={{fontSize:26,fontWeight:800,color:'var(--text)'}}>My Courses</h1><p style={{color:'var(--text2)',marginTop:2,fontSize:14}}>{courses.length} courses</p></div>
        <Btn onClick={()=>setModal(true)}>+ Add Course</Btn>
      </div>
      {courses.length===0?(
        <Card style={{textAlign:'center',padding:'56px 32px'}} className="fade2">
          <div style={{fontSize:56,marginBottom:12}}>📭</div>
          <h3 style={{fontWeight:700,fontSize:18,marginBottom:8,color:'var(--text)'}}>No courses yet</h3>
          <Btn onClick={()=>setModal(true)}>+ Add Course</Btn>
        </Card>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {courses.map((c,i)=>{
            const prog=courseProgress(c)
            const nearExam=(c.exams||[]).filter(e=>daysUntil(e.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date))[0]
            const days=nearExam?daysUntil(nearExam.date):null
            return(
              <div key={c.id} className="hov" onClick={()=>{setSelCourse(c.id);setPage('course')}}
                style={{background:'var(--card)',borderRadius:16,padding:20,border:'1px solid var(--border)',borderTop:`4px solid ${c.color}`,cursor:'pointer',boxShadow:'var(--shadow)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div><h3 style={{fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:2}}>{c.name}</h3><span style={{fontSize:12,color:'var(--text2)'}}>{c.subjects?.length||0} subjects · {(c.exams||[]).length} exams</span></div>
                  {days!==null&&<div style={{background:days<=3?'#FF6584':days<=7?'#FFB347':'var(--primary)',color:'white',borderRadius:50,padding:'4px 10px',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{days===0?'🔥 Today!':days<0?'🎉 Done':`⏳ ${days}d`}</div>}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text2)',marginBottom:5}}><span>Progress</span><span style={{fontWeight:700,color:c.color}}>{prog}%</span></div>
                <div style={{height:6,background:'var(--border)',borderRadius:99,overflow:'hidden',marginBottom:12}}><div style={{height:'100%',width:`${prog}%`,background:c.color,borderRadius:99,transition:'width 0.5s'}}/></div>
                <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                  <button style={{background:'var(--bg)',color:'var(--primary)',border:'1px solid var(--border)',borderRadius:50,padding:'6px 14px',fontSize:12,fontWeight:600,cursor:'pointer'}} onClick={e=>{e.stopPropagation();setSelCourse(c.id);setPage('course')}}>Open →</button>
                  <button style={{background:'#FFF0F3',color:'#FF6584',border:'none',borderRadius:50,padding:'6px 11px',fontSize:12,cursor:'pointer'}} onClick={e=>{e.stopPropagation();delCourse(c.id)}}>🗑</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {modal&&(
        <Modal title="Add New Course 📚" onClose={()=>setModal(false)}>
          <SI label="Course Name *" placeholder="e.g. Mathematics, Physics..." value={form.name} onChange={v=>setForm({...form,name:v})}/>
          <div style={{marginTop:14}}>
            <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:10}}>Color</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{PALETTE.map(c=><div key={c} onClick={()=>setForm({...form,color:c})} style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',border:form.color===c?'3px solid var(--text)':'3px solid transparent',transform:form.color===c?'scale(1.2)':'scale(1)',transition:'all 0.15s'}}/>)}</div>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}><GBtn onClick={()=>setModal(false)}>Cancel</GBtn><Btn onClick={addCourse}>Add Course</Btn></div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ COURSE DETAIL ════════ */
function CoursePage({user,courseId,data,saveD,setPage,setSelSubject}){
  const[tab,setTab]=useState('subjects')
  const[subModal,setSubModal]=useState(false)
  const[examModal,setExamModal]=useState(false)
  const[subName,setSubName]=useState('')
  const[examForm,setExamForm]=useState({name:'',date:'',chapters:{}})
  const course=(data.courses||[]).find(c=>c.id===courseId)
  if(!course)return <div style={{padding:40}}><Btn onClick={()=>setPage('courses')}>← Back</Btn></div>
  const subjects=course.subjects||[],exams=course.exams||[]
  const upd=updC=>saveD({...data,courses:data.courses.map(c=>c.id===courseId?updC:c)})
  const addSubject=()=>{if(!subName.trim())return;upd({...course,subjects:[...subjects,{id:Date.now(),name:subName.trim(),chapters:[],notes:''}]});setSubName('');setSubModal(false)}
  const delSubject=id=>{if(!confirm('Delete?'))return;upd({...course,subjects:subjects.filter(s=>s.id!==id)})}
  const addExam=()=>{if(!examForm.name.trim()||!examForm.date)return;upd({...course,exams:[...exams,{id:Date.now(),name:examForm.name.trim(),date:examForm.date,chapters:examForm.chapters}]});setExamForm({name:'',date:'',chapters:{}});setExamModal(false)}
  const delExam=id=>{if(!confirm('Delete exam?'))return;upd({...course,exams:exams.filter(e=>e.id!==id)})}
  const toggleExCh=(sId,chId)=>{const k=`${sId}_${chId}`;setExamForm(f=>({...f,chapters:{...f.chapters,[k]:!f.chapters[k]}}))}
  const totalCh=subjects.reduce((a,s)=>a+(s.chapters?.length||0),0)
  const doneCh=subjects.reduce((a,s)=>a+(s.chapters?.filter(c=>c.done).length||0),0)
  const overall=totalCh?Math.round(doneCh/totalCh*100):0
  const pieData=subjects.filter(s=>s.chapters?.length).map((s,i)=>({name:s.name,value:s.chapters.length,color:COLORS[i%COLORS.length]}))
  const barData=subjects.map((s,i)=>({name:s.name.length>8?s.name.slice(0,8)+'…':s.name,Done:s.chapters?.filter(c=>c.done).length||0,Total:s.chapters?.length||0}))
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}} className="fade">
        <GBtn onClick={()=>setPage('courses')}>← Back</GBtn>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:12,height:12,borderRadius:'50%',background:course.color}}/><h1 style={{fontSize:22,fontWeight:800,color:'var(--text)'}}>{course.name}</h1></div>
          <p style={{color:'var(--text2)',fontSize:12,marginTop:1}}>{subjects.length} subjects · {exams.length} exams</p>
        </div>
        <div style={{textAlign:'right'}}><div style={{fontFamily:'Sora',fontSize:26,fontWeight:800,color:course.color}}>{overall}%</div><div style={{fontSize:11,color:'var(--text2)'}}>Overall</div></div>
      </div>
      <div style={{display:'flex',gap:3,background:'var(--bg)',borderRadius:50,padding:4,marginBottom:20,width:'fit-content'}}>
        {[['subjects','📖 Subjects'],['exams','📝 Exams'],['charts','📊 Charts']].map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)} style={{background:tab===id?'var(--primary)':'transparent',color:tab===id?'white':'var(--text2)'}}>{label}</button>
        ))}
      </div>

      {tab==='subjects'&&(
        <div className="fade">
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}><Btn onClick={()=>setSubModal(true)}>+ Add Subject</Btn></div>
          {subjects.length===0?(
            <Card style={{textAlign:'center',padding:'48px'}}><div style={{fontSize:48,marginBottom:12}}>📖</div><h3 style={{fontWeight:700,color:'var(--text)',marginBottom:12}}>No subjects yet</h3><Btn onClick={()=>setSubModal(true)}>+ Add Subject</Btn></Card>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:14}}>
              {subjects.map((s,i)=>{
                const color=COLORS[i%COLORS.length],done=s.chapters?.filter(c=>c.done).length||0,total=s.chapters?.length||0,prog=total?Math.round(done/total*100):0
                return(
                  <div key={s.id} className="hov" onClick={()=>{setSelSubject({subjectId:s.id,courseId});setPage('subject')}}
                    style={{background:'var(--card)',borderRadius:14,padding:18,border:'1px solid var(--border)',borderLeft:`4px solid ${color}`,cursor:'pointer',boxShadow:'var(--shadow)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><h3 style={{fontWeight:700,fontSize:14,color:'var(--text)'}}>{s.name}</h3><button style={{background:'none',border:'none',cursor:'pointer',color:'#FF6584',fontSize:13}} onClick={e=>{e.stopPropagation();delSubject(s.id)}}>🗑</button></div>
                    <div style={{fontSize:12,color:'var(--text2)',marginBottom:8}}>{done}/{total} chapters</div>
                    <div style={{height:5,background:'var(--border)',borderRadius:99,overflow:'hidden',marginBottom:6}}><div style={{height:'100%',width:`${prog}%`,background:color,borderRadius:99}}/></div>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:11,color:'var(--text2)'}}>{prog}%</span><span style={{fontSize:11,color,fontWeight:600}}>Open →</span></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab==='exams'&&(
        <div className="fade">
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}><Btn onClick={()=>setExamModal(true)}>+ Add Exam</Btn></div>
          {exams.length===0?(
            <Card style={{textAlign:'center',padding:'48px'}}><div style={{fontSize:48,marginBottom:12}}>📝</div><h3 style={{fontWeight:700,color:'var(--text)',marginBottom:6}}>No exams yet</h3><p style={{color:'var(--text2)',marginBottom:16,fontSize:13}}>Add Term 1, UT1, UT2, Finals etc.</p><Btn onClick={()=>setExamModal(true)}>+ Add Exam</Btn></Card>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {exams.map(ex=>{
                const days=daysUntil(ex.date)
                const chKeys=Object.keys(ex.chapters||{}).filter(k=>ex.chapters[k])
                let examDone=0,examTotal=0
                chKeys.forEach(key=>{const[sId,chId]=key.split('_');const sub=subjects.find(s=>String(s.id)===sId);if(sub){examTotal++;const ch=sub.chapters?.find(c=>String(c.id)===chId);if(ch?.done)examDone++}})
                const examProg=examTotal?Math.round(examDone/examTotal*100):0
                return(
                  <Card key={ex.id} style={{borderLeft:'4px solid var(--primary)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                      <div><h3 style={{fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:2}}>{ex.name}</h3><span style={{fontSize:12,color:'var(--text2)'}}>📅 {new Date(ex.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span></div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        {days!==null&&<div style={{background:days<=3?'#FF6584':days<=7?'#FFB347':'var(--primary)',color:'white',borderRadius:50,padding:'4px 10px',fontSize:11,fontWeight:700}}>{days<0?'🎉 Done':days===0?'🔥 Today!':`⏳ ${days}d`}</div>}
                        <button style={{background:'#FFF0F3',color:'#FF6584',border:'none',borderRadius:50,padding:'4px 10px',cursor:'pointer',fontSize:12}} onClick={()=>delExam(ex.id)}>🗑</button>
                      </div>
                    </div>
                    <div style={{marginBottom:8}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text2)',marginBottom:4}}><span>Exam Progress ({examDone}/{examTotal} chapters)</span><span style={{fontWeight:700,color:'var(--primary)'}}>{examProg}%</span></div>
                      <div style={{height:6,background:'var(--border)',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${examProg}%`,background:'var(--primary)',borderRadius:99,transition:'width 0.5s'}}/></div>
                    </div>
                    {chKeys.length>0&&(
                      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:8}}>
                        {chKeys.slice(0,8).map(key=>{const[sId,chId]=key.split('_');const sub=subjects.find(s=>String(s.id)===sId);const ch=sub?.chapters?.find(c=>String(c.id)===chId);return ch?(<span key={key} style={{background:ch.done?'rgba(67,198,172,0.15)':'var(--bg)',color:ch.done?'var(--success)':'var(--text2)',border:'1px solid var(--border)',borderRadius:50,padding:'2px 10px',fontSize:11}}>{ch.done?'✓ ':''}{ch.name.length>16?ch.name.slice(0,16)+'…':ch.name}</span>):null})}
                        {chKeys.length>8&&<span style={{fontSize:11,color:'var(--text2)',padding:'2px 0'}}>+{chKeys.length-8} more</span>}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab==='charts'&&(
        <div className="fade">
          {pieData.length===0?<Card style={{textAlign:'center',padding:'48px'}}><p style={{color:'var(--text2)'}}>Add subjects with chapters to see charts.</p></Card>:(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:18}}>
              <Card><h3 style={{fontSize:14,fontWeight:700,marginBottom:14,color:'var(--text)'}}>📊 Syllabus</h3><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={72} dataKey="value" paddingAngle={3}>{pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={(v,n)=>[v+' chapters',n]}/></PieChart></ResponsiveContainer><div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>{pieData.map((d,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--text2)'}}><div style={{width:8,height:8,borderRadius:'50%',background:d.color}}/>{d.name}</div>)}</div></Card>
              <Card><h3 style={{fontSize:14,fontWeight:700,marginBottom:14,color:'var(--text)'}}>✅ Completed</h3><ResponsiveContainer width="100%" height={180}><BarChart data={barData}><XAxis dataKey="name" tick={{fontSize:11,fill:'var(--text2)'}}/><YAxis tick={{fontSize:11,fill:'var(--text2)'}}/><Tooltip/><Bar dataKey="Done" fill="var(--primary)" radius={[4,4,0,0]}/><Bar dataKey="Total" fill="var(--border)" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></Card>
            </div>
          )}
        </div>
      )}

      {subModal&&<Modal title="Add Subject 📖" onClose={()=>setSubModal(false)}><SI label="Subject Name" placeholder="e.g. Algebra, Organic Chemistry..." value={subName} onChange={setSubName} onEnter={addSubject}/><div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:18}}><GBtn onClick={()=>setSubModal(false)}>Cancel</GBtn><Btn onClick={addSubject}>Add</Btn></div></Modal>}

      {examModal&&(
        <Modal title="Add Exam 📝" onClose={()=>setExamModal(false)} wide>
          <div style={{display:'flex',gap:12,marginBottom:14}}>
            <div style={{flex:1}}><SI label="Exam Name *" placeholder="e.g. Term 1, UT2, Final..." value={examForm.name} onChange={v=>setExamForm({...examForm,name:v})}/></div>
            <div style={{flex:1}}><SI label="Date *" type="date" value={examForm.date} onChange={v=>setExamForm({...examForm,date:v})}/></div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:10}}>Select Chapters for this Exam</label>
            {subjects.length===0?<p style={{fontSize:13,color:'var(--text2)'}}>Add subjects first.</p>:(
              <div style={{maxHeight:220,overflowY:'auto',display:'flex',flexDirection:'column',gap:10}}>
                {subjects.map((s,si)=>(
                  <div key={s.id}>
                    <div style={{fontSize:11,fontWeight:700,color:COLORS[si%COLORS.length],marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>{s.name}</div>
                    {(s.chapters||[]).length===0?<p style={{fontSize:12,color:'var(--text2)',paddingLeft:8}}>No chapters yet</p>:(
                      <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                        {s.chapters.map(ch=>{const k=`${s.id}_${ch.id}`;const sel=!!examForm.chapters[k];return(
                          <div key={ch.id} onClick={()=>toggleExCh(s.id,ch.id)}
                            style={{padding:'4px 10px',borderRadius:50,fontSize:12,cursor:'pointer',border:`1px solid ${sel?COLORS[si%COLORS.length]:'var(--border)'}`,background:sel?`${COLORS[si%COLORS.length]}18`:'var(--bg)',color:sel?COLORS[si%COLORS.length]:'var(--text2)',transition:'all 0.15s',fontWeight:sel?600:400}}>
                            {sel?'✓ ':''}{ch.name.length>18?ch.name.slice(0,18)+'…':ch.name}
                          </div>
                        )})}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{fontSize:12,color:'var(--text2)',marginBottom:14}}>{Object.values(examForm.chapters).filter(Boolean).length} chapters selected</div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><GBtn onClick={()=>setExamModal(false)}>Cancel</GBtn><Btn onClick={addExam}>Add Exam</Btn></div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ SUBJECT PAGE ════════ */
function SubjectPage({user,subjectId,courseId,data,saveD,setPage}){
  const[modal,setModal]=useState(false)
  const[chName,setChName]=useState('')
  const course=(data.courses||[]).find(c=>c.id===courseId)
  const subject=course?.subjects?.find(s=>s.id===subjectId)
  if(!subject)return <div style={{padding:40}}><Btn onClick={()=>setPage('course')}>← Back</Btn></div>
  const chapters=subject.chapters||[]
  const persist=updS=>saveD({...data,courses:data.courses.map(c=>c.id===courseId?{...c,subjects:c.subjects.map(s=>s.id===subjectId?updS:s)}:c)})
  const updCh=(id,field,val)=>persist({...subject,chapters:chapters.map(c=>c.id===id?{...c,[field]:val}:c)})
  const addCh=()=>{if(!chName.trim())return;persist({...subject,chapters:[...chapters,{id:Date.now(),name:chName.trim(),done:false,revise:false,mock:false,confidence:0}]});setChName('');setModal(false)}
  const delCh=id=>{if(confirm('Delete?'))persist({...subject,chapters:chapters.filter(c=>c.id!==id)})}
  const done=chapters.filter(c=>c.done).length,revised=chapters.filter(c=>c.revise).length,mocked=chapters.filter(c=>c.mock).length
  const avgConf=chapters.length?(chapters.reduce((a,c)=>a+(c.confidence||0),0)/chapters.length).toFixed(1):0
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}} className="fade">
        <GBtn onClick={()=>setPage('course')}>← Back</GBtn>
        <div style={{flex:1}}><h1 style={{fontSize:22,fontWeight:800,color:'var(--text)'}}>{subject.name}</h1><p style={{color:'var(--text2)',fontSize:12}}>{course.name} · {chapters.length} chapters</p></div>
        <Btn onClick={()=>setModal(true)}>+ Add Chapter</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'270px 1fr',gap:16,marginBottom:20}}>
        <Card>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:14,color:'var(--text)'}}>📈 Progress</h3>
          {[{label:'Done',val:chapters.length?Math.round(done/chapters.length*100):0,color:'var(--primary)'},{label:'Revised',val:chapters.length?Math.round(revised/chapters.length*100):0,color:'var(--success)'},{label:'Mocked',val:chapters.length?Math.round(mocked/chapters.length*100):0,color:'var(--warning)'}].map(d=>(
            <div key={d.label} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,color:'var(--text2)'}}>{d.label}</span><span style={{fontSize:12,fontWeight:700,color:d.color}}>{d.val}%</span></div>
              <div style={{height:6,background:'var(--border)',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${d.val}%`,background:d.color,borderRadius:99,transition:'width 0.6s'}}/></div>
            </div>
          ))}
          <div style={{borderTop:'1px solid var(--border)',paddingTop:10,display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12,color:'var(--text2)'}}>Avg Confidence</span><span style={{fontSize:12,fontWeight:700,color:'var(--primary)'}}>{avgConf}/5 ⭐</span></div>
        </Card>
        <Card>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:10,color:'var(--text)'}}>📝 Notes</h3>
          <textarea defaultValue={subject.notes||''} onBlur={e=>persist({...subject,notes:e.target.value})} placeholder="Add notes, formulas, reminders..."
            style={{width:'100%',height:148,padding:12,border:'2px solid var(--border)',borderRadius:12,background:'var(--input)',color:'var(--text)',fontSize:13,resize:'none',outline:'none',lineHeight:1.6,transition:'border 0.2s'}}
            onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>{e.target.style.borderColor='var(--border)';persist({...subject,notes:e.target.value})}}/>
          <p style={{fontSize:11,color:'var(--text2)',marginTop:4}}>Auto-saved on blur</p>
        </Card>
      </div>
      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid var(--border)'}}>
          <h3 style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>Chapter Tracker</h3>
          <div style={{display:'flex',gap:6}}>
            {[['var(--primary)',`${done} Done`],['var(--success)',`${revised} Revised`],['var(--warning)',`${mocked} Mocked`]].map(([c,l])=><span key={l} style={{background:`${c}18`,color:c,borderRadius:50,padding:'3px 10px',fontSize:11,fontWeight:600}}>{l}</span>)}
          </div>
        </div>
        {chapters.length===0?(
          <div style={{textAlign:'center',padding:'40px'}}><div style={{fontSize:40,marginBottom:10}}>📋</div><h3 style={{fontWeight:700,color:'var(--text)',marginBottom:12}}>No chapters yet</h3><Btn onClick={()=>setModal(true)}>+ Add Chapter</Btn></div>
        ):(
          <div style={{overflowX:'auto'}}>
            <table>
              <thead><tr style={{background:'var(--bg)'}}>
                {['Chapter','✅ Done','🔁 Revise','📝 Mock','⭐ Confidence',''].map((h,i)=><th key={i} style={{color:'var(--text2)',borderBottom:'2px solid var(--border)',paddingLeft:i===0?24:undefined,textAlign:i>0?'center':undefined}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {chapters.map(ch=>(
                  <tr key={ch.id}>
                    <td style={{paddingLeft:24,fontWeight:500,color:'var(--text)',borderBottom:'1px solid var(--border)'}}>{ch.name}</td>
                    {[['done','var(--primary)'],['revise','var(--success)'],['mock','var(--warning)']].map(([f,color])=>(
                      <td key={f} style={{textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                        <div style={{display:'flex',justifyContent:'center'}}>
                          <div className="chk" style={{background:ch[f]?color:'transparent',borderColor:ch[f]?color:'#ddd',border:'2px solid'}} onClick={()=>updCh(ch.id,f,!ch[f])}>
                            {ch[f]&&<span style={{color:'white',fontSize:11,fontWeight:700}}>✓</span>}
                          </div>
                        </div>
                      </td>
                    ))}
                    <td style={{textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'center',gap:2}}>
                        {[1,2,3,4,5].map(s=><span key={s} className="star" style={{opacity:ch.confidence>=s?1:0.2}} onClick={()=>updCh(ch.id,'confidence',ch.confidence===s?0:s)}>⭐</span>)}
                      </div>
                    </td>
                    <td style={{textAlign:'center',borderBottom:'1px solid var(--border)'}}><button style={{background:'none',border:'none',cursor:'pointer',color:'#FF6584',fontSize:14}} onClick={()=>delCh(ch.id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {modal&&<Modal title="Add Chapter 📋" onClose={()=>setModal(false)}><SI label="Chapter Name" placeholder="e.g. Chapter 1: Introduction..." value={chName} onChange={setChName} onEnter={addCh}/><div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:18}}><GBtn onClick={()=>setModal(false)}>Cancel</GBtn><Btn onClick={addCh}>Add</Btn></div></Modal>}
    </div>
  )
}

/* ════════ PROGRESS ════════ */
function ProgressPage({user,data,setPage,setSelCourse}){
  const courses=data.courses||[]
  const stats=courses.map((c,i)=>{let t=0,d=0,r=0,m=0,tc=0,cc=0;(c.subjects||[]).forEach(s=>(s.chapters||[]).forEach(ch=>{t++;if(ch.done)d++;if(ch.revise)r++;if(ch.mock)m++;if(ch.confidence){tc+=ch.confidence;cc++}}));const ne=(c.exams||[]).filter(e=>daysUntil(e.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date))[0];return{...c,total:t,done:d,revised:r,mocked:m,prog:t?Math.round(d/t*100):0,avgConf:cc?(tc/cc).toFixed(1):0,daysLeft:ne?daysUntil(ne.date):null,color:c.color||COLORS[i%COLORS.length]}})
  const totals=stats.reduce((a,s)=>({t:a.t+s.total,d:a.d+s.done,r:a.r+s.revised,m:a.m+s.mocked}),{t:0,d:0,r:0,m:0})
  return(
    <div>
      <div className="fade" style={{marginBottom:24}}><h1 style={{fontSize:26,fontWeight:800,color:'var(--text)'}}>Progress Overview 📊</h1><p style={{color:'var(--text2)',marginTop:2}}>Track your performance across all courses.</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:22}} className="fade2">
        {[{icon:'📋',val:totals.t,label:'Total Chapters',color:'var(--primary)'},{icon:'✅',val:totals.d,label:'Done',color:'var(--success)'},{icon:'🔁',val:totals.r,label:'Revised',color:'var(--primary)'},{icon:'📝',val:totals.m,label:'Mocked',color:'var(--warning)'}].map(s=>(
          <div key={s.label} style={{background:'var(--card)',borderRadius:14,padding:'14px 16px',border:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10,boxShadow:'var(--shadow)'}}>
            <div style={{width:38,height:38,borderRadius:11,background:`${s.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>{s.icon}</div>
            <div><div style={{fontSize:22,fontWeight:800,fontFamily:'Sora',color:s.color}}>{s.val}</div><div style={{fontSize:11,color:'var(--text2)',fontWeight:500}}>{s.label}</div></div>
          </div>
        ))}
      </div>
      {courses.length===0?<Card style={{textAlign:'center',padding:'56px'}}><div style={{fontSize:56,marginBottom:12}}>📭</div><Btn onClick={()=>setPage('courses')}>Go to Courses</Btn></Card>:(
        <>
          <Card className="fade3" style={{marginBottom:18}}>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:14,color:'var(--text)'}}>Course Progress (%)</h3>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={stats.map(s=>({name:s.name.length>10?s.name.slice(0,10)+'…':s.name,Progress:s.prog,color:s.color}))}>
                <XAxis dataKey="name" tick={{fontSize:12,fill:'var(--text2)'}}/><YAxis domain={[0,100]} tick={{fontSize:11,fill:'var(--text2)'}}/><Tooltip formatter={v=>[`${v}%`,'Progress']}/>
                <Bar dataKey="Progress" radius={[6,6,0,0]}>{stats.map((s,i)=><Cell key={i} fill={s.color}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {stats.map(s=>(
              <Card key={s.id} className="hov" style={{borderLeft:`4px solid ${s.color}`,cursor:'pointer'}} onClick={()=>{setSelCourse(s.id);setPage('course')}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div><h3 style={{fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:1}}>{s.name}</h3><span style={{fontSize:11,color:'var(--text2)'}}>{s.subjects?.length||0} subjects · {s.total} chapters · {(s.exams||[]).length} exams</span></div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {s.daysLeft!==null&&<div style={{background:s.daysLeft<=3?'#FF6584':s.daysLeft<=7?'#FFB347':'var(--primary)',color:'white',borderRadius:50,padding:'3px 10px',fontSize:11,fontWeight:700}}>{s.daysLeft<0?'🎉 Done':s.daysLeft===0?'🔥 Today!':`⏳ ${s.daysLeft}d`}</div>}
                    <div style={{fontFamily:'Sora',fontSize:22,fontWeight:800,color:s.color}}>{s.prog}%</div>
                  </div>
                </div>
                <div style={{height:5,background:'var(--border)',borderRadius:99,overflow:'hidden',marginBottom:8}}><div style={{height:'100%',width:`${s.prog}%`,background:s.color,borderRadius:99,transition:'width 0.5s'}}/></div>
                <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
                  {[['✅',s.done,s.total],['🔁',s.revised,s.total],['📝',s.mocked,s.total]].map(([e,v,t])=><span key={e} style={{fontSize:11,color:'var(--text2)'}}>{e} <strong style={{color:'var(--text)'}}>{v}/{t}</strong></span>)}
                  <span style={{fontSize:11,color:'var(--text2)'}}>⭐ <strong style={{color:'var(--text)'}}>{s.avgConf}/5</strong></span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ════════ POMODORO ════════ *//* ════════ POMODORO ════════ */
function PomodoroPage({user,data,saveD}){
  const MODES={ pomodoro: data.pomoSession||25, short: data.pomoBreak||5, long: data.pomoLong||15 }
  const[mode,setMode]=useState('pomodoro')
  const[timeLeft,setTimeLeft]=useState(MODES.pomodoro*60)
  const[running,setRunning]=useState(false)
  const[cycles,setCycles]=useState(0)
  const[bg,setBg]=useState(data.pomoBg||'lofi1')
  const[showSettings,setShowSettings]=useState(false)
  const[uploadedBg,setUploadedBg]=useState(data.uploadedBg||null)
  const[spotifyUrl,setSpotifyUrl]=useState(data.spotifyUrl||'')
  const[spotifyInput,setSpotifyInput]=useState(data.spotifyUrl||'')
  const[showSpotify,setShowSpotify]=useState(false)
  const[session,setSession]=useState(data.pomoSession||25)
  const[breakT,setBreakT]=useState(data.pomoBreak||5)
  const[longBreak,setLongBreak]=useState(data.pomoLong||15)
  const intervalRef=useRef(null)

  const durations={pomodoro:session*60,short:breakT*60,long:longBreak*60}

  useEffect(()=>{ if(!running) setTimeLeft(durations[mode]) },[mode,session,breakT,longBreak])

  useEffect(()=>{
    if(running){
      intervalRef.current=setInterval(()=>{
        setTimeLeft(t=>{
          if(t<=1){
            clearInterval(intervalRef.current);setRunning(false)
            if(mode==='pomodoro'){
              setCycles(c=>c+1)
              const updated={...data,sessions:[...(data.sessions||[]),{id:Date.now(),mins:session,date:new Date().toISOString()}]}
              saveD(updated)
            }
            return durations[mode]
          }
          return t-1
        })
      },1000)
    }else clearInterval(intervalRef.current)
    return()=>clearInterval(intervalRef.current)
  },[running,mode,session,breakT,longBreak])

  const reset=()=>{ setRunning(false); setTimeLeft(durations[mode]) }

  // Convert spotify URL to embed URL
  const getEmbedUrl=url=>{
    if(!url) return null
    try{
      // handles open.spotify.com/playlist/xxx or spotify:playlist:xxx
      const match=url.match(/playlist\/([a-zA-Z0-9]+)/)
      if(match) return `https://open.spotify.com/embed/playlist/${match[1]}?utm_source=generator&theme=0`
      const match2=url.match(/album\/([a-zA-Z0-9]+)/)
      if(match2) return `https://open.spotify.com/embed/album/${match2[1]}?utm_source=generator&theme=0`
      const match3=url.match(/track\/([a-zA-Z0-9]+)/)
      if(match3) return `https://open.spotify.com/embed/track/${match3[1]}?utm_source=generator&theme=0`
    }catch{}
    return null
  }

  const embedUrl=getEmbedUrl(spotifyUrl)
  const progress=(1-timeLeft/durations[mode])*100
  const C=2*Math.PI*110
  const dash=C-(progress/100)*C

  const getBgStyle=()=>{
    if(bg==='uploaded'&&uploadedBg) return{background:`url(${uploadedBg}) center/cover`}
    return{background:POMO_BGS[bg]||POMO_BGS.lofi1}
  }

  const modeLabels={pomodoro:'pomodoro',short:'short break',long:'long break'}
  const modeColors={pomodoro:'white',short:'#43C6AC',long:'#FFB347'}

  return(
    <div style={{position:'fixed',top:0,left:252,right:0,bottom:0,zIndex:50,...getBgStyle(),display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
      {/* Dark overlay */}
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',zIndex:0}}/>

      {/* Top right controls */}
      <div style={{position:'absolute',top:24,right:24,display:'flex',gap:10,zIndex:2}}>
        <button onClick={()=>setShowSpotify(s=>!s)}
          style={{background:'rgba(255,255,255,0.12)',border:'none',borderRadius:50,padding:'8px 16px',color:'white',cursor:'pointer',fontSize:13,fontWeight:600,backdropFilter:'blur(12px)',display:'flex',alignItems:'center',gap:6}}>
          🎵 Spotify
        </button>
        <button onClick={()=>setShowSettings(true)}
          style={{background:'rgba(255,255,255,0.12)',border:'none',borderRadius:50,padding:'8px 16px',color:'white',cursor:'pointer',fontSize:13,fontWeight:600,backdropFilter:'blur(12px)'}}>
          ⚙️
        </button>
      </div>

      {/* Cycles top left */}
      <div style={{position:'absolute',top:28,left:28,display:'flex',gap:6,alignItems:'center',zIndex:2}}>
        {Array(Math.min(cycles,8)).fill(null).map((_,i)=>(
          <div key={i} style={{width:10,height:10,borderRadius:'50%',background:'rgba(255,255,255,0.75)'}}/>
        ))}
        {cycles>0&&<span style={{color:'rgba(255,255,255,0.6)',fontSize:13,marginLeft:4}}>{cycles} sessions</span>}
      </div>

      {/* Main content */}
      <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>

        {/* Mode selector */}
        <div style={{display:'flex',gap:8,marginBottom:40}}>
          {Object.entries(modeLabels).map(([key,label])=>(
            <button key={key} onClick={()=>{setMode(key);setRunning(false)}}
              style={{
                padding:'10px 22px',borderRadius:50,border:`2px solid ${mode===key?'white':'rgba(255,255,255,0.3)'}`,
                background:mode===key?'white':'transparent',
                color:mode===key?'#1a1a2e':'white',
                fontSize:14,fontWeight:700,cursor:'pointer',
                fontFamily:'Sora,sans-serif',
                transition:'all 0.2s',
                backdropFilter:'blur(10px)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Big Timer — no circle, just huge text like the inspo */}
        <div style={{marginBottom:40,textAlign:'center'}}>
          <div style={{
            fontSize:120,fontWeight:800,color:'white',fontFamily:'Sora,sans-serif',
            letterSpacing:'-4px',lineHeight:1,
            textShadow:'0 4px 32px rgba(0,0,0,0.5)',
          }}>
            {fmtTime(timeLeft)}
          </div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.5)',marginTop:8,fontWeight:500}}>
            {mode==='pomodoro'?`${session} min focus session`:mode==='short'?`${breakT} min short break`:`${longBreak} min long break`}
          </div>
        </div>

        {/* Controls */}
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <button onClick={()=>setRunning(r=>!r)}
            style={{
              padding:'16px 48px',borderRadius:50,background:'white',border:'none',
              fontSize:18,fontWeight:800,cursor:'pointer',
              fontFamily:'Sora,sans-serif',color:'#1a1a2e',
              boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
              transition:'transform 0.15s,box-shadow 0.15s',
              letterSpacing:1,
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.35)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.25)'}}>
            {running?'pause':'start'}
          </button>
          <button onClick={reset}
            style={{width:50,height:50,borderRadius:'50%',background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',color:'white',fontSize:20,cursor:'pointer',backdropFilter:'blur(10px)',transition:'background 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.25)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}>
            ↺
          </button>
        </div>
      </div>

      {/* Spotify player - bottom left */}
      {showSpotify&&(
        <div style={{position:'absolute',bottom:24,left:24,zIndex:2,width:320}} className="pop">
          {embedUrl?(
            <div>
              <iframe src={embedUrl} width="320" height="152" frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy" style={{borderRadius:14,display:'block'}}/>
              <button onClick={()=>setSpotifyUrl('')}
                style={{marginTop:8,background:'rgba(255,255,255,0.15)',border:'none',borderRadius:50,padding:'5px 14px',color:'white',fontSize:12,cursor:'pointer',backdropFilter:'blur(10px)'}}>
                × Change playlist
              </button>
            </div>
          ):(
            <div style={{background:'rgba(0,0,0,0.6)',borderRadius:16,padding:20,backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.15)'}}>
              <p style={{color:'white',fontSize:14,fontWeight:600,marginBottom:4}}>🎵 Add Spotify Playlist</p>
              <p style={{color:'rgba(255,255,255,0.55)',fontSize:12,marginBottom:12}}>Paste any Spotify playlist, album or track link</p>
              <input value={spotifyInput} onChange={e=>setSpotifyInput(e.target.value)}
                placeholder="https://open.spotify.com/playlist/..."
                style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.1)',color:'white',fontSize:13,outline:'none',marginBottom:10}}/>
              <button onClick={()=>{ setSpotifyUrl(spotifyInput); saveD({...data,spotifyUrl:spotifyInput}) }}
                style={{width:'100%',padding:'10px',background:'#1DB954',border:'none',borderRadius:10,color:'white',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'Sora,sans-serif'}}>
                ▶ Load Player
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(4px)'}} onClick={()=>setShowSettings(false)}>
          <div className="pop" style={{background:'var(--card)',borderRadius:20,padding:28,width:500,maxWidth:'95vw',maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:800,marginBottom:18,color:'var(--text)'}}>⚙️ Timer Settings</h3>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:18}}>
              {[['Pomodoro (min)',session,v=>{setSession(v);if(!running&&mode==='pomodoro')setTimeLeft(v*60);saveD({...data,pomoSession:v})}],
                ['Short Break (min)',breakT,v=>{setBreakT(v);if(!running&&mode==='short')setTimeLeft(v*60);saveD({...data,pomoBreak:v})}],
                ['Long Break (min)',longBreak,v=>{setLongBreak(v);if(!running&&mode==='long')setTimeLeft(v*60);saveD({...data,pomoLong:v})}]
              ].map(([label,val,onChange])=>(
                <div key={label}>
                  <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:6}}>{label}</label>
                  <input type="number" min={1} max={180} value={val}
                    onChange={e=>onChange(+e.target.value)}
                    style={{width:'100%',padding:'10px 12px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:16,fontWeight:700,outline:'none'}}/>
                </div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:18}}>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:6}}>Daily Goal (min)</label>
                <input type="number" min={10} max={600} value={data.dailyGoal||120} onChange={e=>saveD({...data,dailyGoal:+e.target.value})}
                  style={{width:'100%',padding:'10px 12px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:16,fontWeight:700,outline:'none'}}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:6}}>Weekly Goal (min)</label>
                <input type="number" min={60} max={3000} value={data.weeklyGoal||600} onChange={e=>saveD({...data,weeklyGoal:+e.target.value})}
                  style={{width:'100%',padding:'10px 12px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:16,fontWeight:700,outline:'none'}}/>
              </div>
            </div>

            <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:10}}>Background</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:12}}>
              {Object.entries(POMO_BGS).map(([key,val])=>(
                <div key={key} onClick={()=>{setBg(key);saveD({...data,pomoBg:key})}}
                  style={{height:52,borderRadius:10,background:val,cursor:'pointer',border:bg===key?'3px solid var(--primary)':'3px solid transparent',transition:'border 0.15s',position:'relative',overflow:'hidden'}}>
                  {bg===key&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.3)',color:'white',fontSize:16}}>✓</div>}
                  <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.55)',padding:'2px 5px'}}>
                    <span style={{fontSize:9,color:'white',fontWeight:600}}>{BG_LABELS[key]}</span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:6}}>Upload your own background</label>
              <input type="file" accept="image/*" onChange={e=>{
                const file=e.target.files[0]
                if(file){const r=new FileReader();r.onload=ev=>{setUploadedBg(ev.target.result);setBg('uploaded');saveD({...data,uploadedBg:ev.target.result,pomoBg:'uploaded'})};r.readAsDataURL(file)}
              }} style={{fontSize:12,color:'var(--text2)'}}/>
            </div>

            <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}>
              <Btn onClick={()=>setShowSettings(false)}>Done ✓</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ════════ REUSABLES ════════ */
function Card({children,style,className}){return <div className={className} style={{background:'var(--card)',borderRadius:16,padding:20,border:'1px solid var(--border)',boxShadow:'var(--shadow)',...style}}>{children}</div>}
function Btn({children,onClick,style}){return <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 20px',background:'var(--primary)',color:'white',border:'none',borderRadius:50,fontFamily:'Sora',fontWeight:600,fontSize:13,cursor:'pointer',boxShadow:'0 4px 14px rgba(108,99,255,0.25)',transition:'opacity 0.2s',...style}} onMouseEnter={e=>e.currentTarget.style.opacity='0.87'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>{children}</button>}
function GBtn({children,onClick}){return <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 20px',background:'transparent',color:'var(--primary)',border:'2px solid var(--border)',borderRadius:50,fontFamily:'Sora',fontWeight:600,fontSize:13,cursor:'pointer',transition:'border 0.2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--primary)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>{children}</button>}
function SI({label,type='text',placeholder,value,onChange,onEnter}){return <div><label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:5}}>{label}</label><input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onEnter?.()} style={{width:'100%',padding:'11px 13px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:14,outline:'none',transition:'border 0.2s'}} onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>}
function Modal({title,children,onClose,wide}){return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(4px)'}} onClick={onClose}><div className="pop" style={{background:'var(--card)',borderRadius:20,padding:28,width:wide?560:440,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}><h3 style={{fontSize:18,fontWeight:800,marginBottom:16,color:'var(--text)'}}>{title}</h3>{children}</div></div>}

/* ════════ ROOT ════════ */
export default function App(){
  const[user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem(SESS))}catch{return null}})
  const[page,setPage]=useState('dashboard')
  const[selCourse,setSelCourse]=useState(null)
  const[selSubject,setSelSubject]=useState(null)
  const[data,setData]=useState(()=>user?getData(user.email):{courses:[],planner:[],sessions:[],pomoBg:'gradient1',pomoSession:25,pomoBreak:5,theme:'light',dailyGoal:120,weeklyGoal:600})
  const[theme,setTheme]=useState(()=>user?getData(user.email).theme||'light':'light')
  useEffect(()=>{applyTheme(theme)},[theme])
  const login=u=>{localStorage.setItem(SESS,JSON.stringify(u));setUser(u);const d=getData(u.email);setData(d);setTheme(d.theme||'light');applyTheme(d.theme||'light')}
  const saveD=updated=>{setData(updated);saveData(user.email,updated)}
  if(!user)return <AuthPage onLogin={login}/>
  const renderPage=()=>{
    if(page==='course'&&selCourse)return <CoursePage user={user} courseId={selCourse} data={data} saveD={saveD} setPage={setPage} setSelSubject={setSelSubject}/>
    if(page==='subject'&&selSubject)return <SubjectPage user={user} subjectId={selSubject.subjectId} courseId={selSubject.courseId} data={data} saveD={saveD} setPage={setPage}/>
    if(page==='progress')return <ProgressPage user={user} data={data} setPage={setPage} setSelCourse={setSelCourse}/>
    if(page==='pomodoro')return <PomodoroPage user={user} data={data} saveD={saveD}/>
    if(page==='courses')return <CoursesPage user={user} data={data} saveD={saveD} setPage={setPage} setSelCourse={setSelCourse}/>
    return <Dashboard user={user} data={data} saveD={saveD} setPage={setPage} setSelCourse={setSelCourse}/>
  }
  return <Layout user={user} page={page} setPage={setPage} theme={theme} setTheme={setTheme} data={data} saveD={saveD}>{renderPage()}</Layout>
}
