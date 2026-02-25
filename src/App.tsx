import React, { useState } from "react";
import * as Tone from "tone";
import { INITIAL_NOTE_VALUES, NOTE_OPTIONS } from "../constants";

const InstantDynamicPlayer: React.FC = () => {
  const [notes, setNotes] = useState<number[]>(INITIAL_NOTE_VALUES);

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
