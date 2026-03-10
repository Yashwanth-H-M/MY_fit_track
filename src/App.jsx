import { useState, useEffect, useRef } from "react";
import { routine } from "./data/routineData";

// --- Sub-Components ---

const Header = ({ totalDone, totalExercises, onReset, resetState }) => (
  <header style={{
    padding: "20px 24px 12px",
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    flexShrink: 0,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
      <div>
        <div style={{ fontSize: "11px", letterSpacing: "3px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>
          Routine Plan
        </div>
        <h1 style={{ 
          fontSize: "36px", 
          fontFamily: "'Playfair Display', serif", 
          margin: "4px 0 0", 
          letterSpacing: "-1px" 
        }}>
          FitTrak
        </h1>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
        <button 
          className={`reset-btn ${resetState}`} 
          onClick={onReset}
        >
          <span style={{ fontSize: "16px" }}>{resetState === 'idle' ? '↺' : '⚡'}</span>
          {resetState === 'idle' ? 'RESET ALL' : 'SURE?'}
        </button>
        <div style={{ fontSize: "28px", fontWeight: "900", color: totalDone === totalExercises ? "#00C896" : "var(--text-primary)" }}>
          <span style={{ fontSize: "16px", verticalAlign: "middle", marginRight: "4px", color: "var(--text-muted)" }}>Total</span>
          {totalDone}
        </div>
      </div>
    </div>
  </header>
);

const DaySelector = ({ selectedIndex, onSelect }) => (
  <div className="no-scrollbar" style={{ 
    display: "flex", 
    gap: "8px", 
    overflowX: "auto", 
    padding: "0 24px 16px",
    background: "var(--surface)",
    scrollSnapType: "x mandatory",
    borderBottom: "1px solid var(--border)",
  }}>
    {routine.map((day, i) => (
      <div 
        key={i}
        onClick={() => onSelect(i)}
        className="day-selector-item"
        style={{
          background: selectedIndex === i ? day.color : "var(--surface-alt)",
          color: selectedIndex === i ? "#FFF" : "var(--text-secondary)",
          scrollSnapAlign: "start"
        }}
      >
        {day.day}
      </div>
    ))}
  </div>
);

const ProgressCard = ({ label, focus, progress, accent }) => (
  <div style={{ marginBottom: "32px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
       <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>{label}</h2>
       <div style={{ 
          background: `${accent}15`, 
          color: accent, 
          padding: "6px 12px", 
          borderRadius: "100px", 
          fontSize: "12px", 
          fontWeight: "800"
        }}>
          {label === "Rest & Recovery" ? "Active" : `${progress}% Done`}
        </div>
    </div>
    <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "4px 0 12px" }}>{focus}</p>
    
    <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
      <div style={{ 
        height: "100%", 
        width: `${progress}%`, 
        background: accent, 
        transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" 
      }} />
    </div>
  </div>
);

const ExerciseItem = ({ ex, isDone, onToggle, accent }) => (
  <div className="exercise-card" onClick={onToggle}>
    <div className={`check-box ${isDone ? 'checked' : ''}`} style={{ '--accent': accent }}>
      {isDone && <span style={{ color: "#FFF", fontSize: "16px", fontWeight: "900" }}>✓</span>}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ 
        fontSize: "16px", 
        fontWeight: "700", 
        color: isDone ? "var(--text-muted)" : "var(--text-primary)",
        textDecoration: isDone ? "line-through" : "none",
        marginBottom: "4px"
      }}>
        {ex.name}
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <span style={{ fontSize: "12px", fontWeight: "800", color: accent }}>{ex.sets} × {ex.reps}</span>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>⏱ {ex.rest}</span>
      </div>
      {ex.tip && !isDone && (
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontStyle: "italic" }}>
          Tip: {ex.tip}
        </div>
      )}
    </div>
    <div style={{ color: "var(--border)" }}>
       <div style={{ fontSize: "20px" }}>›</div>
    </div>
  </div>
);

