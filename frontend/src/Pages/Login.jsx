import "../index.css";
import Button from "../Button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");

  const [stats, setStats] = useState({
    handicap: 0,
    averageScore: 0,
    averagePutts: 0,
    girPercent: 0,
    firPercent: 0,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("gt_user");
      if (!raw) return;
      const u = JSON.parse(raw);
      const first = (u?.first || "").trim();
      const last = (u?.last || "").trim();
      const user = (u?.username || "").trim();
      setDisplayName((first || last) ? `${first} ${last}`.trim() : user);
    } catch {
      localStorage.removeItem("gt_user");
      localStorage.removeItem("gt_token");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("gt_token");
        if (!token) return;

        const res = await fetch("http://127.0.0.1:8080/rounds", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) throw new Error(data?.error || "Failed to load rounds");
        const rounds = Array.isArray(data.rounds) ? data.rounds : [];

        let totalScores = 0;
        let totalPutts = 0;
        let roundsCount = 0;

        let girTrue = 0, girCount = 0;
        let firTrue = 0, firCount = 0;

        const differentials = [];
        let totalHoles = 0;

        for (const r of rounds) {
          const holes = Array.isArray(r.holes) ? r.holes : [];
          if (!holes.length) continue;

          const gross = holes.reduce((s, h) => s + (Number(h?.score) || 0), 0);
          const putts = holes.reduce((s, h) => s + (Number(h?.putts) || 0), 0);
          const parTotal = holes.reduce((s, h) => s + (Number(h?.par) || 0), 0);

          if (gross > 0) {
            totalScores += gross;
            roundsCount += 1;
          }

          totalPutts += putts;
          totalHoles += holes.length;

          for (const h of holes) {
            if (typeof h?.greenInReg === "boolean") {
              girCount += 1;
              if (h.greenInReg) girTrue += 1;
            }
            if (typeof h?.fairwayHit === "boolean") {
              firCount += 1;
              if (h.fairwayHit) firTrue += 1;
            }
          }

          if (parTotal > 0) {
            differentials.push(gross - parTotal);
          }
        }

        const averageScore = roundsCount ? totalScores / roundsCount : 0;
        const averagePutts = totalHoles ? totalPutts / totalHoles : 0;
        const girPercent = girCount ? (girTrue / girCount) * 100 : 0;
        const firPercent = firCount ? (firTrue / firCount) * 100 : 0;

        let handicap = 0;
        if (differentials.length) {
          const diffs = [...differentials].sort((a, b) => a - b);
          const n = diffs.length;
          let use = 1;
          if (n >= 20) use = 8;
          else if (n >= 15) use = 6;
          else if (n >= 10) use = 4;
          else if (n >= 7) use = 3;
          else if (n >= 5) use = 2;
          else use = 1;

          const used = diffs.slice(0, use);
          handicap = used.reduce((a, b) => a + b, 0) / used.length;
        }

        setStats({
          handicap: Number(handicap.toFixed(1)),
          averageScore: Number(averageScore.toFixed(1)),
          averagePutts: Number(averagePutts.toFixed(1)),
          girPercent: Number(girPercent.toFixed(1)),
          firPercent: Number(firPercent.toFixed(1)),
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  function handleLogout() {
    localStorage.removeItem("gt_user");
    localStorage.removeItem("gt_token");
    navigate("/");
  }

  return (
    <>
      <div className="card">
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
        {displayName && <div className="corner">{displayName}</div>}

        <div className="hc">
          <p>
            <span style={{ color: "#448071", fontWeight: "bold" }}>
  {stats.handicap < 0 ? `+${Math.abs(stats.handicap)}` : stats.handicap}
</span>{" "}
Handicap

          </p>
        </div>
        <div className="stats">
          <p>
            Average Score{" "}
            <span style={{ color: "#448071", fontWeight: "bold" }}>
              {stats.averageScore}
            </span>
          </p>
          <p>
            Average Putts{" "}
            <span style={{ color: "#448071", fontWeight: "bold" }}>
              {stats.averagePutts}
            </span>
          </p>
          <p>
            Green in Regulation{" "}
            <span style={{ color: "#448071", fontWeight: "bold" }}>
              {stats.girPercent}%
            </span>
          </p>
          <p>
            Fairway in Regulation{" "}
            <span style={{ color: "#448071", fontWeight: "bold" }}>
              {stats.firPercent}%
            </span>
          </p>
        </div>
        <div className="button-container">
          <Button txt="Round History" page="/rounds" />
          <Button txt="New Round" page="/start" />
        </div>
      </div>
    </>
  );
};

export default Login;
