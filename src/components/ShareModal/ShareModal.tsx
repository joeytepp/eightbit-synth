"use client";

import { useModal } from "../../contexts/ModalContext";
import { useTabContext } from "../../contexts/TabContext";
import { useChallengeContext } from "../../contexts/ChallengeContext";
import { useEffect } from "react";

export default function ShareModal() {
  const { closeModal, isOpen } = useModal();
  const { title, artist, setTitle, setArtist } = useChallengeContext();
  const { tuningLetters } = useTabContext();

  useEffect(() => {
    if (!isOpen) return;

    window.alert(JSON.stringify(tuningLetters));
  }, [isOpen]);

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
          <h2>Share</h2>
          <button onClick={() => closeModal()}>X</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <section>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              Share song (title & artist)
            </h3>
            <div>
              <label htmlFor="song-title">Title: </label>
              <div>
                <input
                  required
                  type="text"
                  id="song-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
          </section>
          <section>
            <div>
              <label htmlFor="song-artist">Artist: </label>
              <div>
                <input
                  required
                  type="text"
                  id="song-artist"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
              </div>
            </div>
          </section>
          <section>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              Send challenge to friends
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: "0.5rem",
              }}
            >
              Copy a link that contains the current tab and optional title/tempo
            </p>
            <button
              disabled={!title || !artist}
              type="button"
              onClick={() => {}}
              style={{ marginBottom: "1rem" }}
            >
              Copy URL
            </button>
          </section>

          <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
        </div>
      </div>
    </>
  );
}
