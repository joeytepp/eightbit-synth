import React from "react";

type BarProps = {
  notes: number[][];
};
export default function Bar({ notes }: BarProps) {
  return <div>Bar: {notes.length}</div>;
}
