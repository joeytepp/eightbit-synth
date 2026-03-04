import React from "react";
import ShareModal from "../ShareModal/ShareModal";
import { useModal } from "../../contexts/ModalContext";
import { useTrackContext } from "../../contexts/TrackContext";
import SettingsModal from "../SettingsModal/SettingsModal";

export default function Header() {
  const { openModal } = useModal();
  const { title, artist, resetContext } = useTrackContext();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {title && artist && (
          <p style={{ margin: 0, color: "AccentColor" }}>
            "{title}" by {artist}
          </p>
        )}
        <button type="button" onClick={resetContext} title="Reset project">
          Reset
        </button>
      </div>
      <div
        style={{
          padding: "1rem 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", flex: 1 }}>
            🎹 eightbit synth
          </h2>
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button onClick={() => openModal(<SettingsModal />)}>Settings</button>
        <button onClick={() => openModal(<ShareModal />)}>Share</button>
      </div>
    </div>
  );
}
