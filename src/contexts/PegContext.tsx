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
  GUITAR_STRING_ORDER,
  GUITAR_OPEN_MIDI,
  PEG_CELL_COUNT,
  PEG_LETTERS_STORAGE_KEY,
  PEG_CELLS_STORAGE_KEY,
  noteLetterToMidi,
  octaveFromStringKey,
} from "../constants";

const ALLOWED_CELL_CHARS = "0123456789-";
const FRET_MIN = 0;
const FRET_MAX = 60;

const PEG_ROW_ORDER: (keyof typeof GUITAR_OPEN_MIDI)[] = [
  ...GUITAR_STRING_ORDER,
];
const PEG_ROW_COUNT = PEG_ROW_ORDER.length;

function parseFretValue(value: string): string {
  if (value === "" || value === "-") return "-";

  const digits = value.replace(/\D/g, "");

  if (digits === "") return "-";

  const num = parseInt(digits, 10);

  if (Number.isNaN(num) || num < FRET_MIN) {
    return "-";
  }

  if (num > FRET_MAX) {
    return String(Math.floor(num / 10));
  }

  return String(num);
}

function getInitialLetters(): Record<string, string> {
  const initial: Record<string, string> = {};
  GUITAR_STRING_ORDER.forEach((note) => {
    initial[note] = note.slice(0, -1).toUpperCase();
  });
  return initial;
}

function getInitialCells(): Record<string, string[]> {
  const initial: Record<string, string[]> = {};
  GUITAR_STRING_ORDER.forEach((note) => {
    initial[note] = Array(PEG_CELL_COUNT).fill("-");
  });
  return initial;
}

function loadLettersFromStorage(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(PEG_LETTERS_STORAGE_KEY);
    if (raw == null) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (parsed == null || typeof parsed !== "object") return null;

    const obj = parsed as Record<string, unknown>;
    const result: Record<string, string> = {};
    for (const note of GUITAR_STRING_ORDER) {
      const v = obj[note];
      if (typeof v !== "string" || v.length > 1) return null;
      result[note] = v === "" ? note.slice(0, -1).toUpperCase() : v;
    }
    return result;
  } catch {
    return null;
  }
}

function loadCellsFromStorage(): Record<string, string[]> | null {
  try {
    const raw = localStorage.getItem(PEG_CELLS_STORAGE_KEY);
    if (raw == null) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (parsed == null || typeof parsed !== "object") return null;

    const obj = parsed as Record<string, unknown>;
    const result: Record<string, string[]> = {};
    for (const note of GUITAR_STRING_ORDER) {
      const row = obj[note];
      if (!Array.isArray(row) || row.length !== PEG_CELL_COUNT) return null;
      const valid = row.every(
        (c): c is string =>
          typeof c === "string" &&
          (c === "-" ||
            (parseInt(c, 10) >= FRET_MIN && parseInt(c, 10) <= FRET_MAX)),
      );
      if (!valid) return null;
      result[note] = row as string[];
    }
    return result;
  } catch {
    return null;
  }
}

