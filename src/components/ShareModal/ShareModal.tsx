"use client";

import { useEffect, useRef, useState } from "react";
import { useModal } from "../../contexts/ModalContext";
import { usePegContext } from "../../contexts/PegContext";
import {
  decodeSharePayload,
  encodeChallengePayload,
  buildChallengeUrl,
} from "../../utils/shareUrl";
import { useTrackContext } from "../../contexts/TrackContext";

export default function ShareModal() {
  const { closeModal } = useModal();
  const { title, artist, tempo, setTitle, setArtist } = useTrackContext();
  const { lettersByPeg, pegCells } = usePegContext();
  const dataLoadedRef = useRef(false);
  const [challengeCopied, setChallengeCopied] = useState(false);

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

  const handleCopyChallengeUrl = async () => {
    const payload = {
      lettersByPeg,
      pegCells,
      ...(title ? { title } : undefined),
      ...(artist ? { artist } : undefined),
      ...(tempo >= 1 && tempo <= 300 ? { tempo } : undefined),
    };
    const encoded = encodeChallengePayload(payload);
    const url = buildChallengeUrl(encoded);

    await navigator.clipboard.writeText(url);

    setChallengeCopied(true);
    setTimeout(() => setChallengeCopied(false), 2000);
  };

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
              onClick={handleCopyChallengeUrl}
              style={{ marginBottom: "1rem" }}
            >
              {challengeCopied ? "Copied!" : "Copy challenge URL"}
            </button>
          </section>

          <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
        </div>
      </div>
    </>
  );
}
