import React, { useState, useCallback, useRef } from "react";
import * as Tone from "tone";
// import Track from "../Track/Track";
// import EmptyTrack from "../EmptyTrack/EmptyTrack";
import TuningPeg from "../TuningPeg/TuningPeg";
import {
  GUITAR_STRING_ORDER,
  GUITAR_OPEN_MIDI,
  PEG_CELL_COUNT,
} from "../../constants";

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
    return String(FRET_MAX);
  }

  return String(num);
}

export default function TrackList() {
  const [lettersByPeg, setLettersByPeg] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};

      GUITAR_STRING_ORDER.forEach((note) => {
        initial[note] = note.slice(0, -1).toUpperCase();
      });

      return initial;
    },
  );

  const [pegCells, setPegCells] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    GUITAR_STRING_ORDER.forEach((note) => {
      initial[note] = Array(PEG_CELL_COUNT).fill("-");
    });
    return initial;
  });

  const [focusedPegCell, setFocusedPegCell] = useState<string | null>(null);
  const pegCellRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handlePegCellChangeWithValue = useCallback(
    (note: string, cellIndex: number, value: string) => {
      const parsed = parseFretValue(value);

      setPegCells((prev) => {
        const next = { ...prev };
        const row = [...(next[note] ?? Array(PEG_CELL_COUNT).fill("-"))];

        row[cellIndex] = parsed;
        next[note] = row;
        return next;
      });
    },
    [],
  );

  const playAllNotes = useCallback(async () => {
    await Tone.start();
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const noteDuration = 0.2;
    const gap = 0.15;
    let scheduleTime = Tone.now();

    for (let fretIndex = 0; fretIndex < PEG_CELL_COUNT; fretIndex += 1) {
      const startTime = scheduleTime;

      PEG_ROW_ORDER.forEach((note) => {
        const openMidi = GUITAR_OPEN_MIDI[note];
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
        }
      });
      scheduleTime += noteDuration + gap;
    }
  }, [pegCells]);

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
        setPegCells((prev) => {
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

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "0.5rem",
        }}
      >
        <button type="button" onClick={playAllNotes}>
          ▶️ Play
        </button>
      </div>
      <div id="tuning-pegs">
        {GUITAR_STRING_ORDER.map((note) => (
          <TuningPeg
            key={note}
            note={note}
            letter={lettersByPeg[note] ?? note.slice(0, -1)}
            onChangeLetter={(letter) =>
              setLettersByPeg((prev) => ({ ...prev, [note]: letter }))
            }
            onCellChange={(cellIndex, value) =>
              handlePegCellChangeWithValue(note, cellIndex, value)
            }
            onCellKeyDown={(cellIndex, e) =>
              handlePegCellKeyDown(note, cellIndex, e)
            }
            onCellFocus={(cellIndex) =>
              setFocusedPegCell(`${note}-${cellIndex}`)
            }
            onCellBlur={() => setFocusedPegCell(null)}
            cells={pegCells}
            focusedCell={focusedPegCell}
            registerCellRef={(cellKey, el) => {
              pegCellRefs.current[cellKey] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}
