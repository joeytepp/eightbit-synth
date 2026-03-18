import React, { useCallback } from "react";
import Cell from "../Cell/Cell";
import { TAB_NOTE_COUNT } from "../../constants";
import { useTabString } from "../../contexts/TabContext";

const ALLOWED_LETTER_REGEX = /^([ACDG][#b]?|[BE][b]?|F[#]?)$/;

interface TabStringProps {
  note: string;
}

export default function TabString({ note }: TabStringProps) {
  const {
    letter,
    cells,
    setLetter,
    onCellChange,
    onCellKeyDown,
    onCellFocus,
    onCellBlur,
    focusedCell,
    registerCellRef,
  } = useTabString(note);

  const handleTuningLetterChange = useCallback(
    (pegKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        setLetter("");
        return;
      }
      const normalized = raw[0].toUpperCase() + raw.slice(1).toLowerCase();
      if (ALLOWED_LETTER_REGEX.test(normalized)) {
        setLetter(normalized);
      }
    },
    [setLetter],
  );

  const handleLetterKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key.length === 1 && !/^[A-Ga-g#b]$/.test(e.key)) {
        e.preventDefault();
      }
    },
    [],
  );

  return (
    <div
      key={note}
      style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
    >
      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        maxLength={2}
        value={letter}
        onChange={(e) => handleTuningLetterChange(note, e)}
        onKeyDown={handleLetterKeyDown}
        style={{
          width: "1.5em",
          textAlign: "center",
          textTransform: "none",
        }}
      />
      :{" "}
      <div style={{ display: "flex", gap: "0.25rem" }}>
        {Array.from({ length: TAB_NOTE_COUNT }).map((_, i) => {
          const cellKey = `${note}-${i}`;
          return (
            <Cell
              key={i}
              cellKey={cellKey}
              cellIndex={i}
              value={cells[i] ?? "-"}
              onChange={onCellChange}
              onKeyDown={onCellKeyDown}
              onFocus={onCellFocus}
              onBlur={onCellBlur}
              registerCellRef={registerCellRef}
              isFocused={focusedCell === cellKey}
            />
          );
        })}
      </div>
    </div>
  );
}
