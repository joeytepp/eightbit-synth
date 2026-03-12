import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Tone from "tone";
import {
  INITIAL_NOTE_VALUES,
  ARTIST_LOCAL_STORAGE_KEY,
  TITLE_LOCAL_STORAGE_KEY,
  TEMPO_LOCAL_STORAGE_KEY,
  DEFAULT_TEMPO,
  type WaveformType,
  WAVEFORM_LOCAL_STORAGE_KEY,
  DEFAULT_WAVEFORM,
  ATTACK_LOCAL_STORAGE_KEY,
  DEFAULT_ATTACK,
  ATTACK_MIN,
  ATTACK_MAX,
  NOTE_DURATION_LOCAL_STORAGE_KEY,
  DEFAULT_NOTE_DURATION,
  NOTE_DURATION_MIN,
  NOTE_DURATION_MAX,
} from "../constants";
import { decodeSharePayload } from "../utils/shareUrl";

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
        (t as TrackData).notes.every((n) => typeof n === "number"),
    );
    return valid ? (parsed as TrackData[]) : null;
  } catch {
    return null;
  }
}

export interface TrackContextValue {
  tracks: TrackData[];
  title: string;
  artist: string;
  tempo: number;
  waveform: WaveformType;
  attack: number;
  noteDuration: number;
  setTitle: (title: string) => void;
  setArtist: (artist: string) => void;
  setTempo: (tempo: number) => void;
  setWaveform: (waveform: WaveformType) => void;
  setAttack: (attack: number) => void;
  setNoteDuration: (noteDuration: number) => void;
  addTrack: () => void;
  removeTrack: (id: string) => void;
  addNote: (trackId: string) => void;
  removeNote: (trackId: string, index: number) => void;
  changeNote: (trackId: string, index: number, newMidi: number) => void;
  playSequence: () => Promise<void>;
  resetContext: () => void;
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

  const [title, setTitle] = useState(() => {
    return localStorage.getItem(TITLE_LOCAL_STORAGE_KEY) ?? "";
  });
  const [artist, setArtist] = useState(() => {
    return localStorage.getItem(ARTIST_LOCAL_STORAGE_KEY) ?? "";
  });

  const [tempo, setTempoState] = useState(() => {
    const stored = localStorage.getItem(TEMPO_LOCAL_STORAGE_KEY);
    if (stored == null) return DEFAULT_TEMPO;
    const n = Number(stored);
    return Number.isFinite(n) && n > 0 && n <= 300 ? n : DEFAULT_TEMPO;
  });

  const setTempo = useCallback((value: number) => {
    const clamped = Math.max(1, Math.min(300, Math.round(value)));
    setTempoState(clamped);
  }, []);

  const [waveform, setWaveformState] = useState<WaveformType>(() => {
    const stored = localStorage.getItem(WAVEFORM_LOCAL_STORAGE_KEY);
    if (
      stored !== "sine" &&
      stored !== "triangle" &&
      stored !== "square" &&
      stored !== "sawtooth"
    )
      return DEFAULT_WAVEFORM;
    return stored;
  });
  const setWaveform = useCallback((value: WaveformType) => {
    setWaveformState(value);
  }, []);

  const [attack, setAttackState] = useState(() => {
    const stored = localStorage.getItem(ATTACK_LOCAL_STORAGE_KEY);
    if (stored == null) return DEFAULT_ATTACK;
    const n = Number(stored);
    return Number.isFinite(n) && n >= ATTACK_MIN && n <= ATTACK_MAX
      ? n
      : DEFAULT_ATTACK;
  });
  const setAttack = useCallback((value: number) => {
    const clamped = Math.max(ATTACK_MIN, Math.min(ATTACK_MAX, value));
    setAttackState(clamped);
  }, []);

  const [noteDuration, setNoteDurationState] = useState(() => {
    const stored = localStorage.getItem(NOTE_DURATION_LOCAL_STORAGE_KEY);
    if (stored == null) return DEFAULT_NOTE_DURATION;
    const n = Number(stored);
    return Number.isFinite(n) &&
      n >= NOTE_DURATION_MIN &&
      n <= NOTE_DURATION_MAX
      ? n
      : DEFAULT_NOTE_DURATION;
  });
  const setNoteDuration = useCallback((value: number) => {
    const clamped = Math.max(
      NOTE_DURATION_MIN,
      Math.min(NOTE_DURATION_MAX, value),
    );
    setNoteDurationState(clamped);
  }, []);

  const resetContext = useCallback(() => {
    setTracks([createInitialTrack()]);
    setTitle("");
    setArtist("");
    setTempoState(DEFAULT_TEMPO);
    setWaveformState(DEFAULT_WAVEFORM);
    setAttackState(DEFAULT_ATTACK);
    setNoteDurationState(DEFAULT_NOTE_DURATION);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem(TITLE_LOCAL_STORAGE_KEY, title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem(ARTIST_LOCAL_STORAGE_KEY, artist);
  }, [artist]);

  useEffect(() => {
    localStorage.setItem(TEMPO_LOCAL_STORAGE_KEY, String(tempo));
  }, [tempo]);

  useEffect(() => {
    localStorage.setItem(WAVEFORM_LOCAL_STORAGE_KEY, waveform);
  }, [waveform]);

  useEffect(() => {
    localStorage.setItem(ATTACK_LOCAL_STORAGE_KEY, String(attack));
  }, [attack]);

  useEffect(() => {
    localStorage.setItem(NOTE_DURATION_LOCAL_STORAGE_KEY, String(noteDuration));
  }, [noteDuration]);

  // Apply share URL payload to context on initial load
  const appliedShareRef = useRef(false);
  useEffect(() => {
    if (appliedShareRef.current) return;
    appliedShareRef.current = true;
    const payload = decodeSharePayload(
      window.location.href.split("/").pop() || "",
    );
    if (payload) {
      setTitle(payload.title);
      setArtist(payload.artist);
    }
  }, [setTitle, setArtist]);

  const playSequence = useCallback(async () => {
    await Tone.start();

    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    Tone.getTransport().bpm.value = tempo;

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: waveform },
      envelope: { attack },
    }).toDestination();
    const secondsPerBeat = 60 / tempo;

    tracks.forEach((track) => {
      track.notes.forEach((note, index) => {
        Tone.getTransport().schedule((time) => {
          synth.triggerAttackRelease(
            Tone.Frequency(note, "midi").toNote(),
            noteDuration,
            time,
            0.8,
          );
        }, index * secondsPerBeat);
      });
    });

    Tone.getTransport().start();
  }, [tracks, tempo, waveform, attack, noteDuration]);

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
        t.id === trackId ? { ...t, notes: [...t.notes, 60] } : t,
      ),
    );
  }, []);

  const removeNote = useCallback((trackId: string, index: number) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? { ...t, notes: t.notes.filter((_, i) => i !== index) }
          : t,
      ),
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
        }),
      );
    },
    [],
  );

  const value: TrackContextValue = {
    tracks,
    title,
    artist,
    tempo,
    waveform,
    attack,
    noteDuration,
    setTitle,
    setArtist,
    setTempo,
    setWaveform,
    setAttack,
    setNoteDuration,
    addTrack,
    removeTrack,
    addNote,
    removeNote,
    changeNote,
    playSequence,
    resetContext,
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
