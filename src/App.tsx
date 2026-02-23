import React, { useState, useRef } from "react";

import useSynth from "./hooks/use-synth";

const MidiPlayer: React.FC = () => {
  const { notes, setNotes, generateMidi, playMidi, midiData } = useSynth();

  return (
    <div style={{ padding: "2rem" }}>
      <h2>MIDI Generator & Player</h2>

      {notes.map((note, index) => (
        <div key={index}>
          <p>{note}</p>
          <input
            key={note}
            type="range"
            min={0}
            max={1000}
            value={note}
            onChange={(e) =>
              setNotes((prev) => [
                ...prev.slice(0, index),
                e.target.valueAsNumber,
                ...prev.slice(index + 1),
              ])
            }
          />
        </div>
      ))}
      <br />
      <button onClick={generateMidi}>Generate MIDI</button>

      <button
        onClick={playMidi}
        disabled={!midiData}
        style={{ marginLeft: "1rem" }}
      >
        Play MIDI
      </button>
    </div>
  );
};

export default MidiPlayer;
