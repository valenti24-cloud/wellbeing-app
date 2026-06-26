import React, { useState, useEffect, useRef } from "react";

const labelStyle = { color: "oklch(0.56 0.012 90)", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 10, marginTop: 4 };
const moodBtn = { padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "oklch(0.46 0.012 90)", transition: "all 0.2s" };
const textareaStyle = { background: "oklch(0.97 0.006 90)", border: "1px solid oklch(0.86 0.01 80)", borderRadius: 14, padding: "12px 14px", color: "oklch(0.34 0.018 80)", fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: "vertical", width: "100%", boxSizing: "border-box", outline: "none" };
const statCard = { background: "oklch(0.995 0.004 90)", border: "1px solid oklch(0.88 0.008 80)", borderRadius: 20, padding: "16px", textAlign: "center", boxShadow: "0 1px 2px rgba(70,60,40,0.04), 0 14px 30px -22px rgba(70,60,40,0.25)" };
const ghostBtn = { background: "oklch(0.97 0.006 90)", border: "1px solid oklch(0.86 0.01 80)", borderRadius: 999, padding: "8px 18px", color: "oklch(0.46 0.012 90)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" };

const SECTIONS = ["morning", "supplements", "nutrition", "breathing", "evening", "reflection", "reports"];

const SECTION_META = {
  morning: { label: "Morning Check-in", emoji: "🌅", time: "Start of Day" },
  supplements: { label: "Supplements", emoji: "💊", time: "With Breakfast" },
  nutrition: { label: "Nutrition", emoji: "🥗", time: "Track Meals" },
  breathing: { label: "Breathing", emoji: "🫁", time: "3× Daily" },
  evening: { label: "Evening Wind-down", emoji: "🌙", time: "Before Bed" },
  reflection: { label: "Reflection & Gratitude", emoji: "✨", time: "End of Day" },
  reports: { label: "Progress & Reports", emoji: "📊", time: "Weekly · Monthly · Annual" },
};

const SUPPLEMENT_SCHEDULE = {
  emptyStomach: {
    label: "Empty Stomach",
    subtitle: "Upon waking, before food",
    emoji: "🌅",
    color: "#f59e0b",
    items: [
      { id: "inositol_m", name: "Wholesome Story Myo & D-Chiro Inositol", dose: "2 g · 4 capsules" },
      { id: "nac", name: "Thorne NAC", dose: "500–600 mg · 1 capsule" },
      { id: "folic", name: "Folic Acid", dose: "1 tablet" },
    ]
  },
  breakfast: {
    label: "Breakfast",
    subtitle: "With food containing fat",
    emoji: "🍳",
    color: "#34d399",
    items: [
      { id: "juno_b", name: "Biogena Juno", dose: "2 capsules" },
      { id: "ubiquinol_b", name: "Life Extension Super Ubiquinol", dose: "100–200 mg · 1–2 capsules" },
      { id: "vitd_b", name: "Thorne D-1,000 (Vitamin D3)", dose: "3000–4000 IU · 3–4 capsules" },
      { id: "omega", name: "Nordic Naturals Ultimate Omega", dose: "2 g · 2 capsules" },
      { id: "blackcumin", name: "Black Cumin", dose: "1 tablet" },
      { id: "iron", name: "Iron", dose: "36 mg · 1 tablet" },
    ]
  },
  lunch: {
    label: "Lunch / Dinner",
    subtitle: "With food",
    emoji: "🥗",
    color: "#60a5fa",
    items: [
      { id: "juno_l", name: "Biogena Juno", dose: "1 capsule" },
      { id: "ubiquinol_l", name: "Life Extension Super Ubiquinol", dose: "100 mg · 1 capsule (to reach 200–300 mg total)" },
      { id: "vitd_l", name: "Thorne D-1,000 (Vitamin D3)", dose: "Remaining capsules to reach 5000 IU total" },
    ]
  },
  evening: {
    label: "Evening / Before Bed",
    subtitle: "Wind-down routine",
    emoji: "🌙",
    color: "#a78bfa",
    items: [
      { id: "inositol_e", name: "Wholesome Story Myo & D-Chiro Inositol", dose: "2 g · 2 capsules" },
      { id: "magnesium", name: "Magnesium Glycinate", dose: "700–1000 mg" },
    ]
  }
};


// Supplement cycling recommendations
// courseDays: recommended continuous use days (-1 = ongoing/no break needed)
// breakDays: recommended break duration
// notes: brief clinical rationale
const SUPPLEMENT_CYCLES = {
  inositol_m:  { courseDays: 90,  breakDays: 30, notes: "3-month cycles recommended for hormonal regulation" },
  inositol_e:  { courseDays: 90,  breakDays: 30, notes: "Same cycle as morning dose" },
  nac:         { courseDays: 60,  breakDays: 14, notes: "Cycle to prevent glutathione dependency" },
  folic:       { courseDays: -1,  breakDays: 0,  notes: "Ongoing — essential B vitamin, no break needed" },
  juno_b:      { courseDays: -1,  breakDays: 0,  notes: "Multivitamin — ongoing use recommended" },
  juno_l:      { courseDays: -1,  breakDays: 0,  notes: "Multivitamin — ongoing use recommended" },
  ubiquinol_b: { courseDays: -1,  breakDays: 0,  notes: "CoQ10 — safe for long-term use, no break needed" },
  ubiquinol_l: { courseDays: -1,  breakDays: 0,  notes: "CoQ10 — safe for long-term use, no break needed" },
  vitd_b:      { courseDays: -1,  breakDays: 0,  notes: "Check levels every 3 months; adjust dose with doctor" },
  vitd_l:      { courseDays: -1,  breakDays: 0,  notes: "Check levels every 3 months; adjust dose with doctor" },
  omega:       { courseDays: -1,  breakDays: 0,  notes: "Omega-3 — safe ongoing, no break needed" },
  blackcumin:  { courseDays: 90,  breakDays: 30, notes: "Cycle to maintain therapeutic effectiveness" },
  iron:        { courseDays: 90,  breakDays: 90, notes: "Check ferritin levels after 3 months; avoid over-supplementing" },
  magnesium:   { courseDays: -1,  breakDays: 0,  notes: "Magnesium glycinate — safe ongoing, essential mineral" },
};

const BREATHING_EXERCISES = [
  { id: "box", name: "Box Breathing", desc: "4-4-4-4 pattern. Reduces stress and improves focus.", phases: ["Inhale", "Hold", "Exhale", "Hold"], duration: 4, best: "Morning & During Day" },
  { id: "478", name: "4-7-8 Breathing", desc: "Activates parasympathetic nervous system for deep calm.", phases: ["Inhale", "Hold", "Exhale"], duration: [4, 7, 8], best: "Before Sleep" },
  { id: "coherent", name: "Coherent Breathing", desc: "5-5 rhythm. Balances heart rate variability.", phases: ["Inhale", "Exhale"], duration: 5, best: "During Day" },
];

const ApiKeyContext = React.createContext("");

function AIAdvice({ prompt, context, trigger }) {
  const apiKey = React.useContext(ApiKeyContext);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  const getAdvice = async () => {
    if (shown) { setShown(false); setAdvice(""); return; }
    if (!apiKey) { setShown(true); setAdvice("⚠ Please set your API key first — tap the button in the top right corner."); return; }
    setLoading(true);
    setShown(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          system: "You are a warm, knowledgeable wellbeing coach. Give concise, actionable, science-backed advice in 2-4 short paragraphs. Be encouraging, personal, and practical. No bullet points. No markdown headers. Write like a trusted friend who happens to be an expert.",
          messages: [{ role: "user", content: `${prompt}\n\nUser data: ${JSON.stringify(context)}` }]
        })
      });
      const data = await response.json();
      if (data.error) {
        setAdvice("API Error: " + data.error.message);
      } else {
        setAdvice(data.content?.[0]?.text || "Unable to get advice right now.");
      }
    } catch (err) {
      setAdvice("Error: " + (err.message || "Could not connect. Check your API key is set correctly."));
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={getAdvice} style={{
        background: shown ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #a78bfa, #818cf8)",
        border: "none", borderRadius: 12, padding: "10px 20px",
        color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
        fontWeight: 500, transition: "all 0.2s", letterSpacing: 0.3
      }}>
        {loading ? "✦ Getting advice..." : shown ? "✦ Hide advice" : "✦ Get AI advice"}
      </button>
      {shown && !loading && advice && (
        <div style={{
          marginTop: 12, padding: 16, background: "oklch(0.6 0.1 65 / 0.08)",
          borderRadius: 18, borderLeft: "3px solid oklch(0.6 0.1 65)",
          color: "oklch(0.42 0.015 80)", fontSize: 14, lineHeight: 1.75,
          fontFamily: "'Newsreader', serif", animation: "fadeIn 0.4s ease"
        }}>
          {advice}
        </div>
      )}
    </div>
  );
}

