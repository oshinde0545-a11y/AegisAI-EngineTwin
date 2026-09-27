import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Brain, Database, FileText,
  Gauge, Menu, Plane, RefreshCw, Settings, ShieldCheck, SlidersHorizontal,
  Wifi, X, ChevronRight, CircleDot, Play, Pause, Download, Search
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie
} from "recharts";

const navItems = [
  ["Dashboard", Activity],
  ["Live Data", Wifi],
  ["Digital Twin", Database],
  ["AI Analysis", Brain],
  ["Health & Risk", ShieldCheck],
  ["Mission Profile", Plane],
  ["Mission Replay", RefreshCw],
  ["Reports", FileText],
  ["Settings", Settings]
];

const baseTelemetry = {
  rpm: 3850, temperature: 74, oilPressure: 4.2,
  vibration: 2.1, fuelFlow: 28.6, exhaustTemp: 612
};

const expected = {
  rpm: 3800, temperature: 72, oilPressure: 4.0,
  vibration: 2.0, fuelFlow: 28.0, exhaustTemp: 600
};

function App() {
  const [page, setPage] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [telemetry, setTelemetry] = useState(baseTelemetry);
  const [health, setHealth] = useState(92);
  const [connected, setConnected] = useState(true);
  const [faultMode, setFaultMode] = useState(false);
  const [replay, setReplay] = useState(48);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => {
        const next = {
          rpm: prev.rpm + (Math.random() - .5) * 38,
          temperature: prev.temperature + (Math.random() - .5) * .45,
          oilPressure: prev.oilPressure + (Math.random() - .5) * .05,
          vibration: Math.max(.2, prev.vibration + (Math.random() - .5) * .07),
          fuelFlow: prev.fuelFlow + (Math.random() - .5) * .22,
          exhaustTemp: prev.exhaustTemp + (Math.random() - .5) * 3
        };
        if (faultMode) {
          next.temperature += 0.9;
          next.vibration += .16;
          next.exhaustTemp += 6;
          next.oilPressure -= .035;
        }
        return next;
      });
      setHealth(h => Math.max(55, Math.min(98, h + (faultMode ? -.16 : (Math.random()-.47)*.25))));
    }, 1000);
    return () => clearInterval(timer);
  }, [faultMode]);

  const status = health >= 85 ? "NORMAL" : health >= 70 ? "WARNING" : "CRITICAL";
  const risk = health >= 85 ? "LOW" : health >= 70 ? "MEDIUM" : "HIGH";

  const history = useMemo(() => Array.from({length: 42}, (_, i) => ({
    time: `${String(Math.floor(i/2)).padStart(2,"0")}:${i%2 ? "30":"00"}`,
    health: Math.max(50, health - 5 + Math.sin(i/4)*2 + i*.09),
    rpm: telemetry.rpm + Math.sin(i/3)*90,
    temp: telemetry.temperature + Math.sin(i/5)*2
  })), [health, telemetry]);

  const selectPage = (name) => {
    setPage(name);
    setMobileOpen(false);
  };

  const triggerFault = () => {
    setFaultMode(true);
    setHealth(h => Math.max(65, h - 7));
  };

  const normalize = () => {
    setFaultMode(false);
    setHealth(92);
    setTelemetry(baseTelemetry);
  };

  return (
    <div className="app">
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark">✦</div>
          <div className="brand">AEGIS<span>AI</span></div>
          <button className="close-mobile" onClick={() => setMobileOpen(false)}><X size={18}/></button>
        </div>
        <div className="brand-sub">ENGINE HEALTH INTELLIGENCE</div>

        <nav>
          {navItems.map(([name, Icon]) => (
            <button key={name} className={page === name ? "nav active" : "nav"} onClick={() => selectPage(name)}>
              <Icon size={17}/><span>{name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="mission-mini">
            <Plane size={15}/>
            <div><b>MALE UAV</b><span>Endurance Mission</span></div>
          </div>
          <small>AegisAI v1.0.0<br/>AI + Digital Twin + Analytics</small>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="mobile-menu"><button onClick={() => setMobileOpen(true)}><Menu size={21}/></button></div>
          <div>
            <div className="top-title">AI-Enabled Real-Time Digital Twin</div>
            <div className="top-sub">Aero-Piston Engine Health Monitoring & Mission Reliability</div>
          </div>
          <div className="top-actions">
            <span className={connected ? "online" : "offline"}><CircleDot size={11}/> {connected ? "SYSTEM ONLINE" : "OFFLINE"}</span>
            <span className="top-date">{new Date().toLocaleDateString()}</span>
            <span className="uav-tag"><Plane size={17}/> MALE UAV</span>
          </div>
        </header>

        <div className="page-wrap">
          {page === "Dashboard" && (
            <Dashboard telemetry={telemetry} health={health} status={status} risk={risk}
              faultMode={faultMode} history={history} onFault={triggerFault} onNormal={normalize}
              onPage={selectPage}/>
          )}
          {page === "Live Data" && <LiveData telemetry={telemetry} expected={expected}/>}
          {page === "Digital Twin" && <DigitalTwin telemetry={telemetry} expected={expected} health={health}/>}
          {page === "AI Analysis" && <AIAnalysis health={health} risk={risk} faultMode={faultMode}/>}
          {page === "Health & Risk" && <HealthRisk health={health} risk={risk} status={status}/>}
          {page === "Mission Profile" && <MissionProfile health={health}/>}
          {page === "Mission Replay" && <MissionReplay replay={replay} setReplay={setReplay}/>}
          {page === "Reports" && <Reports/>}
          {page === "Settings" && <SettingsPage connected={connected} setConnected={setConnected}/>}
        </div>
      </main>
    </div>
  );
}

function Dashboard({telemetry:t, health, status, risk, faultMode, history, onFault, onNormal, onPage}) {
  return (
    <>
      <div className="summary-grid">
        <HealthCard health={health}/>
        <SummaryCard title="ENGINE STATUS" value={status} tone={status==="NORMAL"?"green":status==="WARNING"?"amber":"red"} sub="Operating state"/>
        <SummaryCard title="MISSION STATUS" value="CRUISE" tone="blue" sub="Phase 3 / 5 · Endurance"/>
        <SummaryCard title="RISK LEVEL" value={risk} tone={risk==="LOW"?"green":risk==="MEDIUM"?"amber":"red"} sub="AI-assisted assessment"/>
      </div>

      <div className="dashboard-grid">
        <div className="left-stack">
          <Card title="REAL-TIME ENGINE PARAMETERS" action={<span className="live"><CircleDot size={10}/> LIVE</span>}>
            <MetricGrid t={t}/>
          </Card>

          <Card title="DIGITAL TWIN — LIVE ENGINE MODEL" action={<span className="live"><CircleDot size={10}/> SYNCHRONIZED</span>}>
            <DigitalTwinCompact t={t}/>
          </Card>

          <Card title="ENGINE HEALTH TREND" action={<div className="range-tabs"><span>1H</span><span>6H</span><span>12H</span><b>24H</b><span>7D</span></div>}>
            <div className="chart-large"><ResponsiveContainer width="100%" height="100%"><AreaChart data={history}>
              <defs><linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopOpacity=".35"/><stop offset="100%" stopOpacity="0"/></linearGradient></defs>
              <CartesianGrid stroke="#12344b" vertical={false}/><XAxis dataKey="time" stroke="#66879e" tick={{fontSize:10}}/><YAxis domain={[50,100]} stroke="#66879e" tick={{fontSize:10}}/><Tooltip contentStyle={{background:"#06182a",border:"1px solid #195174"}}/>
              <Area type="monotone" dataKey="health" stroke="#20e889" fill="url(#healthFill)" strokeWidth={2}/>
            </AreaChart></ResponsiveContainer></div>
          </Card>

          <div className="bottom-grid">
            <Card title="ENGINE PARAMETERS — LAST HOUR">
              <div className="chart-small"><ResponsiveContainer><LineChart data={history}>
                <CartesianGrid stroke="#12344b"/><XAxis dataKey="time" hide/><YAxis stroke="#66879e" tick={{fontSize:9}}/><Tooltip/>
                <Line dataKey="rpm" stroke="#21b9ff" dot={false} strokeWidth={2}/><Line dataKey="temp" stroke="#ffb52e" dot={false} strokeWidth={2}/>
              </LineChart></ResponsiveContainer></div>
            </Card>
            <Card title="MISSION PERFORMANCE">
              <MissionSteps/>
              <div className="mini-stat-grid"><MiniStat label="Current Phase" value="CRUISE"/><MiniStat label="Duration" value="2h 14m"/><MiniStat label="Altitude" value="4,500 ft"/></div>
            </Card>
          </div>
        </div>

        <div className="right-stack">
          <Card title="ACTIVE ALERTS" action={<span>🔔</span>}>
            <div className="alert-counts"><span>0 Critical</span><span className="amber-box">1 Warning</span><span>0 Info</span></div>
            <div className={`alert-box ${faultMode ? "alert-red" : ""}`}>
              <div className="alert-head"><AlertTriangle size={15}/><b>{faultMode ? "Engine anomaly detected" : "Thermal trend deviation detected"}</b></div>
              <p>{faultMode ? "Simulated abnormal behaviour is increasing vibration and exhaust temperature." : "Exhaust temperature is slightly higher than expected."}</p>
              <small>Confidence: {faultMode ? "94" : "91"}% · Risk: {faultMode ? "High" : "Medium"}</small>
            </div>
          </Card>

          <Card title="AI PREDICTION" action={<span className={faultMode ? "amber" : "green"}>● {faultMode ? "ANOMALY" : "NORMAL"}</span>}>
            <h3 className={faultMode ? "amber" : "green"}>{faultMode ? "Potential abnormal behaviour detected." : "No significant abnormality detected."}</h3>
            <div className="confidence-label"><span>Prediction confidence</span><b>{faultMode ? 94 : 87}%</b></div>
            <div className="confidence"><i style={{width:`${faultMode ? 94 : 87}%`}}/></div>
            <ul className="checks">
              <li>✓ Temperature relationship analysed</li><li>✓ RPM stability analysed</li><li>✓ Vibration pattern analysed</li>
            </ul>
            <button className="outline-btn" onClick={() => onPage("AI Analysis")}>View Detailed Analysis <ChevronRight size={15}/></button>
          </Card>

          <Card title="EXPLAINABLE ALERT" action={<span className="amber">● MEDIUM</span>}>
            <b>{faultMode ? "Multi-parameter deviation" : "Thermal trend deviation detected"}</b>
            <div className="factor-list"><span>01</span> Exhaust temperature trend</div>
            <div className="factor-list"><span>02</span> Temperature / RPM deviation</div>
            <div className="factor-list"><span>03</span> Pressure relationship change</div>
            <div className="confidence-label"><span>Evidence confidence</span><b>91%</b></div>
          </Card>

          <Card title="DEMO SCENARIO">
            <div className="scenario-text">{faultMode ? "Fault scenario is active. Watch the health index and telemetry trend change." : "Use the controls to demonstrate a normal engine state or a controlled simulated abnormal condition."}</div>
            <div className="controls">
              <button className="outline-btn" onClick={onNormal}><RefreshCw size={14}/> Normal</button>
              <button className="fault-btn" onClick={onFault}><AlertTriangle size={14}/> Simulate Fault</button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function HealthCard({health}) {
  return <div className="summary-card health-summary"><div className="summary-title">ENGINE HEALTH</div><div className="health-flex">
    <div className="health-ring" style={{"--health":`${health*3.6}deg`}}><div>{health.toFixed(0)}%</div></div>
    <div><strong className={health>=85?"green":health>=70?"amber":"red"}>{health>=85?"GOOD":health>=70?"WATCH":"ATTENTION"}</strong><small>Live Health Index</small></div>
  </div></div>
}
function SummaryCard({title,value,tone,sub}){return <div className="summary-card"><div className="summary-title">{title}</div><div className={`summary-value ${tone}`}>{value}</div><small>{sub}</small></div>}
function Card({title,action,children}){return <section className="card"><div className="card-head"><h3>{title}</h3>{action}</div>{children}</section>}
function MetricGrid({t}){
 const items=[["RPM",t.rpm.toFixed(0),"RPM"],["Temperature",t.temperature.toFixed(1),"°C"],["Oil Pressure",t.oilPressure.toFixed(2),"bar"],["Vibration",t.vibration.toFixed(1),"mm/s"],["Fuel Flow",t.fuelFlow.toFixed(1),"L/h"],["Exhaust Temp",t.exhaustTemp.toFixed(0),"°C"]];
 return <div className="metric-grid">{items.map(([a,b,c])=><div className="metric" key={a}><small>{a}</small><b>{b}<em>{c}</em></b><span>● Normal</span><div className="spark"/></div>)}</div>
}
function DigitalTwinCompact({t}){return <div className="twin-grid"><EngineVisual/><div className="twin-data"><div className="twin-state"><CircleDot size={10}/> DIGITAL TWIN SYNCHRONIZED</div>{[["RPM",t.rpm.toFixed(0),"3800"],["Temperature",t.temperature.toFixed(1)+" °C","72 °C"],["Oil Pressure",t.oilPressure.toFixed(2)+" bar","4.0 bar"],["Exhaust Temp",t.exhaustTemp.toFixed(0)+" °C","600 °C"],["Vibration",t.vibration.toFixed(1)+" mm/s","2.0 mm/s"]].map(x=><div className="compare-row" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><small>Expected {x[2]}</small></div>)}</div></div>}
function EngineVisual(){return <div className="engine-visual"><div className="engine-grid"/><div className="engine-core"/><div className="engine-ring r1"/><div className="engine-ring r2"/><div className="engine-label">LIVE<br/><b>ENGINE</b></div></div>}
function MissionSteps(){return <div className="mission-steps">{["Take-Off","Climb","Cruise","Loiter","Return"].map((x,i)=><div key={x} className={i===2?"step current":"step"}><div>●</div><span>{x}</span></div>)}</div>}
function MiniStat({label,value}){return <div><small>{label}</small><b>{value}</b></div>}

function LiveData({telemetry:t,expected:e}){return <PageShell title="Live Data" subtitle="Real-time engine telemetry and expected behaviour comparison"><div className="data-table-wrap"><table><thead><tr><th>Parameter</th><th>Live</th><th>Expected</th><th>Deviation</th><th>Status</th></tr></thead><tbody>{Object.entries({RPM:[t.rpm,e.rpm],Temperature:[t.temperature,e.temperature],"Oil Pressure":[t.oilPressure,e.oilPressure],Vibration:[t.vibration,e.vibration],"Fuel Flow":[t.fuelFlow,e.fuelFlow],"Exhaust Temp":[t.exhaustTemp,e.exhaustTemp]}).map(([k,[a,b]])=><tr key={k}><td>{k}</td><td>{a.toFixed(2)}</td><td>{b.toFixed(2)}</td><td>{((a-b)/b*100).toFixed(1)}%</td><td><span className="status-pill green">NORMAL</span></td></tr>)}</tbody></table></div></PageShell>}
function DigitalTwin({telemetry,expected,health}){return <PageShell title="Digital Twin" subtitle="Live virtual representation of engine state"><div className="twin-full"><EngineVisual/><div><div className="big-state green">SYNCHRONIZED</div><p className="muted">Health Index: <b>{health.toFixed(0)}%</b></p>{Object.keys(expected).map(k=><div className="compare-row" key={k}><span>{k}</span><b>{telemetry[k]}</b><small>Expected {expected[k]}</small></div>)}<button className="outline-btn">Run What-If Simulation <ChevronRight size={15}/></button></div></div></PageShell>}
function AIAnalysis({health,risk,faultMode}){return <PageShell title="AI Analysis" subtitle="Anomaly detection, prediction confidence and explainable health intelligence"><div className="analysis-grid"><div className="analysis-main"><div className={`ai-status ${faultMode?"warning":"normal"}`}><Brain/><div><small>AI ENGINE STATUS</small><h2>{faultMode?"ANOMALY DETECTED":"NORMAL BEHAVIOUR"}</h2><p>Confidence {faultMode?"94":"87"}%</p></div></div><h3>Contributing Factors</h3>{["Temperature behaviour","RPM stability","Vibration pattern","Oil-pressure relationship","Exhaust temperature trend"].map((x,i)=><div className="factor-bar" key={x}><span>{x}</span><div><i style={{width:`${[91,86,78,83,88][i]}%`}}/></div><b>{[91,86,78,83,88][i]}%</b></div>)}</div><div className="risk-card"><Gauge size={28}/><small>ENGINE HEALTH</small><strong>{health.toFixed(0)}%</strong><span className={risk==="LOW"?"green":risk==="MEDIUM"?"amber":"red"}>{risk} RISK</span></div></div></PageShell>}
function HealthRisk({health,risk,status}){return <PageShell title="Health & Risk" subtitle="Health index, risk level and decision-support indicators"><div className="risk-grid"><div className="risk-big"><div className="health-ring large" style={{"--health":`${health*3.6}deg`}}><div>{health.toFixed(0)}%</div></div><h2 className={risk==="LOW"?"green":risk==="MEDIUM"?"amber":"red"}>{risk} RISK</h2><p>{status} operating state</p></div><div className="risk-items">{["Thermal condition","Lubrication","Vibration","RPM stability","Exhaust behaviour","Sensor consistency"].map((x,i)=><div className="risk-item" key={x}><span>{x}</span><b>{[94,91,88,96,89,97][i]}%</b><div><i style={{width:`${[94,91,88,96,89,97][i]}%`}}/></div></div>)}</div></div></PageShell>}
function MissionProfile({health}){return <PageShell title="Mission Profile" subtitle="Mission-aware engine health context"><div className="mission-profile"><div className="phase-line">{["Take-Off","Climb","Cruise","Loiter","Return"].map((x,i)=><div className={i===2?"phase active":"phase"} key={x}><span>{i+1}</span><b>{x}</b><small>{i===2?"CURRENT":"Complete"}</small></div>)}</div><div className="mission-cards"><MiniStat label="Mission Health" value={`${health.toFixed(0)}%`}/><MiniStat label="Current Phase" value="Cruise"/><MiniStat label="Altitude" value="4,500 ft"/><MiniStat label="Mission Time" value="02:14:00"/></div></div></PageShell>}
function MissionReplay({replay,setReplay}){return <PageShell title="Mission Replay" subtitle="Replay historical telemetry, health trends and alert events"><div className="replay-card"><div className="replay-top"><div><small>MISSION_001</small><h2>Endurance Flight</h2></div><button className="outline-btn"><Play size={14}/> Play Replay</button></div><div className="timeline"><div className="timeline-track"><i style={{width:`${replay}%`}}/></div><input type="range" min="0" max="100" value={replay} onChange={e=>setReplay(e.target.value)}/></div><div className="replay-time">01:{String(Math.floor(replay*2.3)).padStart(2,"0")}:31 <span>/ 03:50:00</span></div><div className="replay-events"><span>● Take-Off</span><span>● Cruise</span><span className="amber">● Thermal alert</span><span>● Current position</span></div></div></PageShell>}
function Reports(){return <PageShell title="Reports" subtitle="Post-flight health and reliability reporting"><div className="report-grid">{["Post-Flight Health Report","AI Anomaly Summary","Digital Twin Comparison","Maintenance Recommendation"].map((x,i)=><div className="report-card" key={x}><FileText/><h3>{x}</h3><p>Generate a structured report from telemetry, health trends and AI analysis.</p><button className="outline-btn"><Download size={14}/> Generate</button></div>)}</div></PageShell>}
function SettingsPage({connected,setConnected}){return <PageShell title="Settings" subtitle="Dashboard and data-source configuration"><div className="settings-list"><div><b>Data Source</b><span>Simulation / ESP32 / DAQ / API</span></div><div><b>Real-Time Connection</b><button className={connected?"toggle on":"toggle"} onClick={()=>setConnected(!connected)}><i/></button></div><div><b>Dashboard Refresh</b><select><option>1 second</option><option>2 seconds</option><option>5 seconds</option></select></div><div><b>Alert Mode</b><select><option>Standard</option><option>Conservative</option><option>High Sensitivity</option></select></div></div></PageShell>}
function PageShell({title,subtitle,children}){return <div className="page"><div className="page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div><button className="outline-btn"><Search size={14}/> Search</button></div>{children}</div>}

export default App;