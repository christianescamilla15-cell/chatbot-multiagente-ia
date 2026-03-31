import { useState, useEffect, useCallback } from "react";
import { TOUR_TEXTS } from "../../constants/translations.js";
import { renderBoldText } from "../../utils/messageFormatter.js";

export default function TourOverlay({ step, lang, onSkip, onNext, onTryChat, onTryStats, onFinish, setLang }) {
  const [spotlightRect, setSpotlightRect] = useState(null);

  const recalcSpotlight = useCallback(() => {
    if (step === 0) { setSpotlightRect(null); return; }
    const selectors = { 1: '[data-tour="agents"]', 2: '[data-tour="input"]', 3: '[data-tour="messages"]', 4: '[data-tour="stats-btn"]' };
    const sel = selectors[step];
    if (!sel) { setSpotlightRect(null); return; }
    const el = document.querySelector(sel);
    if (el) {
      const r = el.getBoundingClientRect();
      setSpotlightRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else { setSpotlightRect(null); }
  }, [step]);

  useEffect(() => { recalcSpotlight(); }, [recalcSpotlight]);

  useEffect(() => {
    window.addEventListener("resize", recalcSpotlight);
    return () => window.removeEventListener("resize", recalcSpotlight);
  }, [recalcSpotlight]);

  if (step === null || step === undefined) return null;

  const btnPrimary = { background: "linear-gradient(135deg, #6EE7C7, #3B82F6)", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
  const btnGhost = { background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
  const skipLink = { background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif", padding: 0 };

  // Step 0 — welcome modal
  if (step === 0) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", animation: "fadeIn 0.3s ease", cursor: "pointer" }} onClick={(e) => { if (e.target.closest('[data-tour-tooltip]') || e.target.closest('button')) return; onNext(1); }}>
        <div data-tour-tooltip style={{ background: "#141B2D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "36px 32px", maxWidth: 420, width: "90%", textAlign: "center", animation: "welcomePulse 0.4s ease" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #6EE7C7, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>MA</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#F9FAFB", margin: "0 0 12px", letterSpacing: "-0.02em" }}>{TOUR_TEXTS[0].title[lang]}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, marginBottom: 4 }}>
            <button onClick={() => setLang('es')} style={{
              padding: '6px 16px', borderRadius: 6,
              border: lang === 'es' ? '2px solid #6EE7C7' : '1px solid #475569',
              background: lang === 'es' ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: lang === 'es' ? '#a5b4fc' : '#64748b',
              cursor: 'pointer', fontSize: '.85rem', fontWeight: lang === 'es' ? 700 : 400,
            }}>Español</button>
            <button onClick={() => setLang('en')} style={{
              padding: '6px 16px', borderRadius: 6,
              border: lang === 'en' ? '2px solid #6EE7C7' : '1px solid #475569',
              background: lang === 'en' ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: lang === 'en' ? '#a5b4fc' : '#64748b',
              cursor: 'pointer', fontSize: '.85rem', fontWeight: lang === 'en' ? 700 : 400,
            }}>English</button>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.6)", margin: "12px 0 24px" }}>{TOUR_TEXTS[0].text[lang]}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={onSkip} style={btnGhost}>{lang === "en" ? "Skip" : "Saltar"}</button>
            <button onClick={() => onNext(1)} style={btnPrimary}>{lang === "en" ? "Start Tour \u2192" : "Iniciar Tour \u2192"}</button>
          </div>
        </div>
      </div>
    );
  }

  // Steps 1-5 — spotlight + tooltip
  const tooltipBelow = step === 1 || step === 4;
  const tooltipStyle = spotlightRect ? {
    position: "fixed",
    zIndex: 10003,
    left: Math.max(12, Math.min(spotlightRect.left, window.innerWidth - 320)),
    top: tooltipBelow ? spotlightRect.top + spotlightRect.height + 16 : spotlightRect.top - 16,
    transform: tooltipBelow ? "none" : "translateY(-100%)",
    width: 300,
    background: "#1A2236",
    border: "1px solid rgba(110,231,199,0.25)",
    borderRadius: 14,
    padding: "16px 18px",
    animation: "slideDown 0.3s ease",
    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
  } : { position: "fixed", zIndex: 10003, top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 300, background: "#1A2236", border: "1px solid rgba(110,231,199,0.25)", borderRadius: 14, padding: "16px 18px" };

  const text = TOUR_TEXTS[step]?.[lang] || "";

  let btnLabel, btnAction;
  if (step === 1) { btnLabel = lang === "en" ? "Next \u2192" : "Siguiente \u2192"; btnAction = () => onNext(2); }
  else if (step === 2) { btnLabel = lang === "en" ? "Try it \u2192" : "Probar \u2192"; btnAction = () => onTryChat(); }
  else if (step === 3) { btnLabel = lang === "en" ? "Next \u2192" : "Siguiente \u2192"; btnAction = () => onNext(4); }
  else if (step === 4) { btnLabel = lang === "en" ? "Try it \u2192" : "Probar \u2192"; btnAction = () => onTryStats(); }
  else if (step === 5) { btnLabel = lang === "en" ? "Finish Tour \u2713" : "Terminar Tour \u2713"; btnAction = () => onFinish(); }

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.4)", pointerEvents: "auto", transition: "all 0.3s ease", cursor: "pointer",
        clipPath: spotlightRect ? `polygon(0% 0%, 0% 100%, ${spotlightRect.left - 8}px 100%, ${spotlightRect.left - 8}px ${spotlightRect.top - 8}px, ${spotlightRect.left + spotlightRect.width + 8}px ${spotlightRect.top - 8}px, ${spotlightRect.left + spotlightRect.width + 8}px ${spotlightRect.top + spotlightRect.height + 8}px, ${spotlightRect.left - 8}px ${spotlightRect.top + spotlightRect.height + 8}px, ${spotlightRect.left - 8}px 100%, 100% 100%, 100% 0%)` : undefined,
      }} onClick={() => btnAction && btnAction()} />
      {spotlightRect && (
        <div style={{ position: "fixed", zIndex: 10001, top: spotlightRect.top - 8, left: spotlightRect.left - 8, width: spotlightRect.width + 16, height: spotlightRect.height + 16, borderRadius: 12, border: "2px solid rgba(110,231,199,0.5)", animation: "tourPulse 1.5s ease-in-out infinite", pointerEvents: "none" }} />
      )}
      {spotlightRect && (
        <div style={{ position: "fixed", zIndex: 10002, top: spotlightRect.top, left: spotlightRect.left, width: spotlightRect.width, height: spotlightRect.height, pointerEvents: "none" }} />
      )}
      <div data-tour-tooltip style={tooltipStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: "rgba(110,231,199,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {lang === "en" ? `Step ${step} of 5` : `Paso ${step} de 5`}
          </span>
          <button onClick={onSkip} style={skipLink}>{lang === "en" ? "Skip Tour" : "Saltar Tour"}</button>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.7)", margin: "0 0 14px" }}>{renderBoldText(text)}</p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={btnAction} style={btnPrimary}>{btnLabel}</button>
        </div>
      </div>
    </>
  );
}