function MorningSection({ data, setData }) {
  const [timerActive, setTimerActive] = React.useState(false);
  const [timerLeft, setTimerLeft] = React.useState(5 * 60);
  const [timerDone, setTimerDone] = React.useState(false);
  const timerRef = React.useRef(null);
  const endTimeRef = React.useRef(null);
  const audioCtxRef = React.useRef(null);
  const bellPlayedRef = React.useRef(false);

  React.useEffect(() => () => clearInterval(timerRef.current), []);

  const unlockAudio = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    } catch(e) {}
  };

  const playBell = () => {
    try {
      const ctx = audioCtxRef.current; if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const ring = (d) => {
        const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o2.connect(g2); g2.connect(ctx.destination);
        const t = ctx.currentTime + d;
        o.type = "sine"; o.frequency.setValueAtTime(528, t);
        o2.type = "sine"; o2.frequency.setValueAtTime(528*2.756, t);
        g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.8,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+4.0);
        g2.gain.setValueAtTime(0.0001,t); g2.gain.linearRampToValueAtTime(0.3,t+0.02); g2.gain.exponentialRampToValueAtTime(0.0001,t+2.0);
        o.start(t); o.stop(t+4.1); o2.start(t); o2.stop(t+2.1);
      };
      ring(0); ring(1.5); ring(3.0);
    } catch(e) {}
    try { if (navigator.vibrate) navigator.vibrate([300,150,300,150,300]); } catch(e) {}
  };

  const TIMER_DURATION = 5 * 60;
  const startTimer = () => {
    if (timerActive) {
      clearInterval(timerRef.current); setTimerActive(false); setTimerLeft(TIMER_DURATION); setTimerDone(false); endTimeRef.current = null; bellPlayedRef.current = false; return;
    }
    unlockAudio(); bellPlayedRef.current = false;
    const endMs = Date.now() + TIMER_DURATION * 1000;
    endTimeRef.current = endMs;
    setTimerActive(true); setTimerDone(false);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimerLeft(remaining);
      if (remaining <= 0 && !bellPlayedRef.current) { bellPlayedRef.current = true; clearInterval(timerRef.current); setTimerActive(false); setTimerDone(true); playBell(); }
    }, 500);
  };

  const ACCENT = "oklch(0.6 0.1 65)";
  const ACCENT_TINT = "oklch(0.6 0.1 65 / 0.12)";
  const card = { background: "oklch(0.995 0.004 90)", border: "1px solid oklch(0.88 0.008 80)", borderRadius: 26, boxShadow: "0 1px 2px rgba(70,60,40,0.04), 0 14px 30px -22px rgba(70,60,40,0.25)" };

  const moodMeta = [
    { label: "Heavy", color: "oklch(0.6 0.1 25)" },
    { label: "Tired", color: "oklch(0.68 0.09 60)" },
    { label: "Okay",  color: "oklch(0.78 0.09 95)" },
    { label: "Good",  color: "oklch(0.66 0.09 165)" },
    { label: "Bright",color: "oklch(0.64 0.1 215)" },
  ];

  const energyLabels = ["Drained", "Low", "Steady", "Good", "Vibrant"];
  const sleep = parseFloat(data.hours || 7);
  const sleepNote = sleep < 6 ? "Short rest" : sleep < 7.5 ? "Decent" : sleep <= 9 ? "Well rested" : "Long sleep";

  const timerMins = Math.floor(timerLeft / 60);
  const timerSecs = String(timerLeft % 60).padStart(2, "0");
  const timerFrac = (TIMER_DURATION - timerLeft) / TIMER_DURATION;
  const timerDeg = Math.round(timerFrac * 360);
  const ringBg = timerDone
    ? `conic-gradient(oklch(0.53 0.09 165) 360deg, oklch(0.88 0.008 80) 360deg)`
    : `conic-gradient(${ACCENT} ${timerDeg}deg, oklch(0.88 0.008 80) ${timerDeg}deg)`;
  const timerBtnLabel = timerDone ? "Again" : timerActive ? "Pause" : (timerLeft < TIMER_DURATION && timerLeft > 0 ? "Resume" : "Start");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* MOOD */}
      <div style={{ ...card, padding: "22px 20px 18px" }}>
        <div style={labelStyle}>How you woke up</div>
        <div style={{ display: "flex", gap: 7 }}>
          {moodMeta.map((m, i) => {
            const on = (data.moodIdx ?? 2) === i;
            return (
              <button key={i} onClick={() => setData({ ...data, moodIdx: i, mood: m.label })} style={{
                flex: 1, minHeight: 78, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 11,
                background: on ? ACCENT_TINT : "transparent",
                border: "1px solid " + (on ? ACCENT : "oklch(0.87 0.008 80)"),
                borderRadius: 18, cursor: "pointer", padding: "8px 2px",
              }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: m.color, display: "block", boxShadow: on ? "0 4px 14px " + m.color + "55" : "none" }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: on ? "oklch(0.34 0.018 80)" : "oklch(0.58 0.012 90)", fontFamily: "'DM Sans', sans-serif" }}>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SLEEP + ENERGY */}
      <div style={{ display: "flex", gap: 14 }}>
        {/* Sleep */}
        <div style={{ ...card, flex: 1, padding: "20px 18px" }}>
          <div style={labelStyle}>Sleep</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3, margin: "12px 0 3px" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 34, fontWeight: 500, color: "oklch(0.34 0.018 80)", lineHeight: 1 }}>{sleep % 1 === 0 ? sleep : sleep.toFixed(1)}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "oklch(0.6 0.012 90)" }}>h</span>
          </div>
          <div style={{ fontSize: 12.5, color: ACCENT, marginBottom: 16 }}>{sleepNote}</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[["−", -0.5], ["+", 0.5]].map(([label, delta]) => (
              <button key={label} onClick={() => setData({ ...data, hours: Math.min(12, Math.max(0, sleep + delta)) })} style={{
                width: 46, height: 46, borderRadius: 14, border: "1px solid oklch(0.86 0.01 80)",
                background: "oklch(0.97 0.006 90)", color: "oklch(0.4 0.015 80)", fontSize: 22, cursor: "pointer",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div style={{ ...card, flex: 1, padding: "20px 18px", display: "flex", flexDirection: "column" }}>
          <div style={labelStyle}>Energy</div>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 21, color: "oklch(0.34 0.018 80)", margin: "12px 0 16px" }}>
            {energyLabels[data.energy ?? 2]}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
            {energyLabels.map((_, i) => (
              <button key={i} onClick={() => setData({ ...data, energy: i })} style={{
                flex: 1, height: 40, borderRadius: 9, border: "none",
                background: i <= (data.energy ?? 2) ? ACCENT : "oklch(0.88 0.008 80)",
                cursor: "pointer",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* WATER RITUAL */}
      <div style={{ ...card, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={labelStyle}>Begin with water</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: ACCENT }}>{data.water || 0} of 4</div>
        </div>
        <div style={{ display: "flex", gap: 11 }}>
          {[0,1,2,3].map(i => {
            const filled = i < (data.water || 0);
            return (
              <button key={i} onClick={() => setData({ ...data, water: i + 1 === data.water ? i : i + 1 })} style={{
                flex: 1, height: 54, borderRadius: 14, border: "1px solid " + (filled ? ACCENT : "oklch(0.86 0.01 80)"),
                background: filled ? ACCENT_TINT : "oklch(0.97 0.006 90)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ width: 14, height: 18, borderRadius: "4px 4px 6px 6px", background: filled ? ACCENT : "oklch(0.78 0.008 90)", display: "block" }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* EYE MASK TIMER */}
      <div style={{ ...card, padding: "22px 20px", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0, borderRadius: "50%", background: ringBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 7, borderRadius: "50%", background: "oklch(0.995 0.004 90)" }} />
          <span style={{ position: "relative", fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500, color: timerDone ? "oklch(0.53 0.09 165)" : "oklch(0.34 0.018 80)" }}>
            {timerDone ? "✓" : `${timerMins}:${timerSecs}`}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 20, color: "oklch(0.34 0.018 80)", marginBottom: 3 }}>Eye-mask reset</div>
          <div style={{ fontSize: 13, color: "oklch(0.54 0.012 90)", marginBottom: 14 }}>A few minutes in the dark before screens.</div>
          <button onClick={startTimer} style={{
            display: "inline-flex", alignItems: "center", gap: 8, height: 46, padding: "0 22px",
            borderRadius: 999, border: "none", background: timerDone ? "oklch(0.53 0.09 165)" : ACCENT,
            color: "white", fontSize: 14.5, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
          }}>{timerBtnLabel}</button>
        </div>
      </div>

      {/* TASKS */}
      <div style={{ ...card, padding: "20px" }}>
        <div style={labelStyle}>Today's intentions</div>
        <textarea value={data.tasks || ""} onChange={e => setData({ ...data, tasks: e.target.value })}
          placeholder="What do you want to accomplish today?"
          style={{ ...textareaStyle, background: "transparent", border: "none", padding: "8px 0", fontSize: 15, fontFamily: "'Newsreader', serif", resize: "none" }} rows={3} />
      </div>

      <AIAdvice
        prompt="Based on this person's morning check-in, give warm personalised advice. Comment on their sleep, energy, mood and intentions. Help them approach the day with clarity."
        context={data}
        trigger="morning"
      />
    </div>
  );
}

function SupplementsSection({ data, setData }) {
  const [editMode, setEditMode] = useState(false);
  const [schedule, setSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem("wb_supplement_schedule");
      return saved ? JSON.parse(saved) : SUPPLEMENT_SCHEDULE;
    } catch(e) { return SUPPLEMENT_SCHEDULE; }
  });
  // Use a ref for edits so typing doesn't cause re-renders that steal focus
  const editRef = React.useRef(null);
  const [editVersion, setEditVersion] = useState(0);

  const taken = data.taken || [];

  // Check if a supplement is currently on break based on start date meta
  const isOnBreak = (itemId) => {
    try {
      const meta = JSON.parse(localStorage.getItem("wb_supp_meta") || "{}");
      const startDate = meta[itemId]?.startDate;
      if (!startDate) return false;
      const cycle = SUPPLEMENT_CYCLES[itemId];
      if (!cycle || cycle.courseDays === -1) return false;
      const daysTaken = Math.max(0, Math.floor((new Date() - new Date(startDate + "T12:00:00")) / (1000 * 60 * 60 * 24)));
      return daysTaken >= cycle.courseDays;
    } catch(e) { return false; }
  };

  const toggle = (id) => {
    if (isOnBreak(id)) return; // locked during break
    setData({ ...data, taken: taken.includes(id) ? taken.filter(x => x !== id) : [...taken, id] });
  };

  const totalAll = Object.values(schedule).reduce((s, g) => s + g.items.length, 0);
  const totalTaken = Object.values(schedule).reduce((s, g) => s + g.items.filter(i => taken.includes(i.id)).length, 0);

  const startEdit = () => {
    editRef.current = JSON.parse(JSON.stringify(schedule));
    setEditMode(true);
    setEditVersion(0);
  };

  const updateItem = (groupKey, itemIdx, field, value) => {
    // Update ref directly — no re-render, no focus loss
    editRef.current[groupKey].items[itemIdx][field] = value;
  };

  const addItem = (groupKey) => {
    const newId = "custom_" + Date.now();
    editRef.current[groupKey].items.push({ id: newId, name: "", dose: "" });
    setEditVersion(v => v + 1); // trigger re-render to show new row
  };

  const removeItem = (groupKey, itemIdx) => {
    editRef.current[groupKey].items.splice(itemIdx, 1);
    setEditVersion(v => v + 1);
  };

  const saveChanges = () => {
    const updated = JSON.parse(JSON.stringify(editRef.current));
    setSchedule(updated);
    try { localStorage.setItem("wb_supplement_schedule", JSON.stringify(updated)); } catch(e) {}
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
    editRef.current = null;
  };

  const editedSchedule = editRef.current;

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, color: "oklch(0.38 0.015 80)" }}>
            {totalTaken} of {totalAll} taken today
          </div>
          <div style={{ height: 4, background: "oklch(0.88 0.008 80)", borderRadius: 99, marginTop: 8, width: 160 }}>
            <div style={{ height: "100%", width: `${(totalTaken / totalAll) * 100}%`, background: "oklch(0.6 0.1 65)", borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>
        </div>
        <button onClick={startEdit} style={{
          padding: "8px 16px", borderRadius: 999, fontSize: 12, fontWeight: 500,
          background: "oklch(0.97 0.006 90)", border: "1px solid oklch(0.86 0.01 80)",
          color: "oklch(0.5 0.012 90)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          ✎ Edit schedule
        </button>
      </div>

      {/* Edit mode */}
      {editMode && (
        <div style={{ marginBottom: 20, padding: 16, background: "oklch(0.6 0.1 65 / 0.06)", border: "1px solid oklch(0.6 0.1 65 / 0.25)", borderRadius: 16, animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "'Newsreader', serif", color: "oklch(0.38 0.015 80)", fontSize: 17 }}>✎ Editing schedule</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={cancelEdit} style={{ ...ghostBtn, fontSize: 12 }}>Cancel</button>
              <button onClick={saveChanges} style={{
                padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: "oklch(0.6 0.1 65)",
                border: "none", color: "white", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif"
              }}>
                Save
              </button>
            </div>
          </div>

          {Object.entries(editedSchedule).map(([groupKey, group]) => (
            <div key={groupKey} style={{ marginBottom: 16 }}>
              <div style={{ color: "oklch(0.56 0.012 90)", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 }}>
                {group.emoji} {group.label}
              </div>
              {group.items.map((item, idx) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 6, marginBottom: 6 }}>
                  <input defaultValue={item.name}
                    onChange={e => updateItem(groupKey, idx, "name", e.target.value)}
                    style={{ ...textareaStyle, padding: "8px 10px", fontSize: 12 }} />
                  <input defaultValue={item.dose}
                    onChange={e => updateItem(groupKey, idx, "dose", e.target.value)}
                    style={{ ...textareaStyle, padding: "8px 10px", fontSize: 12 }} />
                  <button onClick={() => removeItem(groupKey, idx)} style={{
                    width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", fontSize: 14
                  }}>×</button>
                </div>
              ))}
              <button onClick={() => addItem(groupKey)} style={{ ...ghostBtn, fontSize: 11, padding: "5px 12px", marginTop: 4 }}>
                + Add supplement
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Schedule groups */}
      {Object.entries(schedule).map(([groupKey, group]) => {
        const groupTaken = group.items.filter(i => taken.includes(i.id)).length;
        const allDone = groupTaken === group.items.length;
        return (
          <div key={groupKey} style={{
            marginBottom: 14,
            background: "oklch(0.995 0.004 90)",
            border: "1px solid oklch(0.88 0.008 80)",
            borderRadius: 26,
            boxShadow: "0 1px 2px rgba(70,60,40,0.04), 0 14px 30px -22px rgba(70,60,40,0.25)",
            overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 20px 14px" }}>
              <span style={{ fontSize: 20 }}>{group.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: 18, color: "oklch(0.33 0.02 80)" }}>{group.label}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1, color: "oklch(0.58 0.012 90)", marginTop: 2 }}>{group.subtitle}</div>
              </div>
              <div style={{
                fontSize: 12, padding: "4px 12px", borderRadius: 999, fontFamily: "'DM Mono', monospace", fontWeight: 500,
                background: allDone ? "oklch(0.53 0.09 165 / 0.12)" : "oklch(0.6 0.1 65 / 0.08)",
                color: allDone ? "oklch(0.45 0.09 165)" : "oklch(0.55 0.1 65)",
                border: "1px solid " + (allDone ? "oklch(0.53 0.09 165 / 0.35)" : "oklch(0.6 0.1 65 / 0.25)"),
              }}>
                {groupTaken}/{group.items.length}
              </div>
            </div>
            <div style={{ borderTop: "1px solid oklch(0.91 0.006 80)" }}>
              {group.items.map((item, idx) => {
                const isTaken = taken.includes(item.id);
                const onBreak = isOnBreak(item.id);
                return (
                  <button key={item.id} onClick={() => toggle(item.id)} style={{
                    width: "100%", padding: "13px 20px", textAlign: "left",
                    background: onBreak ? "oklch(0.6 0.15 25 / 0.05)" : isTaken ? "oklch(0.6 0.1 65 / 0.07)" : "transparent",
                    border: "none",
                    borderBottom: idx < group.items.length - 1 ? "1px solid oklch(0.92 0.005 80)" : "none",
                    cursor: onBreak ? "not-allowed" : "pointer", transition: "background 0.15s",
                    display: "flex", alignItems: "center", gap: 14, opacity: onBreak ? 0.65 : 1,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      background: onBreak ? "oklch(0.6 0.15 25 / 0.15)" : isTaken ? "oklch(0.6 0.1 65)" : "oklch(0.93 0.006 80)",
                      border: "1.5px solid " + (onBreak ? "oklch(0.6 0.15 25 / 0.5)" : isTaken ? "oklch(0.6 0.1 65)" : "oklch(0.82 0.01 80)"),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: "white", fontWeight: 700, transition: "all 0.2s",
                    }}>
                      {onBreak ? <span style={{ color: "oklch(0.5 0.15 25)", fontSize: 13 }}>✕</span> : isTaken ? "✓" : ""}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3, color: onBreak ? "oklch(0.5 0.12 25)" : "oklch(0.36 0.015 80)" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 11, marginTop: 2, fontFamily: "'DM Mono', monospace", color: onBreak ? "oklch(0.58 0.1 25)" : isTaken ? "oklch(0.6 0.1 65)" : "oklch(0.6 0.01 90)" }}>
                        {onBreak ? "⛔ On break — see Reports" : item.dose}
                      </div>
                    </div>
                    {isTaken && !onBreak && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(0.6 0.1 65)", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <AIAdvice
        prompt="This person follows a specific supplement protocol. Based on the supplements they've taken today vs their full schedule, give personalised advice about timing, any important interactions or synergies to be aware of, and why each supplement group is optimally timed the way it is."
        context={{ schedule: Object.fromEntries(Object.entries(schedule).map(([k,g]) => [k, { label: g.label, items: g.items.map(i => ({ name: i.name, dose: i.dose, taken: taken.includes(i.id) })) }])) }}
        trigger="supplements"
      />
    </div>
  );
}

function NutritionSection({ data, setData }) {
  // Defaults tuned for woman, 45yo, office worker, training 4-5x/week
  // Calories: 1900 kcal maintenance with active lifestyle
  // Protein: 130g (high for muscle preservation & hormonal health)
  // Sugar: 25g (WHO max for women)
  const DEFAULT_CAL  = 1900;
  const DEFAULT_PROT = 130;
  const DEFAULT_SUG  = 25;

  const meals = data.meals || [{ name: "", calories: "", protein: "", sugar: "" }];

  const updateMeal = (i, field, val) => {
    const m = [...meals]; m[i] = { ...m[i], [field]: val }; setData({ ...data, meals: m });
  };
  const addMeal = () => setData({ ...data, meals: [...meals, { name: "", calories: "", protein: "", sugar: "" }] });
  const removeMeal = (i) => setData({ ...data, meals: meals.filter((_, idx) => idx !== i) });

  const totalCals = meals.reduce((s, m) => s + (parseInt(m.calories) || 0), 0);
  const totalProt = meals.reduce((s, m) => s + (parseInt(m.protein) || 0), 0);
  const totalSugar = meals.reduce((s, m) => s + (parseInt(m.sugar) || 0), 0);

  const calGoal  = parseInt(data.calGoal)  || DEFAULT_CAL;
  const protGoal = parseInt(data.protGoal) || DEFAULT_PROT;
  const sugGoal  = parseInt(data.sugGoal)  || DEFAULT_SUG;

  const calPct  = Math.min((totalCals  / calGoal)  * 100, 100);
  const protPct = Math.min((totalProt  / protGoal)  * 100, 100);
  const sugPct  = Math.min((totalSugar / sugGoal)   * 100, 100);

  const calColor  = totalCals  > calGoal  * 1.1 ? "oklch(0.58 0.15 25)" : totalCals  >= calGoal  * 0.85 ? "oklch(0.53 0.09 165)" : "oklch(0.62 0.12 65)";
  const protColor = totalProt  >= protGoal * 0.9 ? "oklch(0.53 0.09 165)" : totalProt  >= protGoal * 0.6  ? "oklch(0.62 0.12 65)" : "oklch(0.58 0.15 25)";
  const sugColor  = totalSugar > sugGoal          ? "oklch(0.58 0.15 25)" : totalSugar > sugGoal  * 0.75 ? "oklch(0.62 0.12 65)" : "oklch(0.53 0.09 165)";

  const StatCard = ({ label, value, unit, goal, goalUnit, pct, color }) => (
    <div style={{ ...statCard, position: "relative", overflow: "hidden" }}>
      <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ color, fontSize: 26, fontFamily: "'DM Mono', monospace", fontWeight: 400, lineHeight: 1 }}>{value}<span style={{ fontSize: 13, marginLeft: 2 }}>{unit}</span></div>
      <div style={{ color: "oklch(0.72 0.01 90)", fontSize: 10, marginTop: 4, marginBottom: 8 }}>goal: {goal}{goalUnit}</div>
      <div style={{ height: 3, background: "oklch(0.92 0.006 80)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        <StatCard label="Calories" value={totalCals} unit="" goal={calGoal} goalUnit=" kcal" pct={calPct} color={calColor} />
        <StatCard label="Protein"  value={totalProt}  unit="g" goal={protGoal} goalUnit="g" pct={protPct} color={protColor} />
        <StatCard label="Sugar"    value={totalSugar} unit="g" goal={sugGoal}  goalUnit="g" pct={sugPct}  color={sugColor} />
      </div>

      {/* Goals row */}
      <p style={labelStyle}>Daily Goals</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        <div>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Calories</div>
          <input type="number" value={data.calGoal || ""} onChange={e => setData({ ...data, calGoal: e.target.value })}
            placeholder={String(DEFAULT_CAL)} style={{ ...textareaStyle, padding: "8px 10px", fontSize: 13 }} />
        </div>
        <div>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Protein g</div>
          <input type="number" value={data.protGoal || ""} onChange={e => setData({ ...data, protGoal: e.target.value })}
            placeholder={String(DEFAULT_PROT)} style={{ ...textareaStyle, padding: "8px 10px", fontSize: 13 }} />
        </div>
        <div>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Sugar g</div>
          <input type="number" value={data.sugGoal || ""} onChange={e => setData({ ...data, sugGoal: e.target.value })}
            placeholder={String(DEFAULT_SUG)} style={{ ...textareaStyle, padding: "8px 10px", fontSize: 13 }} />
        </div>
      </div>

      {/* Meal log — now 4 columns: name | kcal | protein | sugar */}
      <p style={labelStyle}>Meals today</p>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 6, marginBottom: 6 }}>
        {["Meal", "kcal", "prot g", "sugar g", ""].map((h, i) => (
          <div key={i} style={{ color: "oklch(0.72 0.01 90)", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", paddingLeft: 2 }}>{h}</div>
        ))}
      </div>
      {meals.map((m, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 6, marginBottom: 8 }}>
          <input value={m.name} onChange={e => updateMeal(i, "name", e.target.value)}
            placeholder={`Meal ${i + 1}`} style={{ ...textareaStyle, padding: "9px 10px", fontSize: 13 }} />
          <input type="number" value={m.calories} onChange={e => updateMeal(i, "calories", e.target.value)}
            placeholder="0" style={{ ...textareaStyle, padding: "9px 8px", fontSize: 13 }} />
          <input type="number" value={m.protein} onChange={e => updateMeal(i, "protein", e.target.value)}
            placeholder="0" style={{ ...textareaStyle, padding: "9px 8px", fontSize: 13 }} />
          <input type="number" value={m.sugar} onChange={e => updateMeal(i, "sugar", e.target.value)}
            placeholder="0" style={{ ...textareaStyle, padding: "9px 8px", fontSize: 13 }} />
          <button onClick={() => removeMeal(i)} style={{
            width: 32, height: 38, borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.06)", color: "oklch(0.58 0.15 25)", cursor: "pointer", fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
      ))}
      <button onClick={addMeal} style={{ ...ghostBtn, marginBottom: 24 }}>+ Add meal</button>

      <AIAdvice
        prompt="This is a 45-year-old woman, office worker who trains 4-5 times per week. Based on her nutrition today, give personalised advice. Her goals are ~1900 kcal, 130g protein, max 25g sugar. Comment on how she is tracking against each goal, highlight sugar intake especially, and give practical meal suggestions."
        context={{ totalCals, totalProt, totalSugar, calGoal, protGoal, sugGoal, meals }}
        trigger="nutrition"
      />
    </div>
  );
}

function BreathingSection({ data, setData }) {
  const [active, setActive] = useState(null);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [sessionMins, setSessionMins] = useState(5);
  const [sessionLeft, setSessionLeft] = useState(5 * 60);
  const [sessionDone, setSessionDone] = useState(false);
  const timerRef = useRef(null);
  const sessionRef = useRef(null);
  const animFrameRef = useRef(null);
  const phaseStartRef = useRef(null);
  const [scale, setScale] = useState(0.08);

  const ex = active ? BREATHING_EXERCISES.find(e => e.id === active) : null;
  const durations = ex ? (Array.isArray(ex.duration) ? ex.duration : ex.phases.map(() => ex.duration)) : [];

  const start = (id) => {
    clearInterval(timerRef.current);
    clearInterval(sessionRef.current);
    cancelAnimationFrame(animFrameRef.current);
    const secs = sessionMins * 60;
    setActive(id); setPhase(0); setCount(0); setCycles(0); setScale(0.08);
    setSessionLeft(secs); setSessionDone(false);
    phaseStartRef.current = performance.now();
    // Session countdown
    sessionRef.current = setInterval(() => {
      setSessionLeft(t => {
        if (t <= 1) {
          clearInterval(sessionRef.current);
          setSessionDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const stop = () => {
    clearInterval(timerRef.current);
    clearInterval(sessionRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setActive(null); setPhase(0); setCount(0); setScale(0.08);
    setSessionLeft(sessionMins * 60); setSessionDone(false);
  };

  // Auto-stop when session timer hits zero
  useEffect(() => {
    if (sessionDone && active) {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
      // Brief delay so last breath phase can complete
      setTimeout(() => { setActive(null); setPhase(0); setCount(0); setScale(0.08); setSessionDone(false); }, 800);
    }
  }, [sessionDone]);

  // rAF loop for smooth scale animation
  useEffect(() => {
    if (!active || !ex) return;
    const animate = (now) => {
      const elapsed = (now - phaseStartRef.current) / 1000;
      const dur = durations[phase];
      const t = Math.min(elapsed / dur, 1);
      const phaseName = ex.phases[phase];
      let s;
      if (phaseName === "Inhale") {
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        s = 0.08 + ease * 0.92;
      } else if (phaseName === "Exhale") {
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        s = 1.0 - ease * 0.92;
      } else {
        s = 1.0 + Math.sin(t * Math.PI * 2) * 0.04;
      }
      setScale(s);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [active, phase]);

  // Phase ticker
  useEffect(() => {
    if (!active || !ex) return;
    timerRef.current = setInterval(() => {
      setCount(c => {
        if (c + 1 >= durations[phase]) {
          setPhase(p => {
            const next = (p + 1) % ex.phases.length;
            if (next === 0) setCycles(cy => cy + 1);
            phaseStartRef.current = performance.now();
            return next;
          });
          return 0;
        }
        return c + 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active, phase]);

  const phaseName = ex ? ex.phases[phase] : "";
  const dur = ex ? durations[phase] : 4;
  const timeLeft = ex ? dur - count : 0;
  const sessionPct = active ? ((sessionMins * 60 - sessionLeft) / (sessionMins * 60)) * 100 : 0;
  const sessionMinsLeft = Math.floor(sessionLeft / 60);
  const sessionSecsLeft = String(sessionLeft % 60).padStart(2, "0");

  const rings = [
    { size: 100, opacity: 0.75 },
    { size: 160, opacity: 0.40 },
    { size: 220, opacity: 0.22 },
    { size: 290, opacity: 0.11 },
  ];

  return (
    <div>
      {active && ex ? (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "linear-gradient(160deg, #0d2230 0%, #0a1a28 45%, #0e1820 75%, #130d1a 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>

          {/* Session timer arc at top */}
          <div style={{ position: "absolute", top: 48, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 22, fontFamily: "'DM Mono', monospace", fontWeight: 200, letterSpacing: 1 }}>
              {sessionMinsLeft}:{sessionSecsLeft}
            </div>
            <div style={{ width: 160, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: sessionPct + "%", background: "rgba(255,255,255,0.35)", borderRadius: 99, transition: "width 1s linear" }} />
            </div>
          </div>

          {/* Circles */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {rings.map((ring, i) => {
              const s = ring.size * scale;
              return (
                <div key={i} style={{
                  position: "absolute",
                  width: s, height: s,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, rgba(170,200,218,${ring.opacity}) 0%, rgba(130,168,190,${ring.opacity * 0.5}) 55%, transparent 100%)`,
                  transform: "translate(-50%, -50%)",
                  left: "50%", top: "50%",
                  transition: "none",
                }} />
              );
            })}
            <div style={{ width: 290, height: 290, borderRadius: "50%", opacity: 0 }} />
            <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", letterSpacing: 5, textTransform: "uppercase", marginBottom: 6, transition: "opacity 0.4s" }}>
                {phaseName}
              </div>
              <div style={{ color: "#ffffff", fontSize: 96, fontWeight: 200, fontFamily: "'DM Mono', monospace", lineHeight: 1, textShadow: "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(180,210,230,0.3)", letterSpacing: -4 }}>
                {timeLeft}
              </div>
            </div>
          </div>

          {/* Bottom info */}
          <div style={{ position: "absolute", bottom: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>
              Cycle {cycles + 1}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {ex.phases.map((p, i) => (
                <div key={i} style={{
                  padding: "4px 14px", borderRadius: 99, fontSize: 11,
                  background: i === phase ? "oklch(0.86 0.01 80)" : "transparent",
                  color: i === phase ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
                  border: `1px solid ${i === phase ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`,
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.4s",
                }}>
                  {p} {Array.isArray(ex.duration) ? ex.duration[i] : ex.duration}s
                </div>
              ))}
            </div>
          </div>

          <button onClick={stop} style={{
            position: "absolute", top: 52, right: 24,
            background: "rgba(255,255,255,0.07)", border: "1px solid oklch(0.86 0.01 80)",
            borderRadius: 99, padding: "8px 18px",
            color: "rgba(255,255,255,0.5)", fontSize: 13,
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
          }}>
            Done
          </button>
        </div>
      ) : (
        <div>
          {/* Session duration picker */}
          <p style={labelStyle}>Session duration</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {[3, 5, 10, 15, 20].map(m => (
              <button key={m} onClick={() => setSessionMins(m)} style={{
                padding: "8px 16px", borderRadius: 10,
                background: sessionMins === m ? "oklch(0.6 0.1 65)" : "oklch(0.97 0.006 90)",
                border: "1px solid " + (sessionMins === m ? "oklch(0.6 0.1 65)" : "oklch(0.86 0.01 80)"),
                color: sessionMins === m ? "white" : "oklch(0.5 0.012 90)",
                fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer", transition: "all 0.2s",
              }}>
                {m} min
              </button>
            ))}
          </div>

          <p style={labelStyle}>Choose an exercise</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {BREATHING_EXERCISES.map(e => (
              <button key={e.id} onClick={() => start(e.id)} style={{
                padding: "16px 18px", borderRadius: 16, textAlign: "left",
                background: "oklch(0.995 0.004 90)", border: "1px solid oklch(0.88 0.008 80)",
                color: "oklch(0.36 0.015 80)", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(70,60,40,0.04), 0 10px 24px -18px rgba(70,60,40,0.2)",
              }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{e.name}</div>
                <div style={{ color: "oklch(0.54 0.012 90)", fontSize: 12, marginBottom: 4 }}>{e.desc}</div>
                <div style={{ color: "oklch(0.6 0.1 65)", fontSize: 11 }}>Best for: {e.best}</div>
              </button>
            ))}
          </div>
          <AIAdvice
            prompt="Give advice about breathwork for wellbeing and recovery. Explain which exercises are best for morning energy, midday stress relief, and pre-sleep relaxation. Include tips on HRV improvement."
            context={{ exerciseDone: active }}
            trigger="breathing"
          />
        </div>
      )}
    </div>
  );
}


function EveningSection({ data, setData }) {
  return (
    <div>
      <p style={labelStyle}>How was your day overall?</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {["😩 Rough", "😐 Meh", "🙂 Good", "😊 Great", "🌟 Amazing"].map(m => (
          <button key={m} onClick={() => setData({ ...data, dayRating: m })} style={{
            ...moodBtn, background: data.dayRating === m ? "oklch(0.6 0.1 65 / 0.2)" : "oklch(0.97 0.006 90)",
            border: data.dayRating === m ? "1px solid #a78bfa" : "1px solid oklch(0.86 0.01 80)"
          }}>{m}</button>
        ))}
      </div>

      <p style={labelStyle}>Stress level today (1–10)</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <input type="range" min={1} max={10} value={data.stress || 5}
          onChange={e => setData({ ...data, stress: e.target.value })}
          style={{ flex: 1, accentColor: "oklch(0.6 0.1 65)" }} />
        <span style={{ color: "oklch(0.36 0.015 80)", fontFamily: "'DM Mono', monospace", fontSize: 18, minWidth: 24 }}>{data.stress || 5}</span>
      </div>

      <p style={labelStyle}>💧 Water intake today</p>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="number"
              step="0.1"
              value={data.water || ""}
              onChange={e => setData({ ...data, water: e.target.value })}
              placeholder="e.g. 2.5"
              style={{ ...textareaStyle, padding: "12px 40px 12px 14px", fontSize: 20, fontFamily: "'DM Mono', monospace" }}
            />
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "oklch(0.58 0.012 90)", fontSize: 12, pointerEvents: "none" }}>L</span>
          </div>
        </div>
        {data.water && (() => {
          const w = parseFloat(data.water);
          const goal = 2.5;
          const pct = Math.min((w / goal) * 100, 100);
          const color = w >= goal ? "oklch(0.53 0.09 165)" : w >= 1.8 ? "oklch(0.6 0.1 65)" : w >= 1.2 ? "oklch(0.62 0.12 65)" : "oklch(0.58 0.15 25)";
          const label = w >= goal ? "🎯 Goal reached!" : w >= 1.8 ? "💧 Almost there" : w >= 1.2 ? "💧 Keep drinking" : "⚠ Drink more";
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "oklch(0.58 0.012 90)", fontSize: 11 }}>Daily goal: 2.5 L</span>
                <span style={{ color, fontSize: 12, fontWeight: 600 }}>{label}</span>
              </div>
              <div style={{ height: 5, background: "oklch(0.91 0.006 80)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                {[0.5, 1.0, 1.5, 2.0, 2.5].map(mark => (
                  <span key={mark} style={{ color: w >= mark ? color : "oklch(0.72 0.01 90)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>{mark}L</span>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <p style={labelStyle}>🏃 Exercise today</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {[
          { id: "none",   label: "None",    emoji: "😴" },
          { id: "yoga",   label: "Yoga",    emoji: "🧘" },
          { id: "run",    label: "Run",     emoji: "🏃" },
          { id: "tennis", label: "Tennis",  emoji: "🎾" },
          { id: "ballet", label: "Ballet",  emoji: "🩰" },
          { id: "other",  label: "Other",   emoji: "💪" },
        ].map(a => {
          const isSelected = (data.activities || []).includes(a.id);
          return (
            <button key={a.id} onClick={() => {
              if (a.id === "none") {
                setData({ ...data, activities: ["none"], activityMins: {} });
                return;
              }
              const cur = (data.activities || []).filter(x => x !== "none");
              const next = cur.includes(a.id) ? cur.filter(x => x !== a.id) : [...cur, a.id];
              setData({ ...data, activities: next });
            }} style={{
              padding: "9px 14px", borderRadius: 12,
              background: isSelected ? "oklch(0.6 0.1 65 / 0.15)" : "oklch(0.97 0.006 90)",
              border: isSelected ? "1px solid oklch(0.6 0.1 65 / 0.5)" : "1px solid oklch(0.88 0.008 80)",
              color: isSelected ? "oklch(0.55 0.1 65)" : "oklch(0.54 0.012 90)",
              cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
            }}>
              <span>{a.emoji}</span> {a.label}
            </button>
          );
        })}
      </div>

      {/* Minutes per selected activity */}
      {(data.activities || []).filter(a => a !== "none").length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 11, marginBottom: 10 }}>Duration per activity</div>
          {(data.activities || []).filter(a => a !== "none").map(actId => {
            const labels = { yoga: "🧘 Yoga", run: "🏃 Run", tennis: "🎾 Tennis", ballet: "🩰 Ballet", other: "💪 Other" };
            return (
              <div key={actId} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ color: "oklch(0.5 0.012 90)", fontSize: 13, width: 90 }}>{labels[actId]}</div>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="number"
                    value={(data.activityMins || {})[actId] || ""}
                    onChange={e => setData({ ...data, activityMins: { ...(data.activityMins || {}), [actId]: e.target.value } })}
                    placeholder="0"
                    style={{ ...textareaStyle, padding: "8px 40px 8px 12px", fontSize: 15, fontFamily: "'DM Mono', monospace" }}
                  />
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "oklch(0.58 0.012 90)", fontSize: 11, pointerEvents: "none" }}>min</span>
                </div>
              </div>
            );
          })}
          {(() => {
            const total = Object.values(data.activityMins || {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
            return total > 0 ? (
              <div style={{ color: "oklch(0.6 0.1 65)", fontSize: 12, marginTop: 4 }}>
                Total: {total} min · {Math.round(total / 60 * 10) / 10}h
              </div>
            ) : null;
          })()}
        </div>
      )}

      <p style={labelStyle}>Steps today</p>
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            type="number"
            value={data.steps || ""}
            onChange={e => setData({ ...data, steps: e.target.value })}
            placeholder="Enter your steps..."
            style={{ ...textareaStyle, padding: "12px 52px 12px 14px", fontSize: 20, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}
          />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "oklch(0.58 0.012 90)", fontSize: 11, pointerEvents: "none" }}>steps</span>
        </div>
        {data.steps && (() => {
          const s = parseInt(data.steps);
          const goal = 10000;
          const pct = Math.min((s / goal) * 100, 100);
          const color = s >= goal ? "oklch(0.53 0.09 165)" : s >= 7500 ? "oklch(0.6 0.1 65)" : s >= 5000 ? "oklch(0.62 0.12 65)" : "oklch(0.58 0.15 25)";
          const label = s >= goal ? "Goal reached!" : s >= 7500 ? "Almost there" : s >= 5000 ? "Good progress" : "Keep moving";
          const emoji = s >= goal ? "🎯" : s >= 7500 ? "💪" : s >= 5000 ? "🚶" : "👟";
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ color: "oklch(0.58 0.012 90)", fontSize: 11 }}>Daily goal: 10,000</span>
                <span style={{ color, fontSize: 12, fontWeight: 600 }}>{emoji} {label}</span>
              </div>
              <div style={{ height: 6, background: "oklch(0.91 0.006 80)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {[2500, 5000, 7500, 10000].map(mark => (
                  <span key={mark} style={{ color: s >= mark ? color : "oklch(0.72 0.01 90)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
                    {mark >= 1000 ? (mark / 1000) + "k" : mark}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <AIAdvice
        prompt="Based on this person's evening check-in data, give personalised advice for tonight's recovery and wind-down routine. Comment on their day rating, stress level, water intake in litres, specific exercises done with duration, and steps. Suggest recovery tips specific to the exercises they did."
        context={data}
        trigger="evening"
      />
    </div>
  );
}

function ReflectionSection({ data, setData }) {
  return (
    <div>
      <p style={labelStyle}>Three things you're grateful for today</p>
      {[0, 1, 2].map(i => (
        <input key={i} value={(data.gratitude || [])[i] || ""}
          onChange={e => { const g = [...(data.gratitude || ["", "", ""])]; g[i] = e.target.value; setData({ ...data, gratitude: g }); }}
          placeholder={`Gratitude ${i + 1}...`}
          style={{ ...textareaStyle, display: "block", width: "100%", marginBottom: 10, boxSizing: "border-box" }} />
      ))}

      <p style={labelStyle}>What went well today?</p>
      <textarea value={data.wins || ""} onChange={e => setData({ ...data, wins: e.target.value })}
        placeholder="Celebrate your wins, big or small..." style={textareaStyle} rows={3} />

      <p style={labelStyle}>What could have gone better?</p>
      <textarea value={data.improve || ""} onChange={e => setData({ ...data, improve: e.target.value })}
        placeholder="Be kind to yourself..." style={textareaStyle} rows={3} />

      <p style={labelStyle}>Intention for tomorrow</p>
      <textarea value={data.tomorrow || ""} onChange={e => setData({ ...data, tomorrow: e.target.value })}
        placeholder="One thing to focus on tomorrow..." style={textareaStyle} rows={2} />

      <AIAdvice
        prompt="Based on this person's reflection and gratitude entries, provide a warm, encouraging daily summary. Acknowledge their wins, gently reframe any challenges, and help them set a positive intention for tomorrow. Be emotionally supportive and wise."
        context={data}
        trigger="reflection"
      />
    </div>
  );
}

// Styles


function ReportsSection() {
  const [view, setView] = React.useState("weekly"); // weekly | monthly | annual | day
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [allData, setAllData] = React.useState({});

  // Load all saved days from localStorage
  React.useEffect(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("wb_data_")) {
        try {
          const date = key.replace("wb_data_", "");
          data[date] = JSON.parse(localStorage.getItem(key));
        } catch(e) {}
      }
    }
    setAllData(data);
  }, []);

  const dates = Object.keys(allData).sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().split("T")[0];

  // Helper: get N days of data ending today
  const getDays = (n) => {
    const result = [];
    for (let i = 0; i < n; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      result.push({ date: key, data: allData[key] || null });
    }
    return result.reverse();
  };

  const weekDays   = getDays(7);
  const monthDays  = getDays(30);
  const annualDays = getDays(365);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  const formatShort = (dateStr) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };
  const dayName = (dateStr) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "short" });
  };

  // Aggregate stats for a set of days
  const aggregate = (days) => {
    const withData = days.filter(d => d.data);
    const count = withData.length;
    if (count === 0) return null;

    const avg = (arr) => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;
    const pct = (arr) => arr.length ? Math.round((arr.filter(Boolean).length / arr.length) * 100) : 0;

    const sleepHours   = withData.map(d => parseFloat(d.data.morning?.hours || 0)).filter(Boolean);
    const energyLevels = withData.map(d => parseInt(d.data.morning?.energy || 0)).filter(Boolean);
    const stressLevels = withData.map(d => parseInt(d.data.evening?.stress || 0)).filter(Boolean);
    const stepsArr     = withData.map(d => parseInt(d.data.evening?.steps || 0)).filter(Boolean);
    const calArr       = withData.map(d => {
      const meals = d.data.nutrition?.meals || [];
      return meals.reduce((s, m) => s + (parseInt(m.calories)||0), 0);
    }).filter(Boolean);
    const protArr      = withData.map(d => {
      const meals = d.data.nutrition?.meals || [];
      return meals.reduce((s, m) => s + (parseInt(m.protein)||0), 0);
    }).filter(Boolean);
    const sugarArr     = withData.map(d => {
      const meals = d.data.nutrition?.meals || [];
      return meals.reduce((s, m) => s + (parseInt(m.sugar)||0), 0);
    }).filter(Boolean);
    const waterChecked = withData.map(d => d.data.morning?.water);
    const moodMap = {"😴 Tired":1,"😐 Okay":2,"🙂 Good":3,"😊 Great":4,"⚡ Energised":5};
    const moodArr = withData.map(d => moodMap[d.data.morning?.mood] || 0).filter(Boolean);

    // Supplement adherence
    const schedule = (() => { try { const s = localStorage.getItem("wb_supplement_schedule"); return s ? JSON.parse(s) : null; } catch(e){return null;} })();
    const suppItems = schedule ? Object.values(schedule).flatMap(g => g.items.map(i => i.id)) : [];
    const suppAdherence = suppItems.length > 0 ? withData.map(d => {
      const taken = d.data.supplements?.taken || [];
      return taken.length / suppItems.length;
    }) : [];

    return {
      count, total: days.length,
      avgSleep: avg(sleepHours.map(h => Math.round(h * 10) / 10)), 
      avgEnergy: avg(energyLevels),
      avgStress: avg(stressLevels),
      avgSteps: avg(stepsArr),
      avgCal: avg(calArr),
      avgProt: avg(protArr),
      avgSugar: avg(sugarArr),
      waterPct: pct(waterChecked),
      avgMood: avg(moodArr),
      suppPct: suppAdherence.length ? Math.round(suppAdherence.reduce((a,b)=>a+b,0)/suppAdherence.length*100) : null,
    };
  };

  const weekStats  = aggregate(weekDays);
  const monthStats = aggregate(monthDays);
  const annualStats = aggregate(annualDays);

  // Color helpers
  const scoreColor = (val, good, bad, reverse=false) => {
    if (!val) return "oklch(0.58 0.012 90)";
    if (reverse) { if (val <= good) return "oklch(0.53 0.09 165)"; if (val <= bad) return "oklch(0.62 0.12 65)"; return "oklch(0.58 0.15 25)"; }
    if (val >= good) return "oklch(0.53 0.09 165)"; if (val >= bad) return "oklch(0.62 0.12 65)"; return "oklch(0.58 0.15 25)";
  };

  const StatRow = ({ label, value, unit, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid oklch(0.92 0.005 80)" }}>
      <div style={{ color: "oklch(0.5 0.012 90)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
      <div style={{ color: color || "oklch(0.36 0.015 80)", fontSize: 15, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
        {value !== null && value !== undefined ? `${value}${unit || ""}` : <span style={{color:"oklch(0.72 0.01 90)"}}>—</span>}
      </div>
    </div>
  );

  const StatsPanel = ({ stats, label }) => {
    if (!stats) return <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 13, padding: 16 }}>No data yet for this period.</div>;
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: "oklch(0.54 0.012 90)", fontSize: 12, letterSpacing: 1 }}>{stats.count} of {stats.total} days tracked</div>
          <div style={{ height: 4, width: 120, background: "oklch(0.97 0.006 90)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: (stats.count/stats.total*100)+"%", background: "oklch(0.6 0.1 65)", borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>😴 Sleep & Energy</div>
          <StatRow label="Avg sleep" value={stats.avgSleep} unit="h" color={scoreColor(stats.avgSleep, 7.5, 6.5)} />
          <StatRow label="Avg energy" value={stats.avgEnergy || null} unit="/10" color={scoreColor(stats.avgEnergy, 7, 5)} />
          <StatRow label="Avg stress" value={stats.avgStress || null} unit="/10" color={scoreColor(stats.avgStress, 4, 6, true)} />
          <StatRow label="Avg mood" value={stats.avgMood || null} unit="/5" color={scoreColor(stats.avgMood, 4, 3)} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>🥗 Nutrition</div>
          <StatRow label="Avg calories" value={stats.avgCal || null} unit=" kcal" color={scoreColor(stats.avgCal, 1700, 1400)} />
          <StatRow label="Avg protein" value={stats.avgProt || null} unit="g" color={scoreColor(stats.avgProt, 120, 90)} />
          <StatRow label="Avg sugar" value={stats.avgSugar || null} unit="g" color={scoreColor(stats.avgSugar, 15, 25, true)} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>💊 Supplements & Habits</div>
          <StatRow label="Supplement adherence" value={stats.suppPct} unit="%" color={scoreColor(stats.suppPct, 80, 60)} />
          <StatRow label="Morning water" value={stats.waterPct} unit="%" color={scoreColor(stats.waterPct, 80, 50)} />
          <StatRow label="Avg steps" value={stats.avgSteps || null} unit="" color={scoreColor(stats.avgSteps, 8000, 5000)} />
        </div>
      </div>
    );
  };

  // Day detail view
  const DayDetail = ({ dateStr }) => {
    const d = allData[dateStr];
    if (!d) return <div style={{ color: "oklch(0.58 0.012 90)", padding: 16, fontSize: 13 }}>No data recorded for this day.</div>;
    const meals = d.nutrition?.meals || [];
    const totalCal = meals.reduce((s,m)=>s+(parseInt(m.calories)||0),0);
    const totalProt = meals.reduce((s,m)=>s+(parseInt(m.protein)||0),0);
    const totalSugar = meals.reduce((s,m)=>s+(parseInt(m.sugar)||0),0);
    const schedule = (() => { try { const s = localStorage.getItem("wb_supplement_schedule"); return s ? JSON.parse(s) : null; } catch(e){return null;} })();
    const allSupps = schedule ? Object.values(schedule).flatMap(g => g.items) : [];
    const taken = d.supplements?.taken || [];

    return (
      <div>
        <button onClick={() => { setSelectedDate(null); setView("weekly"); }} style={{ ...ghostBtn, fontSize: 12, marginBottom: 20 }}>← Back</button>
        <h3 style={{ margin: "0 0 20px", color: "oklch(0.33 0.02 80)", fontSize: 18, fontWeight: 600 }}>{formatDate(dateStr)}</h3>

        {d.morning && <div style={{ marginBottom: 20 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🌅 Morning</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {d.morning.mood && <span style={pill}>{d.morning.mood}</span>}
            {d.morning.hours && <span style={pill}>😴 {d.morning.hours}h sleep</span>}
            {d.morning.sleep && <span style={pill}>Sleep: {d.morning.sleep}</span>}
            {d.morning.energy && <span style={pill}>⚡ Energy {d.morning.energy}/10</span>}
            {d.morning.water && <span style={{ ...pill, background: "oklch(0.53 0.09 165 / 0.12)", color: "oklch(0.53 0.09 165)" }}>🍋 Morning water ✓</span>}
          </div>
          {d.morning.tasks && <div style={{ color: "oklch(0.54 0.012 90)", fontSize: 13, marginTop: 10, fontStyle: "italic" }}>"{d.morning.tasks}"</div>}
        </div>}

        {allSupps.length > 0 && <div style={{ marginBottom: 20 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>💊 Supplements ({taken.length}/{allSupps.length})</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {allSupps.map(s => (
              <span key={s.id} style={{ ...pill, background: taken.includes(s.id) ? "oklch(0.53 0.09 165 / 0.1)" : "oklch(0.995 0.004 90)", color: taken.includes(s.id) ? "oklch(0.53 0.09 165)" : "oklch(0.72 0.01 90)", textDecoration: taken.includes(s.id) ? "none" : "line-through" }}>
                {taken.includes(s.id) ? "✓" : "○"} {s.name}
              </span>
            ))}
          </div>
        </div>}

        {meals.length > 0 && <div style={{ marginBottom: 20 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🥗 Nutrition</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={miniStat}><div style={{ color: "oklch(0.62 0.12 65)", fontSize: 20, fontFamily: "'DM Mono', monospace" }}>{totalCal}</div><div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10 }}>kcal</div></div>
            <div style={miniStat}><div style={{ color: "oklch(0.53 0.09 165)", fontSize: 20, fontFamily: "'DM Mono', monospace" }}>{totalProt}g</div><div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10 }}>protein</div></div>
            <div style={miniStat}><div style={{ color: totalSugar > 25 ? "oklch(0.58 0.15 25)" : "oklch(0.6 0.1 65)", fontSize: 20, fontFamily: "'DM Mono', monospace" }}>{totalSugar}g</div><div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10 }}>sugar</div></div>
          </div>
          {meals.filter(m=>m.name).map((m,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid oklch(0.93 0.005 80)", fontSize: 13 }}>
              <span style={{ color: "oklch(0.5 0.012 90)" }}>{m.name}</span>
              <span style={{ color: "oklch(0.58 0.012 90)", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{m.calories||0}kcal · {m.protein||0}g · {m.sugar||0}g</span>
            </div>
          ))}
        </div>}

        {d.evening && <div style={{ marginBottom: 20 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🌙 Evening</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {d.evening.dayRating && <span style={pill}>{d.evening.dayRating}</span>}
            {d.evening.stress && <span style={pill}>Stress {d.evening.stress}/10</span>}
            {d.evening.water && <span style={pill}>💧 {d.evening.water}L water</span>}
            {d.evening.steps && <span style={pill}>👟 {parseInt(d.evening.steps).toLocaleString()} steps</span>}
            {(d.evening.activities || []).filter(a => a !== "none").map(a => { const labels = { yoga:"🧘 Yoga", run:"🏃 Run", tennis:"🎾 Tennis", ballet:"🩰 Ballet", other:"💪 Other" }; const mins = (d.evening.activityMins || {})[a]; return <span key={a} style={pill}>{labels[a]}{mins ? " · " + mins + "min" : ""}</span>; })}
          </div>
        </div>}

        {d.reflection && (d.reflection.gratitude || d.reflection.wins) && <div style={{ marginBottom: 20 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>✨ Reflection</div>
          {d.reflection.gratitude?.filter(Boolean).map((g, i) => (
            <div key={i} style={{ color: "oklch(0.5 0.012 90)", fontSize: 13, padding: "5px 0", borderBottom: "1px solid oklch(0.93 0.005 80)" }}>✦ {g}</div>
          ))}
          {d.reflection.wins && <div style={{ color: "oklch(0.54 0.012 90)", fontSize: 13, marginTop: 8, fontStyle: "italic" }}>"{d.reflection.wins}"</div>}
        </div>}
      </div>
    );
  };

  const pill = { padding: "4px 10px", borderRadius: 99, fontSize: 12, background: "oklch(0.97 0.006 90)", color: "oklch(0.5 0.012 90)", fontFamily: "'DM Sans', sans-serif" };
  const miniStat = { flex: 1, background: "oklch(0.995 0.004 90)", border: "1px solid oklch(0.91 0.006 80)", borderRadius: 12, padding: "10px", textAlign: "center" };

  // Calendar strip for day picker
  const CalendarStrip = ({ days }) => (
    <div style={{ overflowX: "auto", marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 6, paddingBottom: 4, minWidth: "max-content" }}>
        {days.map(({ date, data: d }) => {
          const hasData = !!d;
          const isToday = date === today;
          const isSelected = date === selectedDate;
          return (
            <button key={date} onClick={() => { setSelectedDate(date); setView("day"); }} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "8px 6px", borderRadius: 10, minWidth: 42,
              background: isSelected ? "oklch(0.6 0.1 65 / 0.2)" : isToday ? "oklch(0.88 0.008 80)" : "transparent",
              border: isSelected ? "1px solid #a78bfa" : isToday ? "1px solid oklch(0.84 0.01 80)" : "1px solid transparent",
              cursor: "pointer",
            }}>
              <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10 }}>{dayName(date)}</div>
              <div style={{ color: isSelected ? "oklch(0.55 0.1 65)" : isToday ? "oklch(0.33 0.02 80)" : "oklch(0.54 0.012 90)", fontSize: 13, fontWeight: isToday ? 700 : 400, fontFamily: "'DM Mono', monospace" }}>
                {new Date(date + "T12:00:00").getDate()}
              </div>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: hasData ? "oklch(0.6 0.1 65)" : "oklch(0.88 0.008 80)" }} />
            </button>
          );
        })}
      </div>
    </div>
  );


  // Supplement history tracker
  const SupplementTracker = () => {
    const schedule = (() => {
      try { const s = localStorage.getItem("wb_supplement_schedule"); return s ? JSON.parse(s) : null; }
      catch(e) { return null; }
    })() || SUPPLEMENT_SCHEDULE;

    // Get all supplement metadata — meta stored separately in localStorage
    const getMeta = () => {
      try { return JSON.parse(localStorage.getItem("wb_supp_meta") || "{}"); }
      catch(e) { return {}; }
    };
    const saveMeta = (meta) => {
      try { localStorage.setItem("wb_supp_meta", JSON.stringify(meta)); }
      catch(e) {}
    };

    const [meta, setMeta] = React.useState(getMeta);
    const [editingId, setEditingId] = React.useState(null);
    const [dateInput, setDateInput] = React.useState("");

    // Count days taken from history
    const countDaysTaken = (suppId) => {
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("wb_data_")) {
          try {
            const d = JSON.parse(localStorage.getItem(key));
            if ((d.supplements?.taken || []).includes(suppId)) count++;
          } catch(e) {}
        }
      }
      return count;
    };

    const today = new Date().toISOString().split("T")[0];

    const allItems = Object.values(schedule).flatMap(g =>
      g.items.map(item => ({ ...item, groupColor: g.color, groupLabel: g.label }))
    );

    // Deduplicate by base name (inositol_m and inositol_e are same supplement)
    const seen = new Set();
    const uniqueItems = allItems.filter(item => {
      const baseName = item.name.toLowerCase();
      if (seen.has(baseName)) return false;
      seen.add(baseName);
      return true;
    });

    const setStartDate = (id, date) => {
      const updated = { ...meta, [id]: { ...meta[id], startDate: date } };
      setMeta(updated);
      saveMeta(updated);
      setEditingId(null);
    };

    const daysSince = (dateStr) => {
      if (!dateStr) return null;
      const start = new Date(dateStr + "T12:00:00");
      const now = new Date();
      return Math.floor((now - start) / (1000 * 60 * 60 * 24));
    };

    const getStatus = (item, daysTaken, startDate) => {
      const cycle = SUPPLEMENT_CYCLES[item.id];
      if (!cycle) return null;
      if (cycle.courseDays === -1) return { type: "ongoing", color: "oklch(0.53 0.09 165)" };
      if (!startDate) return { type: "nodate", color: "oklch(0.58 0.012 90)" };

      if (daysTaken >= cycle.courseDays) {
        // On break — count break days elapsed since course ended
        const courseEndDate = new Date(startDate + "T12:00:00");
        courseEndDate.setDate(courseEndDate.getDate() + cycle.courseDays);
        const breakElapsed = Math.floor((new Date() - courseEndDate) / (1000 * 60 * 60 * 24));
        const breakLeft = Math.max(0, cycle.breakDays - breakElapsed);
        const breakPct = Math.min((breakElapsed / cycle.breakDays) * 100, 100);
        const resumeDate = new Date(courseEndDate);
        resumeDate.setDate(resumeDate.getDate() + cycle.breakDays);
        const resumeStr = resumeDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        return {
          type: "break",
          color: "oklch(0.58 0.15 25)",
          breakElapsed: Math.max(0, breakElapsed),
          breakTotal: cycle.breakDays,
          breakLeft,
          breakPct,
          resumeDate: resumeStr,
        };
      }

      const daysLeft = cycle.courseDays - daysTaken;
      const progress = Math.min((daysTaken / cycle.courseDays) * 100, 100);
      return { type: "active", color: "oklch(0.6 0.1 65)", daysLeft, progress };
    };

    return (
      <div>
        <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>💊 Supplement Tracker</div>
        <div style={{ color: "oklch(0.72 0.01 90)", fontSize: 11, marginBottom: 16, lineHeight: 1.5 }}>
          Set a start date — every calendar day from that date counts as 1 day taken.
        </div>
        {uniqueItems.map(item => {
          const startDate = meta[item.id]?.startDate;
          const daysTaken = startDate ? Math.max(0, daysSince(startDate)) : 0;
          const cycle = SUPPLEMENT_CYCLES[item.id];
          const status = getStatus(item, daysTaken, startDate);

          return (
            <div key={item.id} style={{
              marginBottom: 14, padding: "14px 16px", borderRadius: 14,
              background: status?.type === "break" ? "oklch(0.58 0.15 25 / 0.05)" : "oklch(0.995 0.004 90)",
              border: `1px solid ${status?.type === "break" ? "oklch(0.58 0.15 25 / 0.25)" : "oklch(0.91 0.006 80)"}`,
            }}>

              {/* Name + days taken */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1, paddingRight: 10 }}>
                  <div style={{ color: status?.type === "break" ? "oklch(0.58 0.15 25)" : "oklch(0.36 0.015 80)", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 11, marginTop: 2 }}>{item.dose}</div>
                </div>
                {startDate && (
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ color: status?.color || "oklch(0.6 0.1 65)", fontSize: 26, fontFamily: "'DM Mono', monospace", fontWeight: 200, lineHeight: 1 }}>
                      {status?.type === "break" ? status.breakElapsed : daysTaken}
                    </div>
                    <div style={{ color: "oklch(0.72 0.01 90)", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {status?.type === "break" ? `of ${status.breakTotal} break days` : cycle?.courseDays > 0 ? `of ${cycle.courseDays} days` : "days"}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {startDate && status?.type === "active" && cycle?.courseDays > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "oklch(0.72 0.01 90)", fontSize: 10 }}>Day 1</span>
                    <span style={{ color: "oklch(0.72 0.01 90)", fontSize: 10 }}>{status.daysLeft} days left</span>
                    <span style={{ color: "oklch(0.72 0.01 90)", fontSize: 10 }}>Day {cycle.courseDays}</span>
                  </div>
                  <div style={{ height: 6, background: "oklch(0.97 0.006 90)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: status.progress + "%", background: "linear-gradient(90deg, #818cf8, #a78bfa)", borderRadius: 99, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              )}

              {/* Break progress bar */}
              {status?.type === "break" && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "oklch(0.58 0.15 25)", fontSize: 11, fontWeight: 600 }}>⛔ On break — {status.breakLeft} days until resume</span>
                  </div>
                  <div style={{ height: 6, background: "oklch(0.97 0.006 90)", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", width: status.breakPct + "%", background: "linear-gradient(90deg, #f87171, #fbbf24)", borderRadius: 99, transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 11 }}>
                    Resume on <span style={{ color: "oklch(0.62 0.12 75)" }}>{status.resumeDate}</span>
                  </div>
                </div>
              )}

              {/* Ongoing badge */}
              {status?.type === "ongoing" && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, background: "oklch(0.53 0.09 165 / 0.12)", color: "oklch(0.53 0.09 165)" }}>✓ Ongoing — no break needed</span>
                </div>
              )}

              {/* No date set */}
              {status?.type === "nodate" && (
                <div style={{ color: "oklch(0.72 0.01 90)", fontSize: 11, marginBottom: 6 }}>Set start date to begin tracking</div>
              )}

              {/* Clinical note */}
              {cycle && cycle.notes && (
                <div style={{ color: "oklch(0.72 0.01 90)", fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>{cycle.notes}</div>
              )}

              {/* Start date picker */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                {editingId === item.id ? (
                  <>
                    <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
                      style={{ background:"oklch(0.97 0.006 90)", border:"1px solid oklch(0.86 0.01 80)", borderRadius:8, padding:"6px 10px", color:"oklch(0.36 0.015 80)", fontSize:12, outline:"none" }} />
                    <button onClick={() => setStartDate(item.id, dateInput)} style={{ padding:"5px 14px", borderRadius:8, background:"oklch(0.6 0.1 65 / 0.15)", border:"1px solid oklch(0.6 0.1 65 / 0.3)", color:"oklch(0.55 0.1 65)", fontSize:12, cursor:"pointer" }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ padding:"5px 10px", borderRadius:8, background:"transparent", border:"1px solid oklch(0.88 0.008 80)", color:"oklch(0.58 0.012 90)", fontSize:12, cursor:"pointer" }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => { setEditingId(item.id); setDateInput(startDate || today); }} style={{ padding:"4px 12px", borderRadius:8, background:"oklch(0.995 0.004 90)", border:"1px solid oklch(0.88 0.008 80)", color: startDate ? "oklch(0.54 0.012 90)" : "oklch(0.6 0.1 65)", fontSize:11, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>
                    {startDate ? `📅 Started ${formatDate(startDate)}` : "📅 Set start date →"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (selectedDate && view === "day") {
    return (
      <div>
        <CalendarStrip days={view === "day" ? getDays(30) : weekDays} />
        <DayDetail dateStr={selectedDate} />
      </div>
    );
  }

  return (
    <div>
      {/* Period tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["weekly","7 Days"],["monthly","30 Days"],["annual","12 Months"],["supplements","Supplements"]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "8px 16px", borderRadius: 99, fontSize: 13,
            background: view === v ? "oklch(0.6 0.1 65 / 0.15)" : "transparent",
            border: view === v ? "1px solid oklch(0.6 0.1 65 / 0.5)" : "1px solid oklch(0.91 0.006 80)",
            color: view === v ? "oklch(0.55 0.1 65)" : "oklch(0.54 0.012 90)", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>{label}</button>
        ))}
      </div>

      {/* Calendar strip */}
      {view !== "supplements" && view === "weekly"  && <CalendarStrip days={weekDays} />}
      {view !== "supplements" && view === "monthly" && <CalendarStrip days={monthDays} />}
      {view !== "supplements" && view === "annual"  && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 11, marginBottom: 10 }}>Tap a month to explore days</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {Array.from({length: 12}, (_,i) => {
              const d = new Date(); d.setMonth(d.getMonth() - 11 + i);
              const monthKey = d.toISOString().slice(0,7);
              const monthDaysData = annualDays.filter(day => day.date.startsWith(monthKey));
              const tracked = monthDaysData.filter(d => d.data).length;
              return (
                <div key={i} style={{ ...statCard, padding: 10, textAlign: "center", cursor: "pointer" }}
                  onClick={() => setView("monthly")}>
                  <div style={{ color: "oklch(0.54 0.012 90)", fontSize: 11 }}>{d.toLocaleDateString("en-GB",{month:"short"})}</div>
                  <div style={{ color: tracked > 0 ? "oklch(0.6 0.1 65)" : "oklch(0.72 0.01 90)", fontSize: 18, fontFamily: "'DM Mono', monospace", margin: "4px 0" }}>{tracked}</div>
                  <div style={{ color: "oklch(0.72 0.01 90)", fontSize: 10 }}>days</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats panel */}
      {view !== "supplements" && view === "weekly"  && <StatsPanel stats={weekStats}   label="This Week" />}
      {view !== "supplements" && view === "monthly" && <StatsPanel stats={monthStats}  label="This Month" />}
      {view !== "supplements" && view === "annual"  && <StatsPanel stats={annualStats} label="This Year" />}

      {/* Recent days list */}
      {view !== "supplements" && view !== "annual" && dates.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Recent Days</div>
          {dates.slice(0, view === "weekly" ? 7 : 30).map(date => {
            const d = allData[date];
            const meals = d.nutrition?.meals || [];
            const cal = meals.reduce((s,m)=>s+(parseInt(m.calories)||0),0);
            const steps = parseInt(d.evening?.steps || 0);
            return (
              <button key={date} onClick={() => { setSelectedDate(date); setView("day"); }} style={{
                width: "100%", padding: "12px 14px", borderRadius: 12, marginBottom: 8,
                background: "oklch(0.995 0.004 90)", border: "1px solid oklch(0.91 0.006 80)",
                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "oklch(0.36 0.015 80)", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                    {date === today ? "Today" : formatDate(date)}
                  </div>
                  <div style={{ color: "oklch(0.58 0.012 90)", fontSize: 11, marginTop: 2 }}>
                    {d.morning?.mood || ""} {d.morning?.hours ? d.morning.hours + "h sleep" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {cal > 0 && <div style={{ textAlign: "right" }}>
                    <div style={{ color: "oklch(0.62 0.12 65)", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{cal}</div>
                    <div style={{ color: "oklch(0.72 0.01 90)", fontSize: 10 }}>kcal</div>
                  </div>}
                  {steps > 0 && <div style={{ textAlign: "right" }}>
                    <div style={{ color: "oklch(0.55 0.1 230)", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{steps.toLocaleString()}</div>
                    <div style={{ color: "oklch(0.72 0.01 90)", fontSize: 10 }}>steps</div>
                  </div>}
                  <div style={{ color: "oklch(0.72 0.01 90)", fontSize: 16 }}>›</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {view === "supplements" && <SupplementTracker />}

      {view !== "supplements" && dates.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "oklch(0.72 0.01 90)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>No history yet.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Start tracking today and your data will appear here.</div>
        </div>
      )}
    </div>
  );
}

export default function WellbeingCompanion() {
  const [activeSection, setActiveSection] = useState("morning");
  const [sectionData, setSectionData] = useState({});
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("wb_apikey") || "");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const todayKey = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const saved = localStorage.getItem("wb_data_" + todayKey);
    if (saved) setSectionData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (Object.keys(sectionData).length > 0) {
      localStorage.setItem("wb_data_" + todayKey, JSON.stringify(sectionData));
    }
  }, [sectionData]);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem("wb_apikey", key);
  };

  const setData = (section) => (d) => setSectionData(s => ({ ...s, [section]: d }));

  return (
    <ApiKeyContext.Provider value={apiKey}>
    <div style={{
      minHeight: "100vh", width: "100%", background: "#f4efe6",
      fontFamily: "'DM Sans', system-ui, sans-serif", color: "oklch(0.34 0.018 90)",
      position: "relative", overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap');
        * { box-sizing: border-box; }
        input, textarea { color: oklch(0.34 0.018 80) !important; }
        input::placeholder, textarea::placeholder { color: oklch(0.7 0.01 90) !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glowpulse { 0%,100% { opacity:0.8; } 50% { opacity:1; } }
        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(118% 78% at 50% -10%, oklch(0.88 0.05 70 / 0.55), transparent 58%)", animation: "glowpulse 9s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, letterSpacing: 2, color: "oklch(0.6 0.1 65)", textTransform: "uppercase", marginBottom: 14 }}>{today}</div>
            <h1 style={{ margin: 0, fontFamily: "'Newsreader', serif", fontSize: 38, fontWeight: 400, lineHeight: 1, color: "oklch(0.33 0.02 80)" }}>
              {activeSection === "morning" ? "Good morning" : activeSection === "supplements" ? "Supplements" : activeSection === "nutrition" ? "Nutrition" : activeSection === "breathing" ? "Breathing" : activeSection === "evening" ? "Evening" : activeSection === "reflection" ? "Reflection" : "Progress"}
            </h1>
            <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 18, color: "oklch(0.52 0.015 90)", marginTop: 9 }}>
              {activeSection === "morning" ? "Let's ease into the day." : activeSection === "supplements" ? "Your daily protocol." : activeSection === "nutrition" ? "Fuel your body well." : activeSection === "breathing" ? "Find your rhythm." : activeSection === "evening" ? "Wind down gently." : activeSection === "reflection" ? "A moment of stillness." : "Your journey so far."}
            </div>
          </div>
          <div style={{ paddingTop: 4 }}>
            <button onClick={() => setShowKeyInput(v => !v)} style={{ fontSize: 10, background: apiKey ? "oklch(0.53 0.09 165 / 0.12)" : "oklch(0.6 0.15 25 / 0.12)", border: "1px solid " + (apiKey ? "oklch(0.53 0.09 165 / 0.4)" : "oklch(0.6 0.15 25 / 0.4)"), borderRadius: 999, padding: "4px 10px", color: apiKey ? "oklch(0.45 0.09 165)" : "oklch(0.5 0.15 25)", cursor: "pointer", fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 }}>
              {apiKey ? "✓ AI" : "⚠ Key"}
            </button>
          </div>
        </div>
        {showKeyInput && (
          <div style={{ marginTop: 14, marginBottom: 4, padding: 16, background: "oklch(0.995 0.004 90)", borderRadius: 20, border: "1px solid oklch(0.88 0.008 80)", boxShadow: "0 1px 2px rgba(70,60,40,0.04), 0 14px 30px -22px rgba(70,60,40,0.25)" }}>
            <div style={{ color: "oklch(0.56 0.012 90)", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 10 }}>Anthropic API Key</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="password" value={apiKey} onChange={e => saveApiKey(e.target.value)} placeholder="sk-ant-..." style={{ flex: 1, background: "oklch(0.97 0.006 90)", border: "1px solid oklch(0.86 0.01 80)", borderRadius: 12, padding: "8px 12px", color: "oklch(0.34 0.018 80)", fontSize: 13, outline: "none" }} />
              <button onClick={() => setShowKeyInput(false)} style={{ background: "oklch(0.6 0.1 65)", border: "none", borderRadius: 999, padding: "8px 18px", color: "white", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Save</button>
            </div>
            <div style={{ color: "oklch(0.62 0.01 90)", fontSize: 11, marginTop: 8 }}>console.anthropic.com · Stored only on your device</div>
          </div>
        )}

      </div>

      {/* Nav */}
      <div style={{ position: "relative", zIndex: 1, overflowX: "auto", padding: "18px 24px 16px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 9, minWidth: "max-content" }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setActiveSection(s)} style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 7,
              height: 38, padding: "0 15px", borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: activeSection === s ? "oklch(0.6 0.1 65)" : "oklch(0.99 0.004 90)",
              border: "1px solid " + (activeSection === s ? "oklch(0.6 0.1 65)" : "oklch(0.85 0.01 80)"),
              color: activeSection === s ? "white" : "oklch(0.46 0.012 90)",
              cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif",
            }}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>{SECTION_META[s].emoji}</span>{SECTION_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto", padding: "6px 20px 40px" }}>
        <div style={{ animation: "fadeIn 0.3s ease" }} key={activeSection}>
          {activeSection === "morning" && <MorningSection data={sectionData.morning || {}} setData={setData("morning")} />}
          {activeSection === "supplements" && <SupplementsSection data={sectionData.supplements || {}} setData={setData("supplements")} />}
          {activeSection === "nutrition" && <NutritionSection data={sectionData.nutrition || {}} setData={setData("nutrition")} />}
          {activeSection === "breathing" && <BreathingSection data={sectionData.breathing || {}} setData={setData("breathing")} />}
          {activeSection === "evening" && <EveningSection data={sectionData.evening || {}} setData={setData("evening")} />}
          {activeSection === "reflection" && <ReflectionSection data={sectionData.reflection || {}} setData={setData("reflection")} />}
          {activeSection === "reports" && <ReportsSection />}
        </div>

        {/* Nav arrows */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
          <button
            onClick={() => setActiveSection(SECTIONS[SECTIONS.indexOf(activeSection) - 1])}
            disabled={activeSection === SECTIONS[0]}
            style={{ ...ghostBtn, opacity: activeSection === SECTIONS[0] ? 0.3 : 1 }}>
            ← Previous
          </button>
          <button
            onClick={() => setActiveSection(SECTIONS[SECTIONS.indexOf(activeSection) + 1])}
            disabled={activeSection === SECTIONS[SECTIONS.length - 1]}
            style={{ ...ghostBtn, background: "oklch(0.6 0.1 65)", border: "none", color: "white", fontWeight: 600, opacity: activeSection === SECTIONS[SECTIONS.length - 1] ? 0.3 : 1 }}>
            Next →
          </button>
        </div>
      </div>
    </div>
    </ApiKeyContext.Provider>
  );
}
