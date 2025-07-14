import "../index.css";
import Toggle from "../Toggle";
import Button from "../Button";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const puttOptions = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

const holeData = [
  { yards: 450, par: 4 }, // Hole 1
  { yards: 380, par: 4 }, // Hole 2
  { yards: 520, par: 5 }, // Hole 3
  { yards: 175, par: 3 }, // Hole 4
  { yards: 405, par: 4 }, // Hole 5
  { yards: 390, par: 4 }, // Hole 6
  { yards: 160, par: 3 }, // Hole 7
  { yards: 525, par: 5 }, // Hole 8
  { yards: 430, par: 4 }, // Hole 9
  { yards: 445, par: 4 }, // Hole 10
  { yards: 180, par: 3 }, // Hole 11
  { yards: 560, par: 5 }, // Hole 12
  { yards: 395, par: 4 }, // Hole 13
  { yards: 415, par: 4 }, // Hole 14
  { yards: 155, par: 3 }, // Hole 15
  { yards: 535, par: 5 }, // Hole 16
  { yards: 465, par: 4 }, // Hole 17
  { yards: 175, par: 3 }, // Hole 18
];

export default function Hole() {
  const { holeNumber } = useParams();
  const navigate = useNavigate();
  //find hole
  const { yards, par } = holeData[Number(holeNumber) - 1];

  const [gir, setGir] = useState(false);
  const [fir, setFir] = useState(false);
  const [putts, setPutts] = useState(0);
  const [score, setScore] = useState(0);

  const handleNext = () => {
    //ADD GET DATA
    navigate(`/holes/${Number(holeNumber) + 1}`);
  };

  return (
    <div>
      <h1>Hole {holeNumber}</h1>
      <h1>
        Yards: {yards} Par: {par}
      </h1>

      <label>
        GIR:
        <Toggle value={gir} onChange={setGir} labels={["no", "yes"]} />
      </label>
      <label>
        FIR:
        <Toggle value={gir} onChange={setGir} labels={["no", "yes"]} />
      </label>

      <label style={{ display: "block", margin: "1em 0" }}>
        Putts:
        <div className="putt-buttons">
          {[
            { label: "0", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "≥4", value: 4 },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={putts === opt.value ? "putt-btn selected" : "putt-btn"}
              onClick={() => setPutts(opt.value)}
              aria-pressed={putts === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </label>

      <label style={{ display: "block", margin: "1em 0" }}>
        Score:
        <div className="putt-buttons">
          {Array.from({ length: par + 4 }, (_, i) => i + 1).map(value => (
      <button
        key={value}
        type="button"
        className={score === value ? "putt-btn selected" : "putt-btn"}
        onClick={() => setScore(value)}
        aria-pressed={score === value}
      >
        {value}
      </button>
    ))}
    <div style={{ marginTop: '1.5em' }}>
            <Button
              txt={Number(holeNumber) < 18 ? 'Next Hole' : 'Finish Round'}
              page={Number(holeNumber) < 18
                ? `/holes/${Number(holeNumber) + 1}`
                : '/'}
            />
          </div>
        </div>
      </label>
    </div>
  );
}
