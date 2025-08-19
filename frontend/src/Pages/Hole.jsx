import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../index.css";

export default function Hole() {
  const { holeNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialHoleData = location.state?.holeData;
  // keep for saving, but do not display
  const courseName =
    location.state?.courseName ||
    location.state?.course?.name ||
    "Unknown Course";

  useEffect(() => {
    if (!initialHoleData) navigate("/start");
  }, [initialHoleData, navigate]);

  if (!initialHoleData) {
    return <div className="card">Loading...</div>;
  }

  const [workingData, setWorkingData] = useState(initialHoleData);

  const idx = Number(holeNumber) - 1;
  if (idx < 0 || idx >= workingData.length) {
    return <div className="card">Hole not found.</div>;
  }

  const current = workingData[idx] || {};
  const { yards, par } = current;

  const [gir, setGir] = useState(current.greenInReg ?? false);
  const [fir, setFir] = useState(current.fairwayHit ?? false);
  const [putts, setPutts] = useState(current.putts ?? 2);
  const [score, setScore] = useState(current.score ?? (par ?? 4));

  // Resync on hole change
  useEffect(() => {
    const h = workingData[idx] || {};
    setGir(h.greenInReg ?? false);
    setFir(h.fairwayHit ?? false);
    setPutts(h.putts ?? 2);
    setScore(h.score ?? (h.par ?? 4));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // Persist current hole state in working copy
  useEffect(() => {
    setWorkingData((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], greenInReg: gir, fairwayHit: fir, putts, score };
      return updated;
    });
  }, [gir, fir, putts, score, idx]);

  const handlePrev = () => {
    if (idx > 0) {
      navigate(`/holes/${idx}`, { state: { holeData: workingData, courseName } });
    }
  };

  const handleNext = async () => {
    if (idx + 1 < workingData.length) {
      navigate(`/holes/${idx + 2}`, { state: { holeData: workingData, courseName } });
    } else {
      try {
        await finishRound();
        navigate("/rounds");
      } catch (e) {
        console.error("Failed to save round:", e);
      }
    }
  };

  async function finishRound() {
    const token = localStorage.getItem("gt_token");
    if (!token) throw new Error("Not logged in");

    const payload = {
      courseName, // stored/sent, not shown in UI
      holes: workingData.map((h, i) => ({
        holeNumber: h.holeNumber ?? i + 1,
        yards: h.yards || 0,
        par: h.par ?? null,
        score: h.score ?? null,
        putts: h.putts ?? null,
        fairwayHit: h.fairwayHit ?? null,
        greenInReg: h.greenInReg ?? null,
      })),
      completedAt: new Date().toISOString(),
    };

    const res = await fetch("http://127.0.0.1:8080/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Create round failed");
    }
    return true;
  }

  function getMarkStyle(val) {
    const rel = val - (par ?? 4);
    const base = {
      display: "grid",
      placeItems: "center",
      width: 28,
      height: 28,
      lineHeight: "28px",
      fontWeight: 700,
      boxShadow: "none",
      borderRadius: 6,
    };

    if (rel <= -2) {
      return {
        ...base,
        borderRadius: "50%",
        boxShadow:
          `0 0 0 2px currentColor inset, 0 0 0 4px #fff inset, 0 0 0 6px currentColor inset`,
      };
    }
    if (rel === -1) {
      // Birdie -> one circle
      return {
        ...base,
        borderRadius: "50%",
        boxShadow: `0 0 0 2px currentColor inset`,
      };
    }
    if (rel === 0) {
      // Par -> nothing
      return base;
    }
    if (rel === 1) {
      // Bogey -> one square
      return {
        ...base,
        boxShadow: `0 0 0 2px currentColor inset`,
      };
    }
    if (rel >= 2) {
      // Double+ -> two squares
      return {
        ...base,
        boxShadow:
          `0 0 0 2px currentColor inset, 0 0 0 4px #fff inset, 0 0 0 6px currentColor inset`,
      };
    }
    return base;
  }

  const green = "#448071";

  return (
    <div className="card">
      
      <h1>Hole {holeNumber}</h1>

      <p style={{ color: green, fontSize: "1.5rem" }}>
        Par {par}: {yards} Yards
      </p>

      <div>
        Green in Regulation
        <div className="gir-grid">
          <button className={gir ? "selected" : ""} onClick={() => setGir(true)}>Yes</button>
          <button className={!gir ? "selected" : ""} onClick={() => setGir(false)}>No</button>
        </div>
      </div>

      <div>
        Fairway Hit
        <div className="fir-grid">
          <button className={fir ? "selected" : ""} onClick={() => setFir(true)}>Yes</button>
          <button className={!fir ? "selected" : ""} onClick={() => setFir(false)}>No</button>
        </div>
      </div>

      <div>
        Putts
        <div className="putts-grid">
          {[0, 1, 2, 3, 4].map((n) => (
            <button key={n} className={putts === n ? "selected" : ""} onClick={() => setPutts(n)}>
              {n === 4 ? "≥4" : n}
            </button>
          ))}
        </div>
      </div>

      <div>
        Score
        <div className="score-grid">
          {Array.from({ length: (par ?? 4) + 3 }, (_, i) => i + 1).map((val) => (
            <button
              key={val}
              className={score === val ? "selected" : ""}
              onClick={() => setScore(val)}
            >
              <span style={getMarkStyle(val)}>{val}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="nav-buttons" style={{ justifyContent: idx > 0 ? "space-between" : "flex-end" }}>
        {idx > 0 && <button onClick={handlePrev}>Prev Hole</button>}
        <button onClick={handleNext}>{idx + 1 < workingData.length ? "Next Hole" : "Finish Round"}</button>
      </div>
    </div>
  );
}