export interface PegContextValue {
  lettersByPeg: Record<string, string>;
  pegCells: Record<string, string[]>;
  focusedPegCell: string | null;
  isPlaying: boolean;
  setLetter: (note: string, letter: string) => void;
  setPegCell: (note: string, cellIndex: number, value: string) => void;
  handlePegCellKeyDown: (
    note: string,
    cellIndex: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  setFocusedPegCell: (key: string | null) => void;
  registerCellRef: (cellKey: string, el: HTMLInputElement | null) => void;
  playAllNotes: () => Promise<void>;
  stopPlayback: () => void;
  resetPegContext: () => void;
  /** Apply challenge payload from URL (letters + cells). Clears focus. */
  applyChallengePayload: (
    lettersByPeg: Record<string, string>,
    pegCells: Record<string, string[]>,
  ) => void;
}

export interface PegStringActions {
  letter: string;
  cells: string[];
  setLetter: (letter: string) => void;
  onCellChange: (cellIndex: number, value: string) => void;
  onCellKeyDown: (
    cellIndex: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  onCellFocus: (cellIndex: number) => void;
  onCellBlur: () => void;
  focusedCell: string | null;
  registerCellRef: (cellKey: string, el: HTMLInputElement | null) => void;
}

const PegContext = createContext<PegContextValue | null>(null);

export function PegProvider({ children }: { children: ReactNode }) {
  const [lettersByPeg, setLettersByPegState] = useState<Record<string, string>>(
    () => loadLettersFromStorage() ?? getInitialLetters(),
  );

  const [pegCells, setPegCellsState] = useState<Record<string, string[]>>(
    () => loadCellsFromStorage() ?? getInitialCells(),
  );

  const [focusedPegCell, setFocusedPegCell] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const pegCellRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const activeSynthRef = useRef<Tone.PolySynth | null>(null);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setLetter = useCallback((note: string, letter: string) => {
    setLettersByPegState((prev) => ({ ...prev, [note]: letter }));
  }, []);

  const setPegCell = useCallback(
    (note: string, cellIndex: number, value: string) => {
      const parsed = parseFretValue(value);
      setPegCellsState((prev) => {
        const next = { ...prev };
        const row = [...(next[note] ?? Array(PEG_CELL_COUNT).fill("-"))];
        row[cellIndex] = parsed;
        next[note] = row;
        return next;
      });
    },
    [],
  );

  const handlePegCellKeyDown = useCallback(
    (
      note: string,
      cellIndex: number,
      e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      const key = e.key;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
        e.preventDefault();
        const rowIndex = PEG_ROW_ORDER.indexOf(note);
        if (rowIndex === -1) return;
        let nextRow = rowIndex;
        let nextCol = cellIndex;
        if (key === "ArrowLeft") {
          nextCol = (cellIndex - 1 + PEG_CELL_COUNT) % PEG_CELL_COUNT;
        } else if (key === "ArrowRight") {
          nextCol = (cellIndex + 1) % PEG_CELL_COUNT;
        } else if (key === "ArrowUp") {
          nextRow = (rowIndex - 1 + PEG_ROW_COUNT) % PEG_ROW_COUNT;
        } else {
          nextRow = (rowIndex + 1) % PEG_ROW_COUNT;
        }
        const nextNote = PEG_ROW_ORDER[nextRow];
        const nextCellKey = `${nextNote}-${nextCol}`;
        setFocusedPegCell(nextCellKey);
        requestAnimationFrame(() => {
          pegCellRefs.current[nextCellKey]?.focus();
          pegCellRefs.current[nextCellKey]?.select();
        });
        return;
      }
      if (key.length !== 1) return;
      if (ALLOWED_CELL_CHARS.includes(key)) {
        e.preventDefault();
        setPegCellsState((prev) => {
          const next = { ...prev };
          const row = [...(next[note] ?? Array(PEG_CELL_COUNT).fill("-"))];
          const current = row[cellIndex];
          const newValue =
            key === "-"
              ? "-"
              : parseFretValue(current === "-" ? key : current + key);
          row[cellIndex] = newValue;
          next[note] = row;
          return next;
        });
      } else {
        e.preventDefault();
      }
    },
    [],
  );

  const registerCellRef = useCallback(
    (cellKey: string, el: HTMLInputElement | null) => {
      pegCellRefs.current[cellKey] = el;
    },
    [],
  );

