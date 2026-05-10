import { useState, useEffect, useRef, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fl=document.createElement('link');fl.href='https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap';fl.rel='stylesheet';document.head.appendChild(fl)
const st=document.createElement('style');st.textContent=`
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;}
h1,h2,h3,h4{font-family:'Sora',sans-serif;}
input,textarea,button,select{font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:#c4c0ff;border-radius:8px;}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
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
.batman-bg{background-color:#f0a500;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='70' viewBox='0 0 100 70'%3E%3Cg fill='%231a0800' opacity='0.55'%3E%3Cpath d='M20 28 Q10 18 2 22 Q8 24 10 28 Q6 26 4 30 Q10 28 14 32 Q12 36 14 40 Q18 34 20 36 Q22 34 26 40 Q28 36 26 32 Q30 28 36 30 Q34 26 36 22 Q28 18 20 28Z'/%3E%3C/g%3E%3Cg fill='%231a0800' opacity='0.4'%3E%3Cpath d='M72 52 Q64 44 58 47 Q63 49 64 52 Q61 51 60 54 Q65 52 68 56 Q66 59 68 62 Q71 57 72 59 Q73 57 76 62 Q78 59 76 56 Q79 52 84 54 Q83 51 84 47 Q78 44 72 52Z'/%3E%3C/g%3E%3Cg fill='%231a0800' opacity='0.3'%3E%3Cpath d='M82 12 Q76 6 72 9 Q76 10 76 13 Q74 12 73 14 Q76 13 78 16 Q77 18 78 20 Q80 17 81 18 Q82 17 84 20 Q85 18 84 16 Q86 13 90 14 Q89 11 90 8 Q86 5 82 12Z'/%3E%3C/g%3E%3C/svg%3E");background-size:100px 70px;}
`;document.head.appendChild(st)

const SUPA_URL = 'https://ocencxinawxcabsacsnp.supabase.co'
const SUPA_KEY = 'sb_publishable_dynJCEwBsiz47pHsl0VoPg_--7YX0f1'

if(!window.__supaLoaded){
  window.__supaLoaded = true
  const s = document.createElement('script')
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
  document.head.appendChild(s)
}

let _client = null
function getClient(){
  if(_client) return _client
  if(window.supabase?.createClient){
    _client = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
      auth:{ persistSession:true, storageKey:'sf_supa_sess' }
    })
  }
  return _client
}

function waitClient(){
  return new Promise((res,rej)=>{
    const t0 = Date.now()
    const poll = ()=>{
      const c = getClient()
      if(c) return res(c)
      if(Date.now()-t0 > 6000) return rej(new Error('Supabase SDK did not load'))
      setTimeout(poll, 100)
    }
    poll()
  })
}

const supa = {
  async signUp(email, password, name){
    const c = await waitClient()
    return c.auth.signUp({ email, password, options:{ data:{ name } } })
  },
  async signIn(email, password){
    const c = await waitClient()
    return c.auth.signInWithPassword({ email, password })
  },
  async signOut(){
    const c = await waitClient()
    return c.auth.signOut()
  },
  async getSession(){
    const c = await waitClient()
    return c.auth.getSession()
  },
  // avatar is now included in the sync (uploadedBg is the only skipped blob)
  async upsertData(userId, payload){
    const c = await waitClient()
    const { uploadedBg, ...safe } = payload
    return c.from('user_data').upsert(
      { user_id: userId, data: safe, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  },
  async fetchData(userId){
    const c = await waitClient()
    const { data, error } = await c.from('user_data').select('data').eq('user_id', userId).single()
    if(error) return null
    return data?.data || null
  },
  // Patch ONLY the avatar field — reads current row, sets avatar to new value, writes back.
  // Pass null to delete the old avatar, pass a base64 string to save a new one.
  async patchAvatar(userId, avatarValue){
    const c = await waitClient()
    const { data: row, error } = await c.from('user_data').select('data').eq('user_id', userId).single()
    if(error || !row) return
    const merged = { ...(row.data || {}), avatar: avatarValue }
    return c.from('user_data').update({ data: merged, updated_at: new Date().toISOString() }).eq('user_id', userId)
  },
}

// ── Avatar compression — max 200KB, 400×400px ──────────────
function compressAvatar(file){
  return new Promise((res,rej)=>{
    const MAX_BYTES=200*1024, MAX_DIM=400
    const img=new Image()
    const url=URL.createObjectURL(file)
    img.onload=()=>{
      URL.revokeObjectURL(url)
      const canvas=document.createElement('canvas')
      let {width:w,height:h}=img
      if(w>MAX_DIM||h>MAX_DIM){const r=Math.min(MAX_DIM/w,MAX_DIM/h);w=Math.round(w*r);h=Math.round(h*r)}
      canvas.width=w; canvas.height=h
      canvas.getContext('2d').drawImage(img,0,0,w,h)
      let dataUrl=canvas.toDataURL('image/jpeg',0.85)
      if(dataUrl.length>MAX_BYTES*1.37) dataUrl=canvas.toDataURL('image/jpeg',0.6)
      if(dataUrl.length>MAX_BYTES*1.37) dataUrl=canvas.toDataURL('image/jpeg',0.4)
      res(dataUrl)
    }
    img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('Image load failed'))}
    img.src=url
  })
}

const SESS = 'sf_sess'

const defaultData = () => ({
  courses:[], planner:[], sessions:[],
  pomoBg:'lofi1', pomoSession:25, pomoBreak:5, pomoLong:15,
  theme:'light', dailyGoal:120, weeklyGoal:600,
  timerFont:'Sora', alertSound:'bell',
  uploadedBg:null, spotifyUrl:'', avatar:null,
  pomoLoop:false, pomoLoopCount:4,
  displayName:'', importedCalEvents:[],
})

const localKey = uid => `sf_cache_${uid}`
const getLocalCache = uid => { try { return JSON.parse(localStorage.getItem(localKey(uid))) || defaultData() } catch { return defaultData() } }
const setLocalCache = (uid, d) => localStorage.setItem(localKey(uid), JSON.stringify(d))

let _syncTimer = null
const scheduleSync = (userId, data) => {
  clearTimeout(_syncTimer)
  _syncTimer = setTimeout(async () => {
    try { await supa.upsertData(userId, data) } catch(e) {}
  }, 1500)
}

