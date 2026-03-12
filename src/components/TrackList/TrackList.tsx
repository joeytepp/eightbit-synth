import React from "react";
import TuningPeg from "../TuningPeg/TuningPeg";
import { GUITAR_STRING_ORDER } from "../../constants";
import { usePegContext } from "../../contexts/PegContext";

export default function TrackList() {
  const { playAllNotes, stopPlayback, isPlaying } = usePegContext();

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <button type="button" onClick={playAllNotes}>
          ▶️ Play
        </button>
        {isPlaying && (
          <button type="button" onClick={stopPlayback}>
            ⏹️ Stop
          </button>
        )}
      </div>
      <div id="tuning-pegs">
        {GUITAR_STRING_ORDER.map((note) => (
          <TuningPeg key={note} note={note} />
        ))}
      </div>
    </div>
  );
}
