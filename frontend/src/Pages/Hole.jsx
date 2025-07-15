import "../index.css";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../Button";

const holeData = [
  { yards: 450, par: 4 },
  { yards: 380, par: 4 },
  { yards: 520, par: 5 },
  { yards: 175, par: 3 },
  { yards: 405, par: 4 },
  { yards: 390, par: 4 },
  { yards: 160, par: 3 },
  { yards: 525, par: 5 },
  { yards: 430, par: 4 },
  { yards: 445, par: 4 },
  { yards: 180, par: 3 },
  { yards: 560, par: 5 },
  { yards: 395, par: 4 },
  { yards: 415, par: 4 },
  { yards: 155, par: 3 },
  { yards: 535, par: 5 },
  { yards: 465, par: 4 },
  { yards: 175, par: 3 }
];

export default function Hole() {
  const { holeNumber } = useParams();
  const holeIdx = Number(holeNumber);
  const { yards, par } = holeData[holeIdx - 1];

  const [gir, setGir] = useState(false);
  const [fir, setFir] = useState(false);
  const [putts, setPutts] = useState(0);
  const [score, setScore] = useState(par);

  return (
    <div className="card">
      <h1>Hole {holeNumber}</h1>
      <p style={{ color: "#448071" }}>
        Par {par}: {yards} Yards </p>

      <label>
        Green in Regulation
        <div className="gir-grid">
          <button
            className={gir ? "selected" : ""}
            onClick={() => setGir(true)}
          >
            Yes
          </button>
          <button
            className={!gir ? "selected" : ""}
            onClick={() => setGir(false)}
          >
            No
          </button>
        </div>
      </label>

      <label>
        Fairway Hit
        <div className="fir-grid">
          <button
            className={fir ? "selected" : ""}
            onClick={() => setFir(true)}
          >
            Yes
          </button>
          <button
            className={!fir ? "selected" : ""}
            onClick={() => setFir(false)}
          >
            No
          </button>
        </div>
      </label>

      <label>
        Putts
        <div className="putts-grid">
          {[0, 1, 2, 3, 4].map(n => (
            <button
              key={n}
              className={putts === n ? "selected" : ""}
              onClick={() => setPutts(n)}
            >
              {n === 4 ? "≥4" : n}
            </button>
          ))}
        </div>
      </label>

      <label>
        Score:
        <div className="score-grid">
          {Array.from({ length: par + 3 }, (_, i) => i + 1).map(val => (
            <button
              key={val}
              className={score === val ? "selected" : ""}
              onClick={() => setScore(val)}
            >
              {val}
            </button>
          ))}
        </div>
      </label>

       <div className="nav-buttons">
        {holeIdx > 1 && (
          <Button
            txt="Prev Hole"
            page={`/holes/${holeIdx - 1}`}
          />
        )}
        <Button
          txt={holeIdx < 18 ? "Next Hole" : "Finish Round"}
          page={holeIdx < 18 ? `/holes/${holeIdx + 1}` : "/"}
        />
      </div>
    </div>
  );
}
