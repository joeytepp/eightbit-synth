import React, { useState } from "react";
import { useModal } from "../../contexts/ModalContext";

export default function ShareModal() {
  const { closeModal } = useModal();

  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");

  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Share Song</h2>
        <button onClick={() => closeModal()}>X</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="song-name">Title: </label>
          <div>
            <input type="text" id="song-name" />
          </div>
        </div>
        <div>
          <label htmlFor="song-name">Artist: </label>
          <div>
            <input type="text" id="song-name" />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <button onClick={() => closeModal()}>Cancel</button>
          <button>Share</button>
        </div>
      </div>
    </div>
  );
}
