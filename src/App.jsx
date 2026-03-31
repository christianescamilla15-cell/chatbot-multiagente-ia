import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AGENTS } from "./constants/agents.js";
import { useChat } from "./hooks/useChat.js";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import Header from "./components/layout/Header.jsx";
import TourOverlay from "./components/layout/TourOverlay.jsx";
import AgentSelector from "./components/agents/AgentSelector.jsx";
import AgentInfo from "./components/agents/AgentInfo.jsx";
import ChatPanel from "./components/chat/ChatPanel.jsx";
import StatsPanel from "./components/chat/StatsPanel.jsx";
import QuickActions from "./components/chat/QuickActions.jsx";
import ChatInput from "./components/chat/ChatInput.jsx";
import DashboardPanel from "./components/chat/DashboardPanel.jsx";
import AdminPanel from "./components/admin/AdminPanel.jsx";
import ExportButton from "./components/chat/ExportButton.jsx";
import AgentStats from "./components/chat/AgentStats.jsx";

// ─── CSS Keyframes & Global Styles ─────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');
  @keyframes msgIn { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes transferFlash { 0%{opacity:0;transform:scaleX(0.8)} 50%{opacity:1} 100%{transform:scaleX(1)} }
  @keyframes welcomePulse { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
  @keyframes tourPulse { 0%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.03)} 100%{opacity:1;transform:scale(1)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes glowPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
  *{box-sizing:border-box} textarea:focus{outline:none} textarea{resize:none}
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
  html{scroll-behavior:smooth}
`;

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, height: 2, zIndex: 9999,
      width: `${progress}%`,
      background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #A78BFA)',
      transition: 'width 0.1s linear',
    }} />
  );
}

export default function SynapseAssistant() {
  // Lenis removed — was blocking scroll inside chat panel

  const {
    messages, input, setInput, loading, agent, setAgent,
    lang, setLang, ratings, handleRate, verified,
    phone, setPhone, residentName,
    clearChat, exportChat, suggestions, firstFromAgent,
    sendMessage, bottomRef, inputRef,
  } = useChat();

  const [showStats, setShowStats] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showAgentStats, setShowAgentStats] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAdmin, setShowAdmin] = useState(() => new URLSearchParams(window.location.search).get("admin") === "true");
  const [tourStep, setTourStep] = useState(0);
  const tourActive = tourStep !== null;

  const ca = AGENTS[agent];

  return (
    <ErrorBoundary>
      <ScrollProgress />
      <div style={{ minHeight: "100vh", background: "#09090B", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", padding: 20 }}>
        <style>{globalStyles}</style>

        {/* Film grain noise overlay */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none', opacity: 0.035,
        }}>
          <svg width="100%" height="100%">
            <filter id="noise"><feTurbulence baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter>
            <rect width="100%" height="100%" filter="url(#noise)" opacity="0.5"/>
          </svg>
        </div>

        {/* Subtle background glow */}
        <motion.div
          animate={{ background: `radial-gradient(circle, ${ca.shadow?.replace("0.3", "0.06")} 0%, transparent 70%)` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 700, pointerEvents: "none" }}
        />

        {/* Main chat container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%", maxWidth: 520, height: "min(780px, 92vh)",
            background: "#0F1117",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px ${ca.color}08, 0 0 80px ${ca.shadow?.replace("0.3", "0.04")}`,
            position: "relative", zIndex: 1,
            transition: "box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            backdropFilter: "blur(12px)",
          }}
        >

          <Header
            agent={agent} lang={lang} setLang={setLang}
            showInfo={showInfo} setShowInfo={setShowInfo}
            showStats={showStats} setShowStats={setShowStats}
            showAgentStats={showAgentStats} setShowAgentStats={setShowAgentStats}
            exportChat={exportChat} clearChat={clearChat}
            messages={messages} ratings={ratings} onStartTour={() => setTourStep(0)}
          />

          <ErrorBoundary fallbackLabel={lang === "en" ? "Agent selector error" : "Error en selector de agentes"}>
            <AgentSelector agent={agent} onSelect={setAgent} lang={lang} />
          </ErrorBoundary>

          <AnimatePresence mode="wait">
            {showInfo && (
              <motion.div key="info"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <AgentInfo agent={agent} lang={lang} />
              </motion.div>
            )}
            {showStats && (
              <motion.div key="stats"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <StatsPanel messages={messages} ratings={ratings} lang={lang} />
              </motion.div>
            )}
            {showAgentStats && (
              <motion.div key="agentStats"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <AgentStats messages={messages} ratings={ratings} lang={lang} />
              </motion.div>
            )}
          </AnimatePresence>

          <ErrorBoundary fallbackLabel={lang === "en" ? "Chat panel error" : "Error en panel de chat"}>
            <ChatPanel
              messages={messages} loading={loading} agent={agent}
              lang={lang} firstFromAgent={firstFromAgent}
              onRate={handleRate} bottomRef={bottomRef}
            />
          </ErrorBoundary>

          {/* Dashboard + Admin toggle buttons */}
          <div style={{ padding: "4px 16px", display: "flex", justifyContent: "center", gap: 8 }}>
            <button onClick={() => setShowDashboard(!showDashboard)} style={{
              background: showDashboard ? `${ca.color}15` : "rgba(255,255,255,0.03)",
              border: `1px solid ${showDashboard ? `${ca.color}25` : "rgba(255,255,255,0.06)"}`,
              borderRadius: 8, padding: "4px 14px", fontSize: 10, fontWeight: 600,
              color: showDashboard ? ca.color : "rgba(255,255,255,0.4)", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>{showDashboard ? "Cerrar Dashboard" : "Dashboard"}</button>
            <button onClick={() => window.open(`${window.location.origin}?admin=true`, '_blank')} style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 8, padding: "4px 14px", fontSize: 10, fontWeight: 600,
              color: "#818CF8", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>Admin Panel</button>
          </div>

          <AnimatePresence>
            {showDashboard && (
              <motion.div key="dashboard"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardPanel agent={agent} />
              </motion.div>
            )}
          </AnimatePresence>

          <QuickActions suggestions={suggestions} loading={loading} agent={agent} onSend={sendMessage} />

          <ChatInput
            inputRef={inputRef} input={input} setInput={setInput}
            loading={loading} agent={agent} onSend={sendMessage} lang={lang}
            phone={phone} setPhone={setPhone} verified={verified} residentName={residentName}
          />
        </motion.div>

        {/* Tour Overlay */}
        {tourActive && (
          <TourOverlay
            step={tourStep}
            lang={lang}
            setLang={setLang}
            onSkip={() => setTourStep(null)}
            onNext={(next) => setTourStep(next)}
            onTryChat={() => {
              const demoMsg = lang === 'en' ? "What are the pool hours?" : "Cual es el horario de la alberca?";
              setInput(demoMsg);
              setTourStep(null);
              setTimeout(() => {
                sendMessage(demoMsg);
                setTimeout(() => setTourStep(3), 1800);
              }, 300);
            }}
            onTryStats={() => {
              setShowStats(true);
              setShowInfo(false);
              setTourStep(5);
            }}
            onFinish={() => setTourStep(null)}
          />
        )}

        {/* Admin Panel Overlay */}
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      </div>
    </ErrorBoundary>
  );
}
