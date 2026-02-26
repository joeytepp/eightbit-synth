import React, { useState } from "react";
import { useModal } from "../../contexts/ModalContext";
import { encodeSharePayload } from "../../utils/shareUrl";
import { useTrackContext } from "../../contexts/TrackContext";

export default function ShareModal() {
  const { closeModal } = useModal();

  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const { tracks } = useTrackContext();

  return (
    <div
      style={{
        padding: "0 1rem 1rem",
        margin: "0 auto",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
      }}
    >
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
          <button
            onClick={() => {
              const shareUrl = encodeSharePayload({
                title,
                artist,
                tracks: tracks,
              });

              window.location.href = shareUrl;
            }}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
