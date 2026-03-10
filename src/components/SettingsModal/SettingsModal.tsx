import React from "react";
import { useTrackContext } from "../../contexts/TrackContext";
import {
  type WaveformType,
  WAVEFORM_OPTIONS,
  ATTACK_MIN,
  ATTACK_MAX,
  NOTE_DURATION_MIN,
  NOTE_DURATION_MAX,
} from "../../constants";

export default function SettingsModal() {
  // TODO: Implement using new context
  const {
    tempo,
    setTempo,
    waveform,
    setWaveform,
    attack,
    setAttack,
    noteDuration,
    setNoteDuration,
  } = useTrackContext();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      <h2>Settings</h2>
      <div>
        <label htmlFor="tempo">Tempo (BPM): </label>
        <input
          type="number"
          id="tempo"
          min={1}
          max={300}
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="waveform">Waveform: </label>
        <select
          id="waveform"
          value={waveform}
          onChange={(e) => setWaveform(e.target.value as WaveformType)}
        >
          {WAVEFORM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="attack">Attack (s): </label>
        <input
          type="number"
          id="attack"
          min={ATTACK_MIN}
          max={ATTACK_MAX}
          step={0.01}
          value={attack}
          onChange={(e) => setAttack(Number(e.target.value))}
        />
        <span
          style={{ marginLeft: "0.25rem", fontSize: "0.9em", color: "#666" }}
        >
          Softer onset when higher
        </span>
      </div>
      <div>
        <label htmlFor="noteDuration">Note duration (s): </label>
        <input
          type="number"
          id="noteDuration"
          min={NOTE_DURATION_MIN}
          max={NOTE_DURATION_MAX}
          step={0.05}
          value={noteDuration}
          onChange={(e) => setNoteDuration(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
