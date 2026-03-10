import React from "react";

type CellProps = {
  cellKey: string;
  cellIndex: number;
  value: string;
  onChange: (cellIndex: number, value: string) => void;
  onKeyDown: (
    cellIndex: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  onFocus: (cellIndex: number) => void;
  onBlur: (cellIndex: number) => void;
  registerCellRef?: (cellKey: string, el: HTMLInputElement | null) => void;
  isFocused: boolean;
};

export default function Cell({
  cellKey,
  cellIndex,
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  registerCellRef,
  isFocused,
}: CellProps) {
  return (
    <input
      ref={(el) => {
        registerCellRef?.(cellKey, el);
      }}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      maxLength={2}
      value={value}
      onChange={(e) => onChange(cellIndex, e.target.value)}
      onKeyDown={(e) => onKeyDown(cellIndex, e)}
      onFocus={(e) => {
        onFocus(cellIndex);
        e.target.select();
      }}
      onBlur={() => onBlur(cellIndex)}
      style={{
        width: "1.5em",
        textAlign: "center",
        padding: "2px 0",
        border: "none",
        outline: "none",
        background: isFocused ? "lightblue" : "transparent",
      }}
    />
  );
}
