import React, { useState, useEffect, useRef } from "react";

const SECTIONS = ["morning", "supplements", "nutrition", "breathing", "evening", "reflection"];

const SECTION_META = {
  morning: { label: "Morning Check-in", emoji: "🌅", time: "Start of Day" },
  supplements: { label: "Supplements", emoji: "💊", time: "With Breakfast" },
  nutrition: { label: "Nutrition", emoji: "🥗", time: "Track Meals" },
  breathing: { label: "Breathing", emoji: "🫁", time: "3× Daily" },
  evening: { label: "Evening Wind-down", emoji: "🌙", time: "Before Bed" },
  reflection: { label: "Reflection & Gratitude", emoji: "✨", time: "End of Day" },
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
  const [schedule, setSchedule] = useState(SUPPLEMENT_SCHEDULE);
  // Use a ref for edits so typing doesn't cause re-renders that steal focus
  const editRef = React.useRef(null);
  const [editVersion, setEditVersion] = useState(0);

  const taken = data.taken || [];

  const toggle = (id) => {
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
    setSchedule(JSON.parse(JSON.stringify(editRef.current)));
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
                return (
                  <button key={item.id} onClick={() => toggle(item.id)} style={{
                    padding: "12px 14px", borderRadius: 12, textAlign: "left",
                    background: isTaken ? `${group.color}18` : "rgba(255,255,255,0.03)",
                    border: isTaken ? `1px solid ${group.color}55` : "1px solid rgba(255,255,255,0.07)",
                    cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "flex-start", gap: 12
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      background: isTaken ? group.color : "transparent",
                      border: isTaken ? `none` : `1.5px solid #334155`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#0a0a12", fontWeight: 700, transition: "all 0.2s"
                    }}>
                      {isTaken ? "✓" : ""}
                    </div>
                    <div>
                      <div style={{ color: isTaken ? "#e2e8f0" : "#94a3b8", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
                        {item.name}
                      </div>
                      <div style={{ color: isTaken ? group.color : "#475569", fontSize: 11, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
                        {item.dose}
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
  const meals = data.meals || [{ name: "", calories: "", protein: "" }];
  const updateMeal = (i, field, val) => {
    const m = [...meals]; m[i] = { ...m[i], [field]: val }; setData({ ...data, meals: m });
  };
  const addMeal = () => setData({ ...data, meals: [...meals, { name: "", calories: "", protein: "" }] });
  const totalCals = meals.reduce((s, m) => s + (parseInt(m.calories) || 0), 0);
  const totalProt = meals.reduce((s, m) => s + (parseInt(m.protein) || 0), 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={statCard}>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>CALORIES TODAY</div>
          <div style={{ color: "#f59e0b", fontSize: 28, fontFamily: "'DM Mono', monospace" }}>{totalCals}</div>
          <div style={{ color: "#475569", fontSize: 11 }}>goal: {data.calGoal || 2000} kcal</div>
        </div>
        <div style={statCard}>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>PROTEIN TODAY</div>
          <div style={{ color: "#34d399", fontSize: 28, fontFamily: "'DM Mono', monospace" }}>{totalProt}g</div>
          <div style={{ color: "#475569", fontSize: 11 }}>goal: {data.protGoal || 150}g</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <p style={{ ...labelStyle, marginBottom: 6 }}>Calorie goal</p>
          <input type="number" value={data.calGoal || ""} onChange={e => setData({ ...data, calGoal: e.target.value })}
            placeholder="2000" style={{ ...textareaStyle, padding: "10px 14px" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ ...labelStyle, marginBottom: 6 }}>Protein goal (g)</p>
          <input type="number" value={data.protGoal || ""} onChange={e => setData({ ...data, protGoal: e.target.value })}
            placeholder="150" style={{ ...textareaStyle, padding: "10px 14px" }} />
        </div>
      </div>

      <p style={labelStyle}>Meals today</p>
      {meals.map((m, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
          <input value={m.name} onChange={e => updateMeal(i, "name", e.target.value)}
            placeholder={`Meal ${i + 1}`} style={{ ...textareaStyle, padding: "10px 14px" }} />
          <input type="number" value={m.calories} onChange={e => updateMeal(i, "calories", e.target.value)}
            placeholder="kcal" style={{ ...textareaStyle, padding: "10px 14px" }} />
          <input type="number" value={m.protein} onChange={e => updateMeal(i, "protein", e.target.value)}
            placeholder="protein g" style={{ ...textareaStyle, padding: "10px 14px" }} />
        </div>
      ))}
      <button onClick={addMeal} style={{ ...ghostBtn, marginBottom: 20 }}>+ Add meal</button>

      <AIAdvice
        prompt="Based on this person's nutrition data today, give personalised diet advice. Comment on their calorie and protein intake vs goals, meal timing, and nutritional balance. Suggest improvements if needed."
        context={data}
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

      <p style={labelStyle}>Water intake (glasses)</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[4, 5, 6, 7, 8, 9, 10].map(n => (
          <button key={n} onClick={() => setData({ ...data, water: n })} style={{
            width: 40, height: 40, borderRadius: 10, border: data.water === n ? "1px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)",
            background: data.water === n ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.04)",
            color: data.water === n ? "#c4b5fd" : "#64748b", fontSize: 13,
            fontFamily: "'DM Mono', monospace", cursor: "pointer"
          }}>{n}</button>
        ))}
      </div>

      <p style={labelStyle}>Did you exercise today?</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {["None", "Walk", "Light", "Moderate", "Intense"].map(a => (
          <button key={a} onClick={() => setData({ ...data, activity: a })} style={{
            ...moodBtn, background: data.activity === a ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.05)",
            border: data.activity === a ? "1px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)"
          }}>{a}</button>
        ))}
      </div>

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
        prompt="Based on this person's evening check-in data, give personalised advice for tonight's recovery and wind-down routine. Comment on their day rating, stress level, hydration, activity, and steps count. Suggest sleep preparation tips."
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