const RestDayView = () => (
  <div className="rest-container" style={{
    textAlign: "center",
    padding: "50px 30px",
    background: "var(--surface)",
    borderRadius: "24px",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--border)",
    animation: "slideIn 0.5s ease forwards",
  }}>
    <div className="rest-icon" style={{ fontSize: "64px", marginBottom: "20px" }}>🌿</div>
    <h3 className="rest-title" style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px" }}>Time to Recharge</h3>
    <p className="rest-p" style={{ color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "15px" }}>
      Rest days are just as important as training days. Focus on mobility, hydration, and quality sleep to allow your muscles to recover.
    </p>
    <div style={{ 
      marginTop: "32px", 
      display: "flex", 
      justifyContent: "center", 
      gap: "28px",
      opacity: 0.8
    }}>
      {["💧 WATER", "🧘 MOBILITY", "💤 SLEEP"].map((text, idx) => (
        <div key={idx}>
          <div style={{ fontSize: "24px" }}>{text.split(' ')[0]}</div>
          <div style={{ fontSize: "10px", fontWeight: "700", marginTop: "4px" }}>{text.split(' ')[1]}</div>
        </div>
      ))}
    </div>
  </div>
);

// --- Main Application ---

export default function GymRoutine() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => 
    Number(localStorage.getItem("fit_trak_day") || 0)
  );
  const [checked, setChecked] = useState(() => 
    JSON.parse(localStorage.getItem("fit_trak_checked") || "{}")
  );
  const [resetState, setResetState] = useState("idle");
  const resetTimerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("fit_trak_day", selectedDayIndex);
    localStorage.setItem("fit_trak_checked", JSON.stringify(checked));
  }, [selectedDayIndex, checked]);

  const handleToggle = (di, ei) => {
    const k = `${di}-${ei}`;
    setChecked(p => ({ ...p, [k]: !p[k] }));
  };

  const handleResetClick = () => {
    if (resetState === "idle") {
      setResetState("confirm");
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setResetState("idle"), 3000);
    } else {
      setChecked({});
      setSelectedDayIndex(0);
      localStorage.removeItem("fit_trak_checked");
      localStorage.removeItem("fit_trak_day");
      setResetState("idle");
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    }
  };

  const currentDay = routine[selectedDayIndex];
  const dayExercises = currentDay.exercises || [];
  const dayDoneCount = dayExercises.filter((_, ei) => checked[`${selectedDayIndex}-${ei}`]).length;
  const progressPercent = currentDay.isRest ? 100 : Math.round((dayDoneCount / dayExercises.length) * 100);
  const totalExercises = routine.reduce((s, d) => s + (d.exercises ? d.exercises.length : 0), 0);
  const totalDone = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{
      height: "100vh",
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>
      <Header 
        totalDone={totalDone} 
        totalExercises={totalExercises} 
        onReset={handleResetClick} 
        resetState={resetState} 
      />
      
      <DaySelector 
        selectedIndex={selectedDayIndex} 
        onSelect={setSelectedDayIndex} 
      />

      <main ref={listRef} style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px",
        paddingBottom: "40px"
      }}>
        <ProgressCard 
          label={currentDay.label} 
          focus={currentDay.focus} 
          progress={progressPercent} 
          accent={currentDay.color}
        />

        {currentDay.note && (
             <div style={{
                background: `${currentDay.color}08`,
                borderLeft: `4px solid ${currentDay.color}`,
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "24px",
                fontSize: "14px",
                lineHeight: "1.5",
                display: "flex",
                gap: "12px"
             }}>
                <span style={{ fontSize: "18px" }}>⚡</span>
                {currentDay.note}
             </div>
        )}

        {currentDay.isRest ? (
          <RestDayView />
        ) : (
          <div className="animate-list">
            {dayExercises.map((ex, ei) => (
              <ExerciseItem 
                key={ei}
                ex={ex}
                isDone={!!checked[`${selectedDayIndex}-${ei}`]}
                onToggle={() => handleToggle(selectedDayIndex, ei)}
                accent={currentDay.color}
              />
            ))}
          </div>
        )}

        <div style={{ padding: "60px 0", textAlign: "center", opacity: 0.5 }}>
           <div style={{ fontSize: "11px", letterSpacing: "2px", fontWeight: "700" }}>END OF ROUTINE</div>
        </div>
      </main>
    </div>
  );
}
