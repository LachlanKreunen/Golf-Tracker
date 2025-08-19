import "../index.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ---------- utils ---------- */
function fmtDate(d) {
  try { return new Date(d).toLocaleDateString(); } catch { return ""; }
}
function sum(arr) { return arr.reduce((s, n) => s + (Number(n) || 0), 0); }
function totals(holes = []) {
  const front = holes.slice(0, 9);
  const back  = holes.slice(9, 18);
  const parF   = sum(front.map(h => h.par));
  const parB   = sum(back.map(h => h.par));
  const grossF = sum(front.map(h => h.score));
  const grossB = sum(back.map(h => h.score));
  return { parTotal: parF + parB, grossTotal: grossF + grossB, grossF, grossB };
}
function relToPar(par, score) {
  if (score == null || par == null) return null;
  const d = Number(score) - Number(par);
  if (d <= -2) return "eagle";
  if (d === -1) return "birdie";
  if (d === 0)  return "par";
  if (d === 1)  return "bogey";
  return "double";
}
function boxStyle(mark) {
  const base = {
    width: 36, height: 36,
    display: "grid", placeItems: "center",
    border: "1px solid #e6ecec",
    background: "#fff",
    fontWeight: 700,
    borderRadius: 8,
    cursor: "pointer",
  };
  const green = "#448071";
  switch (mark) {
    case "birdie": return { ...base, borderRadius: "50%", boxShadow: `0 0 0 2px ${green} inset` };
    case "eagle":  return { ...base, borderRadius: "50%", boxShadow: `0 0 0 2px ${green} inset, 0 0 0 4px #fff inset, 0 0 0 6px ${green} inset` };
    case "bogey":  return { ...base, boxShadow: `0 0 0 2px ${green} inset` };
    case "double": return { ...base, boxShadow: `0 0 0 2px ${green} inset, 0 0 0 4px #fff inset, 0 0 0 6px ${green} inset` };
    default: return base;
  }
}

