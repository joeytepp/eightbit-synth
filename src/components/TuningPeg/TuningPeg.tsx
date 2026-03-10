import React, { useCallback } from "react";
import Cell from "../Cell/Cell";
import { PEG_CELL_COUNT } from "../../constants";

const ALLOWED_LETTERS = "ABCDEF";

type TuningPegProps = {
  note: string;
  letter: string;
  onChangeLetter: (letter: string) => void;
  onCellChange: (cellIndex: number, value: string) => void;
  onCellKeyDown: (
    cellIndex: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  onCellFocus: (cellIndex: number) => void;
  onCellBlur: (cellIndex: number) => void;
  cells: Record<string, string[]>;
  focusedCell: string | null;
  registerCellRef?: (cellKey: string, el: HTMLInputElement | null) => void;
};

export default function TuningPeg({
  note,
  letter,
  onChangeLetter,
  onCellChange,
  onCellKeyDown,
  onCellFocus,
  onCellBlur,
  cells,
  focusedCell,
  registerCellRef,
}: TuningPegProps) {
  const handlePegLetterChange = useCallback(
    (pegKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const upper = raw.toUpperCase();
      const last = upper.slice(-1);
      if (last === "" || ALLOWED_LETTERS.includes(last)) {
        onChangeLetter(last);
      }
    },
    [onChangeLetter],
  );

  const handlePegKeyDown = useCallback(
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
        onChange={(e) => handlePegLetterChange(note, e)}
        onKeyDown={handlePegKeyDown}
        style={{
          width: "1.5em",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      />
      :{" "}
      <div style={{ display: "flex", gap: "0.25rem" }}>
        {Array.from({ length: PEG_CELL_COUNT }).map((_, i) => {
          const cellKey = `${note}-${i}`;
          return (
            <Cell
              key={i}
              cellKey={cellKey}
              cellIndex={i}
              value={cells[note]?.[i] ?? "-"}
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
