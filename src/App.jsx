import React, { useState, useEffect, useRef } from "react";

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
          marginTop: 12, padding: 16, background: "rgba(167,139,250,0.08)",
          borderRadius: 14, borderLeft: "3px solid #a78bfa",
          color: "#c4b5fd", fontSize: 14, lineHeight: 1.75,
          fontFamily: "'DM Sans', sans-serif", animation: "fadeIn 0.4s ease"
        }}>
          {advice}
        </div>
      )}
    </div>
  );
}

function MorningSection({ data, setData }) {
  const TIMER_DURATION = 5 * 60;
  const [timerActive, setTimerActive] = React.useState(false);
  const [timerLeft, setTimerLeft] = React.useState(TIMER_DURATION);
  const [timerDone, setTimerDone] = React.useState(false);
  const [endTimeDisplay, setEndTimeDisplay] = React.useState("");
  const timerRef = React.useRef(null);
  const endTimeRef = React.useRef(null);
  const audioCtxRef = React.useRef(null);
  const bellPlayedRef = React.useRef(false);

  React.useEffect(() => () => clearInterval(timerRef.current), []);

  // iOS-safe bell: uses AudioContext created & resumed on the START tap gesture
  const initAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    } catch(e) {}
  };

  const playBell = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const ring = (delayS) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g1 = ctx.createGain();
        const g2 = ctx.createGain();
        osc.connect(g1); g1.connect(ctx.destination);
        osc2.connect(g2); g2.connect(ctx.destination);
        const t = ctx.currentTime + delayS;
        osc.type = "sine";
        osc.frequency.setValueAtTime(528, t);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(528 * 2.756, t);
        g1.gain.setValueAtTime(0.0001, t);
        g1.gain.linearRampToValueAtTime(0.8, t + 0.02);
        g1.gain.exponentialRampToValueAtTime(0.0001, t + 4.0);
        g2.gain.setValueAtTime(0.0001, t);
        g2.gain.linearRampToValueAtTime(0.3, t + 0.02);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);
        osc.start(t); osc.stop(t + 4.1);
        osc2.start(t); osc2.stop(t + 2.1);
      };
      ring(0); ring(1.5); ring(3.0);
    } catch(e) {}
    try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch(e) {}
  };

  const startTimer = () => {
    if (timerActive) {
      clearInterval(timerRef.current);
      setTimerActive(false);
      setTimerLeft(TIMER_DURATION);
      setTimerDone(false);
      setEndTimeDisplay("");
      endTimeRef.current = null;
      bellPlayedRef.current = false;
      return;
    }

    // Init audio on this tap — the ONLY way iOS allows it
    initAudio();
    bellPlayedRef.current = false;

    // Calculate real end time
    const endMs = Date.now() + TIMER_DURATION * 1000;
    endTimeRef.current = endMs;

    // Show end time as real clock time e.g. "5:01 PM"
    const endDate = new Date(endMs);
    const hrs = endDate.getHours();
    const mins = String(endDate.getMinutes()).padStart(2, "0");
    const ampm = hrs >= 12 ? "PM" : "AM";
    const displayHr = hrs % 12 || 12;
    setEndTimeDisplay(`${displayHr}:${mins} ${ampm}`);

    setTimerActive(true);
    setTimerDone(false);

    // Poll every 500ms using real clock — survives screen lock
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimerLeft(remaining);
      if (remaining <= 0 && !bellPlayedRef.current) {
        bellPlayedRef.current = true;
        clearInterval(timerRef.current);
        setTimerActive(false);
        setTimerDone(true);
        playBell();
      }
    }, 500);
  };

  const mins = String(Math.floor(timerLeft / 60)).padStart(2, "0");
  const secs = String(timerLeft % 60).padStart(2, "0");
  const progress = ((5 * 60 - timerLeft) / (5 * 60)) * 100;

  return (
    <div>
      {/* Morning rituals */}
      <p style={labelStyle}>Morning Rituals</p>

      {/* Water check */}
      <button onClick={() => setData({ ...data, water: !data.water })} style={{
        width: "100%", padding: "14px 16px", borderRadius: 14, textAlign: "left",
        background: data.water ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.03)",
        border: data.water ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
        marginBottom: 12, transition: "all 0.2s",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: data.water ? "#34d399" : "transparent",
          border: data.water ? "none" : "1.5px solid #334155",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, transition: "all 0.2s",
        }}>
          {data.water ? "✓" : ""}
        </div>
        <div>
          <div style={{ color: data.water ? "#34d399" : "#94a3b8", fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
            🍋 Warm water with lime juice
          </div>
          <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>1 glass on empty stomach</div>
        </div>
      </button>

      {/* Eye mask timer */}
      <div style={{
        padding: "14px 16px", borderRadius: 14, marginBottom: 20,
        background: timerDone ? "rgba(52,211,153,0.12)" : timerActive ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.03)",
        border: timerDone ? "1px solid rgba(52,211,153,0.4)" : timerActive ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: timerActive ? 12 : 0 }}>
          <div>
            <div style={{ color: timerDone ? "#34d399" : timerActive ? "#c4b5fd" : "#94a3b8", fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
              😌 Warm eye mask
            </div>
            {timerActive && endTimeDisplay
              ? <div style={{ color: "#a78bfa", fontSize: 11, marginTop: 2 }}>Ends at {endTimeDisplay}</div>
              : <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>5 minute timer</div>
            }
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {timerActive && (
              <div style={{ color: "#c4b5fd", fontSize: 30, fontFamily: "'DM Mono', monospace", fontWeight: 200, letterSpacing: -1 }}>
                {mins}:{secs}
              </div>
            )}
            {timerDone && (
              <div style={{ color: "#34d399", fontSize: 20 }}>✓ Done!</div>
            )}
            <button onClick={startTimer} style={{
              padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
              background: timerActive ? "rgba(239,68,68,0.15)" : timerDone ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #a78bfa, #818cf8)",
              border: timerActive ? "1px solid rgba(239,68,68,0.3)" : "none",
              color: timerActive ? "#f87171" : timerDone ? "#475569" : "#fff",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>
              {timerActive ? "■ Stop" : timerDone ? "↺ Again" : "▶ Start"}
            </button>
          </div>
        </div>
        {timerActive && (
          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              width: progress + "%",
              background: "linear-gradient(90deg, #a78bfa, #34d399)",
              transition: "width 1s linear",
            }} />
          </div>
        )}
      </div>

      <p style={labelStyle}>How are you feeling this morning?</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {["😴 Tired", "😐 Okay", "🙂 Good", "😊 Great", "⚡ Energised"].map(m => (
          <button key={m} onClick={() => setData({ ...data, mood: m })} style={{
            ...moodBtn, background: data.mood === m ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.05)",
            border: data.mood === m ? "1px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)"
          }}>{m}</button>
        ))}
      </div>

      <p style={labelStyle}>Sleep quality last night</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["Poor", "Fair", "Good", "Great"].map(s => (
          <button key={s} onClick={() => setData({ ...data, sleep: s })} style={{
            ...moodBtn, background: data.sleep === s ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.05)",
            border: data.sleep === s ? "1px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)"
          }}>{s}</button>
        ))}
      </div>

      <p style={labelStyle}>Hours slept</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <input type="range" min={3} max={12} step={0.5} value={data.hours || 7}
          onChange={e => setData({ ...data, hours: e.target.value })}
          style={{ flex: 1, accentColor: "#a78bfa" }} />
        <span style={{ color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 18, minWidth: 40 }}>{data.hours || 7}h</span>
      </div>

      <p style={labelStyle}>Today's main tasks / intentions</p>
      <textarea value={data.tasks || ""} onChange={e => setData({ ...data, tasks: e.target.value })}
        placeholder="What do you want to accomplish today?"
        style={textareaStyle} rows={3} />

      <p style={labelStyle}>Energy level (1–10)</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <input type="range" min={1} max={10} value={data.energy || 5}
          onChange={e => setData({ ...data, energy: e.target.value })}
          style={{ flex: 1, accentColor: "#a78bfa" }} />
        <span style={{ color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 18, minWidth: 24 }}>{data.energy || 5}</span>
      </div>

      <AIAdvice
        prompt="Based on this person's morning check-in data, give personalised morning wellbeing advice. Comment on their sleep, energy, and today's tasks. Suggest how to approach the day for optimal wellbeing and performance."
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
          <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600 }}>
            {totalTaken} / {totalAll} taken today
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 99, marginTop: 6, width: 160 }}>
            <div style={{ height: "100%", width: `${(totalTaken / totalAll) * 100}%`, background: "linear-gradient(90deg, #a78bfa, #34d399)", borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>
        </div>
        <button onClick={startEdit} style={{
          padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: "#94a3b8", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: 6
        }}>
          ✎ Edit schedule
        </button>
      </div>

      {/* Edit mode */}
      {editMode && (
        <div style={{ marginBottom: 20, padding: 16, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 16, animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ color: "#fbbf24", fontSize: 13, fontWeight: 600 }}>✎ Editing your schedule</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={cancelEdit} style={{ ...ghostBtn, fontSize: 12 }}>Cancel</button>
              <button onClick={saveChanges} style={{
                padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: "linear-gradient(135deg, #a78bfa, #818cf8)",
                border: "none", color: "#fff", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif"
              }}>
                Save
              </button>
            </div>
          </div>

          {Object.entries(editedSchedule).map(([groupKey, group]) => (
            <div key={groupKey} style={{ marginBottom: 16 }}>
              <div style={{ color: "#64748b", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
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
        return (
          <div key={groupKey} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{group.emoji}</span>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{group.label}</div>
                <div style={{ color: "#475569", fontSize: 11 }}>{group.subtitle}</div>
              </div>
              <div style={{
                marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 99,
                background: groupTaken === group.items.length ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)",
                color: groupTaken === group.items.length ? "#34d399" : "#475569",
                border: `1px solid ${groupTaken === group.items.length ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)"}`
              }}>
                {groupTaken}/{group.items.length}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 8, borderLeft: `2px solid ${group.color}22` }}>
              {group.items.map(item => {
                const isTaken = taken.includes(item.id);
                const onBreak = isOnBreak(item.id);
                return (
                  <button key={item.id} onClick={() => toggle(item.id)} style={{
                    padding: "12px 14px", borderRadius: 12, textAlign: "left",
                    background: onBreak ? "rgba(248,113,113,0.05)" : isTaken ? `${group.color}18` : "rgba(255,255,255,0.03)",
                    border: onBreak ? "1px solid rgba(248,113,113,0.2)" : isTaken ? `1px solid ${group.color}55` : "1px solid rgba(255,255,255,0.07)",
                    cursor: onBreak ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "flex-start", gap: 12,
                    opacity: onBreak ? 0.6 : 1,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      background: onBreak ? "rgba(248,113,113,0.2)" : isTaken ? group.color : "transparent",
                      border: onBreak ? "1.5px solid #f87171" : isTaken ? "none" : "1.5px solid #334155",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: onBreak ? "#f87171" : "#0a0a12", fontWeight: 700, transition: "all 0.2s"
                    }}>
                      {onBreak ? "✕" : isTaken ? "✓" : ""}
                    </div>
                    <div>
                      <div style={{ color: onBreak ? "#f87171" : isTaken ? "#e2e8f0" : "#94a3b8", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
                        {item.name}
                      </div>
                      <div style={{ color: onBreak ? "#f87171" : isTaken ? group.color : "#475569", fontSize: 11, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
                        {onBreak ? "⛔ On break — see Reports" : item.dose}
                      </div>
                    </div>
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

  const calColor  = totalCals  > calGoal  * 1.1 ? "#f87171" : totalCals  >= calGoal  * 0.85 ? "#34d399" : "#f59e0b";
  const protColor = totalProt  >= protGoal * 0.9 ? "#34d399" : totalProt  >= protGoal * 0.6  ? "#f59e0b" : "#f87171";
  const sugColor  = totalSugar > sugGoal          ? "#f87171" : totalSugar > sugGoal  * 0.75 ? "#f59e0b" : "#34d399";

  const StatCard = ({ label, value, unit, goal, goalUnit, pct, color }) => (
    <div style={{ ...statCard, position: "relative", overflow: "hidden" }}>
      <div style={{ color: "#475569", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ color, fontSize: 26, fontFamily: "'DM Mono', monospace", fontWeight: 400, lineHeight: 1 }}>{value}<span style={{ fontSize: 13, marginLeft: 2 }}>{unit}</span></div>
      <div style={{ color: "#334155", fontSize: 10, marginTop: 4, marginBottom: 8 }}>goal: {goal}{goalUnit}</div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
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
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Calories</div>
          <input type="number" value={data.calGoal || ""} onChange={e => setData({ ...data, calGoal: e.target.value })}
            placeholder={String(DEFAULT_CAL)} style={{ ...textareaStyle, padding: "8px 10px", fontSize: 13 }} />
        </div>
        <div>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Protein g</div>
          <input type="number" value={data.protGoal || ""} onChange={e => setData({ ...data, protGoal: e.target.value })}
            placeholder={String(DEFAULT_PROT)} style={{ ...textareaStyle, padding: "8px 10px", fontSize: 13 }} />
        </div>
        <div>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Sugar g</div>
          <input type="number" value={data.sugGoal || ""} onChange={e => setData({ ...data, sugGoal: e.target.value })}
            placeholder={String(DEFAULT_SUG)} style={{ ...textareaStyle, padding: "8px 10px", fontSize: 13 }} />
        </div>
      </div>

      {/* Meal log — now 4 columns: name | kcal | protein | sugar */}
      <p style={labelStyle}>Meals today</p>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 6, marginBottom: 6 }}>
        {["Meal", "kcal", "prot g", "sugar g", ""].map((h, i) => (
          <div key={i} style={{ color: "#334155", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", paddingLeft: 2 }}>{h}</div>
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
            background: "rgba(239,68,68,0.06)", color: "#f87171", cursor: "pointer", fontSize: 15,
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
  const timerRef = useRef(null);
  const animFrameRef = useRef(null);
  const phaseStartRef = useRef(null);
  const [scale, setScale] = useState(0.08);

  const ex = active ? BREATHING_EXERCISES.find(e => e.id === active) : null;
  const durations = ex ? (Array.isArray(ex.duration) ? ex.duration : ex.phases.map(() => ex.duration)) : [];

  const start = (id) => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setActive(id); setPhase(0); setCount(0); setCycles(0); setScale(0.08);
    phaseStartRef.current = performance.now();
  };

  const stop = () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setActive(null); setPhase(0); setCount(0); setScale(0.08);
  };

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
        // ease in-out: 0.08 -> 1.0
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        s = 0.08 + ease * 0.92;
      } else if (phaseName === "Exhale") {
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        s = 1.0 - ease * 0.92;
      } else {
        // Hold: gentle pulse
        s = 1.0 + Math.sin(t * Math.PI * 2) * 0.04;
      }
      setScale(s);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [active, phase]);

  // Second ticker for phase transitions
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

  // Ring configs: [baseSize in px, opacity]
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

          {/* Circles — all same centre, scaled together */}
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

            {/* Invisible anchor so relative div has size */}
            <div style={{ width: 290, height: 290, borderRadius: "50%", opacity: 0 }} />

            {/* Centre label */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 20,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 0,
            }}>
              <div style={{
                color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", letterSpacing: 5,
                textTransform: "uppercase", marginBottom: 6,
                transition: "opacity 0.4s",
              }}>
                {phaseName}
              </div>
              <div style={{
                color: "#ffffff",
                fontSize: 96, fontWeight: 200,
                fontFamily: "'DM Mono', monospace",
                lineHeight: 1,
                textShadow: "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(180,210,230,0.3)",
                letterSpacing: -4,
              }}>
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
                  background: i === phase ? "rgba(255,255,255,0.12)" : "transparent",
                  color: i === phase ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
                  border: `1px solid ${i === phase ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.4s",
                }}>
                  {p} {Array.isArray(ex.duration) ? ex.duration[i] : ex.duration}s
                </div>
              ))}
            </div>
          </div>

          <button onClick={stop} style={{
            position: "absolute", top: 52, right: 24,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 99, padding: "8px 18px",
            color: "rgba(255,255,255,0.5)", fontSize: 13,
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
          }}>
            Done
          </button>
        </div>
      ) : (
        <div>
          <p style={labelStyle}>Choose an exercise</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {BREATHING_EXERCISES.map(e => (
              <button key={e.id} onClick={() => start(e.id)} style={{
                padding: "16px 18px", borderRadius: 16, textAlign: "left",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0", cursor: "pointer", transition: "all 0.2s",
              }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{e.name}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginBottom: 4 }}>{e.desc}</div>
                <div style={{ color: "#a78bfa", fontSize: 11 }}>Best for: {e.best}</div>
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
            ...moodBtn, background: data.dayRating === m ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.05)",
            border: data.dayRating === m ? "1px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)"
          }}>{m}</button>
        ))}
      </div>

      <p style={labelStyle}>Stress level today (1–10)</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <input type="range" min={1} max={10} value={data.stress || 5}
          onChange={e => setData({ ...data, stress: e.target.value })}
          style={{ flex: 1, accentColor: "#a78bfa" }} />
        <span style={{ color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 18, minWidth: 24 }}>{data.stress || 5}</span>
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
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 12, pointerEvents: "none" }}>L</span>
          </div>
        </div>
        {data.water && (() => {
          const w = parseFloat(data.water);
          const goal = 2.5;
          const pct = Math.min((w / goal) * 100, 100);
          const color = w >= goal ? "#34d399" : w >= 1.8 ? "#a78bfa" : w >= 1.2 ? "#f59e0b" : "#f87171";
          const label = w >= goal ? "🎯 Goal reached!" : w >= 1.8 ? "💧 Almost there" : w >= 1.2 ? "💧 Keep drinking" : "⚠ Drink more";
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#475569", fontSize: 11 }}>Daily goal: 2.5 L</span>
                <span style={{ color, fontSize: 12, fontWeight: 600 }}>{label}</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                {[0.5, 1.0, 1.5, 2.0, 2.5].map(mark => (
                  <span key={mark} style={{ color: w >= mark ? color : "#334155", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>{mark}L</span>
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
              background: isSelected ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
              border: isSelected ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.08)",
              color: isSelected ? "#c4b5fd" : "#64748b",
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
          <div style={{ color: "#475569", fontSize: 11, marginBottom: 10 }}>Duration per activity</div>
          {(data.activities || []).filter(a => a !== "none").map(actId => {
            const labels = { yoga: "🧘 Yoga", run: "🏃 Run", tennis: "🎾 Tennis", ballet: "🩰 Ballet", other: "💪 Other" };
            return (
              <div key={actId} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ color: "#94a3b8", fontSize: 13, width: 90 }}>{labels[actId]}</div>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="number"
                    value={(data.activityMins || {})[actId] || ""}
                    onChange={e => setData({ ...data, activityMins: { ...(data.activityMins || {}), [actId]: e.target.value } })}
                    placeholder="0"
                    style={{ ...textareaStyle, padding: "8px 40px 8px 12px", fontSize: 15, fontFamily: "'DM Mono', monospace" }}
                  />
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 11, pointerEvents: "none" }}>min</span>
                </div>
              </div>
            );
          })}
          {(() => {
            const total = Object.values(data.activityMins || {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
            return total > 0 ? (
              <div style={{ color: "#a78bfa", fontSize: 12, marginTop: 4 }}>
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
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 11, pointerEvents: "none" }}>steps</span>
        </div>
        {data.steps && (() => {
          const s = parseInt(data.steps);
          const goal = 10000;
          const pct = Math.min((s / goal) * 100, 100);
          const color = s >= goal ? "#34d399" : s >= 7500 ? "#a78bfa" : s >= 5000 ? "#f59e0b" : "#f87171";
          const label = s >= goal ? "Goal reached!" : s >= 7500 ? "Almost there" : s >= 5000 ? "Good progress" : "Keep moving";
          const emoji = s >= goal ? "🎯" : s >= 7500 ? "💪" : s >= 5000 ? "🚶" : "👟";
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ color: "#475569", fontSize: 11 }}>Daily goal: 10,000</span>
                <span style={{ color, fontSize: 12, fontWeight: 600 }}>{emoji} {label}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {[2500, 5000, 7500, 10000].map(mark => (
                  <span key={mark} style={{ color: s >= mark ? color : "#334155", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
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
const labelStyle = { color: "#94a3b8", fontSize: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10, marginTop: 4 };
const moodBtn = { padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", transition: "all 0.2s" };
const textareaStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: "vertical", width: "100%", boxSizing: "border-box", outline: "none" };
const statCard = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px", textAlign: "center" };
const ghostBtn = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", color: "#94a3b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" };


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
    if (!val) return "#475569";
    if (reverse) { if (val <= good) return "#34d399"; if (val <= bad) return "#f59e0b"; return "#f87171"; }
    if (val >= good) return "#34d399"; if (val >= bad) return "#f59e0b"; return "#f87171";
  };

  const StatRow = ({ label, value, unit, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ color: "#94a3b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
      <div style={{ color: color || "#e2e8f0", fontSize: 15, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
        {value !== null && value !== undefined ? `${value}${unit || ""}` : <span style={{color:"#334155"}}>—</span>}
      </div>
    </div>
  );

  const StatsPanel = ({ stats, label }) => {
    if (!stats) return <div style={{ color: "#475569", fontSize: 13, padding: 16 }}>No data yet for this period.</div>;
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: "#64748b", fontSize: 12, letterSpacing: 1 }}>{stats.count} of {stats.total} days tracked</div>
          <div style={{ height: 4, width: 120, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: (stats.count/stats.total*100)+"%", background: "#a78bfa", borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>😴 Sleep & Energy</div>
          <StatRow label="Avg sleep" value={stats.avgSleep} unit="h" color={scoreColor(stats.avgSleep, 7.5, 6.5)} />
          <StatRow label="Avg energy" value={stats.avgEnergy || null} unit="/10" color={scoreColor(stats.avgEnergy, 7, 5)} />
          <StatRow label="Avg stress" value={stats.avgStress || null} unit="/10" color={scoreColor(stats.avgStress, 4, 6, true)} />
          <StatRow label="Avg mood" value={stats.avgMood || null} unit="/5" color={scoreColor(stats.avgMood, 4, 3)} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>🥗 Nutrition</div>
          <StatRow label="Avg calories" value={stats.avgCal || null} unit=" kcal" color={scoreColor(stats.avgCal, 1700, 1400)} />
          <StatRow label="Avg protein" value={stats.avgProt || null} unit="g" color={scoreColor(stats.avgProt, 120, 90)} />
          <StatRow label="Avg sugar" value={stats.avgSugar || null} unit="g" color={scoreColor(stats.avgSugar, 15, 25, true)} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>💊 Supplements & Habits</div>
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
    if (!d) return <div style={{ color: "#475569", padding: 16, fontSize: 13 }}>No data recorded for this day.</div>;
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
        <h3 style={{ margin: "0 0 20px", color: "#f1f5f9", fontSize: 18, fontWeight: 600 }}>{formatDate(dateStr)}</h3>

        {d.morning && <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🌅 Morning</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {d.morning.mood && <span style={pill}>{d.morning.mood}</span>}
            {d.morning.hours && <span style={pill}>😴 {d.morning.hours}h sleep</span>}
            {d.morning.sleep && <span style={pill}>Sleep: {d.morning.sleep}</span>}
            {d.morning.energy && <span style={pill}>⚡ Energy {d.morning.energy}/10</span>}
            {d.morning.water && <span style={{ ...pill, background: "rgba(52,211,153,0.15)", color: "#34d399" }}>🍋 Morning water ✓</span>}
          </div>
          {d.morning.tasks && <div style={{ color: "#64748b", fontSize: 13, marginTop: 10, fontStyle: "italic" }}>"{d.morning.tasks}"</div>}
        </div>}

        {allSupps.length > 0 && <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>💊 Supplements ({taken.length}/{allSupps.length})</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {allSupps.map(s => (
              <span key={s.id} style={{ ...pill, background: taken.includes(s.id) ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)", color: taken.includes(s.id) ? "#34d399" : "#334155", textDecoration: taken.includes(s.id) ? "none" : "line-through" }}>
                {taken.includes(s.id) ? "✓" : "○"} {s.name}
              </span>
            ))}
          </div>
        </div>}

        {meals.length > 0 && <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🥗 Nutrition</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={miniStat}><div style={{ color: "#f59e0b", fontSize: 20, fontFamily: "'DM Mono', monospace" }}>{totalCal}</div><div style={{ color: "#475569", fontSize: 10 }}>kcal</div></div>
            <div style={miniStat}><div style={{ color: "#34d399", fontSize: 20, fontFamily: "'DM Mono', monospace" }}>{totalProt}g</div><div style={{ color: "#475569", fontSize: 10 }}>protein</div></div>
            <div style={miniStat}><div style={{ color: totalSugar > 25 ? "#f87171" : "#a78bfa", fontSize: 20, fontFamily: "'DM Mono', monospace" }}>{totalSugar}g</div><div style={{ color: "#475569", fontSize: 10 }}>sugar</div></div>
          </div>
          {meals.filter(m=>m.name).map((m,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
              <span style={{ color: "#94a3b8" }}>{m.name}</span>
              <span style={{ color: "#475569", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{m.calories||0}kcal · {m.protein||0}g · {m.sugar||0}g</span>
            </div>
          ))}
        </div>}

        {d.evening && <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🌙 Evening</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {d.evening.dayRating && <span style={pill}>{d.evening.dayRating}</span>}
            {d.evening.stress && <span style={pill}>Stress {d.evening.stress}/10</span>}
            {d.evening.water && <span style={pill}>💧 {d.evening.water}L water</span>}
            {d.evening.steps && <span style={pill}>👟 {parseInt(d.evening.steps).toLocaleString()} steps</span>}
            {(d.evening.activities || []).filter(a => a !== "none").map(a => { const labels = { yoga:"🧘 Yoga", run:"🏃 Run", tennis:"🎾 Tennis", ballet:"🩰 Ballet", other:"💪 Other" }; const mins = (d.evening.activityMins || {})[a]; return <span key={a} style={pill}>{labels[a]}{mins ? " · " + mins + "min" : ""}</span>; })}
          </div>
        </div>}

        {d.reflection && (d.reflection.gratitude || d.reflection.wins) && <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>✨ Reflection</div>
          {d.reflection.gratitude?.filter(Boolean).map((g, i) => (
            <div key={i} style={{ color: "#94a3b8", fontSize: 13, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>✦ {g}</div>
          ))}
          {d.reflection.wins && <div style={{ color: "#64748b", fontSize: 13, marginTop: 8, fontStyle: "italic" }}>"{d.reflection.wins}"</div>}
        </div>}
      </div>
    );
  };

  const pill = { padding: "4px 10px", borderRadius: 99, fontSize: 12, background: "rgba(255,255,255,0.06)", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" };
  const miniStat = { flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px", textAlign: "center" };

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
              background: isSelected ? "rgba(167,139,250,0.25)" : isToday ? "rgba(255,255,255,0.08)" : "transparent",
              border: isSelected ? "1px solid #a78bfa" : isToday ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
              cursor: "pointer",
            }}>
              <div style={{ color: "#475569", fontSize: 10 }}>{dayName(date)}</div>
              <div style={{ color: isSelected ? "#c4b5fd" : isToday ? "#f1f5f9" : "#64748b", fontSize: 13, fontWeight: isToday ? 700 : 400, fontFamily: "'DM Mono', monospace" }}>
                {new Date(date + "T12:00:00").getDate()}
              </div>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: hasData ? "#a78bfa" : "rgba(255,255,255,0.08)" }} />
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
      if (cycle.courseDays === -1) return { type: "ongoing", color: "#34d399" };
      if (!startDate) return { type: "nodate", color: "#475569" };

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
          color: "#f87171",
          breakElapsed: Math.max(0, breakElapsed),
          breakTotal: cycle.breakDays,
          breakLeft,
          breakPct,
          resumeDate: resumeStr,
        };
      }

      const daysLeft = cycle.courseDays - daysTaken;
      const progress = Math.min((daysTaken / cycle.courseDays) * 100, 100);
      return { type: "active", color: "#a78bfa", daysLeft, progress };
    };

    return (
      <div>
        <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>💊 Supplement Tracker</div>
        <div style={{ color: "#334155", fontSize: 11, marginBottom: 16, lineHeight: 1.5 }}>
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
              background: status?.type === "break" ? "rgba(248,113,113,0.05)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${status?.type === "break" ? "rgba(248,113,113,0.25)" : "rgba(255,255,255,0.07)"}`,
            }}>

              {/* Name + days taken */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1, paddingRight: 10 }}>
                  <div style={{ color: status?.type === "break" ? "#f87171" : "#e2e8f0", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>{item.dose}</div>
                </div>
                {startDate && (
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ color: status?.color || "#a78bfa", fontSize: 26, fontFamily: "'DM Mono', monospace", fontWeight: 200, lineHeight: 1 }}>
                      {status?.type === "break" ? status.breakElapsed : daysTaken}
                    </div>
                    <div style={{ color: "#334155", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {status?.type === "break" ? `of ${status.breakTotal} break days` : cycle?.courseDays > 0 ? `of ${cycle.courseDays} days` : "days"}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {startDate && status?.type === "active" && cycle?.courseDays > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#334155", fontSize: 10 }}>Day 1</span>
                    <span style={{ color: "#334155", fontSize: 10 }}>{status.daysLeft} days left</span>
                    <span style={{ color: "#334155", fontSize: 10 }}>Day {cycle.courseDays}</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: status.progress + "%", background: "linear-gradient(90deg, #818cf8, #a78bfa)", borderRadius: 99, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              )}

              {/* Break progress bar */}
              {status?.type === "break" && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#f87171", fontSize: 11, fontWeight: 600 }}>⛔ On break — {status.breakLeft} days until resume</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", width: status.breakPct + "%", background: "linear-gradient(90deg, #f87171, #fbbf24)", borderRadius: 99, transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ color: "#475569", fontSize: 11 }}>
                    Resume on <span style={{ color: "#fbbf24" }}>{status.resumeDate}</span>
                  </div>
                </div>
              )}

              {/* Ongoing badge */}
              {status?.type === "ongoing" && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, background: "rgba(52,211,153,0.15)", color: "#34d399" }}>✓ Ongoing — no break needed</span>
                </div>
              )}

              {/* No date set */}
              {status?.type === "nodate" && (
                <div style={{ color: "#334155", fontSize: 11, marginBottom: 6 }}>Set start date to begin tracking</div>
              )}

              {/* Clinical note */}
              {cycle && cycle.notes && (
                <div style={{ color: "#334155", fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>{cycle.notes}</div>
              )}

              {/* Start date picker */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                {editingId === item.id ? (
                  <>
                    <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
                      style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"6px 10px", color:"#e2e8f0", fontSize:12, outline:"none" }} />
                    <button onClick={() => setStartDate(item.id, dateInput)} style={{ padding:"5px 14px", borderRadius:8, background:"rgba(167,139,250,0.2)", border:"1px solid rgba(167,139,250,0.3)", color:"#c4b5fd", fontSize:12, cursor:"pointer" }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ padding:"5px 10px", borderRadius:8, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"#475569", fontSize:12, cursor:"pointer" }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => { setEditingId(item.id); setDateInput(startDate || today); }} style={{ padding:"4px 12px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color: startDate ? "#64748b" : "#a78bfa", fontSize:11, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>
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
            background: view === v ? "rgba(167,139,250,0.2)" : "transparent",
            border: view === v ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.07)",
            color: view === v ? "#c4b5fd" : "#64748b", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>{label}</button>
        ))}
      </div>

      {/* Calendar strip */}
      {view !== "supplements" && view === "weekly"  && <CalendarStrip days={weekDays} />}
      {view !== "supplements" && view === "monthly" && <CalendarStrip days={monthDays} />}
      {view !== "supplements" && view === "annual"  && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#475569", fontSize: 11, marginBottom: 10 }}>Tap a month to explore days</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {Array.from({length: 12}, (_,i) => {
              const d = new Date(); d.setMonth(d.getMonth() - 11 + i);
              const monthKey = d.toISOString().slice(0,7);
              const monthDaysData = annualDays.filter(day => day.date.startsWith(monthKey));
              const tracked = monthDaysData.filter(d => d.data).length;
              return (
                <div key={i} style={{ ...statCard, padding: 10, textAlign: "center", cursor: "pointer" }}
                  onClick={() => setView("monthly")}>
                  <div style={{ color: "#64748b", fontSize: 11 }}>{d.toLocaleDateString("en-GB",{month:"short"})}</div>
                  <div style={{ color: tracked > 0 ? "#a78bfa" : "#334155", fontSize: 18, fontFamily: "'DM Mono', monospace", margin: "4px 0" }}>{tracked}</div>
                  <div style={{ color: "#334155", fontSize: 10 }}>days</div>
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
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Recent Days</div>
          {dates.slice(0, view === "weekly" ? 7 : 30).map(date => {
            const d = allData[date];
            const meals = d.nutrition?.meals || [];
            const cal = meals.reduce((s,m)=>s+(parseInt(m.calories)||0),0);
            const steps = parseInt(d.evening?.steps || 0);
            return (
              <button key={date} onClick={() => { setSelectedDate(date); setView("day"); }} style={{
                width: "100%", padding: "12px 14px", borderRadius: 12, marginBottom: 8,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                    {date === today ? "Today" : formatDate(date)}
                  </div>
                  <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>
                    {d.morning?.mood || ""} {d.morning?.hours ? d.morning.hours + "h sleep" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {cal > 0 && <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#f59e0b", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{cal}</div>
                    <div style={{ color: "#334155", fontSize: 10 }}>kcal</div>
                  </div>}
                  {steps > 0 && <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#60a5fa", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{steps.toLocaleString()}</div>
                    <div style={{ color: "#334155", fontSize: 10 }}>steps</div>
                  </div>}
                  <div style={{ color: "#334155", fontSize: 16 }}>›</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {view === "supplements" && <SupplementTracker />}

      {view !== "supplements" && dates.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#334155" }}>
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
      minHeight: "100vh", background: "#0a0a12",
      fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        input, textarea { color: #e2e8f0 !important; }
        input::placeholder, textarea::placeholder { color: #334155 !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 99px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "28px 24px 0", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div style={{ color: "#475569", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{today}</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#f1f5f9", letterSpacing: -0.5 }}>Daily Wellbeing</h1>
          </div>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <div style={{ fontSize: 28 }}>🌿</div>
            <button onClick={() => setShowKeyInput(v => !v)} style={{ fontSize: 10, background: apiKey ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)", border: "1px solid " + (apiKey ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"), borderRadius: 6, padding: "2px 8px", color: apiKey ? "#34d399" : "#f87171", cursor: "pointer" }}>
              {apiKey ? "✓ AI ready" : "⚠ Set API key"}
            </button>
          </div>
        </div>
        {showKeyInput && (
          <div style={{ marginBottom: 16, padding: 14, background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ color: "#94a3b8", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Anthropic API Key</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="password" value={apiKey} onChange={e => saveApiKey(e.target.value)} placeholder="sk-ant-..." style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }} />
              <button onClick={() => setShowKeyInput(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>Save</button>
            </div>
            <div style={{ color: "#475569", fontSize: 11, marginTop: 8 }}>Get your key at console.anthropic.com · Stored only on your device</div>
          </div>
        )}

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, marginTop: 16, marginBottom: 24 }}>
          {SECTIONS.map(s => (
            <div key={s} style={{
              height: 3, flex: 1, borderRadius: 99,
              background: s === activeSection ? "#a78bfa" : sectionData[s] ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)",
              transition: "all 0.3s"
            }} />
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{ overflowX: "auto", padding: "0 24px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, paddingBottom: 16, minWidth: "max-content" }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setActiveSection(s)} style={{
              padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 500,
              background: activeSection === s ? "rgba(167,139,250,0.2)" : "transparent",
              border: activeSection === s ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.07)",
              color: activeSection === s ? "#c4b5fd" : "#64748b", cursor: "pointer",
              transition: "all 0.2s", whiteSpace: "nowrap"
            }}>
              {SECTION_META[s].emoji} {SECTION_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "8px 24px 40px" }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 600, color: "#f1f5f9" }}>
            {SECTION_META[activeSection].emoji} {SECTION_META[activeSection].label}
          </h2>
          <div style={{ color: "#475569", fontSize: 12 }}>{SECTION_META[activeSection].time}</div>
        </div>

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
            style={{ ...ghostBtn, background: "rgba(167,139,250,0.15)", borderColor: "rgba(167,139,250,0.3)", color: "#c4b5fd", opacity: activeSection === SECTIONS[SECTIONS.length - 1] ? 0.3 : 1 }}>
            Next →
          </button>
        </div>
      </div>
    </div>
    </ApiKeyContext.Provider>
  );
}
