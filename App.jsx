import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  Database,
  FileText,
  Gauge,
  Menu,
  Plane,
  RefreshCw,
  Settings,
  ShieldCheck,
  Wifi,
  X,
  ChevronRight,
  CircleDot,
  Play,
  Download,
  Search
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from "recharts";


/* =========================================================
   NAVIGATION
========================================================= */

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


/* =========================================================
   DEFAULT VALUES
========================================================= */

const baseTelemetry = {
  rpm: 3850,
  temperature: 74,
  oilPressure: 4.2,
  vibration: 2.1,
  fuelFlow: 28.6,
  exhaustTemp: 612
};


/* =========================================================
   BACKEND URL
========================================================= */

const API_BASE = "http://127.0.0.1:8000";


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  const [page, setPage] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [telemetry, setTelemetry] = useState(baseTelemetry);

  const [expected, setExpected] = useState({
    rpm: 3800,
    temperature: 72,
    oilPressure: 4.0,
    vibration: 2.0,
    fuelFlow: 28.0,
    exhaustTemp: 600
  });

  const [health, setHealth] = useState(92);

  const [healthData, setHealthData] = useState(null);
  const [twinData, setTwinData] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);

  const [connected, setConnected] = useState(false);
  const [faultMode, setFaultMode] = useState(false);

  const [replay, setReplay] = useState(48);


  /* =========================================================
     FETCH DATA FROM FASTAPI BACKEND
  ========================================================= */

  useEffect(() => {

    let mounted = true;

    const fetchEngineData = async () => {

      try {

        const [
          telemetryResponse,
          healthResponse,
          twinResponse
        ] = await Promise.all([
          fetch(`${API_BASE}/api/telemetry/current`),
          fetch(`${API_BASE}/api/health/`),
          fetch(`${API_BASE}/api/twin/`)
        ]);


        if (
          !telemetryResponse.ok ||
          !healthResponse.ok ||
          !twinResponse.ok
        ) {
          throw new Error("Backend API error");
        }


        const telemetryResult =
          await telemetryResponse.json();

        const healthResult =
          await healthResponse.json();

        const twinResult =
          await twinResponse.json();


        if (!mounted) return;


        /* -------------------------
           TELEMETRY
        ------------------------- */

        const sensor = telemetryResult.data;

        if (sensor) {

          setTelemetry({
            rpm: Number(sensor.rpm),
            temperature: Number(sensor.temperature),
            oilPressure: Number(sensor.oil_pressure),
            vibration: Number(sensor.vibration),
            fuelFlow: Number(sensor.fuel_flow),
            exhaustTemp: Number(sensor.exhaust_temperature)
          });

        }


        /* -------------------------
           HEALTH
        ------------------------- */

        if (healthResult.health) {

          setHealthData(healthResult.health);

          setHealth(
            Number(healthResult.health.health_index)
          );

        }


        /* -------------------------
           ANOMALY
        ------------------------- */

        if (healthResult.anomaly) {

          setAnomalyData(healthResult.anomaly);

          setFaultMode(
            Boolean(healthResult.anomaly.is_anomaly)
          );

        }


        /* -------------------------
           DIGITAL TWIN
        ------------------------- */

        const twin = twinResult.digital_twin;

        if (twin) {

          setTwinData(twin);


          if (twin.expected) {

            setExpected({
              rpm: Number(twin.expected.rpm),
              temperature: Number(twin.expected.temperature),
              oilPressure: Number(twin.expected.oil_pressure),
              vibration: Number(twin.expected.vibration),
              fuelFlow: Number(twin.expected.fuel_flow),
              exhaustTemp: Number(
                twin.expected.exhaust_temperature
              )
            });

          }

        }


        setConnected(true);

      } catch (error) {

        console.error(
          "AegisAI backend connection error:",
          error
        );

        setConnected(false);

      }

    };


    /* Initial request */

    fetchEngineData();


    /* Refresh every second */

    const timer = setInterval(
      fetchEngineData,
      1000
    );


    return () => {

      mounted = false;
      clearInterval(timer);

    };

  }, []);


  /* =========================================================
     STATUS + RISK
  ========================================================= */

  const status =
    healthData?.status ||
    (
      health >= 85
        ? "NORMAL"
        : health >= 70
          ? "WARNING"
          : "CRITICAL"
    );


  const risk =
    healthData?.risk_level ||
    (
      health >= 85
        ? "LOW"
        : health >= 70
          ? "MEDIUM"
          : "HIGH"
    );


  /* =========================================================
     HEALTH HISTORY
  ========================================================= */

  const history = useMemo(() => {

    return Array.from(
      { length: 42 },
      (_, i) => ({

        time:
          `${String(
            Math.floor(i / 2)
          ).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,

        health:
          Math.max(
            50,
            health -
              5 +
              Math.sin(i / 4) * 2 +
              i * 0.09
          ),

        rpm:
          telemetry.rpm +
          Math.sin(i / 3) * 90,

        temp:
          telemetry.temperature +
          Math.sin(i / 5) * 2

      })
    );

  }, [health, telemetry]);


  /* =========================================================
     PAGE SELECT
  ========================================================= */

  const selectPage = (name) => {

    setPage(name);
    setMobileOpen(false);

  };


  /* =========================================================
     ENABLE BACKEND FAULT MODE
  ========================================================= */

  const triggerFault = async () => {

    try {

      const response = await fetch(
        `${API_BASE}/api/telemetry/fault/true`,
        {
          method: "POST"
        }
      );


      if (!response.ok) {

        throw new Error(
          "Unable to enable fault mode"
        );

      }


      setFaultMode(true);

    } catch (error) {

      console.error(
        "Unable to enable fault mode:",
        error
      );

    }

  };


  /* =========================================================
     DISABLE BACKEND FAULT MODE
  ========================================================= */

  const normalize = async () => {

    try {

      const response = await fetch(
        `${API_BASE}/api/telemetry/fault/false`,
        {
          method: "POST"
        }
      );


      if (!response.ok) {

        throw new Error(
          "Unable to disable fault mode"
        );

      }


      setFaultMode(false);

    } catch (error) {

      console.error(
        "Unable to disable fault mode:",
        error
      );

    }

  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="app">

      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={
          `sidebar ${mobileOpen ? "open" : ""}`
        }
      >

        <div className="brand-row">

          <div className="brand-mark">
            ✦
          </div>

          <div className="brand">
            AEGIS<span>AI</span>
          </div>

          <button
            className="close-mobile"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>

        </div>


        <div className="brand-sub">
          ENGINE HEALTH INTELLIGENCE
        </div>


        <nav>

          {navItems.map(
            ([name, Icon]) => (

              <button
                key={name}
                className={
                  page === name
                    ? "nav active"
                    : "nav"
                }
                onClick={() =>
                  selectPage(name)
                }
              >

                <Icon size={17} />

                <span>
                  {name}
                </span>

              </button>

            )
          )}

        </nav>


        <div className="sidebar-bottom">

          <div className="mission-mini">

            <Plane size={15} />

            <div>

              <b>
                MALE UAV
              </b>

              <span>
                Endurance Mission
              </span>

            </div>

          </div>


          <small>
            AegisAI v1.0.0
            <br />
            AI + Digital Twin + Analytics
          </small>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main>

        <header className="topbar">

          <div className="mobile-menu">

            <button
              onClick={() =>
                setMobileOpen(true)
              }
            >
              <Menu size={21} />
            </button>

          </div>


          <div>

            <div className="top-title">
              AI-Enabled Real-Time Digital Twin
            </div>

            <div className="top-sub">
              Aero-Piston Engine Health Monitoring
              & Mission Reliability
            </div>

          </div>


          <div className="top-actions">

            <span
              className={
                connected
                  ? "online"
                  : "offline"
              }
            >

              <CircleDot size={11} />

              {connected
                ? "SYSTEM ONLINE"
                : "OFFLINE"}

            </span>


            <span className="top-date">
              {new Date().toLocaleDateString()}
            </span>


            <span className="uav-tag">

              <Plane size={17} />

              MALE UAV

            </span>

          </div>

        </header>


        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <div className="page-wrap">


          {/* =================================================
              DASHBOARD
          ================================================= */}

          {page === "Dashboard" && (

            <Dashboard

              telemetry={telemetry}

              health={health}

              status={status}

              risk={risk}

              faultMode={faultMode}

              history={history}

              onFault={triggerFault}

              onNormal={normalize}

              onPage={selectPage}

              twinData={twinData}

              anomalyData={anomalyData}

            />

          )}


          {/* =================================================
              LIVE DATA
          ================================================= */}

          {page === "Live Data" && (

            <LiveData
              telemetry={telemetry}
              expected={expected}
              twinData={twinData}
            />

          )}


          {/* =================================================
              DIGITAL TWIN
          ================================================= */}

          {page === "Digital Twin" && (

            <DigitalTwin

              telemetry={telemetry}

              expected={expected}

              health={health}

              twinData={twinData}

            />

          )}


          {/* =================================================
              AI ANALYSIS
          ================================================= */}

          {page === "AI Analysis" && (

            <AIAnalysis

              health={health}

              risk={risk}

              faultMode={faultMode}

              anomalyData={anomalyData}

            />

          )}


          {/* =================================================
              HEALTH & RISK
          ================================================= */}

          {page === "Health & Risk" && (

            <HealthRisk

              health={health}

              risk={risk}

              status={status}

              healthData={healthData}

            />

          )}


          {/* =================================================
              MISSION PROFILE
          ================================================= */}

          {page === "Mission Profile" && (

            <MissionProfile
              health={health}
            />

          )}


          {/* =================================================
              MISSION REPLAY
          ================================================= */}

          {page === "Mission Replay" && (

            <MissionReplay

              replay={replay}

              setReplay={setReplay}

            />

          )}


          {/* =================================================
              REPORTS
          ================================================= */}

          {page === "Reports" && (
            <Reports />
          )}


          {/* =================================================
              SETTINGS
          ================================================= */}

          {page === "Settings" && (

            <SettingsPage

              connected={connected}

              setConnected={setConnected}

            />

          )}

        </div>

      </main>

    </div>

  );

}


/* ============================================================
   DASHBOARD
============================================================ */

function Dashboard({
  telemetry: t,
  health,
  status,
  risk,
  faultMode,
  history,
  onFault,
  onNormal,
  onPage,
  twinData,
  anomalyData
}) {

  const twinSynchronized =
    twinData?.synchronized ?? true;


  const anomalyConfidence =
    anomalyData?.confidence != null
      ? Number(anomalyData.confidence).toFixed(2)
      : faultMode
        ? "94"
        : "87";


  const anomalySeverity =
    anomalyData?.severity ||
    (faultMode ? "CRITICAL" : "NORMAL");


  const anomalyMessage =
    anomalyData?.message ||
    (
      faultMode
        ? "Abnormal engine behaviour detected."
        : "No significant abnormality detected."
    );


  return (

    <>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="summary-grid">

        <HealthCard
          health={health}
        />


        <SummaryCard
          title="ENGINE STATUS"
          value={status}
          tone={
            status === "NORMAL"
              ? "green"
              : status === "WARNING"
                ? "amber"
                : "red"
          }
          sub="Operating state"
        />


        <SummaryCard
          title="MISSION STATUS"
          value="CRUISE"
          tone="blue"
          sub="Phase 3 / 5 · Endurance"
        />


        <SummaryCard
          title="RISK LEVEL"
          value={risk}
          tone={
            risk === "LOW"
              ? "green"
              : risk === "MEDIUM"
                ? "amber"
                : "red"
          }
          sub="AI-assisted assessment"
        />

      </div>


      {/* ======================================================
          DASHBOARD GRID
      ====================================================== */}

      <div className="dashboard-grid">


        {/* ====================================================
            LEFT SIDE
        ==================================================== */}

        <div className="left-stack">


          {/* ==================================================
              REAL-TIME PARAMETERS
          ================================================== */}

          <Card
            title="REAL-TIME ENGINE PARAMETERS"
            action={
              <span className="live">
                <CircleDot size={10} />
                LIVE
              </span>
            }
          >

            <MetricGrid
              t={t}
              faultMode={faultMode}
            />

          </Card>


          {/* ==================================================
              DIGITAL TWIN
          ================================================== */}

          <Card
            title="DIGITAL TWIN — LIVE ENGINE MODEL"
            action={
              <span
                className={
                  twinSynchronized
                    ? "live"
                    : "amber"
                }
              >

                <CircleDot size={10} />

                {twinSynchronized
                  ? "SYNCHRONIZED"
                  : "DEVIATION"}

              </span>
            }
          >

            <DigitalTwinCompact

              t={t}

              twinData={twinData}

            />

          </Card>


          {/* ==================================================
              HEALTH TREND
          ================================================== */}

          <Card
            title="ENGINE HEALTH TREND"
            action={
              <div className="range-tabs">
                <span>1H</span>
                <span>6H</span>
                <span>12H</span>
                <b>24H</b>
                <span>7D</span>
              </div>
            }
          >

            <div className="chart-large">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart data={history}>

                  <defs>

                    <linearGradient
                      id="healthFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopOpacity=".35"
                      />

                      <stop
                        offset="100%"
                        stopOpacity="0"
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    stroke="#12344b"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="time"
                    stroke="#66879e"
                    tick={{
                      fontSize: 10
                    }}
                  />


                  <YAxis
                    domain={[50, 100]}
                    stroke="#66879e"
                    tick={{
                      fontSize: 10
                    }}
                  />


                  <Tooltip
                    contentStyle={{
                      background: "#06182a",
                      border: "1px solid #195174"
                    }}
                  />


                  <Area
                    type="monotone"
                    dataKey="health"
                    stroke="#20e889"
                    fill="url(#healthFill)"
                    strokeWidth={2}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </Card>


          {/* ==================================================
              LOWER CHARTS
          ================================================== */}

          <div className="bottom-grid">


            <Card title="ENGINE PARAMETERS — LAST HOUR">

              <div className="chart-small">

                <ResponsiveContainer>

                  <LineChart data={history}>

                    <CartesianGrid
                      stroke="#12344b"
                    />

                    <XAxis
                      dataKey="time"
                      hide
                    />

                    <YAxis
                      stroke="#66879e"
                      tick={{
                        fontSize: 9
                      }}
                    />

                    <Tooltip />


                    <Line
                      dataKey="rpm"
                      stroke="#21b9ff"
                      dot={false}
                      strokeWidth={2}
                    />


                    <Line
                      dataKey="temp"
                      stroke="#ffb52e"
                      dot={false}
                      strokeWidth={2}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </Card>


            <Card title="MISSION PERFORMANCE">

              <MissionSteps />

              <div className="mini-stat-grid">

                <MiniStat
                  label="Current Phase"
                  value="CRUISE"
                />

                <MiniStat
                  label="Duration"
                  value="2h 14m"
                />

                <MiniStat
                  label="Altitude"
                  value="4,500 ft"
                />

              </div>

            </Card>

          </div>

        </div>


        {/* ====================================================
            RIGHT SIDE
        ==================================================== */}

        <div className="right-stack">


          {/* ==================================================
              ACTIVE ALERTS
          ================================================== */}

          <Card
            title="ACTIVE ALERTS"
            action={<span>🔔</span>}
          >

            <div className="alert-counts">

              <span>
                {anomalySeverity === "CRITICAL"
                  ? "1 Critical"
                  : "0 Critical"}
              </span>

              <span className="amber-box">
                {status === "WARNING"
                  ? "1 Warning"
                  : "0 Warning"}
              </span>

              <span>
                0 Info
              </span>

            </div>


            <div
              className={
                `alert-box ${
                  faultMode
                    ? "alert-red"
                    : ""
                }`
              }
            >

              <div className="alert-head">

                <AlertTriangle size={15} />

                <b>
                  {faultMode
                    ? "Engine anomaly detected"
                    : "Thermal trend deviation detected"}
                </b>

              </div>


              <p>

                {faultMode
                  ? anomalyMessage
                  : "Exhaust temperature is slightly higher than expected."}

              </p>


              <small>

                Confidence:{" "}
                {anomalyConfidence}%

                {" · "}

                Risk:{" "}

                {risk}

              </small>

            </div>

          </Card>


          {/* ==================================================
              AI PREDICTION
          ================================================== */}

          <Card
            title="AI PREDICTION"
            action={
              <span
                className={
                  faultMode
                    ? "amber"
                    : "green"
                }
              >

                ●{" "}

                {faultMode
                  ? "ANOMALY"
                  : "NORMAL"}

              </span>
            }
          >

            <h3
              className={
                faultMode
                  ? "amber"
                  : "green"
              }
            >

              {anomalyMessage}

            </h3>


            <div className="confidence-label">

              <span>
                Prediction confidence
              </span>

              <b>
                {anomalyConfidence}%
              </b>

            </div>


            <div className="confidence">

              <i
                style={{
                  width:
                    `${Math.min(
                      100,
                      Number(anomalyConfidence)
                    )}%`
                }}
              />

            </div>


            <ul className="checks">

              <li>
                ✓ Temperature relationship analysed
              </li>

              <li>
                ✓ RPM stability analysed
              </li>

              <li>
                ✓ Vibration pattern analysed
              </li>

            </ul>


            <button
              className="outline-btn"
              onClick={() =>
                onPage("AI Analysis")
              }
            >

              View Detailed Analysis

              <ChevronRight size={15} />

            </button>

          </Card>


          {/* ==================================================
              EXPLAINABLE ALERT
          ================================================== */}

          <Card
            title="EXPLAINABLE ALERT"
            action={
              <span
                className={
                  faultMode
                    ? "red"
                    : "amber"
                }
              >

                ●{" "}

                {faultMode
                  ? anomalySeverity
                  : "MEDIUM"}

              </span>
            }
          >

            <b>

              {faultMode
                ? "Multi-parameter deviation"
                : "Thermal trend deviation detected"}

            </b>


            <div className="factor-list">

              <span>01</span>

              Exhaust temperature trend

            </div>


            <div className="factor-list">

              <span>02</span>

              Temperature / RPM deviation

            </div>


            <div className="factor-list">

              <span>03</span>

              Pressure relationship change

            </div>


            <div className="confidence-label">

              <span>
                Evidence confidence
              </span>

              <b>
                {anomalyConfidence}%
              </b>

            </div>

          </Card>


          {/* ==================================================
              DEMO SCENARIO
          ================================================== */}

          <Card title="DEMO SCENARIO">

            <div className="scenario-text">

              {faultMode

                ? "Fault scenario is active. Watch the health index and telemetry trend change."

                : "Use the controls to demonstrate a normal engine state or a controlled simulated abnormal condition."}

            </div>


            <div className="controls">

              <button
                className="outline-btn"
                onClick={onNormal}
              >

                <RefreshCw size={14} />

                Normal

              </button>


              <button
                className="fault-btn"
                onClick={onFault}
              >

                <AlertTriangle size={14} />

                Simulate Fault

              </button>

            </div>

          </Card>

        </div>

      </div>

    </>

  );

}


/* ============================================================
   HEALTH CARD
============================================================ */

function HealthCard({ health }) {

  return (

    <div className="summary-card health-summary">

      <div className="summary-title">
        ENGINE HEALTH
      </div>


      <div className="health-flex">

        <div
          className="health-ring"
          style={{
            "--health":
              `${health * 3.6}deg`
          }}
        >

          <div>
            {health.toFixed(0)}%
          </div>

        </div>


        <div>

          <strong
            className={
              health >= 85
                ? "green"
                : health >= 70
                  ? "amber"
                  : "red"
            }
          >

            {health >= 85
              ? "GOOD"
              : health >= 70
                ? "WATCH"
                : "ATTENTION"}

          </strong>


          <small>
            Live Health Index
          </small>

        </div>

      </div>

    </div>

  );

}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  title,
  value,
  tone,
  sub
}) {

  return (

    <div className="summary-card">

      <div className="summary-title">
        {title}
      </div>

      <div
        className={
          `summary-value ${tone}`
        }
      >
        {value}
      </div>

      <small>
        {sub}
      </small>

    </div>

  );

}


/* ============================================================
   CARD
============================================================ */

function Card({
  title,
  action,
  children
}) {

  return (

    <section className="card">

      <div className="card-head">

        <h3>
          {title}
        </h3>

        {action}

      </div>

      {children}

    </section>

  );

}


/* ============================================================
   METRIC GRID
============================================================ */

function MetricGrid({
  t,
  faultMode
}) {

  const items = [

    [
      "RPM",
      t.rpm.toFixed(0),
      "RPM"
    ],

    [
      "Temperature",
      t.temperature.toFixed(1),
      "°C"
    ],

    [
      "Oil Pressure",
      t.oilPressure.toFixed(2),
      "bar"
    ],

    [
      "Vibration",
      t.vibration.toFixed(1),
      "mm/s"
    ],

    [
      "Fuel Flow",
      t.fuelFlow.toFixed(1),
      "L/h"
    ],

    [
      "Exhaust Temp",
      t.exhaustTemp.toFixed(0),
      "°C"
    ]

  ];


  return (

    <div className="metric-grid">

      {items.map(
        ([name, value, unit]) => (

          <div
            className="metric"
            key={name}
          >

            <small>
              {name}
            </small>


            <b>

              {value}

              <em>
                {unit}
              </em>

            </b>


            <span
              className={
                faultMode
                  ? "amber"
                  : "green"
              }
            >

              ●{" "}

              {faultMode
                ? "Deviation"
                : "Normal"}

            </span>


            <div className="spark" />

          </div>

        )
      )}

    </div>

  );

}


/* ============================================================
   DIGITAL TWIN COMPACT
============================================================ */

function DigitalTwinCompact({
  t,
  twinData
}) {

  const synchronized =
    twinData?.synchronized ?? true;


  const expectedTwin =
    twinData?.expected || {

      rpm: 3800,
      temperature: 72,
      oil_pressure: 4.0,
      vibration: 2.0,
      fuel_flow: 28.0,
      exhaust_temperature: 600

    };


  const rows = [

    [
      "RPM",
      t.rpm.toFixed(0),
      Number(expectedTwin.rpm).toFixed(0)
    ],

    [
      "Temperature",
      `${t.temperature.toFixed(1)} °C`,
      `${Number(
        expectedTwin.temperature
      ).toFixed(1)} °C`
    ],

    [
      "Oil Pressure",
      `${t.oilPressure.toFixed(2)} bar`,
      `${Number(
        expectedTwin.oil_pressure
      ).toFixed(1)} bar`
    ],

    [
      "Exhaust Temp",
      `${t.exhaustTemp.toFixed(0)} °C`,
      `${Number(
        expectedTwin.exhaust_temperature
      ).toFixed(0)} °C`
    ],

    [
      "Vibration",
      `${t.vibration.toFixed(1)} mm/s`,
      `${Number(
        expectedTwin.vibration
      ).toFixed(1)} mm/s`
    ]

  ];


  return (

    <div className="twin-grid">

      <EngineVisual />


      <div className="twin-data">

        <div
          className={
            `twin-state ${
              synchronized
                ? "green"
                : "amber"
            }`
          }
        >

          <CircleDot size={10} />

          DIGITAL TWIN{" "}

          {synchronized
            ? "SYNCHRONIZED"
            : "DEVIATION"}

        </div>


        {rows.map(
          ([name, actual, expectedValue]) => (

            <div
              className="compare-row"
              key={name}
            >

              <span>
                {name}
              </span>

              <b>
                {actual}
              </b>

              <small>
                Expected {expectedValue}
              </small>

            </div>

          )
        )}

      </div>

    </div>

  );

}


/* ============================================================
   ENGINE VISUAL
============================================================ */

function EngineVisual() {

  return (

    <div className="engine-visual">

      <div className="engine-grid" />

      <div className="engine-core" />

      <div className="engine-ring r1" />

      <div className="engine-ring r2" />

      <div className="engine-label">

        LIVE

        <br />

        <b>
          ENGINE
        </b>

      </div>

    </div>

  );

}


/* ============================================================
   MISSION STEPS
============================================================ */

function MissionSteps() {

  return (

    <div className="mission-steps">

      {[
        "Take-Off",
        "Climb",
        "Cruise",
        "Loiter",
        "Return"
      ].map(
        (x, i) => (

          <div
            key={x}
            className={
              i === 2
                ? "step current"
                : "step"
            }
          >

            <div>
              ●
            </div>

            <span>
              {x}
            </span>

          </div>

        )
      )}

    </div>

  );

}


/* ============================================================
   MINI STAT
============================================================ */

function MiniStat({
  label,
  value
}) {

  return (

    <div>

      <small>
        {label}
      </small>

      <b>
        {value}
      </b>

    </div>

  );

}


/* ============================================================
   LIVE DATA
============================================================ */

function LiveData({
  telemetry: t,
  expected: e,
  twinData
}) {

  const rows = [

    [
      "RPM",
      t.rpm,
      e.rpm
    ],

    [
      "Temperature",
      t.temperature,
      e.temperature
    ],

    [
      "Oil Pressure",
      t.oilPressure,
      e.oilPressure
    ],

    [
      "Vibration",
      t.vibration,
      e.vibration
    ],

    [
      "Fuel Flow",
      t.fuelFlow,
      e.fuelFlow
    ],

    [
      "Exhaust Temp",
      t.exhaustTemp,
      e.exhaustTemp
    ]

  ];


  return (

    <PageShell
      title="Live Data"
      subtitle="Real-time engine telemetry and expected behaviour comparison"
    >

      <div className="data-table-wrap">

        <table>

          <thead>

            <tr>

              <th>
                Parameter
              </th>

              <th>
                Live
              </th>

              <th>
                Expected
              </th>

              <th>
                Deviation
              </th>

              <th>
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            {rows.map(
              ([name, live, expectedValue]) => {

                const deviation =
                  (
                    (live - expectedValue) /
                    expectedValue
                  ) * 100;


                const abnormal =
                  Math.abs(deviation) > 5;


                return (

                  <tr key={name}>

                    <td>
                      {name}
                    </td>

                    <td>
                      {Number(live).toFixed(2)}
                    </td>

                    <td>
                      {Number(
                        expectedValue
                      ).toFixed(2)}
                    </td>

                    <td>
                      {deviation.toFixed(1)}%
                    </td>

                    <td>

                      <span
                        className={
                          `status-pill ${
                            abnormal
                              ? "amber"
                              : "green"
                          }`
                        }
                      >

                        {abnormal
                          ? "DEVIATION"
                          : "NORMAL"}

                      </span>

                    </td>

                  </tr>

                );

              }
            )}

          </tbody>

        </table>

      </div>


      {twinData && (

        <div
          className="card"
          style={{ marginTop: "20px" }}
        >

          <div className="card-head">

            <h3>
              DIGITAL TWIN STATE
            </h3>

          </div>

          <p>

            Model State:{" "}

            <b>
              {twinData.model_state}
            </b>

          </p>

        </div>

      )}

    </PageShell>

  );

}


/* ============================================================
   DIGITAL TWIN FULL PAGE
============================================================ */

function DigitalTwin({
  telemetry,
  expected,
  health,
  twinData
}) {

  const synchronized =
    twinData?.synchronized ?? true;


  return (

    <PageShell
      title="Digital Twin"
      subtitle="Live virtual representation of engine state"
    >

      <div className="twin-full">

        <EngineVisual />


        <div>

          <div
            className={
              `big-state ${
                synchronized
                  ? "green"
                  : "amber"
              }`
            }
          >

            {synchronized
              ? "SYNCHRONIZED"
              : "DEVIATION"}

          </div>


          <p className="muted">

            Health Index:{" "}

            <b>
              {health.toFixed(2)}%
            </b>

          </p>


          {Object.keys(expected).map(
            key => (

              <div
                className="compare-row"
                key={key}
              >

                <span>
                  {key}
                </span>

                <b>
                  {Number(
                    telemetry[key]
                  ).toFixed(2)}
                </b>

                <small>
                  Expected{" "}
                  {Number(
                    expected[key]
                  ).toFixed(2)}
                </small>

              </div>

            )
          )}


          {twinData?.residuals && (

            <div
              className="card"
              style={{
                marginTop: "15px"
              }}
            >

              <div className="card-head">

                <h3>
                  MODEL RESIDUALS
                </h3>

              </div>


              {Object.entries(
                twinData.residuals
              ).map(
                ([key, value]) => (

                  <div
                    className="compare-row"
                    key={key}
                  >

                    <span>
                      {key}
                    </span>

                    <b>
                      {Number(
                        value
                      ).toFixed(2)}
                    </b>

                  </div>

                )
              )}

            </div>

          )}


          <button
            className="outline-btn"
          >

            Run What-If Simulation

            <ChevronRight size={15} />

          </button>

        </div>

      </div>

    </PageShell>

  );

}


/* ============================================================
   AI ANALYSIS
============================================================ */

function AIAnalysis({
  health,
  risk,
  faultMode,
  anomalyData
}) {

  const confidence =
    anomalyData?.confidence != null
      ? Number(anomalyData.confidence)
      : faultMode
        ? 94
        : 87;


  const score =
    anomalyData?.anomaly_score != null
      ? Number(anomalyData.anomaly_score)
      : 0;


  const severity =
    anomalyData?.severity ||
    (faultMode ? "CRITICAL" : "NORMAL");


  const message =
    anomalyData?.message ||
    (
      faultMode
        ? "Abnormal engine behaviour detected."
        : "No significant abnormality detected."
    );


  return (

    <PageShell
      title="AI Analysis"
      subtitle="Anomaly detection, prediction confidence and explainable health intelligence"
    >

      <div className="analysis-grid">


        <div className="analysis-main">


          <div
            className={
              `ai-status ${
                faultMode
                  ? "warning"
                  : "normal"
              }`
            }
          >

            <Brain />


            <div>

              <small>
                AI ENGINE STATUS
              </small>


              <h2>
                {faultMode
                  ? "ANOMALY DETECTED"
                  : "NORMAL BEHAVIOUR"}
              </h2>


              <p>
                Confidence{" "}
                {confidence.toFixed(2)}%
              </p>


              <p>
                Anomaly Score:{" "}
                {score.toFixed(3)}
              </p>


              <p>
                Severity:{" "}
                {severity}
              </p>


              <p>
                {message}
              </p>

            </div>

          </div>


          <h3>
            Contributing Factors
          </h3>


          {[
            "Temperature behaviour",
            "RPM stability",
            "Vibration pattern",
            "Oil-pressure relationship",
            "Exhaust temperature trend"
          ].map(
            (x, i) => {

              const values =
                faultMode
                  ? [95, 91, 89, 82, 96]
                  : [91, 86, 78, 83, 88];


              return (

                <div
                  className="factor-bar"
                  key={x}
                >

                  <span>
                    {x}
                  </span>


                  <div>

                    <i
                      style={{
                        width:
                          `${values[i]}%`
                      }}
                    />

                  </div>


                  <b>
                    {values[i]}%
                  </b>

                </div>

              );

            }
          )}

        </div>


        <div className="risk-card">

          <Gauge size={28} />

          <small>
            ENGINE HEALTH
          </small>

          <strong>
            {health.toFixed(0)}%
          </strong>

          <span
            className={
              risk === "LOW"
                ? "green"
                : risk === "MEDIUM"
                  ? "amber"
                  : "red"
            }
          >

            {risk} RISK

          </span>

        </div>

      </div>

    </PageShell>

  );

}


/* ============================================================
   HEALTH & RISK
============================================================ */

function HealthRisk({
  health,
  risk,
  status,
  healthData
}) {

  const components =
    healthData?.components || {};


  const items = [

    [
      "Thermal condition",
      components.temperature ?? 94
    ],

    [
      "Lubrication",
      components.oil_pressure ?? 91
    ],

    [
      "Vibration",
      components.vibration ?? 88
    ],

    [
      "RPM stability",
      components.rpm ?? 96
    ],

    [
      "Exhaust behaviour",
      components.exhaust_temperature ?? 89
    ],

    [
      "Fuel flow",
      components.fuel_flow ?? 97
    ]

  ];


  return (

    <PageShell
      title="Health & Risk"
      subtitle="Health index, risk level and decision-support indicators"
    >

      <div className="risk-grid">


        <div className="risk-big">

          <div
            className="health-ring large"
            style={{
              "--health":
                `${health * 3.6}deg`
            }}
          >

            <div>
              {health.toFixed(0)}%
            </div>

          </div>


          <h2
            className={
              risk === "LOW"
                ? "green"
                : risk === "MEDIUM"
                  ? "amber"
                  : "red"
            }
          >

            {risk} RISK

          </h2>


          <p>
            {status} operating state
          </p>

        </div>


        <div className="risk-items">

          {items.map(
            ([name, value]) => (

              <div
                className="risk-item"
                key={name}
              >

                <span>
                  {name}
                </span>


                <b>
                  {Number(value).toFixed(1)}%
                </b>


                <div>

                  <i
                    style={{
                      width:
                        `${Math.max(
                          0,
                          Math.min(
                            100,
                            Number(value)
                          )
                        )}%`
                    }}
                  />

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </PageShell>

  );

}


/* ============================================================
   MISSION PROFILE
============================================================ */

function MissionProfile({
  health
}) {

  return (

    <PageShell
      title="Mission Profile"
      subtitle="Mission-aware engine health context"
    >

      <div className="mission-profile">


        <div className="phase-line">

          {[
            "Take-Off",
            "Climb",
            "Cruise",
            "Loiter",
            "Return"
          ].map(
            (x, i) => (

              <div
                className={
                  i === 2
                    ? "phase active"
                    : "phase"
                }
                key={x}
              >

                <span>
                  {i + 1}
                </span>

                <b>
                  {x}
                </b>

                <small>
                  {i === 2
                    ? "CURRENT"
                    : "Complete"}
                </small>

              </div>

            )
          )}

        </div>


        <div className="mission-cards">

          <MiniStat
            label="Mission Health"
            value={`${health.toFixed(0)}%`}
          />

          <MiniStat
            label="Current Phase"
            value="Cruise"
          />

          <MiniStat
            label="Altitude"
            value="4,500 ft"
          />

          <MiniStat
            label="Mission Time"
            value="02:14:00"
          />

        </div>

      </div>

    </PageShell>

  );

}


/* ============================================================
   MISSION REPLAY
============================================================ */

function MissionReplay({
  replay,
  setReplay
}) {

  return (

    <PageShell
      title="Mission Replay"
      subtitle="Replay historical telemetry, health trends and alert events"
    >

      <div className="replay-card">


        <div className="replay-top">

          <div>

            <small>
              MISSION_001
            </small>

            <h2>
              Endurance Flight
            </h2>

          </div>


          <button className="outline-btn">

            <Play size={14} />

            Play Replay

          </button>

        </div>


        <div className="timeline">

          <div className="timeline-track">

            <i
              style={{
                width:
                  `${replay}%`
              }}
            />

          </div>


          <input
            type="range"
            min="0"
            max="100"
            value={replay}
            onChange={
              e =>
                setReplay(
                  e.target.value
                )
            }
          />

        </div>


        <div className="replay-time">

          01:
          {String(
            Math.floor(
              replay * 2.3
            )
          ).padStart(2, "0")}

          :31

          <span>
            / 03:50:00
          </span>

        </div>


        <div className="replay-events">

          <span>
            ● Take-Off
          </span>

          <span>
            ● Cruise
          </span>

          <span className="amber">
            ● Thermal alert
          </span>

          <span>
            ● Current position
          </span>

        </div>

      </div>

    </PageShell>

  );

}


/* ============================================================
   REPORTS
============================================================ */

function Reports() {

  return (

    <PageShell
      title="Reports"
      subtitle="Post-flight health and reliability reporting"
    >

      <div className="report-grid">

        {[
          "Post-Flight Health Report",
          "AI Anomaly Summary",
          "Digital Twin Comparison",
          "Maintenance Recommendation"
        ].map(
          x => (

            <div
              className="report-card"
              key={x}
            >

              <FileText />

              <h3>
                {x}
              </h3>

              <p>
                Generate a structured report
                from telemetry, health trends
                and AI analysis.
              </p>


              <button className="outline-btn">

                <Download size={14} />

                Generate

              </button>

            </div>

          )
        )}

      </div>

    </PageShell>

  );

}


/* ============================================================
   SETTINGS
============================================================ */

function SettingsPage({
  connected,
  setConnected
}) {

  return (

    <PageShell
      title="Settings"
      subtitle="Dashboard and data-source configuration"
    >

      <div className="settings-list">


        <div>

          <b>
            Data Source
          </b>

          <span>
            Simulation / ESP32 / DAQ / API
          </span>

        </div>


        <div>

          <b>
            Real-Time Connection
          </b>


          <button
            className={
              connected
                ? "toggle on"
                : "toggle"
            }
            onClick={() =>
              setConnected(
                !connected
              )
            }
          >

            <i />

          </button>

        </div>


        <div>

          <b>
            Dashboard Refresh
          </b>


          <select>

            <option>
              1 second
            </option>

            <option>
              2 seconds
            </option>

            <option>
              5 seconds
            </option>

          </select>

        </div>


        <div>

          <b>
            Alert Mode
          </b>


          <select>

            <option>
              Standard
            </option>

            <option>
              Conservative
            </option>

            <option>
              High Sensitivity
            </option>

          </select>

        </div>

      </div>

    </PageShell>

  );

}


/* ============================================================
   PAGE SHELL
============================================================ */

function PageShell({
  title,
  subtitle,
  children
}) {

  return (

    <div className="page">

      <div className="page-heading">

        <div>

          <h1>
            {title}
          </h1>

          <p>
            {subtitle}
          </p>

        </div>


        <button className="outline-btn">

          <Search size={14} />

          Search

        </button>

      </div>


      {children}

    </div>

  );

}


/* ============================================================
   EXPORT
============================================================ */

export default App;