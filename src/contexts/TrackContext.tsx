import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import * as Tone from "tone";
import { INITIAL_NOTE_VALUES } from "../constants";

export interface TrackData {
  id: string;
  notes: number[];
}

const STORAGE_KEY = "synth-project-tracks";

function loadTracksFromStorage(): TrackData[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const valid = parsed.every(
      (t): t is TrackData =>
        t != null &&
        typeof t === "object" &&
        typeof (t as TrackData).id === "string" &&
        Array.isArray((t as TrackData).notes) &&
        (t as TrackData).notes.every((n) => typeof n === "number")
    );
    return valid ? (parsed as TrackData[]) : null;
  } catch {
    return null;
  }
}

export interface TrackContextValue {
  tracks: TrackData[];
  addTrack: () => void;
  removeTrack: (id: string) => void;
  addNote: (trackId: string) => void;
  removeNote: (trackId: string, index: number) => void;
  changeNote: (trackId: string, index: number, newMidi: number) => void;
  playSequence: () => Promise<void>;
}

export interface TrackActions {
  notes: number[];
  addNote: () => void;
  removeNote: (index: number) => void;
  changeNote: (index: number, newMidi: number) => void;
}

const TrackContext = createContext<TrackContextValue | null>(null);

function createInitialTrack(): TrackData {
  return {
    id: crypto.randomUUID(),
    notes: [...INITIAL_NOTE_VALUES],
  };
}

export function TrackProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<TrackData[]>(() => {
    const stored = loadTracksFromStorage();
    return stored ?? [createInitialTrack()];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  }, [tracks]);

  const playSequence = useCallback(async () => {
    await Tone.start();

    Tone.getTransport().stop();
    Tone.getTransport().cancel();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();

    tracks.forEach((track) => {
      track.notes.forEach((note, index) => {
        Tone.getTransport().schedule((time) => {
          synth.triggerAttackRelease(
            Tone.Frequency(note, "midi").toNote(),
            0.45,
            time,
            0.8,
          );
        }, index * 0.5);
      });
    });

    Tone.getTransport().start();
  }, [tracks]);

  const addTrack = useCallback(() => {
    setTracks((prev) => [...prev, createInitialTrack()]);
  }, []);

  const removeTrack = useCallback((id: string) => {
    setTracks((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const addNote = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, notes: [...t.notes, 60] } : t
      )
    );
  }, []);

  const removeNote = useCallback((trackId: string, index: number) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? { ...t, notes: t.notes.filter((_, i) => i !== index) }
          : t
      )
    );
  }, []);

  const changeNote = useCallback(
    (trackId: string, index: number, newMidi: number) => {
      setTracks((prev) =>
        prev.map((t) => {
          if (t.id !== trackId) return t;
          const updated = [...t.notes];
          updated[index] = newMidi;
          return { ...t, notes: updated };
        })
      );
    },
    []
  );

  const value: TrackContextValue = {
    tracks,
    addTrack,
    removeTrack,
    addNote,
    removeNote,
    changeNote,
    playSequence,
  };

  return (
    <TrackContext.Provider value={value}>{children}</TrackContext.Provider>
  );
}

export function useTrackContext(): TrackContextValue {
  const ctx = useContext(TrackContext);
  if (ctx === null) {
    throw new Error("useTrackContext must be used within TrackProvider");
  }
  return ctx;
}

export function useTrack(trackId: string): TrackActions {
  const ctx = useTrackContext();
  const track = ctx.tracks.find((t) => t.id === trackId);

  if (!track) {
    return {
      notes: [],
      addNote: () => {},
      removeNote: () => {},
      changeNote: () => {},
    };
  }

  return {
    notes: track.notes,
    addNote: () => ctx.addNote(trackId),
    removeNote: (index: number) => ctx.removeNote(trackId, index),
    changeNote: (index: number, newMidi: number) =>
      ctx.changeNote(trackId, index, newMidi),
  };
}
