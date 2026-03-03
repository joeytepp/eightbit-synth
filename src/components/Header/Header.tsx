import React from "react";
import ShareModal from "../ShareModal/ShareModal";
import { useModal } from "../../contexts/ModalContext";
import { useTrackContext } from "../../contexts/TrackContext";

export default function Header() {
  const { openModal } = useModal();
  const { title, artist } = useTrackContext();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {title && artist && (
        <div style={{ marginBottom: "1rem", color: "AccentColor" }}>
          <p>
            "{title}" by {artist}
          </p>
        </div>
      )}
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
      <div>
        <button onClick={() => openModal(<ShareModal />)}>Share</button>
      </div>
    </div>
  );
}