function AuthPage({onLogin}){
  const[mode,setMode]=useState('login')
  const[form,setForm]=useState({name:'',email:'',password:''})
  const[err,setErr]=useState('')
  const[loading,setLoading]=useState(false)
  const[sdkReady,setSdkReady]=useState(false)

  useEffect(()=>{
    waitClient().then(async c => {
      setSdkReady(true)
      const { data:{ session } } = await c.auth.getSession()
      if(session?.user){
        const uid = session.user.id
        const name = session.user.user_metadata?.name || session.user.email.split('@')[0]
        const user = { id:uid, email:session.user.email, name }
        let d = null
        try { d = await supa.fetchData(uid) } catch(e){}
        const localD = getLocalCache(uid)
        const finalD = d || (localD.courses?.length ? localD : defaultData())
        setLocalCache(uid, finalD)
        onLogin(user, finalD)
      }
    }).catch(e => setErr('Could not load Supabase SDK. Check your internet connection.'))
  },[])

  const submit = async () => {
    setErr('')
    if(!form.email.trim() || !form.password.trim()){ setErr('Email and password required.'); return }
    setLoading(true)
    try {
      if(mode === 'signup'){
        if(!form.name.trim()){ setErr('Name required.'); setLoading(false); return }
        const { data, error } = await supa.signUp(form.email.trim(), form.password, form.name.trim())
        if(error){ setErr(error.message); setLoading(false); return }
        if(data?.session){
          const uid = data.user.id
          const user = { id:uid, email:data.user.email, name:form.name.trim() }
          await supa.upsertData(uid, defaultData())
          setLocalCache(uid, defaultData())
          onLogin(user, defaultData())
        } else {
          setErr('Account created! Check your email to confirm, then log in.')
        }
      } else {
        const { data, error } = await supa.signIn(form.email.trim(), form.password)
        if(error){ setErr(error.message); setLoading(false); return }
        const uid = data.user.id
        const name = data.user.user_metadata?.name || data.user.email.split('@')[0]
        const user = { id:uid, email:data.user.email, name }
        let cloudD = null
        try { cloudD = await supa.fetchData(uid) } catch(e){}
        const localD = getLocalCache(uid)
        const finalD = cloudD || (localD.courses?.length ? localD : defaultData())
        setLocalCache(uid, finalD)
        onLogin(user, finalD)
      }
    } catch(e){
      setErr(e?.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const inp = {
    width:'100%', padding:'12px 14px', marginBottom:14,
    borderRadius:12, border:'1px solid rgba(255,255,255,0.4)',
    background:'rgba(255,255,255,0.15)', color:'#ffffff',
    outline:'none', fontSize:15, fontWeight:500, backdropFilter:'blur(8px)',
  }

  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 50%,#43c6ac 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'Sora,sans-serif'}}>
      <div style={{width:400,maxWidth:'100%',padding:35,borderRadius:24,background:'rgba(255,255,255,0.1)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.2)',boxShadow:'0 25px 60px rgba(0,0,0,0.3)',color:'white',animation:'fadeIn 0.6s ease'}}>
        <div style={{textAlign:'center',marginBottom:25}}>
          <div style={{fontSize:42}}>📚</div>
          <h1 style={{fontSize:28,fontWeight:800}}>StudyFlow</h1>
          <p style={{fontSize:13,opacity:0.7}}>Focus • Track • Improve</p>
        </div>
        {!sdkReady ? (
          <div style={{textAlign:'center',padding:'30px 0',opacity:0.8}}>
            <div style={{fontSize:28,marginBottom:10}}>⏳</div>
            <p style={{fontSize:14}}>Connecting to server...</p>
          </div>
        ) : (
          <>
            <div style={{display:'flex',background:'rgba(255,255,255,0.1)',borderRadius:50,padding:4,marginBottom:20}}>
              {['login','signup'].map(m=>(
                <button key={m} onClick={()=>{setMode(m);setErr('')}} style={{flex:1,padding:10,border:'none',borderRadius:50,cursor:'pointer',fontWeight:600,background:mode===m?'white':'transparent',color:mode===m?'#333':'white',transition:'0.3s',fontFamily:'Sora'}}>
                  {m==='login'?'Login':'Sign Up'}
                </button>
              ))}
            </div>
            {mode==='signup'&&<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full Name" style={inp}/>}
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" style={inp}/>
            <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==='Enter'&&!loading&&submit()} placeholder="Password" style={inp}/>
            {err&&<div style={{background:'rgba(255,0,80,0.2)',padding:'10px 14px',borderRadius:10,fontSize:13,marginBottom:15,lineHeight:1.6}}>{err}</div>}
            <button onClick={submit} disabled={loading} style={{width:'100%',padding:14,borderRadius:50,border:'none',background:'linear-gradient(135deg,#6C63FF,#43C6AC)',color:'white',fontWeight:700,fontSize:15,cursor:loading?'not-allowed':'pointer',opacity:loading?0.75:1,fontFamily:'Sora'}}>
              {loading?'⏳ Please wait...':(mode==='login'?'Login →':'Create Account →')}
            </button>
            <p style={{textAlign:'center',fontSize:12,opacity:0.6,marginTop:15}}>☁️ Data syncs across all your devices</p>
          </>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} input::placeholder{color:rgba(255,255,255,0.6)}`}</style>
    </div>
  )
}

const THEMES={
  light:{name:'Light',emoji:'☀️','--bg':'#F4F3FF','--card':'#FFFFFF','--text':'#1a1a2e','--text2':'#6b6b8a','--border':'#EEECFF','--hover':'#FAFAFE','--sidebar':'#FFFFFF','--input':'#F4F3FF','--shadow':'0 2px 16px rgba(108,99,255,0.08)','--primary':'#6C63FF','--success':'#43C6AC','--warning':'#FFB347',sidebarEmoji:'📚',sidebarBg:'#FFFFFF',sidebarDark:false},
  dark:{name:'Dark',emoji:'🌙','--bg':'#0f0f1a','--card':'#1e1e30','--text':'#e8e6ff','--text2':'#9b99b8','--border':'#2e2e48','--hover':'#252540','--sidebar':'#15152a','--input':'#252540','--shadow':'0 2px 16px rgba(0,0,0,0.4)','--primary':'#7B74FF','--success':'#43C6AC','--warning':'#FFB347',sidebarEmoji:'📚',sidebarBg:'#15152a',sidebarDark:true},
  batman:{name:'Batman',emoji:'🦇','--bg':'#0a0a0f','--card':'#111118','--text':'#f0e060','--text2':'#a09830','--border':'#2a2a10','--hover':'#1a1a08','--sidebar':'#07070d','--input':'#1a1a08','--shadow':'0 2px 20px rgba(240,224,96,0.15)','--primary':'#f0e060','--success':'#c8b800','--warning':'#ff8800',sidebarEmoji:'🦇',sidebarBg:'#07070d',sidebarDark:true,decoration:['🦇','🦇','🦇']},
  avengers:{name:'Avengers',emoji:'🛡️','--bg':'#0d1117','--card':'#161b22','--text':'#e6edf3','--text2':'#8b949e','--border':'#21262d','--hover':'#1c2128','--sidebar':'#010409','--input':'#1c2128','--shadow':'0 2px 20px rgba(198,40,40,0.2)','--primary':'#c62828','--success':'#1565c0','--warning':'#f9a825',sidebarEmoji:'⚡',sidebarBg:'#010409',sidebarDark:true,decoration:['🛡️','⚡','🔴']},
  barbie:{name:'Barbie',emoji:'💖','--bg':'#fff0f8','--card':'#ffffff','--text':'#880044','--text2':'#cc6699','--border':'#ffccee','--hover':'#fff5fb','--sidebar':'#ff69b4','--input':'#fff0f8','--shadow':'0 2px 20px rgba(255,105,180,0.2)','--primary':'#ff1493','--success':'#ff69b4','--warning':'#ffb347',sidebarEmoji:'👛',sidebarBg:'#ff69b4',sidebarDark:true,decoration:['💖','✨','👠']},
  unicorn:{name:'Unicorn',emoji:'🦄','--bg':'#fdf4ff','--card':'#ffffff','--text':'#4a0080','--text2':'#9b59b6','--border':'#e8d0ff','--hover':'#faf0ff','--sidebar':'#f3e0ff','--input':'#fdf4ff','--shadow':'0 2px 20px rgba(155,89,182,0.15)','--primary':'#a855f7','--success':'#ec4899','--warning':'#f59e0b',sidebarEmoji:'🦄',sidebarBg:'#f3e0ff',sidebarDark:false,decoration:['🦄','🌈','⭐']},
  anime:{name:'Anime',emoji:'⚔️','--bg':'#fff8f0','--card':'#ffffff','--text':'#1a0a00','--text2':'#8b4513','--border':'#ffd0a0','--hover':'#fff3e0','--sidebar':'#1a0a00','--input':'#fff8f0','--shadow':'0 2px 20px rgba(255,100,0,0.15)','--primary':'#ff6400','--success':'#00aa44','--warning':'#ffcc00',sidebarEmoji:'⛩️',sidebarBg:'#1a0a00',sidebarDark:true,decoration:['⚔️','🌸','⛩️']},
  nature:{name:'Nature',emoji:'🌿','--bg':'#f0f7f0','--card':'#ffffff','--text':'#1a3a1a','--text2':'#4a7a4a','--border':'#c8e6c8','--hover':'#e8f5e8','--sidebar':'#1a3a1a','--input':'#f0f7f0','--shadow':'0 2px 20px rgba(26,100,26,0.1)','--primary':'#2e7d32','--success':'#43a047','--warning':'#f9a825',sidebarEmoji:'🌳',sidebarBg:'#1a3a1a',sidebarDark:true,decoration:['🌿','🍃','🌱']},
  cars:{name:'Racing',emoji:'🏎️','--bg':'#0a0a0a','--card':'#141414','--text':'#ffffff','--text2':'#999999','--border':'#2a2a2a','--hover':'#1e1e1e','--sidebar':'#050505','--input':'#1e1e1e','--shadow':'0 2px 20px rgba(255,50,0,0.2)','--primary':'#ff3200','--success':'#00ff88','--warning':'#ffcc00',sidebarEmoji:'🏁',sidebarBg:'#050505',sidebarDark:true,decoration:['🏎️','🏁','🔥']},
}

function applyTheme(key){
  const t=THEMES[key]||THEMES.light
  Object.entries(t).forEach(([k,v])=>{if(k.startsWith('--'))document.documentElement.style.setProperty(k,v)})
  document.body.style.background=t['--bg']
  document.body.style.color=t['--text']
}

const THEME_CHARACTERS={
  light:{emoji:'📚',name:'Bookworm Buddy',chars:['📚','✏️','🎒','📐','🌟'],colors:['#6C63FF','#A78BFA','#43C6AC','#FFB347','#F472B6'],bg:'linear-gradient(135deg,#F4F3FF,#E8E6FF)',border:'#C4C0FF',message:'Keep studying, superstar!',animation:'bounce'},
  dark:{emoji:'🌙',name:'Night Owl',chars:['🦉','🌙','⭐','💫','🔭'],colors:['#7B74FF','#A78BFA','#43C6AC','#60A5FA','#F472B6'],bg:'linear-gradient(135deg,#1e1e30,#252540)',border:'#3a3a5c',message:'Night grind mode: ON',animation:'float'},
  batman:{emoji:'🦇',name:'Dark Knight',chars:['🦇','🌃','🌑','⚡','🖤'],colors:['#f0e060','#a09830','#f0e060','#c8b800','#ff8800'],bg:'linear-gradient(135deg,#0a0a0f,#1a1a08)',border:'#f0e06033',message:'I am Batman.',animation:'float'},
  avengers:{emoji:'🛡️',name:'Study Avenger',chars:['🛡️','⚡','🔴','🦾','🪖'],colors:['#c62828','#1565c0','#f9a825','#c62828','#1565c0'],bg:'linear-gradient(135deg,#0d1117,#1c2128)',border:'#c6282844',message:'Avengers... STUDY!',animation:'assemble'},
  barbie:{emoji:'💖',name:'Study Barbie',chars:['💖','👛','✨','💅','👠'],colors:['#ff1493','#ff69b4','#ff1493','#ffb347','#ff69b4'],bg:'linear-gradient(135deg,#fff0f8,#ffd6ee)',border:'#ff69b4',message:"She's studying, she's everything!",animation:'sparkle'},
  unicorn:{emoji:'🦄',name:'Uni the Unicorn',chars:['🦄','🌈','⭐','🌸','💜'],colors:['#a855f7','#ec4899','#f59e0b','#a855f7','#ec4899'],bg:'linear-gradient(135deg,#fdf4ff,#f3e0ff)',border:'#d8b4fe',message:'Believe in your magic! ✨',animation:'rainbow'},
  anime:{emoji:'⚔️',name:'Study Protagonist',chars:['⚔️','🌸','⛩️','🔥','💢'],colors:['#ff6400','#00aa44','#ffcc00','#ff6400','#00aa44'],bg:'linear-gradient(135deg,#fff8f0,#ffe8d0)',border:'#ffd0a0',message:'この試験は俺が倒す！',animation:'power-up'},
  nature:{emoji:'🌿',name:'Forest Scholar',chars:['🌿','🍃','🌱','🌳','🦋'],colors:['#2e7d32','#43a047','#66bb6a','#2e7d32','#43a047'],bg:'linear-gradient(135deg,#f0f7f0,#e0f0e0)',border:'#a5d6a7',message:'Grow like a tree 🌱',animation:'sway'},
  cars:{emoji:'🏎️',name:'Speed Learner',chars:['🏎️','🏁','🔥','⚡','💨'],colors:['#ff3200','#00ff88','#ffcc00','#ff3200','#00ff88'],bg:'linear-gradient(135deg,#0a0a0a,#1e1e1e)',border:'#ff320044',message:'FULL THROTTLE STUDYING!',animation:'zoom'},
}

function ThemeCharacter({theme}){
  const cfg=THEME_CHARACTERS[theme]||THEME_CHARACTERS.light
  const T=THEMES[theme]||THEMES.light
  return(
    <div style={{marginTop:32,borderRadius:24,border:`2px solid ${cfg.border}`,background:cfg.bg,padding:'28px 24px',display:'flex',alignItems:'center',gap:28,overflow:'hidden',position:'relative'}}>
      <style>{`
        @keyframes tc-bounce{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-18px) rotate(-8deg)}75%{transform:translateY(-8px) rotate(6deg)}}
        @keyframes tc-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes tc-assemble{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.15) rotate(5deg)}}
        @keyframes tc-sparkle{0%,100%{transform:scale(1) rotate(0deg)}25%{transform:scale(1.2) rotate(-10deg)}75%{transform:scale(1.1) rotate(10deg)}}
        @keyframes tc-rainbow{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
        @keyframes tc-power-up{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.3) translateY(-12px)}}
        @keyframes tc-sway{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
        @keyframes tc-zoom{0%{transform:translateX(-8px) skewX(-5deg)}50%{transform:translateX(8px) skewX(5deg)}100%{transform:translateX(-8px) skewX(-5deg)}}
        @keyframes tc-drift{0%{transform:translateX(0) translateY(0)}33%{transform:translateX(8px) translateY(-6px)}66%{transform:translateX(-6px) translateY(4px)}100%{transform:translateX(0) translateY(0)}}
      `}</style>
      <div style={{fontSize:80,lineHeight:1,flexShrink:0,animation:`tc-${cfg.animation} 2.5s ease-in-out infinite`,filter:'drop-shadow(0 8px 16px rgba(0,0,0,0.18))',userSelect:'none'}}>{cfg.chars[0]}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1.5,color:T['--primary'],marginBottom:4,fontFamily:'Sora,sans-serif',opacity:0.8}}>{cfg.name}</div>
        <div style={{fontSize:20,fontWeight:800,color:T['--text'],fontFamily:'Sora,sans-serif',marginBottom:10,lineHeight:1.3}}>{cfg.message}</div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {cfg.chars.slice(1).map((ch,i)=><div key={i} style={{fontSize:28,animation:`tc-drift ${2+i*0.4}s ease-in-out ${i*0.3}s infinite`,userSelect:'none',filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.12))'}}>{ch}</div>)}
        </div>
      </div>
      {[0,1,2,3].map(i=><div key={i} style={{position:'absolute',width:[60,40,80,30][i],height:[60,40,80,30][i],borderRadius:'50%',background:cfg.colors[i%cfg.colors.length],opacity:0.08,top:['10%','60%','-20%','70%'][i],right:`${8+i*8}%`,animation:`tc-float ${3+i}s ease-in-out ${i*0.5}s infinite`,pointerEvents:'none'}}/>)}
      <div style={{position:'absolute',top:16,right:16,background:T['--primary'],color:'white',borderRadius:50,padding:'4px 12px',fontSize:11,fontWeight:700,fontFamily:'Sora,sans-serif',display:'flex',alignItems:'center',gap:5,boxShadow:`0 4px 14px ${T['--primary']}44`}}>{T.emoji} {T.name}</div>
    </div>
  )
}

const IDB_NAME='studyflow_pdfs',IDB_STORE='pdfs'
function openIDB(){return new Promise((res,rej)=>{const r=indexedDB.open(IDB_NAME,1);r.onupgradeneeded=e=>e.target.result.createObjectStore(IDB_STORE);r.onsuccess=e=>res(e.target.result);r.onerror=()=>rej(r.error)})}
async function savePDF(key,file){const db=await openIDB();return new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readwrite');tx.objectStore(IDB_STORE).put(file,key);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
async function getPDF(key){const db=await openIDB();return new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readonly');const r=tx.objectStore(IDB_STORE).get(key);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}
async function deletePDF(key){const db=await openIDB();return new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readwrite');tx.objectStore(IDB_STORE).delete(key);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}

const COLORS=['#6C63FF','#FF6584','#43C6AC','#FFB347','#A78BFA','#F472B6','#34D399','#60A5FA']
const POMO_BGS={gradient1:'linear-gradient(135deg,#667eea,#764ba2)',gradient2:'linear-gradient(135deg,#f093fb,#f5576c)',gradient3:'linear-gradient(135deg,#4facfe,#00f2fe)',gradient4:'linear-gradient(135deg,#43e97b,#38f9d7)',solid1:'#1a1a2e',solid2:'#2d1b69',solid3:'#0f3460',solid4:'#16213e',lofi1:'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80) center/cover',lofi2:'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80) center/cover',lofi3:'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80) center/cover'}
const BG_LABELS={gradient1:'Purple Dream',gradient2:'Pink Sunset',gradient3:'Ocean Blue',gradient4:'Mint Fresh',solid1:'Midnight',solid2:'Deep Purple',solid3:'Navy',solid4:'Dark Blue',lofi1:'Mountain Night',lofi2:'Mountain Lake',lofi3:'Forest'}
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']
const daysUntil=d=>{if(!d)return null;return Math.ceil((new Date(d)-new Date())/86400000)}
const courseProgress=c=>{let t=0,d=0;(c.subjects||[]).forEach(s=>(s.chapters||[]).forEach(ch=>{t++;if(ch.done)d++}));return t?Math.round(d/t*100):0}
const fmtTime=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

function ThemePicker({currentTheme,onSelect,onClose}){
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div className="pop" style={{background:'var(--card)',borderRadius:22,padding:0,width:520,maxWidth:'95vw',maxHeight:'85vh',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.4)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'22px 26px 18px',background:'linear-gradient(135deg,var(--primary),var(--success))'}}>
          <h3 style={{fontSize:20,fontWeight:800,color:'white',marginBottom:4}}>🎨 Choose Your Theme</h3>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>Personalize the whole app to match your vibe!</p>
        </div>
        <div style={{padding:20,overflowY:'auto',maxHeight:'65vh'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {Object.entries(THEMES).map(([key,t])=>{
              const isActive=currentTheme===key
              return(
                <div key={key} onClick={()=>{onSelect(key);onClose()}} style={{borderRadius:16,overflow:'hidden',cursor:'pointer',border:`3px solid ${isActive?t['--primary']:'transparent'}`,transition:'all 0.2s',transform:isActive?'scale(1.03)':'scale(1)'}} onMouseEnter={e=>!isActive&&(e.currentTarget.style.transform='scale(1.02)')} onMouseLeave={e=>!isActive&&(e.currentTarget.style.transform='scale(1)')}>
                  <div style={{height:70,background:t['--bg'],position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',left:0,top:0,bottom:0,width:24,background:t.sidebarBg||t['--sidebar'],display:'flex',flexDirection:'column',padding:'6px 3px',gap:3}}>
                      {[1,2,3].map(i=><div key={i} style={{height:3,borderRadius:99,background:t['--primary'],opacity:i===1?0.9:0.3,width:i===1?'80%':'60%'}}/>)}
                    </div>
                    <div style={{marginLeft:24,padding:8,display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{height:5,borderRadius:99,background:t['--primary'],width:'55%',opacity:0.8}}/>
                      <div style={{display:'flex',gap:3}}>
                        <div style={{flex:1,height:20,borderRadius:8,background:t['--card'],border:`1px solid ${t['--border']}`}}/>
                        <div style={{flex:1,height:20,borderRadius:8,background:t['--card'],border:`1px solid ${t['--border']}`}}/>
                      </div>
                    </div>
                    {t.decoration&&<div style={{position:'absolute',bottom:3,right:4,fontSize:14,opacity:0.5}}>{t.decoration[0]}</div>}
                    {isActive&&<div style={{position:'absolute',top:5,right:5,width:18,height:18,borderRadius:'50%',background:t['--primary'],display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'white',fontWeight:700}}>✓</div>}
                  </div>
                  <div style={{background:isActive?t['--primary']:t['--card'],padding:'8px 12px',display:'flex',alignItems:'center',gap:8,borderTop:`1px solid ${t['--border']}`}}>
                    <span style={{fontSize:16}}>{t.emoji}</span>
                    <span style={{fontSize:13,fontWeight:700,color:isActive?'white':t['--text'],fontFamily:'Sora'}}>{t.name}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{padding:'14px 22px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{padding:'10px 22px',background:'transparent',color:'var(--text)',border:'2px solid var(--border)',borderRadius:50,fontFamily:'Sora',fontWeight:600,fontSize:13,cursor:'pointer'}}>Close</button>
        </div>
      </div>
    </div>
  )
}

function ProfilePanel({user,data,saveD,onClose,onNameChange}){
  const[name,setName]=useState(data.displayName||user.name)
  const[saved,setSaved]=useState(false)
  const[importMsg,setImportMsg]=useState('')
  const[avatarLoading,setAvatarLoading]=useState(false)
  const avatarRef=useRef(null)
  const icsImportRef=useRef(null)
  const courses=data.courses||[]
  const totalMins=Math.round((data.sessions||[]).reduce((a,s)=>a+(s.mins||0),0))
  const totalHours=(totalMins/60).toFixed(1)
  const totalTasks=(data.planner||[]).filter(t=>t.done).length
  const totalSessions=(data.sessions||[]).length
  const totalChapters=courses.reduce((a,c)=>a+(c.subjects||[]).reduce((b,s)=>b+(s.chapters||[]).length,0),0)
  const doneChapters=courses.reduce((a,c)=>a+(c.subjects||[]).reduce((b,s)=>b+(s.chapters||[]).filter(ch=>ch.done).length,0),0)
  const T=THEMES[data.theme||'light']||THEMES.light

  // ── Avatar upload: delete old from DB → compress new → save new ──
  const handleAvatar=async e=>{
    const file=e.target.files[0]
    if(!file) return
    if(!file.type.startsWith('image/')){ alert('Please select an image file.'); return }
    setAvatarLoading(true)
    try {
      // Step 1: wipe old avatar from DB immediately (fire-and-forget, frees storage)
      if(user?.id) supa.patchAvatar(user.id, null).catch(()=>{})
      // Step 2: compress new image to ≤200KB / 400×400px
      const compressed = await compressAvatar(file)
      // Step 3: write new avatar to DB and update local state
      if(user?.id) supa.patchAvatar(user.id, compressed).catch(()=>{})
      saveD({...data, avatar: compressed})
      // Reset so same file can be picked again next time
      if(avatarRef.current) avatarRef.current.value=''
    } catch(err){
      alert('Could not process image. Please try a different file.')
    }
    setAvatarLoading(false)
  }

  const saveName=()=>{if(!name.trim())return;saveD({...data,displayName:name.trim()});onNameChange(name.trim());setSaved(true);setTimeout(()=>setSaved(false),2000)}
  const exportICSFile=()=>{
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//StudyFlow//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH']
    let count=0
    courses.forEach(c=>(c.exams||[]).forEach(ex=>{if(!ex.date)return;const d=ex.date.replace(/-/g,'');lines.push('BEGIN:VEVENT',`UID:${ex.id}@studyflow`,`DTSTART;VALUE=DATE:${d}`,`DTEND;VALUE=DATE:${d}`,`SUMMARY:📝 ${ex.name} - ${c.name}`,`DESCRIPTION:Exam for ${c.name}`,'END:VEVENT');count++}))
    lines.push('END:VCALENDAR')
    if(count===0){alert('No exam dates to export! Add exams first.');return}
    const blob=new Blob([lines.join('\r\n')],{type:'text/calendar'})
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='studyflow_exams.ics';a.click();URL.revokeObjectURL(url)
  }
  const handleICSImport=e=>{
    const file=e.target.files[0];if(!file)return
    const r=new FileReader()
    r.onload=ev=>{
      try{
        const text=ev.target.result;const events=[]
        text.split('BEGIN:VEVENT').slice(1).forEach(block=>{
          const getVal=key=>{const m=block.match(new RegExp(key+'[^:]*:([^\\r\\n]+)'));return m?m[1].trim():''}
          const summary=getVal('SUMMARY');const dtstart=getVal('DTSTART')
          if(summary&&dtstart){const raw=dtstart.replace(/[TZ]/g,'').slice(0,8);const date=raw.length===8?`${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`:'';if(date)events.push({summary,date})}
        })
        if(events.length===0){setImportMsg('❌ No events found.');return}
        saveD({...data,importedCalEvents:events});setImportMsg(`✅ Imported ${events.length} events!`);setTimeout(()=>setImportMsg(''),4000)
      }catch{setImportMsg('❌ Could not read file.')}
    }
    r.readAsText(file);if(icsImportRef.current)icsImportRef.current.value=''
  }
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div className="pop" style={{background:'var(--card)',borderRadius:22,padding:0,width:500,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 32px 80px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{background:`linear-gradient(135deg,${T['--primary']},${T['--success']})`,padding:'26px 26px 20px',borderRadius:'22px 22px 0 0'}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{position:'relative',cursor:avatarLoading?'wait':'pointer'}} onClick={()=>!avatarLoading&&avatarRef.current?.click()}>
              {data.avatar
                ?<img src={data.avatar} style={{width:70,height:70,borderRadius:'50%',objectFit:'cover',border:'3px solid rgba(255,255,255,0.5)',opacity:avatarLoading?0.5:1}}/>
                :<div style={{width:70,height:70,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:800,color:'white',border:'3px solid rgba(255,255,255,0.4)',opacity:avatarLoading?0.5:1}}>{(data.displayName||user.name)?.[0]?.toUpperCase()}</div>
              }
              <div style={{position:'absolute',bottom:0,right:0,width:22,height:22,borderRadius:'50%',background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>{avatarLoading?'⏳':'📷'}</div>
            </div>
            <div>
              <h2 style={{fontSize:19,fontWeight:800,color:'white',marginBottom:2}}>{data.displayName||user.name}</h2>
              <p style={{fontSize:12,color:'rgba(255,255,255,0.75)'}}>{user.email}</p>
              <div style={{display:'inline-flex',alignItems:'center',gap:5,marginTop:5,background:'rgba(255,255,255,0.15)',borderRadius:50,padding:'3px 10px'}}><span style={{fontSize:13}}>{T.emoji}</span><span style={{fontSize:11,color:'white',fontWeight:600}}>{T.name} Theme</span></div>
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} style={{display:'none'}}/>
        </div>
        <div style={{padding:22}}>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:6}}>Display Name</label>
            <div style={{display:'flex',gap:10}}>
              <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveName()} style={{flex:1,padding:'11px 14px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:14,outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              <button onClick={saveName} style={{padding:'11px 18px',background:'var(--primary)',color:'white',border:'none',borderRadius:50,fontFamily:'Sora',fontWeight:600,fontSize:13,cursor:'pointer'}}>{saved?'✓ Saved!':'Save'}</button>
            </div>
          </div>
          <h3 style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:12}}>📊 Your Stats</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22}}>
            {[{icon:'⏱️',label:'Study Hours',val:totalHours+'h',color:'var(--primary)'},{icon:'🍅',label:'Pomodoro Sessions',val:totalSessions,color:'#FF6584'},{icon:'✅',label:'Tasks Completed',val:totalTasks,color:'var(--success)'},{icon:'📖',label:'Chapters Done',val:`${doneChapters}/${totalChapters}`,color:'var(--warning)'}].map(s=>(
              <div key={s.label} style={{background:'var(--bg)',borderRadius:14,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
                <div style={{fontSize:22}}>{s.icon}</div>
                <div><div style={{fontSize:18,fontWeight:800,color:s.color,fontFamily:'Sora'}}>{s.val}</div><div style={{fontSize:10,color:'var(--text2)'}}>{s.label}</div></div>
              </div>
            ))}
          </div>
          <h3 style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:12}}>📅 Calendar Sync</h3>
          <div style={{background:'var(--bg)',borderRadius:14,padding:16,marginBottom:20}}>
            <p style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:4}}>📤 Export exam dates</p>
            <p style={{fontSize:11,color:'var(--text2)',marginBottom:10,lineHeight:1.6}}>Download <strong>.ics</strong> → import into Google Calendar, Apple Calendar, or Outlook.</p>
            <button onClick={exportICSFile} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px',background:'var(--primary)',color:'white',border:'none',borderRadius:12,fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'Sora',marginBottom:12}}>⬇ Export to Google / Apple Calendar</button>
            <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
              <p style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:8}}>📥 Import from Google / Apple</p>
              <button onClick={()=>icsImportRef.current?.click()} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px',background:'var(--bg)',color:'var(--text)',border:'2px solid var(--border)',borderRadius:12,fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'Sora'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--primary)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>⬆ Upload .ics from Google / Apple</button>
              <input ref={icsImportRef} type="file" accept=".ics,text/calendar" onChange={handleICSImport} style={{display:'none'}}/>
              {importMsg&&<div style={{marginTop:10,padding:'10px 14px',background:importMsg.startsWith('✅')?'rgba(67,198,172,0.12)':'rgba(255,101,132,0.12)',borderRadius:10,fontSize:13,fontWeight:500,color:importMsg.startsWith('✅')?'var(--success)':'#FF6584'}}>{importMsg}</div>}
              {(data.importedCalEvents||[]).length>0&&(
                <div style={{marginTop:10,padding:'12px 14px',background:'var(--card)',borderRadius:10,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--text)',marginBottom:6}}>{data.importedCalEvents.length} imported events</div>
                  <div style={{maxHeight:70,overflowY:'auto',display:'flex',flexDirection:'column',gap:3}}>
                    {data.importedCalEvents.slice(0,4).map((ev,i)=><div key={i} style={{fontSize:11,color:'var(--text2)',display:'flex',gap:8,alignItems:'center'}}><span style={{color:'var(--success)',flexShrink:0,fontWeight:600}}>{ev.date}</span><span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.summary}</span></div>)}
                    {data.importedCalEvents.length>4&&<div style={{fontSize:11,color:'var(--text2)'}}>+{data.importedCalEvents.length-4} more</div>}
                  </div>
                  <button onClick={()=>saveD({...data,importedCalEvents:[]})} style={{marginTop:6,background:'none',border:'none',color:'#FF6584',fontSize:11,cursor:'pointer',fontWeight:600}}>🗑 Remove imported events</button>
                </div>
              )}
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}><button onClick={onClose} style={{padding:'10px 22px',background:'transparent',color:'var(--primary)',border:'2px solid var(--border)',borderRadius:50,fontFamily:'Sora',fontWeight:600,fontSize:13,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--primary)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>Close</button></div>
        </div>
      </div>
    </div>
  )
}

// ── Layout: accepts isFullscreen to hide sidebar when Pomodoro focus mode is on ──
function Layout({user,page,setPage,theme,setTheme,data,saveD,onSignOut,children,isFullscreen}){
  const[showProfile,setShowProfile]=useState(false)
  const[showThemePicker,setShowThemePicker]=useState(false)
  const[displayName,setDisplayName]=useState(data.displayName||user.name)
  const nav=[['dashboard','🏠','Dashboard'],['courses','📚','My Courses'],['progress','📊','Progress'],['pomodoro','🍅','Pomodoro']]
  const active=page==='course'||page==='subject'?'courses':page
  const T=THEMES[theme]||THEMES.light
  const isDark=T.sidebarDark
  const sidebarText=isDark?'rgba(255,255,255,0.75)':'var(--text2)'
  const sidebarActive=isDark?'white':T['--primary']
  const sidebarActiveBg=isDark?'rgba(255,255,255,0.12)':`${T['--primary']}18`
  const handleTheme=t=>{setTheme(t);applyTheme(t);saveD({...data,theme:t})}

  return(
    <div style={{display:'flex',minHeight:'100vh',background:T['--bg']}}>
      {/* Sidebar — fully hidden when Focus Mode is active */}
      {!isFullscreen&&(
        <div style={{width:252,background:T.sidebarBg||'var(--sidebar)',borderRight:`1px solid ${isDark?'rgba(255,255,255,0.08)':'var(--border)'}`,display:'flex',flexDirection:'column',padding:'22px 14px',position:'fixed',top:0,left:0,height:'100vh',zIndex:100,overflow:'hidden',transition:'background 0.3s'}}>
          {T.decoration&&(
            <div style={{position:'absolute',bottom:70,right:8,fontSize:28,lineHeight:1.6,pointerEvents:'none',userSelect:'none',opacity:0.25}}>
              {T.decoration.map((e,i)=><div key={i}>{e}</div>)}
            </div>
          )}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:32,paddingLeft:8,position:'relative',zIndex:1}}>
            <span style={{fontSize:26}}>{T.sidebarEmoji||'📚'}</span>
            <span style={{fontFamily:'Sora',fontWeight:800,fontSize:19,color:T['--primary']}}>StudyFlow</span>
          </div>
          <nav style={{flex:1,position:'relative',zIndex:1}}>
            <p style={{fontSize:10,fontWeight:700,color:sidebarText,textTransform:'uppercase',letterSpacing:1,paddingLeft:16,marginBottom:8,opacity:0.6}}>Menu</p>
            {nav.map(([id,icon,label])=>(
              <div key={id} className="navitem" style={{color:active===id?sidebarActive:sidebarText,background:active===id?sidebarActiveBg:'transparent',fontWeight:active===id?700:500}} onClick={()=>setPage(id)}>
                <span style={{fontSize:17}}>{icon}</span><span>{label}</span>
                {active===id&&T.decoration&&<span style={{marginLeft:'auto',fontSize:12}}>{T.decoration[0]}</span>}
              </div>
            ))}
          </nav>
          <div style={{borderTop:`1px solid ${isDark?'rgba(255,255,255,0.1)':'var(--border)'}`,paddingTop:14,position:'relative',zIndex:1}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px',marginBottom:4}}>
              <span style={{fontSize:12,fontWeight:600,color:sidebarText,opacity:0.8}}>🌙 Dark</span>
              <div onClick={()=>handleTheme(isDark?'light':'dark')} style={{width:36,height:20,borderRadius:50,background:isDark?T['--primary']:'#ddd',cursor:'pointer',position:'relative',transition:'background 0.3s'}}>
                <div style={{width:16,height:16,borderRadius:'50%',background:'white',position:'absolute',top:2,left:isDark?18:2,transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
              </div>
            </div>
            <div onClick={()=>setShowThemePicker(true)} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 16px',borderRadius:10,cursor:'pointer',marginBottom:4,transition:'all 0.15s'}} onMouseEnter={e=>e.currentTarget.style.background=sidebarActiveBg} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{fontSize:15}}>{T.emoji}</span>
              <span style={{fontSize:12,fontWeight:600,color:sidebarText,opacity:0.8,flex:1}}>Theme: {T.name}</span>
              <span style={{fontSize:11,color:T['--primary'],fontWeight:700}}>Change</span>
            </div>
            <div onClick={()=>setShowProfile(true)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:isDark?'rgba(255,255,255,0.06)':'var(--bg)',borderRadius:12,marginBottom:8,cursor:'pointer',transition:'opacity 0.15s'}} onMouseEnter={e=>e.currentTarget.style.opacity='0.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              {data.avatar?<img src={data.avatar} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>:<div style={{width:36,height:36,borderRadius:'50%',background:`linear-gradient(135deg,${T['--primary']},${T['--success']})`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:15,flexShrink:0}}>{displayName?.[0]?.toUpperCase()}</div>}
              <div style={{overflow:'hidden',flex:1}}>
                <div style={{fontWeight:600,fontSize:13,color:isDark?'white':'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{displayName}</div>
                <div style={{fontSize:10,color:T['--primary'],fontWeight:600}}>View Profile →</div>
              </div>
            </div>
            <div className="navitem" style={{color:'#FF6584'}} onClick={onSignOut||(() => { localStorage.removeItem(SESS); window.location.reload() })}><span>🚪</span><span style={{fontSize:13}}>Sign Out</span></div>
          </div>
        </div>
      )}

      <main
        className={theme==='batman'?'batman-bg':''}
        style={{
          marginLeft: isFullscreen ? 0 : 252,
          flex:1,
          padding: isFullscreen ? 0 : 32,
          minHeight:'100vh',
          background:theme==='batman'?undefined:T['--bg'],
          transition:'margin-left 0.3s, padding 0.3s'
        }}>
        {children}
      </main>

      {showThemePicker&&<ThemePicker currentTheme={theme} onSelect={handleTheme} onClose={()=>setShowThemePicker(false)}/>}
      {showProfile&&<ProfilePanel user={user} data={data} saveD={saveD} onClose={()=>setShowProfile(false)} onNameChange={name=>{setDisplayName(name)}}/>}
    </div>
  )
}

function SmartStudyModal({data,onClose,setPage,setSelSubject,setSelCourse}){
  const weak=[]
  ;(data.courses||[]).forEach(course=>{;(course.subjects||[]).forEach(subject=>{;(subject.chapters||[]).forEach(ch=>{if(!ch.done){const examWeight=(course.exams||[]).filter(ex=>ex.chapters?.[`${subject.id}_${ch.id}`]).length;weak.push({ch,subject,course,confidence:ch.confidence||0,examWeight,urgency:(5-(ch.confidence||0))+(examWeight*2)})}})})})
  const top3=weak.sort((a,b)=>b.urgency-a.urgency).slice(0,3)
  const urgColor=u=>u>=8?'#FF6584':u>=5?'#FFB347':'#43C6AC'
  const urgLabel=u=>u>=8?'🔴 High':u>=5?'🟡 Medium':'🟢 Low'
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div className="pop" style={{background:'var(--card)',borderRadius:22,padding:0,width:500,maxWidth:'95vw',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{background:'linear-gradient(135deg,var(--primary),#A78BFA)',padding:'22px 26px'}}><div style={{display:'flex',alignItems:'center',gap:12}}><div style={{fontSize:32}}>🧠</div><div><h3 style={{fontSize:19,fontWeight:800,color:'white',marginBottom:2}}>Smart Study</h3><p style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>Your weakest chapters — focus here first!</p></div></div></div>
        <div style={{padding:22}}>
          {top3.length===0?(<div style={{textAlign:'center',padding:'28px 0'}}><div style={{fontSize:52,marginBottom:10}}>🎉</div><h3 style={{fontWeight:700,fontSize:17,color:'var(--text)',marginBottom:6}}>All caught up!</h3><p style={{color:'var(--text2)',fontSize:13}}>You've completed all chapters. Amazing!</p></div>):(
            <>
              <p style={{fontSize:13,color:'var(--text2)',marginBottom:14}}>Based on confidence & exam weight, study these <strong style={{color:'var(--text)'}}>3 chapters</strong> right now:</p>
              <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
                {top3.map(({ch,subject,course,confidence,examWeight,urgency},i)=>(
                  <div key={ch.id} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:'var(--bg)',borderRadius:14,border:`2px solid ${urgColor(urgency)}33`,cursor:'pointer',transition:'all 0.15s'}} onClick={()=>{setSelCourse(course.id);setSelSubject({subjectId:subject.id,courseId:course.id});setPage('subject');onClose()}} onMouseEnter={e=>e.currentTarget.style.background='var(--hover)'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg)'}>
                    <div style={{width:34,height:34,borderRadius:'50%',background:`${urgColor(urgency)}22`,border:`2px solid ${urgColor(urgency)}`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,color:urgColor(urgency),flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ch.name}</div>
                      <div style={{fontSize:11,color:'var(--text2)',marginBottom:4}}>{subject.name} · {course.name}</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                        <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:11,opacity:confidence>=s?1:0.2}}>⭐</span>)}</div>
                        {examWeight>0&&<span style={{background:'rgba(255,101,132,0.12)',color:'#FF6584',borderRadius:50,padding:'2px 8px',fontSize:10,fontWeight:600}}>📝 {examWeight} exam{examWeight>1?'s':''}</span>}
                        <span style={{fontSize:10,fontWeight:600,color:urgColor(urgency)}}>{urgLabel(urgency)}</span>
                      </div>
                    </div>
                    <span style={{fontSize:12,color:'var(--primary)',fontWeight:600,flexShrink:0}}>Study →</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{display:'flex',justifyContent:'center',marginTop:14}}><Btn onClick={onClose}>Got it!</Btn></div>
        </div>
      </div>
    </div>
  )
}

function Dashboard({user,data,saveD,setPage,setSelCourse,setSelSubject}){
  const[plannerView,setPlannerView]=useState('daily')
  const[newTask,setNewTask]=useState('')
  const[calMonth,setCalMonth]=useState(new Date().getMonth())
  const[calYear,setCalYear]=useState(new Date().getFullYear())
  const[showSmartStudy,setShowSmartStudy]=useState(false)
  const courses=data.courses||[]
  const planner=data.planner||[]
  const now=new Date()
  const today=now.toISOString().split('T')[0]
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate()
  const firstDay=new Date(calYear,calMonth,1).getDay()
  const examDates={}
  courses.forEach(c=>(c.exams||[]).forEach(ex=>{if(ex.date){const d=new Date(ex.date);if(d.getMonth()===calMonth&&d.getFullYear()===calYear){const day=d.getDate();if(!examDates[day])examDates[day]=[];examDates[day].push({name:ex.name,course:c.name,color:'#FF6584'})}}}))
  ;(data.importedCalEvents||[]).forEach(ev=>{if(ev.date){const d=new Date(ev.date+'T12:00:00');if(d.getMonth()===calMonth&&d.getFullYear()===calYear){const day=d.getDate();if(!examDates[day])examDates[day]=[];examDates[day].push({name:ev.summary,course:'Imported',color:'#43C6AC'})}}})
  const studyDays=new Set((data.sessions||[]).map(s=>s.date?.split('T')[0]))
  let nearestExam=null,nearestDays=Infinity
  courses.forEach(c=>(c.exams||[]).forEach(ex=>{if(ex.date){const d=daysUntil(ex.date);if(d!==null&&d>=0&&d<nearestDays){nearestDays=d;nearestExam={...ex,courseName:c.name,color:c.color}}}}))
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-now.getDay())
  const weekEnd=new Date(weekStart);weekEnd.setDate(weekStart.getDate()+6)
  const todayTasks=planner.filter(t=>t.date===today)
  const weekTasks=planner.filter(t=>{const d=new Date(t.date);return d>=weekStart&&d<=weekEnd})
  const shownTasks=plannerView==='daily'?todayTasks:weekTasks
  const addTask=()=>{if(!newTask.trim())return;saveD({...data,planner:[...planner,{id:Date.now(),text:newTask.trim(),done:false,date:today}]});setNewTask('')}
  const toggleTask=id=>saveD({...data,planner:planner.map(t=>t.id===id?{...t,done:!t.done}:t)})
  const delTask=id=>saveD({...data,planner:planner.filter(t=>t.id!==id)})
  const dailyGoal=data.dailyGoal||120,weeklyGoal=data.weeklyGoal||600
  const todaySessions=(data.sessions||[]).filter(s=>s.date?.split('T')[0]===today)
  const todayMins=todaySessions.reduce((a,s)=>a+(s.mins||0),0)
  const weekSessions=(data.sessions||[]).filter(s=>{const d=new Date(s.date);return d>=weekStart&&d<=weekEnd})
  const weekMins=weekSessions.reduce((a,s)=>a+(s.mins||0),0)
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}} className="fade">
        <div><h1 style={{fontSize:26,fontWeight:800,color:'var(--text)'}}>Hey, {(data.displayName||user.name).split(' ')[0]} 👋</h1><p style={{color:'var(--text2)',marginTop:2,fontSize:14}}>{now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>setShowSmartStudy(true)} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',background:'linear-gradient(135deg,#A78BFA,#6C63FF)',color:'white',border:'none',borderRadius:50,fontFamily:'Sora',fontWeight:600,fontSize:13,cursor:'pointer',boxShadow:'0 4px 14px rgba(167,139,250,0.35)',transition:'opacity 0.2s'}} onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>🧠 Smart Study</button>
          <Btn onClick={()=>setPage('courses')}>+ Add Course</Btn>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:18,marginBottom:20}}>
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
              const day=i+1,isToday=day===now.getDate()&&calMonth===now.getMonth()&&calYear===now.getFullYear(),hasExam=examDates[day],dateStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,studied=studyDays.has(dateStr)
              return(
                <div key={day} style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div className="cal-day" style={{background:isToday?'var(--primary)':hasExam?hasExam[0].color:studied?'rgba(67,198,172,0.25)':'transparent',color:isToday||hasExam?'white':'var(--text)',fontWeight:isToday?800:hasExam?700:400,fontSize:11,outline:hasExam&&!isToday?`2px solid ${hasExam[0].color}`:'none',outlineOffset:2,cursor:hasExam?'pointer':'default'}}
                    onMouseEnter={e=>{if(hasExam){const t=e.currentTarget.parentNode.querySelector('.exam-tip');if(t)t.style.display='block';e.currentTarget.style.transform='scale(1.15)'}}}
                    onMouseLeave={e=>{if(hasExam){const t=e.currentTarget.parentNode.querySelector('.exam-tip');if(t)t.style.display='none';e.currentTarget.style.transform='scale(1)'}}}>
                    {day}
                  </div>
                  {hasExam&&(
                    <div className="exam-tip" style={{display:'none',position:'absolute',bottom:'110%',left:'50%',transform:'translateX(-50%)',background:'rgba(20,20,40,0.96)',color:'white',borderRadius:10,padding:'8px 12px',fontSize:11,fontWeight:600,whiteSpace:'nowrap',zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,0.4)',border:`1px solid ${hasExam[0].color}44`,pointerEvents:'none',lineHeight:1.7}}>
                      {hasExam.map((e,i)=><div key={i}><span style={{color:e.color}}>📝 {e.name}</span><br/><span style={{opacity:0.7,fontSize:10}}>{e.course}</span>{i<hasExam.length-1&&<hr style={{border:'none',borderTop:'1px solid rgba(255,255,255,0.15)',margin:'3px 0'}}/>}</div>)}
                      <div style={{position:'absolute',top:'100%',left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'5px solid transparent',borderRight:'5px solid transparent',borderTop:'5px solid rgba(20,20,40,0.96)'}}/>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
            {[['var(--primary)','Today'],['#FF6584','Exams'],['#43C6AC','Imported'],['rgba(67,198,172,0.4)','Studied']].map(([c,l])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'var(--text2)'}}><div style={{width:8,height:8,borderRadius:'50%',background:c}}/>{l}</div>
            ))}
          </div>
        </Card>
        <Card className="fade2">
          <h3 style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:14}}>⏳ Next Exam</h3>
          {nearestExam?(<div style={{textAlign:'center',padding:'4px 0'}}>
            <div style={{fontSize:54,fontWeight:800,fontFamily:'Sora',color:nearestExam.color||'var(--primary)',lineHeight:1}}>{nearestDays}</div>
            <div style={{fontSize:13,color:'var(--text2)',marginTop:4,marginBottom:12}}>days left</div>
            <div style={{background:'var(--bg)',borderRadius:12,padding:'10px 14px',textAlign:'left'}}>
              <div style={{fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:2}}>{nearestExam.name}</div>
              <div style={{fontSize:12,color:'var(--text2)'}}>{nearestExam.courseName}</div>
              <div style={{fontSize:11,color:'var(--text2)',marginTop:3}}>📅 {new Date(nearestExam.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
            </div>
            {nearestDays<=3&&<div style={{marginTop:10,background:'#FFF0F3',color:'#FF6584',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:600}}>🔥 Exam very soon!</div>}
          </div>):(<div style={{textAlign:'center',padding:'20px 0',color:'var(--text2)'}}><div style={{fontSize:36,marginBottom:8}}>🎉</div><p style={{fontSize:13}}>No upcoming exams</p></div>)}
        </Card>
        <Card className="fade3">
          <h3 style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:14}}>🎯 Study Goals</h3>
          {[{label:'Daily Goal',cur:todayMins,goal:dailyGoal,color:'var(--primary)'},{label:'Weekly Goal',cur:weekMins,goal:weeklyGoal,color:'var(--success)'}].map(g=>(
            <div key={g.label} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:12,color:'var(--text2)'}}>{g.label}</span><span style={{fontSize:12,fontWeight:700,color:g.color}}>{g.cur}/{g.goal} min</span></div>
              <div style={{height:7,background:'var(--border)',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(g.cur/g.goal*100,100)}%`,background:g.color,borderRadius:99,transition:'width 0.6s'}}/></div>
            </div>
          ))}
          <div style={{display:'flex',gap:8}}>
            <div style={{flex:1,background:'var(--bg)',borderRadius:10,padding:'8px 10px',textAlign:'center'}}><div style={{fontSize:20,fontWeight:800,color:'var(--primary)',fontFamily:'Sora'}}>{todaySessions.length}</div><div style={{fontSize:10,color:'var(--text2)'}}>Today</div></div>
            <div style={{flex:1,background:'var(--bg)',borderRadius:10,padding:'8px 10px',textAlign:'center'}}><div style={{fontSize:20,fontWeight:800,color:'var(--success)',fontFamily:'Sora'}}>{weekSessions.length}</div><div style={{fontSize:10,color:'var(--text2)'}}>This Week</div></div>
          </div>
        </Card>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:18}}>
        <Card>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <h3 style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>📋 Planner</h3>
            <div style={{display:'flex',gap:3,background:'var(--bg)',borderRadius:50,padding:3}}>
              {['daily','weekly'].map(v=><button key={v} className="tab-btn" onClick={()=>setPlannerView(v)} style={{background:plannerView===v?'var(--primary)':'transparent',color:plannerView===v?'white':'var(--text2)',padding:'5px 12px',fontSize:12}}>{v==='daily'?'Today':'Week'}</button>)}
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTask()} placeholder="Add a task..." style={{flex:1,padding:'8px 12px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:13,outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            <button onClick={addTask} style={{padding:'8px 14px',background:'var(--primary)',color:'white',border:'none',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:14}}>+</button>
          </div>
          <div style={{maxHeight:220,overflowY:'auto',display:'flex',flexDirection:'column',gap:5}}>
            {shownTasks.length===0?<div style={{textAlign:'center',padding:'20px 0',color:'var(--text2)',fontSize:13}}>{plannerView==='daily'?'No tasks today! 🎉':'No tasks this week.'}</div>:shownTasks.map(t=>(
              <div key={t.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',background:'var(--bg)',borderRadius:10,opacity:t.done?0.5:1}}>
                <div className="chk" style={{background:t.done?'var(--primary)':'transparent',borderColor:t.done?'var(--primary)':'#ddd',border:'2px solid'}} onClick={()=>toggleTask(t.id)}>{t.done&&<span style={{color:'white',fontSize:11,fontWeight:700}}>✓</span>}</div>
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
          {courses.length===0?(<div style={{textAlign:'center',padding:'28px 0',color:'var(--text2)'}}><div style={{fontSize:36,marginBottom:8}}>📭</div><p style={{fontSize:13}}>No courses yet. <span style={{color:'var(--primary)',cursor:'pointer',fontWeight:600}} onClick={()=>setPage('courses')}>Add one →</span></p></div>):(
            <div style={{display:'flex',flexDirection:'column',gap:10,maxHeight:260,overflowY:'auto'}}>
              {courses.map((c,i)=>{
                const prog=courseProgress(c),nearExam=(c.exams||[]).filter(e=>daysUntil(e.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date))[0],days=nearExam?daysUntil(nearExam.date):null
                return(<div key={c.id} className="hov" onClick={()=>{setSelCourse(c.id);setPage('course')}} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'var(--bg)',borderRadius:12,cursor:'pointer',border:'1px solid var(--border)'}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:c.color||COLORS[i%COLORS.length],flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</span><span style={{fontSize:12,fontWeight:700,color:c.color||COLORS[i%COLORS.length],flexShrink:0,marginLeft:8}}>{prog}%</span></div>
                    <div style={{height:5,background:'var(--border)',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${prog}%`,background:c.color||COLORS[i%COLORS.length],borderRadius:99,transition:'width 0.5s'}}/></div>
                  </div>
                  {days!==null&&<div style={{background:days<=3?'#FF6584':days<=7?'#FFB347':'var(--primary)',color:'white',borderRadius:50,padding:'3px 8px',fontSize:11,fontWeight:700,flexShrink:0}}>{days===0?'Today!':days<0?'Done':`${days}d`}</div>}
                </div>)
              })}
            </div>
          )}
        </Card>
      </div>
      {showSmartStudy&&<SmartStudyModal data={data} onClose={()=>setShowSmartStudy(false)} setPage={setPage} setSelSubject={setSelSubject} setSelCourse={setSelCourse}/>}
    </div>
  )
}

function CoursesPage({user,data,saveD,setPage,setSelCourse}){
  const[modal,setModal]=useState(false)
  const[form,setForm]=useState({name:'',color:'#6C63FF'})
  const courses=data.courses||[]
  const PALETTE=['#6C63FF','#FF6584','#43C6AC','#FFB347','#A78BFA','#F472B6','#34D399','#60A5FA']
  const addCourse=()=>{if(!form.name.trim())return;saveD({...data,courses:[...courses,{id:Date.now(),name:form.name.trim(),color:form.color,subjects:[],exams:[]}]});setForm({name:'',color:'#6C63FF'});setModal(false)}
  const delCourse=id=>{if(!confirm('Delete?'))return;saveD({...data,courses:courses.filter(c=>c.id!==id)})}
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}} className="fade">
        <div><h1 style={{fontSize:26,fontWeight:800,color:'var(--text)'}}>My Courses</h1><p style={{color:'var(--text2)',marginTop:2,fontSize:14}}>{courses.length} courses</p></div>
        <Btn onClick={()=>setModal(true)}>+ Add Course</Btn>
      </div>
      {courses.length===0?<Card style={{textAlign:'center',padding:'56px 32px'}} className="fade2"><div style={{fontSize:56,marginBottom:12}}>📭</div><h3 style={{fontWeight:700,fontSize:18,marginBottom:8,color:'var(--text)'}}>No courses yet</h3><Btn onClick={()=>setModal(true)}>+ Add Course</Btn></Card>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {courses.map((c,i)=>{
            const prog=courseProgress(c),nearExam=(c.exams||[]).filter(e=>daysUntil(e.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date))[0],days=nearExam?daysUntil(nearExam.date):null
            return(<div key={c.id} className="hov" onClick={()=>{setSelCourse(c.id);setPage('course')}} style={{background:'var(--card)',borderRadius:16,padding:20,border:'1px solid var(--border)',borderTop:`4px solid ${c.color}`,cursor:'pointer',boxShadow:'var(--shadow)'}}>
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
            </div>)
          })}
        </div>
      )}
      <ThemeCharacter theme={data.theme || 'light'} />
      {modal&&<Modal title="Add New Course 📚" onClose={()=>setModal(false)}><SI label="Course Name *" placeholder="e.g. Mathematics, Physics..." value={form.name} onChange={v=>setForm({...form,name:v})}/><div style={{marginTop:14}}><label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:10}}>Color</label><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{PALETTE.map(c=><div key={c} onClick={()=>setForm({...form,color:c})} style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',border:form.color===c?'3px solid var(--text)':'3px solid transparent',transform:form.color===c?'scale(1.2)':'scale(1)',transition:'all 0.15s'}}/>)}</div></div><div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}><GBtn onClick={()=>setModal(false)}>Cancel</GBtn><Btn onClick={addCourse}>Add Course</Btn></div></Modal>}
    </div>
  )
}

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
  const totalCh=subjects.reduce((a,s)=>a+(s.chapters?.length||0),0),doneCh=subjects.reduce((a,s)=>a+(s.chapters?.filter(c=>c.done).length||0),0),overall=totalCh?Math.round(doneCh/totalCh*100):0
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}} className="fade">
        <GBtn onClick={()=>setPage('courses')}>← Back</GBtn>
        <div style={{flex:1}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:12,height:12,borderRadius:'50%',background:course.color}}/><h1 style={{fontSize:22,fontWeight:800,color:'var(--text)'}}>{course.name}</h1></div><p style={{color:'var(--text2)',fontSize:12,marginTop:1}}>{subjects.length} subjects · {exams.length} exams</p></div>
        <div style={{textAlign:'right'}}><div style={{fontFamily:'Sora',fontSize:26,fontWeight:800,color:course.color}}>{overall}%</div><div style={{fontSize:11,color:'var(--text2)'}}>Overall</div></div>
      </div>
      <div style={{display:'flex',gap:3,background:'var(--bg)',borderRadius:50,padding:4,marginBottom:20,width:'fit-content'}}>
        {[['subjects','📖 Subjects'],['exams','📝 Exams']].map(([id,label])=><button key={id} className="tab-btn" onClick={()=>setTab(id)} style={{background:tab===id?'var(--primary)':'transparent',color:tab===id?'white':'var(--text2)'}}>{label}</button>)}
      </div>
      {tab==='subjects'&&(
        <div className="fade">
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}><Btn onClick={()=>setSubModal(true)}>+ Add Subject</Btn></div>
          {subjects.length===0?<Card style={{textAlign:'center',padding:'48px'}}><div style={{fontSize:48,marginBottom:12}}>📖</div><h3 style={{fontWeight:700,color:'var(--text)',marginBottom:12}}>No subjects yet</h3><Btn onClick={()=>setSubModal(true)}>+ Add Subject</Btn></Card>:(
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:14,marginBottom:20}}>
                {subjects.map((s,i)=>{const color=COLORS[i%COLORS.length],done=s.chapters?.filter(c=>c.done).length||0,total=s.chapters?.length||0,prog=total?Math.round(done/total*100):0;return(
                  <div key={s.id} className="hov" onClick={()=>{setSelSubject({subjectId:s.id,courseId});setPage('subject')}} style={{background:'var(--card)',borderRadius:14,padding:18,border:'1px solid var(--border)',borderLeft:`4px solid ${color}`,cursor:'pointer',boxShadow:'var(--shadow)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><h3 style={{fontWeight:700,fontSize:14,color:'var(--text)'}}>{s.name}</h3><button style={{background:'none',border:'none',cursor:'pointer',color:'#FF6584',fontSize:13}} onClick={e=>{e.stopPropagation();delSubject(s.id)}}>🗑</button></div>
                    <div style={{fontSize:12,color:'var(--text2)',marginBottom:8}}>{done}/{total} chapters</div>
                    <div style={{height:5,background:'var(--border)',borderRadius:99,overflow:'hidden',marginBottom:6}}><div style={{height:'100%',width:`${prog}%`,background:color,borderRadius:99}}/></div>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:11,color:'var(--text2)'}}>{prog}%</span><span style={{fontSize:11,color,fontWeight:600}}>Open →</span></div>
                  </div>
                )})}
              </div>
              <Card>
                <h3 style={{fontSize:14,fontWeight:700,marginBottom:16,color:'var(--text)'}}>📊 Subject-wise Progress</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={subjects.map(s=>({name:s.name.length>10?s.name.slice(0,10)+'…':s.name,Done:s.chapters?.filter(c=>c.done).length||0,Revised:s.chapters?.filter(c=>c.revise).length||0,Mocked:s.chapters?.filter(c=>c.mock).length||0,Total:s.chapters?.length||0}))} barGap={2} barCategoryGap="30%">
                    <XAxis dataKey="name" tick={{fontSize:12,fill:'var(--text2)'}}/><YAxis tick={{fontSize:11,fill:'var(--text2)'}}/>
                    <Tooltip contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)'}}/>
                    <Bar dataKey="Done" fill="var(--primary)" radius={[4,4,0,0]}/><Bar dataKey="Revised" fill="var(--success)" radius={[4,4,0,0]}/><Bar dataKey="Mocked" fill="var(--warning)" radius={[4,4,0,0]}/><Bar dataKey="Total" fill="var(--border)" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{display:'flex',gap:16,marginTop:10,flexWrap:'wrap'}}>
                  {[['var(--primary)','Done'],['var(--success)','Revised'],['var(--warning)','Mocked'],['var(--border)','Total']].map(([c,l])=><div key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text2)'}}><div style={{width:10,height:10,borderRadius:3,background:c}}/>{l}</div>)}
                </div>
              </Card>
            </>
          )}
        </div>
      )}
      {tab==='exams'&&(
        <div className="fade">
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}><Btn onClick={()=>setExamModal(true)}>+ Add Exam</Btn></div>
          {exams.length===0?<Card style={{textAlign:'center',padding:'48px'}}><div style={{fontSize:48,marginBottom:12}}>📝</div><h3 style={{fontWeight:700,color:'var(--text)',marginBottom:6}}>No exams yet</h3><p style={{color:'var(--text2)',marginBottom:16,fontSize:13}}>Add Term 1, UT1, UT2, Finals etc.</p><Btn onClick={()=>setExamModal(true)}>+ Add Exam</Btn></Card>:(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {exams.map(ex=>{
                const days=daysUntil(ex.date),chKeys=Object.keys(ex.chapters||{}).filter(k=>ex.chapters[k]);let examDone=0,examTotal=0
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
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text2)',marginBottom:4}}><span>Progress ({examDone}/{examTotal} chapters)</span><span style={{fontWeight:700,color:'var(--primary)'}}>{examProg}%</span></div>
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
      {subModal&&<Modal title="Add Subject 📖" onClose={()=>setSubModal(false)}><SI label="Subject Name" placeholder="e.g. Algebra, Organic Chemistry..." value={subName} onChange={setSubName} onEnter={addSubject}/><div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:18}}><GBtn onClick={()=>setSubModal(false)}>Cancel</GBtn><Btn onClick={addSubject}>Add</Btn></div></Modal>}
      {examModal&&(
        <Modal title="Add Exam 📝" onClose={()=>setExamModal(false)} wide>
          <div style={{display:'flex',gap:12,marginBottom:14}}><div style={{flex:1}}><SI label="Exam Name *" placeholder="e.g. Term 1, UT2, Final..." value={examForm.name} onChange={v=>setExamForm({...examForm,name:v})}/></div><div style={{flex:1}}><SI label="Date *" type="date" value={examForm.date} onChange={v=>setExamForm({...examForm,date:v})}/></div></div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:10}}>Select Chapters for this Exam</label>
            {subjects.length===0?<p style={{fontSize:13,color:'var(--text2)'}}>Add subjects first.</p>:(
              <div style={{maxHeight:220,overflowY:'auto',display:'flex',flexDirection:'column',gap:10}}>
                {subjects.map((s,si)=>(
                  <div key={s.id}>
                    <div style={{fontSize:11,fontWeight:700,color:COLORS[si%COLORS.length],marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>{s.name}</div>
                    {(s.chapters||[]).length===0?<p style={{fontSize:12,color:'var(--text2)',paddingLeft:8}}>No chapters yet</p>:(
                      <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                        {s.chapters.map(ch=>{const k=`${s.id}_${ch.id}`;const sel=!!examForm.chapters[k];return(<div key={ch.id} onClick={()=>toggleExCh(s.id,ch.id)} style={{padding:'4px 10px',borderRadius:50,fontSize:12,cursor:'pointer',border:`1px solid ${sel?COLORS[si%COLORS.length]:'var(--border)'}`,background:sel?`${COLORS[si%COLORS.length]}18`:'var(--bg)',color:sel?COLORS[si%COLORS.length]:'var(--text2)',transition:'all 0.15s',fontWeight:sel?600:400}}>{sel?'✓ ':''}{ch.name.length>18?ch.name.slice(0,18)+'…':ch.name}</div>)})}
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

function PDFViewer({subjectKey}){
  const[pdfs,setPdfs]=useState([])
  const[activeId,setActiveId]=useState(null)
  const[fullscreen,setFullscreen]=useState(false)
  const[loading,setLoading]=useState(true)
  const fileRef=useRef(null)
  const folderRef=useRef(null)
  useEffect(()=>{
    if(!subjectKey){setLoading(false);return}
    const manifestKey=`${subjectKey}_manifest`
    const manifest=JSON.parse(localStorage.getItem(manifestKey)||'[]')
    if(manifest.length===0){setLoading(false);return}
    Promise.all(manifest.map(async item=>{
      try{const file=await getPDF(`${subjectKey}_${item.id}`);if(file){const url=URL.createObjectURL(file);return{id:item.id,name:item.name,url}}return null}catch{return null}
    })).then(results=>{const valid=results.filter(Boolean);setPdfs(valid);if(valid.length>0)setActiveId(valid[0].id);setLoading(false)})
    return()=>{}
  },[subjectKey])
  const addFiles=async(files)=>{
    const pdfFiles=Array.from(files).filter(f=>f.type==='application/pdf')
    if(pdfFiles.length===0){alert('No PDF files found.');return}
    const manifestKey=`${subjectKey}_manifest`,existing=JSON.parse(localStorage.getItem(manifestKey)||'[]'),newItems=[]
    for(const file of pdfFiles){
      const id=`${Date.now()}_${Math.random().toString(36).slice(2)}`
      try{await savePDF(`${subjectKey}_${id}`,file);const url=URL.createObjectURL(file);newItems.push({id,name:file.name,url})}catch(e){console.error('Failed to save PDF',e)}
    }
    if(newItems.length===0){alert('Failed to save. Storage may be full.');return}
    localStorage.setItem(manifestKey,JSON.stringify([...existing,...newItems.map(({id,name})=>({id,name}))]))
    setPdfs(prev=>[...prev,...newItems])
    if(!activeId&&newItems.length>0)setActiveId(newItems[0].id)
  }
  const removePdf=async(id)=>{
    const pdf=pdfs.find(p=>p.id===id)
    if(pdf){try{URL.revokeObjectURL(pdf.url)}catch{}}
    try{await deletePDF(`${subjectKey}_${id}`)}catch{}
    const manifestKey=`${subjectKey}_manifest`,manifest=JSON.parse(localStorage.getItem(manifestKey)||'[]')
    localStorage.setItem(manifestKey,JSON.stringify(manifest.filter(m=>m.id!==id)))
    const updated=pdfs.filter(p=>p.id!==id)
    setPdfs(updated)
    if(activeId===id)setActiveId(updated.length>0?updated[0].id:null)
  }
  const activePdf=pdfs.find(p=>p.id===activeId)
  if(loading)return<div style={{textAlign:'center',padding:'20px 0',color:'var(--text2)',fontSize:13}}>⏳ Loading PDFs...</div>
  return(
    <div>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <button onClick={()=>fileRef.current?.click()} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'9px 10px',background:'var(--primary)',color:'white',border:'none',borderRadius:10,fontSize:12,fontWeight:600,cursor:'pointer'}}>📄 Add PDF(s)</button>
        <button onClick={()=>folderRef.current?.click()} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'9px 10px',background:'var(--bg)',color:'var(--text)',border:'2px solid var(--border)',borderRadius:10,fontSize:12,fontWeight:600,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--primary)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>📁 Folder</button>
      </div>
      <input ref={fileRef} type="file" accept="application/pdf" multiple onChange={e=>addFiles(e.target.files)} style={{display:'none'}}/>
      <input ref={folderRef} type="file" webkitdirectory="" onChange={e=>addFiles(e.target.files)} style={{display:'none'}}/>
      {pdfs.length===0?(
        <div onClick={()=>fileRef.current?.click()} style={{border:'2px dashed var(--border)',borderRadius:12,padding:'20px 12px',textAlign:'center',cursor:'pointer',background:'var(--bg)',transition:'all 0.2s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--primary)';e.currentTarget.style.background='rgba(108,99,255,0.04)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg)'}}>
          <div style={{fontSize:24,marginBottom:6}}>📂</div>
          <p style={{fontSize:12,fontWeight:600,color:'var(--text)',marginBottom:2}}>No PDFs yet</p>
          <p style={{fontSize:10,color:'var(--text2)'}}>Add files or a whole folder</p>
        </div>
      ):(
        <>
          <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:8,maxHeight:110,overflowY:'auto'}}>
            {pdfs.map(pdf=>(
              <div key={pdf.id} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 10px',borderRadius:8,background:activeId===pdf.id?'rgba(108,99,255,0.12)':'var(--bg)',border:`1px solid ${activeId===pdf.id?'var(--primary)':'var(--border)'}`,cursor:'pointer',transition:'all 0.15s'}} onClick={()=>setActiveId(pdf.id)}>
                <span style={{fontSize:12}}>📄</span>
                <span style={{flex:1,fontSize:11,fontWeight:500,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{pdf.name}</span>
                <button onClick={e=>{e.stopPropagation();removePdf(pdf.id)}} style={{background:'none',border:'none',color:'#FF6584',cursor:'pointer',fontSize:12,padding:'0 2px',flexShrink:0}}>✕</button>
              </div>
            ))}
          </div>
          {activePdf&&(
            <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6,padding:'5px 8px',background:'var(--bg)',borderRadius:8,border:'1px solid var(--border)'}}>
                <span style={{fontSize:10,color:'var(--text2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>📄 <strong style={{color:'var(--text)'}}>{activePdf.name.length>24?activePdf.name.slice(0,24)+'…':activePdf.name}</strong></span>
                <button onClick={()=>setFullscreen(true)} style={{background:'var(--primary)',color:'white',border:'none',borderRadius:6,padding:'3px 8px',fontSize:10,fontWeight:600,cursor:'pointer',flexShrink:0,marginLeft:6}}>⛶ Full</button>
              </div>
              <div style={{borderRadius:10,overflow:'hidden',border:'1px solid var(--border)'}}><iframe src={activePdf.url} style={{width:'100%',height:160,border:'none',display:'block'}} title="PDF"/></div>
            </>
          )}
        </>
      )}
      <p style={{fontSize:9,color:'var(--text2)',marginTop:6,textAlign:'center'}}>📌 Saved locally — nothing uploaded</p>
      {fullscreen&&activePdf&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:2000,display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(10px)',flexShrink:0,overflowX:'auto'}}>
            <div style={{display:'flex',gap:6,flex:1,overflowX:'auto'}}>
              {pdfs.map(pdf=><button key={pdf.id} onClick={()=>setActiveId(pdf.id)} style={{padding:'6px 12px',borderRadius:50,border:'none',background:activeId===pdf.id?'white':'rgba(255,255,255,0.15)',color:activeId===pdf.id?'#1a1a2e':'white',fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>📄 {pdf.name.length>18?pdf.name.slice(0,18)+'…':pdf.name}</button>)}
            </div>
            <button onClick={()=>setFullscreen(false)} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,padding:'7px 14px',color:'white',fontSize:12,fontWeight:600,cursor:'pointer',flexShrink:0}}>✕ Close</button>
          </div>
          <iframe src={activePdf.url} style={{flex:1,border:'none',width:'100%'}} title="PDF Fullscreen"/>
        </div>
      )}
    </div>
  )
}

function SubjectPage({user,subjectId,courseId,data,saveD,setPage}){
  const[modal,setModal]=useState(false)
  const[chName,setChName]=useState('')
  const course=(data.courses||[]).find(c=>c.id===courseId)
  const subject=course?.subjects?.find(s=>s.id===subjectId)
  if(!subject)return <div style={{padding:40}}><Btn onClick={()=>setPage('course')}>← Back</Btn></div>
  const chapters=subject.chapters||[]
  const pdfKey=`pdf_${user.email}_${courseId}_${subjectId}`
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
        <Card><h3 style={{fontSize:14,fontWeight:700,marginBottom:12,color:'var(--text)'}}>📄 Study Material</h3><PDFViewer subjectKey={pdfKey}/></Card>
        <Card>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:10,color:'var(--text)'}}>📝 Notes</h3>
          <textarea defaultValue={subject.notes||''} onBlur={e=>persist({...subject,notes:e.target.value})} placeholder="Add notes, formulas, reminders..." style={{width:'100%',height:148,padding:12,border:'2px solid var(--border)',borderRadius:12,background:'var(--input)',color:'var(--text)',fontSize:13,resize:'none',outline:'none',lineHeight:1.6,transition:'border 0.2s'}} onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>{e.target.style.borderColor='var(--border)';persist({...subject,notes:e.target.value})}}/>
          <p style={{fontSize:11,color:'var(--text2)',marginTop:4}}>Auto-saved on blur</p>
        </Card>
      </div>
      {chapters.length>0&&(
        <Card style={{marginBottom:20}}>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16,color:'var(--text)'}}>📊 Chapter Analysis</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,alignItems:'center'}}>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[{label:'Done',val:done,total:chapters.length,color:'var(--primary)'},{label:'Revised',val:revised,total:chapters.length,color:'var(--success)'},{label:'Mocked',val:mocked,total:chapters.length,color:'var(--warning)'}].map(s=>(
                <div key={s.label}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:13,color:'var(--text2)'}}>{s.label}</span><span style={{fontSize:13,fontWeight:700,color:s.color}}>{s.val}/{s.total}</span></div>
                  <div style={{height:8,background:'var(--border)',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${s.total?Math.round(s.val/s.total*100):0}%`,background:s.color,borderRadius:99,transition:'width 0.6s'}}/></div>
                </div>
              ))}
              <div style={{marginTop:4,padding:'10px 14px',background:'var(--bg)',borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:13,color:'var(--text2)'}}>Avg Confidence</span>
                <div style={{display:'flex',gap:2,alignItems:'center'}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:13,opacity:parseFloat(avgConf)>=s?1:0.2}}>⭐</span>)}<span style={{fontSize:12,fontWeight:700,color:'var(--primary)',marginLeft:4}}>{avgConf}/5</span></div>
              </div>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={[{name:'Done',val:done},{name:'Revised',val:revised},{name:'Mocked',val:mocked},{name:'Total',val:chapters.length}]} barSize={36}>
                  <XAxis dataKey="name" tick={{fontSize:12,fill:'var(--text2)'}}/><YAxis tick={{fontSize:11,fill:'var(--text2)'}} domain={[0,chapters.length||1]}/>
                  <Tooltip contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)'}}/>
                  <Bar dataKey="val" radius={[6,6,0,0]}><Cell fill="var(--primary)"/><Cell fill="var(--success)"/><Cell fill="var(--warning)"/><Cell fill="var(--border)"/></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}
      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid var(--border)'}}>
          <h3 style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>Chapter Tracker</h3>
          <div style={{display:'flex',gap:6}}>{[['var(--primary)',`${done} Done`],['var(--success)',`${revised} Revised`],['var(--warning)',`${mocked} Mocked`]].map(([c,l])=><span key={l} style={{background:`${c}18`,color:c,borderRadius:50,padding:'3px 10px',fontSize:11,fontWeight:600}}>{l}</span>)}</div>
        </div>
        {chapters.length===0?(<div style={{textAlign:'center',padding:'40px'}}><div style={{fontSize:40,marginBottom:10}}>📋</div><h3 style={{fontWeight:700,color:'var(--text)',marginBottom:12}}>No chapters yet</h3><Btn onClick={()=>setModal(true)}>+ Add Chapter</Btn></div>):(
          <div style={{overflowX:'auto'}}>
            <table>
              <thead><tr style={{background:'var(--bg)'}}>{['Chapter','✅ Done','🔁 Revise','📝 Mock','⭐ Confidence',''].map((h,i)=><th key={i} style={{color:'var(--text2)',borderBottom:'2px solid var(--border)',paddingLeft:i===0?24:undefined,textAlign:i>0?'center':undefined}}>{h}</th>)}</tr></thead>
              <tbody>
                {chapters.map(ch=>(
                  <tr key={ch.id}>
                    <td style={{paddingLeft:24,fontWeight:500,color:'var(--text)',borderBottom:'1px solid var(--border)'}}>{ch.name}</td>
                    {[['done','var(--primary)'],['revise','var(--success)'],['mock','var(--warning)']].map(([f,color])=>(
                      <td key={f} style={{textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                        <div style={{display:'flex',justifyContent:'center'}}>
                          <div className="chk" style={{background:ch[f]?color:'transparent',borderColor:ch[f]?color:'#ddd',border:'2px solid'}} onClick={()=>updCh(ch.id,f,!ch[f])}>{ch[f]&&<span style={{color:'white',fontSize:11,fontWeight:700}}>✓</span>}</div>
                        </div>
                      </td>
                    ))}
                    <td style={{textAlign:'center',borderBottom:'1px solid var(--border)'}}><div style={{display:'flex',justifyContent:'center',gap:2}}>{[1,2,3,4,5].map(s=><span key={s} className="star" style={{opacity:ch.confidence>=s?1:0.2}} onClick={()=>updCh(ch.id,'confidence',ch.confidence===s?0:s)}>⭐</span>)}</div></td>
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
              <BarChart data={stats.map(s=>({name:s.name.length>10?s.name.slice(0,10)+'…':s.name,Progress:s.prog}))}>
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

// isFullscreen and setIsFullscreen are now props — lifted to App so Layout can react
function PomodoroPage({user,data,saveD,running,setRunning,timeLeft,setTimeLeft,mode,setMode,cycles,setCycles,isFullscreen,setIsFullscreen}){
  const[session,setSession]=useState(data.pomoSession||25)
  const[breakT,setBreakT]=useState(data.pomoBreak||5)
  const[longBreak,setLongBreak]=useState(data.pomoLong||15)
  const[bg,setBg]=useState(data.pomoBg||'lofi1')
  const[uploadedBg,setUploadedBg]=useState(data.uploadedBg||null)
  const[spotifyUrl,setSpotifyUrl]=useState(data.spotifyUrl||'')
  const[spotifyInput,setSpotifyInput]=useState(data.spotifyUrl||'')
  const[showSpotify,setShowSpotify]=useState(false)
  const[showSettings,setShowSettings]=useState(false)
  const[settingsTab,setSettingsTab]=useState('timer')
  const[timerFont,setTimerFont]=useState(data.timerFont||'Sora')
  const[alertSound,setAlertSound]=useState(data.alertSound||'bell')
  // ── Loop / session count ─────────────────────────────────────
  const[loopEnabled,setLoopEnabled]=useState(data.pomoLoop||false)
  const[loopCount,setLoopCount]=useState(data.pomoLoopCount||4)   // how many pomodoros per loop
  const loopCycleRef=useRef(0)   // pomodoros completed in current loop run
  const intervalRef=useRef(null)
  const endTimeRef=useRef(null)
  const durations={pomodoro:session*60,short:breakT*60,long:longBreak*60}
  useEffect(()=>{if(!running)setTimeLeft(durations[mode])},[mode,session,breakT,longBreak])
  // Single persistent AudioContext — avoids browser suspension on repeated creation
  const audioCtxRef=useRef(null)
  const getAudioCtx=useCallback(()=>{
    if(!audioCtxRef.current){
      audioCtxRef.current=new(window.AudioContext||window.webkitAudioContext)()
    }
    // Resume if suspended (browser requires a user gesture first)
    if(audioCtxRef.current.state==='suspended'){
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  },[])

  const playSound=useCallback((type)=>{
    try{
      const ctx=getAudioCtx()
      const sounds={
        bell:()=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='triangle';o.frequency.setValueAtTime(880,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(440,ctx.currentTime+1.5);g.gain.setValueAtTime(0.4,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+2);o.start();o.stop(ctx.currentTime+2)},
        chime:()=>{[523,659,784,1047].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+i*0.15);g.gain.linearRampToValueAtTime(0.25,ctx.currentTime+i*0.15+0.05);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.15+1.5);o.start(ctx.currentTime+i*0.15);o.stop(ctx.currentTime+i*0.15+1.5)})},
        soft:()=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.value=660;g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+1.2);o.start();o.stop(ctx.currentTime+1.2)},
        pop:()=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.setValueAtTime(800,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.1);g.gain.setValueAtTime(0.4,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.15);o.start();o.stop(ctx.currentTime+0.2)},
        none:()=>{}
      };(sounds[type]||sounds.bell)()
    }catch(e){}
  },[getAudioCtx])

  // ── Eagerly preload ML scripts so Focus Guard starts fast ──────
  // Scripts are injected silently in the background; models are NOT
  // initialised yet (that still happens on toggle). Just warms the cache.
  useEffect(()=>{
    const preload=(url)=>{
      if(!document.querySelector(`script[src="${url}"]`)){
        const s=document.createElement('script');s.src=url;s.async=true
        // low priority — use defer-like approach
        setTimeout(()=>document.head.appendChild(s), 2000)
      }
    }
    preload('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js')
    preload('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js')
    preload('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js')
  },[])

  // Unlock AudioContext on first user interaction with the page
  useEffect(()=>{
    const unlock=()=>{
      if(audioCtxRef.current&&audioCtxRef.current.state==='suspended'){
        audioCtxRef.current.resume()
      }
    }
    document.addEventListener('click',unlock,{once:false})
    document.addEventListener('keydown',unlock,{once:false})
    return()=>{
      document.removeEventListener('click',unlock)
      document.removeEventListener('keydown',unlock)
    }
  },[])

  // ── Focus Guard ───────────────────────────────────────────────
  const[focusGuard,setFocusGuard]=useState(false)
  const[fgStatus,setFgStatus]=useState('off')   // off|loading|ready|face|absent|sleeping|phone|error
  const[fgMsg,setFgMsg]=useState('')
  const videoRef=useRef(null)
  const canvasRef=useRef(null)
  const streamRef=useRef(null)
  const faceApiReadyRef=useRef(false)
  const cocoReadyRef=useRef(false)
  const detectionLoopRef=useRef(null)
  const absentSinceRef=useRef(null)
  const manuallyPausedRef=useRef(false)
  const guardPausedRef=useRef(false)
  const lastDistractionAlertRef=useRef(0)
  const isRunningDetectionRef=useRef(false)  // guard against overlapping detection frames

  const loadScript=url=>new Promise((res,rej)=>{
    if(document.querySelector(`script[src="${url}"]`)){
      // already injected — poll until the global it provides is available
      const t0=Date.now()
      const poll=()=>{setTimeout(()=>{
        // resolve after short delay so globals are set
        if(Date.now()-t0>8000)rej(new Error('Script timeout: '+url))
        else res()
      },600)}
      poll();return
    }
    const s=document.createElement('script');s.src=url
    s.onload=()=>setTimeout(res,200) // small delay for globals to initialise
    s.onerror=()=>rej(new Error('Failed to load: '+url))
    document.head.appendChild(s)
  })

  const playSoftPing=useCallback(()=>{
    try{
      const ctx=getAudioCtx()
      const o=ctx.createOscillator(),g=ctx.createGain()
      o.connect(g);g.connect(ctx.destination)
      o.type='sine';o.frequency.value=880
      g.gain.setValueAtTime(0,ctx.currentTime)
      g.gain.linearRampToValueAtTime(0.12,ctx.currentTime+0.04)
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.7)
      o.start();o.stop(ctx.currentTime+0.7)
    }catch(e){}
  },[getAudioCtx])

  const stopFocusGuard=useCallback(()=>{
    clearTimeout(detectionLoopRef.current)   // chained setTimeout, not setInterval
    isRunningDetectionRef.current=false
    if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null}
    absentSinceRef.current=null
    guardPausedRef.current=false
    setFgStatus('off');setFgMsg('')
  },[])

  // ── Detection: BlazeFace (face/sleep) + COCO-SSD (phone) + screen-glow heuristic ──
  // Canvas is downscaled to 160×120 to keep CPU low.
  // Uses chained setTimeout (not setInterval) so frames never pile up.
  // DISTRACTION_COOLDOWN: 15s between soft pings to avoid continuous noise.
  const DISTRACTION_COOLDOWN=15000

  // Screen-glow heuristic: sample brightness of a center strip of the image.
  // A phone screen held to camera floods the frame with bright uniform light.
  const detectScreenGlow=useCallback((ctx,w,h)=>{
    try{
      // Sample a 60×40 strip in the centre of the frame
      const sw=Math.round(w*0.4),sh=Math.round(h*0.35)
      const sx=Math.round((w-sw)/2),sy=Math.round((h-sh)/2)
      const d=ctx.getImageData(sx,sy,sw,sh).data
      let totalBright=0,count=0
      for(let i=0;i<d.length;i+=16){ // every 4th pixel (r channel)
        totalBright+=d[i];count++
      }
      const avgBrightness=count?totalBright/count:0
      // High uniform brightness (>200/255) across centre = likely screen glare
      return avgBrightness>200
    }catch{return false}
  },[])

  const scheduleDetection=useCallback(()=>{
    if(!focusGuard||!faceApiReadyRef.current)return
    detectionLoopRef.current=setTimeout(async()=>{
      await runDetectionFrame()
      scheduleDetection() // chain next frame only after current completes
    },3000) // 3s between frames — enough to catch distraction, light on CPU
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[focusGuard])

  const runDetectionFrame=useCallback(async()=>{
    if(isRunningDetectionRef.current)return
    if(!videoRef.current||!canvasRef.current||!faceApiReadyRef.current)return
    const video=videoRef.current
    if(video.readyState<2)return
    isRunningDetectionRef.current=true
    const canvas=canvasRef.current
    // ── 160×120 = 4× fewer pixels than 320×240, ~4× faster inference ──
    const W=160,H=120
    canvas.width=W;canvas.height=H
    const ctx=canvas.getContext('2d')
    ctx.drawImage(video,0,0,W,H)
    try{
      // 1 ── Face presence + sleep heuristic (BlazeFace)
      const faces=await window._blazeModel.estimateFaces(canvas,false)
      const faceFound=!!(faces&&faces.length>0)
      let sleeping=false
      if(faceFound){
        const face=faces[0]
        const kp=face.landmarks // [[x,y],...] — [rightEye,leftEye,nose,mouth,rightEar,leftEar]
        if(kp&&kp.length>=2){
          const eyeMidY=(kp[0][1]+kp[1][1])/2
          const faceH=Math.max(face.bottomRight[1]-face.topLeft[1],1)
          const eyeRelY=(eyeMidY-face.topLeft[1])/faceH
          // Eyes normally sit at 35-55% of face height.
          // When head droops down (sleeping), eyes shift to >65%.
          sleeping=eyeRelY>0.65
        }
      }

      // 2 ── Phone object detection (COCO-SSD) — runs on same downscaled canvas
      let phoneFound=false
      if(cocoReadyRef.current&&window._cocoModel){
        const preds=await window._cocoModel.detect(canvas)
        // Detect phone itself OR laptop/tv/remote as proxy for screen-watching
        // Also flag high confidence on 'book' held very close (often misclassified phone)
        phoneFound=preds.some(p=>
          (['cell phone','remote'].includes(p.class)&&p.score>0.40)||
          (['laptop','tv'].includes(p.class)&&p.score>0.55)
        )
      }

      // 3 ── Screen-glow heuristic: catches phone screen facing camera
      // Only run if no face found (person walked away holding phone to camera)
      // OR if face found but COCO missed the physical device
      const screenGlow=detectScreenGlow(ctx,W,H)
      // Phone-screen-to-camera detection: glow detected AND either COCO agrees OR face is still present
      const phoneScreenDetected=screenGlow&&(phoneFound||faceFound)

      // ── Apply rules ──────────────────────────────────────────────
      const now=Date.now()
      if(!faceFound&&!phoneScreenDetected){
        // User is genuinely absent
        if(!absentSinceRef.current)absentSinceRef.current=now
        const secs=(now-absentSinceRef.current)/1000
        setFgStatus('absent');setFgMsg(`Away ${Math.round(secs)}s…`)
        if(secs>=5&&!manuallyPausedRef.current&&!guardPausedRef.current){
          guardPausedRef.current=true
          setRunning(false)
          playSound(alertSound)
          setFgMsg('Timer paused — come back! 👀')
        }
      } else {
        // Face present OR phone screen detected
        if(absentSinceRef.current){
          absentSinceRef.current=null
          if(guardPausedRef.current&&!manuallyPausedRef.current){
            guardPausedRef.current=false
            setRunning(true)
            setFgMsg('Welcome back! Resuming ▶')
            setTimeout(()=>setFgMsg('Focused ✓'),2200)
          }
        }
        const cooldownOk=now-lastDistractionAlertRef.current>DISTRACTION_COOLDOWN
        if(phoneFound||phoneScreenDetected){
          // Phone detected (object OR screen glow) — distract alert, ONE ping per cooldown
          setFgStatus('phone');setFgMsg('📱 Put the phone down!')
          if(cooldownOk){lastDistractionAlertRef.current=now;playSoftPing()}
        } else if(sleeping){
          setFgStatus('sleeping');setFgMsg('😴 Hey, wake up!')
          if(cooldownOk){lastDistractionAlertRef.current=now;playSoftPing()}
        } else {
          setFgStatus('face');setFgMsg('Focused ✓')
        }
      }
    }catch(e){console.warn('FocusGuard frame error:',e?.message)}
    finally{isRunningDetectionRef.current=false}
  },[alertSound,playSound,playSoftPing,setRunning,detectScreenGlow,DISTRACTION_COOLDOWN])

  useEffect(()=>{
    if(!focusGuard){stopFocusGuard();return}
    let cancelled=false
    const start=async()=>{
      setFgStatus('loading');setFgMsg('Loading AI models…')
      try{
        // ── TensorFlow.js core (backend: WebGL for GPU, falls back to CPU) ──
        if(!window.tf){
          setFgMsg('Loading TensorFlow…')
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js')
          await new Promise((res,rej)=>{const t0=Date.now();const p=()=>{if(window.tf)return res();if(Date.now()-t0>12000)return rej(new Error('TF timeout'));setTimeout(p,300)};p()})
        }
        // ── BlazeFace — self-contained, fetches its own weights automatically ──
        if(!window.blazeface){
          setFgMsg('Loading face model…')
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js')
          await new Promise((res,rej)=>{const t0=Date.now();const p=()=>{if(window.blazeface)return res();if(Date.now()-t0>12000)return rej(new Error('BlazeFace timeout'));setTimeout(p,300)};p()})
        }
        if(!faceApiReadyRef.current){
          setFgMsg('Initialising face model…')
          window._blazeModel=await window.blazeface.load()
          faceApiReadyRef.current=true
        }
        // ── COCO-SSD — phone/laptop/tv detection ──────────────
        if(!window.cocoSsd){
          setFgMsg('Loading object model…')
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js')
          await new Promise((res,rej)=>{const t0=Date.now();const p=()=>{if(window.cocoSsd)return res();if(Date.now()-t0>18000)return rej(new Error('COCO timeout'));setTimeout(p,300)};p()})
        }
        if(!cocoReadyRef.current){
          setFgMsg('Initialising object model…')
          window._cocoModel=await window.cocoSsd.load()
          cocoReadyRef.current=true
        }
        if(cancelled)return
        // ── Camera — ask for low-res to reduce bandwidth + CPU ──
        setFgMsg('Starting camera…')
        const stream=await navigator.mediaDevices.getUserMedia({
          video:{width:{ideal:320},height:{ideal:240},facingMode:'user'}
        })
        if(cancelled){stream.getTracks().forEach(t=>t.stop());return}
        streamRef.current=stream
        if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play()}
        setFgStatus('ready');setFgMsg('Active — watching 👁')
        // Use chained setTimeout so frames never pile up (scheduleDetection calls itself)
        scheduleDetection()
      }catch(e){
        if(!cancelled){
          console.error('FocusGuard error:',e)
          setFgStatus('error')
          setFgMsg(
            e?.message?.includes('ermission')?'Camera permission denied':
            e?.message?.includes('timeout')||e?.message?.includes('load')?'Model load failed — check connection':
            e?.message||'Failed to start'
          )
        }
      }
    }
    start()
    return()=>{cancelled=true;stopFocusGuard()}
  },[focusGuard,scheduleDetection])

  const handleStartStop=()=>{
    getAudioCtx()
    if(running){manuallyPausedRef.current=true;guardPausedRef.current=false;setRunning(false)}
    else{manuallyPausedRef.current=false;setRunning(true)}
  }

  const FG_STATUS_COLOR={off:'#888',loading:'#FFB347',ready:'#43C6AC',face:'#43C6AC',absent:'#FF6584',sleeping:'#FFB347',phone:'#FFB347',error:'#FF6584'}
  const FG_STATUS_ICON={off:'⚫',loading:'⏳',ready:'👁',face:'🟢',absent:'🔴',sleeping:'😴',phone:'📱',error:'❌'}


  const handleDone=useCallback(()=>{
    clearInterval(intervalRef.current)
    endTimeRef.current=null
    manuallyPausedRef.current=false;guardPausedRef.current=false
    playSound(alertSound)

    if(mode==='pomodoro'){
      const newCycles=loopCycleRef.current+1
      setCycles(c=>c+1)
      saveD({...data,sessions:[...(data.sessions||[]),{id:Date.now(),mins:session,date:new Date().toISOString()}]})

      if(loopEnabled){
        loopCycleRef.current=newCycles
        const isLongBreakTime=newCycles>0&&newCycles%4===0
        // Auto-advance: switch to appropriate break and restart
        const nextMode=isLongBreakTime?'long':'short'
        setMode(nextMode)
        const nextDur=isLongBreakTime?longBreak*60:breakT*60
        setTimeLeft(nextDur)
        if(newCycles<loopCount*2){  // loopCount pomodoros + their breaks
          setTimeout(()=>{endTimeRef.current=Date.now()+nextDur*1000;setRunning(true)},800)
        } else {
          // All loops done
          loopCycleRef.current=0
          setRunning(false)
          setMode('pomodoro')
          setTimeLeft(session*60)
        }
        return
      }
    } else {
      // Break finished — if looping, auto-start next pomodoro
      if(loopEnabled){
        setMode('pomodoro')
        const nextDur=session*60
        setTimeLeft(nextDur)
        setTimeout(()=>{endTimeRef.current=Date.now()+nextDur*1000;setRunning(true)},800)
        return
      }
    }
    setRunning(false)
    setTimeLeft(durations[mode])
  },[mode,session,breakT,longBreak,alertSound,data,saveD,durations,playSound,setRunning,setCycles,setTimeLeft,setMode,loopEnabled,loopCount])
  const tick=useCallback(()=>{
    if(!endTimeRef.current)return
    const remaining=Math.round((endTimeRef.current-Date.now())/1000)
    if(remaining<=0){handleDone()}else{setTimeLeft(remaining)}
  },[handleDone,setTimeLeft])
  useEffect(()=>{
    if(running){endTimeRef.current=Date.now()+timeLeft*1000;intervalRef.current=setInterval(tick,500)}
    else{clearInterval(intervalRef.current)}
    return()=>clearInterval(intervalRef.current)
  },[running])
  useEffect(()=>{
    const onVisible=()=>{if(!document.hidden&&running&&endTimeRef.current){const remaining=Math.round((endTimeRef.current-Date.now())/1000);if(remaining<=0){handleDone()}else{setTimeLeft(remaining)}}}
    document.addEventListener('visibilitychange',onVisible)
    return()=>document.removeEventListener('visibilitychange',onVisible)
  },[running,handleDone,setTimeLeft])
  const reset=()=>{setRunning(false);endTimeRef.current=null;setTimeLeft(durations[mode])}
  const skip=()=>{setRunning(false);endTimeRef.current=null;loopCycleRef.current=0;setMode(m=>m==='pomodoro'?'short':'pomodoro')}
  const getEmbedUrl=url=>{if(!url)return null;const m1=url.match(/playlist\/([a-zA-Z0-9]+)/);if(m1)return`https://open.spotify.com/embed/playlist/${m1[1]}?utm_source=generator&theme=0`;const m2=url.match(/album\/([a-zA-Z0-9]+)/);if(m2)return`https://open.spotify.com/embed/album/${m2[1]}?utm_source=generator&theme=0`;const m3=url.match(/track\/([a-zA-Z0-9]+)/);if(m3)return`https://open.spotify.com/embed/track/${m3[1]}?utm_source=generator&theme=0`;return null}
  const embedUrl=getEmbedUrl(spotifyUrl)
  const getBgStyle=()=>{if(bg==='uploaded'&&uploadedBg)return{background:`url(${uploadedBg}) center/cover`};return{background:POMO_BGS[bg]||POMO_BGS.lofi1}}
  const FONTS=[{id:'Sora',label:'Sora',sample:'25:00'},{id:'Georgia',label:'Serif Classic',sample:'25:00'},{id:'Courier New',label:'Monospace',sample:'25:00'},{id:'system-ui',label:'System',sample:'25:00'},{id:'cursive',label:'Cursive',sample:'25:00'}]
  const SOUNDS=[{id:'bell',label:'🔔 Bell',desc:'Soft triangle bell'},{id:'chime',label:'🎐 Wind Chime',desc:'4-note chime'},{id:'soft',label:'✨ Soft Ding',desc:'Gentle tone'},{id:'pop',label:'💬 Pop',desc:'Quick pop'},{id:'none',label:'🔇 Silent',desc:'No sound'}]
  return(
    // left offset matches sidebar (252px) when not fullscreen so dashboard doesn't show through
    <div style={{position:'fixed',top:0,left:isFullscreen?0:252,right:0,bottom:0,zIndex:isFullscreen?9999:50,...getBgStyle(),display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden',transition:'left 0.3s'}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.52)',zIndex:0}}/>
      {/* Hidden elements for Focus Guard ML — always mounted when feature is on */}
      <video ref={videoRef} style={{display:'none'}} muted playsInline/>
      <canvas ref={canvasRef} style={{display:'none'}}/>
      {!isFullscreen&&(
        <div style={{position:'absolute',top:24,right:24,display:'flex',gap:12,zIndex:2}}>
          <button onClick={()=>setShowSpotify(s=>!s)} style={{background:showSpotify?'rgba(30,215,96,0.25)':'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'12px 22px',color:'white',cursor:'pointer',fontSize:15,fontWeight:700,backdropFilter:'blur(12px)',display:'flex',alignItems:'center',gap:8}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            Music
          </button>
          <button onClick={()=>setShowSettings(true)} style={{background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'12px 22px',color:'white',cursor:'pointer',fontSize:15,fontWeight:700,backdropFilter:'blur(12px)',display:'flex',alignItems:'center',gap:8}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </button>
        </div>
      )}
      <div style={{position:'absolute',top:28,left:28,display:'flex',gap:6,alignItems:'center',zIndex:2}}>
        {Array(Math.min(cycles,8)).fill(null).map((_,i)=><div key={i} style={{width:10,height:10,borderRadius:'50%',background:'rgba(255,255,255,0.75)'}}/>)}
        {cycles>0&&<span style={{color:'rgba(255,255,255,0.6)',fontSize:13,marginLeft:4}}>{cycles} sessions</span>}
      </div>
      {/* Focus Mode button — toggles sidebar visibility via lifted state */}
      <button onClick={()=>setIsFullscreen(f=>!f)} style={{position:'absolute',bottom:24,right:24,zIndex:2,background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'10px 18px',color:'white',cursor:'pointer',fontSize:13,fontWeight:600,backdropFilter:'blur(12px)',display:'flex',alignItems:'center',gap:8}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.25)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}>
        {isFullscreen?<><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>Exit Focus</>:<><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>Focus Mode</>}
      </button>
      {/* Focus Guard status badge — bottom left */}
      {focusGuard&&fgStatus!=='off'&&(
        <div onClick={()=>{setShowSettings(true);setSettingsTab('guard')}} style={{position:'absolute',bottom:24,left:24,zIndex:2,display:'flex',alignItems:'center',gap:7,padding:'8px 14px',background:'rgba(0,0,0,0.45)',backdropFilter:'blur(12px)',borderRadius:50,border:`1.5px solid ${FG_STATUS_COLOR[fgStatus]||'#888'}55`,cursor:'pointer',transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.65)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(0,0,0,0.45)'}>
          <div style={{width:8,height:8,borderRadius:'50%',background:FG_STATUS_COLOR[fgStatus]||'#888',boxShadow:`0 0 8px ${FG_STATUS_COLOR[fgStatus]||'#888'}`}}/>
          <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>{fgMsg||'Focus Guard'}</span>
        </div>
      )}
      <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div style={{display:'flex',gap:8,marginBottom:44}}>
          {[['pomodoro','pomodoro'],['short','short break'],['long','long break']].map(([key,label])=>(
            <button key={key} onClick={()=>{setMode(key);setRunning(false);endTimeRef.current=null}} style={{padding:'11px 24px',borderRadius:50,border:`2px solid ${mode===key?'white':'rgba(255,255,255,0.3)'}`,background:mode===key?'white':'transparent',color:mode===key?'#1a1a2e':'white',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'Sora,sans-serif',transition:'all 0.2s',backdropFilter:'blur(10px)'}}>{label}</button>
          ))}
        </div>
        {loopEnabled&&(
          <div style={{marginBottom:12,display:'flex',alignItems:'center',gap:6,justifyContent:'center'}}>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.55)',fontWeight:600}}>🔁 Loop</span>
            <div style={{display:'flex',gap:5}}>
              {Array.from({length:loopCount},(_,i)=>(
                <div key={i} style={{width:8,height:8,borderRadius:'50%',background:i<loopCycleRef.current?'rgba(255,255,255,0.9)':i===loopCycleRef.current&&mode==='pomodoro'?'var(--primary)':'rgba(255,255,255,0.25)',transition:'all 0.3s',boxShadow:i===loopCycleRef.current&&mode==='pomodoro'?'0 0 8px var(--primary)':'none'}}/>
              ))}
            </div>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.55)',fontWeight:600}}>{loopCycleRef.current}/{loopCount}</span>
          </div>
        )}
        <div style={{marginBottom:44,textAlign:'center'}}>
          <div style={{fontSize:128,fontWeight:800,color:'white',fontFamily:`'${timerFont}',sans-serif`,letterSpacing:'-4px',lineHeight:1,textShadow:'0 4px 40px rgba(0,0,0,0.6)'}}>{fmtTime(timeLeft)}</div>
          <div style={{fontSize:15,color:'rgba(255,255,255,0.5)',marginTop:10,fontWeight:500}}>{mode==='pomodoro'?`${session} min focus`:mode==='short'?`${breakT} min short break`:`${longBreak} min long break`}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <button onClick={reset} style={{width:54,height:54,borderRadius:'50%',background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',color:'white',fontSize:22,cursor:'pointer',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.28)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}>↺</button>
          <button onClick={handleStartStop} style={{padding:'18px 56px',borderRadius:50,background:'white',border:'none',fontSize:20,fontWeight:800,cursor:'pointer',fontFamily:'Sora,sans-serif',color:'#1a1a2e',boxShadow:'0 8px 32px rgba(0,0,0,0.3)',transition:'all 0.15s',letterSpacing:1}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>{running?'pause':'start'}</button>
          <button onClick={skip} style={{width:54,height:54,borderRadius:'50%',background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',color:'white',fontSize:22,cursor:'pointer',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.28)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}>⏭</button>
        </div>
        <button onClick={()=>playSound(alertSound)} style={{marginTop:18,background:'transparent',border:'none',color:'rgba(255,255,255,0.4)',fontSize:13,cursor:'pointer',fontWeight:500}} onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>🔔 test alert sound</button>
      </div>
      {showSpotify&&(
        <div style={{position:'absolute',bottom:24,left:24,zIndex:2,width:330}} className="pop">
          {embedUrl?(<div><iframe src={embedUrl} width="330" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{borderRadius:16,display:'block',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}/><button onClick={()=>{setSpotifyUrl('');setSpotifyInput('');saveD({...data,spotifyUrl:''})}} style={{marginTop:8,background:'rgba(0,0,0,0.5)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:50,padding:'6px 16px',color:'rgba(255,255,255,0.7)',fontSize:12,cursor:'pointer'}}>× Change playlist</button></div>):(
            <div style={{background:'rgba(0,0,0,0.65)',borderRadius:18,padding:22,backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.15)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}><svg width="22" height="22" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg><p style={{color:'white',fontSize:15,fontWeight:700}}>Spotify Player</p></div>
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:12,marginBottom:14}}>Paste a playlist, album or track link</p>
              <input value={spotifyInput} onChange={e=>setSpotifyInput(e.target.value)} placeholder="https://open.spotify.com/playlist/..." style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',color:'white',fontSize:13,outline:'none',marginBottom:12}} onFocus={e=>e.target.style.borderColor='#1DB954'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.2)'}/>
              <button onClick={()=>{setSpotifyUrl(spotifyInput);saveD({...data,spotifyUrl:spotifyInput})}} style={{width:'100%',padding:'12px',background:'#1DB954',border:'none',borderRadius:12,color:'white',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:'Sora,sans-serif'}}>▶ Load Player</button>
            </div>
          )}
        </div>
      )}
      {showSettings&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(6px)'}} onClick={()=>setShowSettings(false)}>
          <div className="pop" style={{background:'var(--card)',borderRadius:22,padding:0,width:520,maxWidth:'95vw',maxHeight:'88vh',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.4)'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'22px 28px 0',borderBottom:'1px solid var(--border)'}}>
              <h3 style={{fontSize:18,fontWeight:800,color:'var(--text)',marginBottom:16}}>⚙️ Timer Settings</h3>
              <div style={{display:'flex',gap:4}}>
                {[['timer','⏱ Timer'],['bg','🖼 Background'],['sounds','🔔 Sounds'],['fonts','✍️ Fonts'],['guard','👁 Focus Guard']].map(([id,label])=>(
                  <button key={id} onClick={()=>setSettingsTab(id)} style={{padding:'8px 16px',borderRadius:'10px 10px 0 0',border:'none',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'Sora,sans-serif',background:settingsTab===id?'var(--primary)':'transparent',color:settingsTab===id?'white':'var(--text2)',transition:'all 0.15s'}}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{padding:26,overflowY:'auto',maxHeight:'60vh'}}>
              {settingsTab==='timer'&&(
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:18}}>
                    {[['🍅 Pomodoro',session,v=>{setSession(v);if(mode==='pomodoro'&&!running)setTimeLeft(v*60);saveD({...data,pomoSession:v})},1,180],['☕ Short Break',breakT,v=>{setBreakT(v);if(mode==='short'&&!running)setTimeLeft(v*60);saveD({...data,pomoBreak:v})},1,60],['🌙 Long Break',longBreak,v=>{setLongBreak(v);if(mode==='long'&&!running)setTimeLeft(v*60);saveD({...data,pomoLong:v})},1,120]].map(([label,val,onChange,min,max])=>(
                      <div key={label}><label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:6}}>{label}</label><input type="number" min={min} max={max} value={val} onChange={e=>onChange(+e.target.value)} style={{width:'100%',padding:'12px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:18,fontWeight:700,outline:'none',textAlign:'center'}}/><span style={{fontSize:11,color:'var(--text2)',display:'block',textAlign:'center',marginTop:3}}>minutes</span></div>
                    ))}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
                    <div><label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:6}}>🎯 Daily Goal</label><input type="number" min={10} max={600} value={data.dailyGoal||120} onChange={e=>saveD({...data,dailyGoal:+e.target.value})} style={{width:'100%',padding:'12px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:18,fontWeight:700,outline:'none',textAlign:'center'}}/><span style={{fontSize:11,color:'var(--text2)',display:'block',textAlign:'center',marginTop:3}}>min/day</span></div>
                    <div><label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:6}}>📅 Weekly Goal</label><input type="number" min={60} max={3000} value={data.weeklyGoal||600} onChange={e=>saveD({...data,weeklyGoal:+e.target.value})} style={{width:'100%',padding:'12px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:18,fontWeight:700,outline:'none',textAlign:'center'}}/><span style={{fontSize:11,color:'var(--text2)',display:'block',textAlign:'center',marginTop:3}}>min/week</span></div>
                  </div>
                  {/* ── Loop Sessions ── */}
                  <div style={{background:'var(--bg)',borderRadius:14,padding:16,border:'1px solid var(--border)'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:loopEnabled?14:0}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:2}}>🔁 Loop Sessions</div>
                        <div style={{fontSize:11,color:'var(--text2)'}}>Auto-cycle through pomodoros and breaks</div>
                      </div>
                      <div onClick={()=>{const v=!loopEnabled;setLoopEnabled(v);loopCycleRef.current=0;saveD({...data,pomoLoop:v})}} style={{width:44,height:24,borderRadius:50,background:loopEnabled?'var(--primary)':'#ccc',cursor:'pointer',position:'relative',transition:'background 0.25s',flexShrink:0}}>
                        <div style={{width:18,height:18,borderRadius:'50%',background:'white',position:'absolute',top:3,left:loopEnabled?23:3,transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
                      </div>
                    </div>
                    {loopEnabled&&(
                      <div>
                        <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:8}}>Number of Pomodoros per loop</label>
                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                          {[1,2,3,4,5,6,8].map(n=>(
                            <div key={n} onClick={()=>{setLoopCount(n);loopCycleRef.current=0;saveD({...data,pomoLoopCount:n})}} style={{width:44,height:44,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,cursor:'pointer',border:`2px solid ${loopCount===n?'var(--primary)':'var(--border)'}`,background:loopCount===n?'rgba(108,99,255,0.1)':'var(--bg)',color:loopCount===n?'var(--primary)':'var(--text)',transition:'all 0.15s',fontFamily:'Sora,sans-serif'}}>
                              {n}
                            </div>
                          ))}
                        </div>
                        <div style={{marginTop:12,padding:'10px 12px',background:'rgba(108,99,255,0.07)',borderRadius:10,fontSize:12,color:'var(--text2)',lineHeight:1.7}}>
                          <strong style={{color:'var(--text)'}}>Sequence:</strong> {Array.from({length:loopCount},(_,i)=>`🍅${i>0&&i%4===3?' 🌙':' ☕'}`).join(' → ')}
                          <br/>Total: <strong style={{color:'var(--primary)'}}>{loopCount}</strong> pomodoros · <strong style={{color:'var(--success)'}}>{loopCount-1}</strong> short breaks{loopCount>=4?<> · <strong style={{color:'var(--warning)'}}>1</strong> long break</>:null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {settingsTab==='bg'&&(
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:18}}>
                    {Object.entries(POMO_BGS).map(([key,val])=>(
                      <div key={key} onClick={()=>{setBg(key);saveD({...data,pomoBg:key})}} style={{height:70,borderRadius:12,background:val,cursor:'pointer',border:bg===key?'3px solid var(--primary)':'3px solid transparent',transition:'all 0.15s',position:'relative',overflow:'hidden'}}>
                        {bg===key&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.3)',color:'white',fontSize:20}}>✓</div>}
                        <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.55)',padding:'4px 8px'}}><span style={{fontSize:11,color:'white',fontWeight:600}}>{BG_LABELS[key]}</span></div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:8}}>📁 Upload your own (saved permanently)</label>
                    <input type="file" accept="image/*" onChange={e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>{setUploadedBg(ev.target.result);setBg('uploaded');saveD({...data,uploadedBg:ev.target.result,pomoBg:'uploaded'})};r.readAsDataURL(file)}} style={{fontSize:13,color:'var(--text2)'}}/>
                    {uploadedBg&&<div style={{marginTop:8,display:'flex',alignItems:'center',gap:8}}><img src={uploadedBg} style={{width:48,height:32,borderRadius:6,objectFit:'cover'}}/><span style={{fontSize:12,color:'var(--success)'}}>✓ Custom background saved</span><button onClick={()=>{setUploadedBg(null);if(bg==='uploaded')setBg('lofi1');saveD({...data,uploadedBg:null,pomoBg:'lofi1'})}} style={{background:'none',border:'none',color:'#FF6584',cursor:'pointer',fontSize:12}}>Remove</button></div>}
                  </div>
                </div>
              )}
              {settingsTab==='sounds'&&(
                <div>
                  <p style={{fontSize:13,color:'var(--text2)',marginBottom:16}}>Alert that plays when a session ends.</p>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {SOUNDS.map(s=>(
                      <div key={s.id} onClick={()=>{setAlertSound(s.id);saveD({...data,alertSound:s.id})}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderRadius:14,border:`2px solid ${alertSound===s.id?'var(--primary)':'var(--border)'}`,background:alertSound===s.id?'rgba(108,99,255,0.08)':'var(--bg)',cursor:'pointer',transition:'all 0.15s'}}>
                        <div><div style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>{s.label}</div><div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>{s.desc}</div></div>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <button onClick={e=>{e.stopPropagation();playSound(s.id)}} style={{background:'var(--primary)',border:'none',borderRadius:50,padding:'6px 14px',color:'white',fontSize:12,fontWeight:600,cursor:'pointer'}}>▶ Test</button>
                          {alertSound===s.id&&<div style={{width:10,height:10,borderRadius:'50%',background:'var(--primary)'}}/>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab==='guard'&&(
                <div>
                  {/* Header */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:3}}>👁 Focus Guard</div>
                      <div style={{fontSize:12,color:'var(--text2)'}}>Camera monitors you — everything stays on your device, nothing is uploaded.</div>
                    </div>
                    {/* Toggle */}
                    <div onClick={()=>setFocusGuard(v=>!v)} style={{width:48,height:26,borderRadius:50,background:focusGuard?'var(--primary)':'#ccc',cursor:'pointer',position:'relative',transition:'background 0.25s',flexShrink:0,marginLeft:16}}>
                      <div style={{width:20,height:20,borderRadius:'50%',background:'white',position:'absolute',top:3,left:focusGuard?25:3,transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.25)'}}/>
                    </div>
                  </div>

                  {focusGuard&&(
                    <div>
                      {/* Status pill */}
                      <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:12,background:fgStatus==='face'?'rgba(67,198,172,0.12)':fgStatus==='absent'||fgStatus==='error'?'rgba(255,101,132,0.12)':'rgba(255,179,71,0.12)',marginBottom:14,border:`1px solid ${(FG_STATUS_COLOR[fgStatus]||'#888')}33`}}>
                        <span style={{fontSize:16}}>{FG_STATUS_ICON[fgStatus]||'⚫'}</span>
                        <span style={{fontSize:13,fontWeight:600,color:FG_STATUS_COLOR[fgStatus]||'var(--text2)'}}>{fgMsg||'Initialising…'}</span>
                        {fgStatus==='loading'&&<div style={{marginLeft:'auto',width:14,height:14,border:'2px solid var(--border)',borderTop:'2px solid var(--primary)',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>}
                      </div>

                      {/* Live camera preview — small, shows model working */}
                      {streamRef.current&&videoRef.current&&(
                        <div style={{marginBottom:14,borderRadius:12,overflow:'hidden',border:'2px solid var(--border)',position:'relative',maxWidth:220}}>
                          <video
                            ref={el=>{if(el&&streamRef.current&&!el.srcObject){el.srcObject=streamRef.current;el.play()}}}
                            style={{width:'100%',display:'block',transform:'scaleX(-1)'}}
                            muted playsInline autoPlay
                          />
                          <div style={{position:'absolute',top:6,right:6,background:FG_STATUS_COLOR[fgStatus]||'#888',width:10,height:10,borderRadius:'50%',boxShadow:'0 0 6px currentColor'}}/>
                          <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.55)',padding:'4px 8px',fontSize:10,color:'white',fontWeight:600}}>
                            {fgMsg}
                          </div>
                        </div>
                      )}

                      {/* What it detects */}
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        {[
                          {icon:'🔴',label:'Left frame > 5s',action:'Pause timer + alert'},
                          {icon:'😴',label:'Eyes closed (sleeping)',action:'Soft ping alert'},
                          {icon:'📱',label:'Phone in hand',action:'Soft ping alert'},
                          {icon:'🟢',label:'Face present & focused',action:'Timer runs normally'},
                        ].map(r=>(
                          <div key={r.label} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
                            <span style={{fontSize:16,flexShrink:0}}>{r.icon}</span>
                            <div style={{flex:1}}>
                              <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{r.label}</div>
                              <div style={{fontSize:11,color:'var(--text2)'}}>{r.action}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{marginTop:12,padding:'10px 12px',background:'rgba(108,99,255,0.07)',borderRadius:10,fontSize:11,color:'var(--text2)',lineHeight:1.7}}>
                        🔒 <strong>Privacy:</strong> Video is processed locally in your browser using TensorFlow.js. No images or data ever leave your device.
                      </div>
                    </div>
                  )}

                  {!focusGuard&&(
                    <div style={{textAlign:'center',padding:'28px 0',color:'var(--text2)'}}>
                      <div style={{fontSize:40,marginBottom:8}}>📷</div>
                      <p style={{fontSize:13}}>Toggle on to activate Focus Guard</p>
                    </div>
                  )}
                </div>
              )}

              {settingsTab==='fonts'&&(
                <div>
                  <p style={{fontSize:13,color:'var(--text2)',marginBottom:16}}>Choose font for the timer display.</p>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {FONTS.map(f=>(
                      <div key={f.id} onClick={()=>{setTimerFont(f.id);saveD({...data,timerFont:f.id})}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderRadius:14,border:`2px solid ${timerFont===f.id?'var(--primary)':'var(--border)'}`,background:timerFont===f.id?'rgba(108,99,255,0.08)':'var(--bg)',cursor:'pointer',transition:'all 0.15s'}}>
                        <div><div style={{fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:4}}>{f.label}</div><div style={{fontSize:36,fontWeight:800,color:'var(--text)',fontFamily:`'${f.id}',sans-serif`,lineHeight:1}}>{f.sample}</div></div>
                        {timerFont===f.id&&<div style={{width:12,height:12,borderRadius:'50%',background:'var(--primary)'}}/>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{padding:'16px 28px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end'}}><Btn onClick={()=>setShowSettings(false)}>Done ✓</Btn></div>
          </div>
        </div>
      )}
    </div>
  )
}

function Card({children,style,className}){return <div className={className} style={{background:'var(--card)',borderRadius:16,padding:20,border:'1px solid var(--border)',boxShadow:'var(--shadow)',...style}}>{children}</div>}
function Btn({children,onClick,style}){return <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 20px',background:'var(--primary)',color:'white',border:'none',borderRadius:50,fontFamily:'Sora',fontWeight:600,fontSize:13,cursor:'pointer',boxShadow:'0 4px 14px rgba(108,99,255,0.25)',transition:'opacity 0.2s',...style}} onMouseEnter={e=>e.currentTarget.style.opacity='0.87'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>{children}</button>}
function GBtn({children,onClick}){return <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 20px',background:'transparent',color:'var(--primary)',border:'2px solid var(--border)',borderRadius:50,fontFamily:'Sora',fontWeight:600,fontSize:13,cursor:'pointer',transition:'border 0.2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--primary)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>{children}</button>}
function SI({label,type='text',placeholder,value,onChange,onEnter}){return <div><label style={{fontSize:12,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:5}}>{label}</label><input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onEnter?.()} style={{width:'100%',padding:'11px 13px',border:'2px solid var(--border)',borderRadius:10,background:'var(--input)',color:'var(--text)',fontSize:14,outline:'none',transition:'border 0.2s'}} onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>}
function Modal({title,children,onClose,wide}){return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(4px)'}} onClick={onClose}><div className="pop" style={{background:'var(--card)',borderRadius:20,padding:28,width:wide?560:440,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}><h3 style={{fontSize:18,fontWeight:800,marginBottom:16,color:'var(--text)'}}>{title}</h3>{children}</div></div>}

export default function App(){
  const[user,setUser]=useState(null)
  const[data,setData]=useState(defaultData())
  const[page,setPage]=useState('dashboard')
  const[selCourse,setSelCourse]=useState(null)
  const[selSubject,setSelSubject]=useState(null)
  const[theme,setTheme]=useState('light')
  const[ready,setReady]=useState(false)

  // Lifted Pomodoro state — pomoFullscreen lives here so Layout can hide sidebar
  const[pomoRunning,setPomoRunning]=useState(false)
  const[pomoTimeLeft,setPomoTimeLeft]=useState(25*60)
  const[pomoMode,setPomoMode]=useState('pomodoro')
  const[pomoCycles,setPomoCycles]=useState(0)
  const[pomoFullscreen,setPomoFullscreen]=useState(false)

  useEffect(()=>{ applyTheme(theme) },[theme])
  useEffect(()=>{ setReady(true) },[])

  const handleLogin = (u, d) => {
    setUser(u)
    const finalD = d || defaultData()
    setData(finalD)
    setTheme(finalD.theme||'light')
    applyTheme(finalD.theme||'light')
    setPomoTimeLeft((finalD.pomoSession||25)*60)
    setReady(true)
  }

  const saveD = updated => {
    setData(updated)
    if(user?.id){
      setLocalCache(user.id, updated)
      scheduleSync(user.id, updated)
    }
  }

  const signOut = async () => {
    try { await supa.signOut() } catch(e){}
    setUser(null)
    setData(defaultData())
    setPage('dashboard')
  }

  if(!ready) return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F4F3FF'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:12}}>📚</div>
        <div style={{fontFamily:'Sora',fontWeight:700,color:'#6C63FF',fontSize:16}}>Loading StudyFlow...</div>
      </div>
    </div>
  )

  if(!user) return <AuthPage onLogin={handleLogin}/>

  const pomoProps={
    user, data, saveD,
    running:pomoRunning, setRunning:setPomoRunning,
    timeLeft:pomoTimeLeft, setTimeLeft:setPomoTimeLeft,
    mode:pomoMode, setMode:setPomoMode,
    cycles:pomoCycles, setCycles:setPomoCycles,
    isFullscreen:pomoFullscreen, setIsFullscreen:setPomoFullscreen,
  }

  const renderPage=()=>{
    if(page==='course'&&selCourse) return <CoursePage user={user} courseId={selCourse} data={data} saveD={saveD} setPage={setPage} setSelSubject={setSelSubject}/>
    if(page==='subject'&&selSubject) return <SubjectPage user={user} subjectId={selSubject.subjectId} courseId={selSubject.courseId} data={data} saveD={saveD} setPage={setPage}/>
    if(page==='progress') return <ProgressPage user={user} data={data} setPage={setPage} setSelCourse={setSelCourse}/>
    if(page==='courses') return <CoursesPage user={user} data={data} saveD={saveD} setPage={setPage} setSelCourse={setSelCourse}/>
    return <Dashboard user={user} data={data} saveD={saveD} setPage={setPage} setSelCourse={setSelCourse} setSelSubject={setSelSubject}/>
  }

  const modeLabel = pomoMode==='pomodoro'?'Focus':pomoMode==='short'?'Short Break':'Long Break'

  return(
    // isFullscreen passed to Layout so it hides the sidebar during Focus Mode
    <Layout user={user} page={page} setPage={setPage} theme={theme} setTheme={setTheme} data={data} saveD={saveD} onSignOut={signOut} isFullscreen={pomoFullscreen}>
      <div style={{position:'fixed',top:0,left:pomoFullscreen?0:252,right:0,bottom:0,opacity:page==='pomodoro'?1:0,pointerEvents:page==='pomodoro'?'auto':'none',zIndex:page==='pomodoro'?50:-1,transition:'opacity 0.2s, left 0.3s'}}>
        <PomodoroPage {...pomoProps}/>
      </div>

      {page!=='pomodoro'&&pomoRunning&&(
        <div onClick={()=>setPage('pomodoro')} style={{position:'fixed',bottom:28,right:28,zIndex:9999,background:'linear-gradient(135deg,#6C63FF,#43C6AC)',borderRadius:50,padding:'12px 22px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 8px 32px rgba(108,99,255,0.5)',cursor:'pointer',userSelect:'none'}}>
          <span style={{fontSize:20}}>🍅</span>
          <span style={{fontFamily:'Sora',fontWeight:800,fontSize:22,color:'white',letterSpacing:1,minWidth:70,textAlign:'center'}}>{fmtTime(pomoTimeLeft)}</span>
          <div style={{display:'flex',flexDirection:'column',gap:1}}>
            <span style={{fontSize:11,color:'rgba(255,255,255,0.9)',fontWeight:700}}>{modeLabel}</span>
            <span style={{fontSize:10,color:'rgba(255,255,255,0.6)'}}>tap to open</span>
          </div>
        </div>
      )}

      {page!=='pomodoro'&&renderPage()}
    </Layout>
  )
}