  const stopPlayback = useCallback(() => {
    if (activeSynthRef.current) {
      activeSynthRef.current.releaseAll();
      activeSynthRef.current.dispose();
      activeSynthRef.current = null;
    }
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAllNotes = useCallback(async () => {
    stopPlayback();
    await Tone.start();
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    activeSynthRef.current = synth;
    setIsPlaying(true);

    const noteDuration = 0.2;
    const gap = 0.15;
    let scheduleTime = Tone.now();
    let lastNoteTime = scheduleTime;

    for (let fretIndex = 0; fretIndex < PEG_CELL_COUNT; fretIndex += 1) {
      const startTime = scheduleTime;

      PEG_ROW_ORDER.forEach((note) => {
        const letter = lettersByPeg[note] ?? note.slice(0, -1);
        const octave = octaveFromStringKey(note);
        const openMidi =
          noteLetterToMidi(letter, octave) ?? GUITAR_OPEN_MIDI[note];
        const row = pegCells[note] ?? [];
        const cellValue = row[fretIndex];
        const fret = cellValue !== "-" ? parseInt(cellValue, 10) : null;

        if (
          fret !== null &&
          !Number.isNaN(fret) &&
          fret >= FRET_MIN &&
          fret <= FRET_MAX
        ) {
          const noteMidi = openMidi + fret;
          const freq = Tone.Frequency(noteMidi, "midi").toFrequency();
          synth.triggerAttackRelease(freq, noteDuration, startTime);
          lastNoteTime = startTime + noteDuration;
        }
      });
      scheduleTime += noteDuration + gap;
    }

    const remainingMs = Math.max(0, (lastNoteTime - Tone.now()) * 1000) + 100;
    playTimeoutRef.current = setTimeout(() => {
      activeSynthRef.current?.dispose();
      activeSynthRef.current = null;
      setIsPlaying(false);
    }, remainingMs);
  }, [pegCells, lettersByPeg, stopPlayback]);

  const resetPegContext = useCallback(() => {
    setLettersByPegState(getInitialLetters());
    setPegCellsState(getInitialCells());
    setFocusedPegCell(null);
  }, []);

  const applyChallengePayload = useCallback(
    (letters: Record<string, string>, cells: Record<string, string[]>) => {
      const safeLetters: Record<string, string> = {};
      const safeCells: Record<string, string[]> = {};
      GUITAR_STRING_ORDER.forEach((note) => {
        const l = letters[note];
        safeLetters[note] =
          typeof l === "string" && l.length <= 1
            ? l
            : note.slice(0, -1).toUpperCase();
        const row = cells[note];
        safeCells[note] =
          Array.isArray(row) && row.length === PEG_CELL_COUNT
            ? [...row]
            : Array(PEG_CELL_COUNT).fill("-");
      });
      setLettersByPegState(safeLetters);
      setPegCellsState(safeCells);
      setFocusedPegCell(null);
    },
    [],
  );

  useEffect(() => {
    localStorage.setItem(PEG_LETTERS_STORAGE_KEY, JSON.stringify(lettersByPeg));
  }, [lettersByPeg]);

  useEffect(() => {
    localStorage.setItem(PEG_CELLS_STORAGE_KEY, JSON.stringify(pegCells));
  }, [pegCells]);

  const value: PegContextValue = {
    lettersByPeg,
    pegCells,
    focusedPegCell,
    isPlaying,
    setLetter,
    setPegCell,
    handlePegCellKeyDown,
    setFocusedPegCell,
    registerCellRef,
    playAllNotes,
    stopPlayback,
    resetPegContext,
    applyChallengePayload,
  };

  return <PegContext.Provider value={value}>{children}</PegContext.Provider>;
}

export function usePegContext(): PegContextValue {
  const ctx = useContext(PegContext);
  if (ctx === null) {
    throw new Error("usePegContext must be used within PegProvider");
  }
  return ctx;
}

export function usePegString(note: string): PegStringActions {
  const ctx = usePegContext();

  return {
    letter: ctx.lettersByPeg[note] ?? note.slice(0, -1).toUpperCase(),
    cells: ctx.pegCells[note] ?? Array(PEG_CELL_COUNT).fill("-"),
    setLetter: (letter: string) => ctx.setLetter(note, letter),
    onCellChange: (cellIndex: number, value: string) =>
      ctx.setPegCell(note, cellIndex, value),
    onCellKeyDown: (cellIndex: number, e) =>
      ctx.handlePegCellKeyDown(note, cellIndex, e),
    onCellFocus: (cellIndex: number) =>
      ctx.setFocusedPegCell(`${note}-${cellIndex}`),
    onCellBlur: () => ctx.setFocusedPegCell(null),
    focusedCell: ctx.focusedPegCell,
    registerCellRef: ctx.registerCellRef,
  };
}
