import { useState, useRef } from "react";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

export default function useSynth() {
  const [midiData, setMidiData] = useState<Uint8Array | null>(null);
  const [notes, setNotes] = useState<number[]>([
    60, 62, 64, 65, 67, 69, 71, 72,
  ]);

  const synthRef = useRef<Tone.PolySynth | null>(null);

  const generateMidi = () => {
    const midi = new Midi();
    const track = midi.addTrack();

    notes.forEach((note, index) => {
      track.addNote({
        midi: note,
        time: index * 0.5,
        duration: 0.45,
        velocity: 0.8,
      });
    });

    const bytes = midi.toArray();
    setMidiData(bytes);
  };

  const playMidi = async () => {
    if (!midiData) return;

    await Tone.start(); // Required for browser audio context

    // Stop and reset any current playback so each click starts from the beginning
    if (synthRef.current) {
      synthRef.current.releaseAll();
      synthRef.current.dispose();
      synthRef.current = null;
    }

    const midi = new Midi(midiData);

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synthRef.current = synth;

    const startTime = Tone.now();
    midi.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        synth.triggerAttackRelease(
          note.name,
          note.duration,
          startTime + note.time,
          note.velocity,
        );
      });
    });
  };

  return {
    generateMidi,
    midiData,
    playMidi,
    setNotes,
    notes,
  };
}
