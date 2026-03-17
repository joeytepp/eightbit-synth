import React, { useCallback } from "react";
import Cell from "../Cell/Cell";
import { TAB_NOTE_COUNT } from "../../constants";
import { useTabString } from "../../contexts/TabContext";

const ALLOWED_LETTERS = "ABCDEFG";

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
      const upper = raw.toUpperCase();
      const last = upper.slice(-1);
      if (last === "" || ALLOWED_LETTERS.includes(last)) {
        setLetter(last);
      }
    },
    [setLetter],
  );

  const handleLetterKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key.toUpperCase();
      if (key.length === 1 && !ALLOWED_LETTERS.includes(key)) {
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
        maxLength={1}
        value={letter}
        onChange={(e) => handleTuningLetterChange(note, e)}
        onKeyDown={handleLetterKeyDown}
        style={{
          width: "1.5em",
          textAlign: "center",
          textTransform: "uppercase",
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
