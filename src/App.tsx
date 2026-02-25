import React, { useState } from "react";
import * as Tone from "tone";

const NOTE_OPTIONS = [
  { name: " ", midi: 0 },
  { name: "A2", midi: 45 },
  { name: "A#2", midi: 46 },
  { name: "B2", midi: 47 },
  { name: "C3", midi: 48 },
  { name: "C#3", midi: 49 },
  { name: "D3", midi: 50 },
  { name: "D#3", midi: 51 },
  { name: "E3", midi: 52 },
  { name: "F3", midi: 53 },
  { name: "F#3", midi: 54 },
  { name: "G3", midi: 55 },
  { name: "G#3", midi: 56 },
  { name: "A3", midi: 57 },
  { name: "A#3", midi: 58 },
  { name: "B3", midi: 59 },
  { name: "C4", midi: 60 },
  { name: "C#4", midi: 61 },
  { name: "D4", midi: 62 },
  { name: "D#4", midi: 63 },
  { name: "E4", midi: 64 },
  { name: "F4", midi: 65 },
  { name: "F#4", midi: 66 },
  { name: "G4", midi: 67 },
  { name: "G#4", midi: 68 },
  { name: "A4", midi: 69 },
  { name: "A#4", midi: 70 },
  { name: "B4", midi: 71 },
  { name: "C5", midi: 72 },
];

const InstantDynamicPlayer: React.FC = () => {
  // Initial 8 notes (C major scale)
  const [notes, setNotes] = useState<number[]>([
    60, 62, 64, 65, 67, 69, 71, 72,
  ]);

  const playSequence = async () => {
    await Tone.start();

    Tone.getTransport().stop();
    Tone.getTransport().cancel();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();

    notes.forEach((note, index) => {
      Tone.getTransport().schedule((time) => {
        synth.triggerAttackRelease(
          Tone.Frequency(note, "midi").toNote(),
          0.45,
          time,
          0.8,
        );
      }, index * 0.5);
    });

    Tone.getTransport().start();
  };

  const addNote = () => {
    setNotes([...notes, 60]);
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const changeNote = (index: number, newMidi: number) => {
    const updated = [...notes];
    updated[index] = newMidi;
    setNotes(updated);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dynamic MIDI Generator</h2>

      {notes.map((note, index) => (
        <div key={index} style={{ marginBottom: "0.5rem" }}>
          <select
            value={note}
            onChange={(e) => changeNote(index, Number(e.target.value))}
          >
            {NOTE_OPTIONS.map((option) => (
              <option key={option.midi} value={option.midi}>
                {option.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => removeNote(index)}
            style={{ marginLeft: "0.5rem" }}
          >
            Remove
          </button>
        </div>
      ))}

      <button onClick={addNote}>Add Note</button>

      <button onClick={playSequence} style={{ marginLeft: "1rem" }}>
        Generate & Play
      </button>
    </div>
  );
};

export default InstantDynamicPlayer;
