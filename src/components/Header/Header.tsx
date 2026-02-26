import React from "react";

export default function Header() {
  return (
    <div
      style={{
        padding: "1rem 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1>eightbit synth</h1>
      <button>Share</button>
    </div>
  );
}