/* ---------- component ---------- */
const Rounds = () => {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [inspect, setInspect] = useState(null);

  // One-time cleanup of any legacy client-stored rounds
  useEffect(() => {
    try { localStorage.removeItem("rounds"); } catch {}
  }, []);

  const refetchRounds = useCallback(async () => {
    const token = localStorage.getItem("gt_token");
    if (!token) { navigate("/"); return; }
    setLoading(true);
    setLoadErr("");
    try {
      const res = await fetch("http://127.0.0.1:8080/rounds", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data; try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
      if (!res.ok) throw new Error(data?.error || "Failed to load rounds");
      const raw = Array.isArray(data.rounds) ? data.rounds : [];
      // Show only documents that clearly came from Mongo (have an _id)
      const fromDb = raw.filter(r => r && (r._id || r._id?.$oid));
      setRounds(fromDb);
    } catch (e) {
      setLoadErr(e.message || "Failed to load rounds");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { refetchRounds(); }, [refetchRounds]);

  async function handleDelete(roundId) {
    const ok = window.confirm("Delete this round? This cannot be undone.");
    if (!ok) return;

    const token = localStorage.getItem("gt_token");
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8080/rounds/${roundId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Delete failed");
      // Re-sync with server truth
      await refetchRounds();
    } catch (err) {
      console.error("Delete error:", err);
      // Keep UI unchanged; no error HTML is surfaced
    }
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", padding: "8px 12px" }}>
      {/* Hole detail overlay */}
      {inspect && (
        <div
          onClick={(e)=>{ if(e.target === e.currentTarget) setInspect(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "grid", placeItems: "center", zIndex: 50, padding: 16 }}
        >
          <div
            onClick={(e)=>e.stopPropagation()}
            style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: 16, border: "1px solid #e7eef0", boxShadow: "0 8px 30px rgba(15,30,60,.18)", padding: 20 }}
          >
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
              <div style={{fontWeight:700}}>{inspect.round?.courseName ?? "Course"}</div>
              <div style={{fontSize:12, opacity:.7}}>
                {(inspect.round?.date && new Date(inspect.round.date).toLocaleDateString()) || ""}
              </div>
            </div>

            <h3 style={{margin:"8px 0 12px 0"}}>Hole {inspect.hole?.holeNumber ?? (inspect.index!=null ? inspect.index+1 : "?")}</h3>

            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
              <div><strong>Par:</strong> <span style={{color:"#448071"}}>{inspect.hole?.par ?? "—"}</span></div>
              <div><strong>Yards:</strong> <span style={{color:"#448071"}}>{inspect.hole?.yards ?? "—"}</span></div>
              <div><strong>Score:</strong> <span style={{color:"#448071"}}>{inspect.hole?.score ?? "—"}</span></div>
              <div><strong>Putts:</strong> <span style={{color:"#448071"}}>{inspect.hole?.putts ?? "—"}</span></div>
              <div><strong>Fairway Hit:</strong> <span style={{color:"#448071"}}>{inspect.hole?.fairwayHit === true ? "Yes" : inspect.hole?.fairwayHit === false ? "No" : "—"}</span></div>
              <div><strong>GIR:</strong> <span style={{color:"#448071"}}>{inspect.hole?.greenInReg === true ? "Yes" : inspect.hole?.greenInReg === false ? "No" : "—"}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Header: text-style Back + title */}
      <div style={{display:"flex",alignItems:"center",gap:"1rem",width:"100%",maxWidth:720,justifyContent:"flex-start"}}>
        <button
          className="logout-button"
          onClick={()=>navigate("/login")}
          style={{ position: "static" }}
        >
          Back
        </button>
        <h1 style={{ margin: "12px 0 4px", fontSize: 24, fontWeight: 800, textAlign: "center", width: "100%" }}>
          Round History
        </h1>
      </div>

      {loading && <p>Loading rounds…</p>}
      {loadErr && <p style={{ color: "#b00020", whiteSpace: "pre-wrap", maxWidth: 720 }}>{loadErr}</p>}
      {!loading && !loadErr && rounds.length === 0 && <p>No rounds yet</p>}

      {!loading && !loadErr && rounds.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%" }}>
          {rounds.map((r) => {
            const holes = Array.isArray(r.holes) ? r.holes : [];
            const { parTotal, grossTotal, grossF, grossB } = totals(holes);
            const toPar = grossTotal - parTotal;
            const toParStr = toPar > 0 ? `+${toPar}` : `${toPar}`;
            const id = r._id?.$oid || r._id;
            const front = holes.slice(0, 9);
            const back  = holes.slice(9, 18);

            return (
              <div
                key={id}
                style={{
                  width: "100%", maxWidth: 720,
                  border: "1px solid #e7eef0", borderRadius: 14,
                  padding: 12, background: "#fff",
                  boxShadow: "0 2px 10px rgba(15,30,60,.06)"
                }}
              >
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <div style={{fontWeight:700}}>{r.courseName || "Course"}</div>

                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <button
                      className="logout-button"
                      onClick={(e)=>{ e.stopPropagation(); handleDelete(id); }}
                      style={{ position:"static", color:"#b00020" }}
                      title="Delete round"
                    >
                      Delete
                    </button>
                    <div style={{opacity:.7,fontSize:".9rem"}}>{fmtDate(r.startedAt || r.createdAt)}</div>
                  </div>
                </div>

                <div style={{display:"flex",gap:16,flexWrap:"wrap",opacity:.9, margin:"6px 0 10px"}}>
                  <div>To Par <strong style={{color:"#448071"}}>{toParStr}</strong></div>
                  <div>Gross <strong style={{color:"#448071"}}>{grossTotal}</strong></div>
                </div>

                <NineTable
                  label="OUT"
                  holes={front}
                  total={grossF}
                  onCellClick={(hole,i)=>setInspect({ round: r, hole, index: i })}
                />
                <NineTable
                  label="IN"
                  holes={back}
                  total={grossB}
                  onCellClick={(hole,i)=>setInspect({ round: r, hole, index: i+9 })}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Rounds;

function NineTable({ label, holes, total, onCellClick }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 8, margin: "8px 0" }}>
      <div style={{ fontWeight: 600, opacity: 0.8, width: 42 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${holes.length}, 1fr)`, gap: 6 }}>
        {holes.map((h, i) => {
          const mark = relToPar(h.par, h.score);
          return (
            <div key={h.holeNumber ?? i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ fontSize: 12, opacity: 0.75, textAlign: "center" }}>Par {h.par ?? "—"}</div>
              <div
                style={boxStyle(mark)}
                onClick={(e) => { e.stopPropagation(); onCellClick && onCellClick(h, i); }}
                title="View hole details"
              >
                {h.score ?? "—"}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontWeight: 700, color: "#448071" }}> {total}</div>
    </div>
  );
}
