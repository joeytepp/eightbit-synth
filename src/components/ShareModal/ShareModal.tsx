"use client";

import { useEffect, useRef } from "react";
import { useModal } from "../../contexts/ModalContext";
import { decodeSharePayload, encodeSharePayload } from "../../utils/shareUrl";
import { useTrackContext } from "../../contexts/TrackContext";

export default function ShareModal() {
  const { closeModal } = useModal();
  const { tracks, title, artist, setTitle, setArtist } = useTrackContext();
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;

    const payload = decodeSharePayload(
      window.location.href.split("/").pop() || "",
    );
    if (payload) {
      setTitle(payload.title);
      setArtist(payload.artist);
    }
  }, [setTitle, setArtist]);

  return (
    <>
      {title && artist && (
        <div style={{ margin: "1rem", color: "AccentColor" }}>
          <p>
            "{title}" by {artist}
          </p>
        </div>
      )}

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
            <label htmlFor="song-title">Title: </label>
            <div>
              <input
                type="text"
                id="song-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="song-artist">Artist: </label>
            <div>
              <input
                type="text"
                id="song-artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
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
              disabled={!title || !artist}
              onClick={async () => {
                const shareUrl = encodeSharePayload({
                  title,
                  artist,
                  tracks: tracks,
                });

                await new Promise((resolve) => {
                  navigator.clipboard.writeText(
                    window.location.origin + "/" + shareUrl,
                  );
                  setTimeout(resolve, 1000);
                });

                window.location.href = shareUrl;
                window.alert("Copied to clipboard");
              }}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
