"use client";

import { useCallback, useState } from "react";
import { useModal } from "../../contexts/ModalContext";
import { useChallengeContext } from "../../contexts/ChallengeContext";
import { useTabContext } from "../../contexts/TabContext";
import { GUITAR_STRING_ORDER, TAB_NOTE_COUNT } from "../../constants";

export default function ShareModal() {
  const { closeModal } = useModal();
  const { title, artist, setTitle, setArtist } = useChallengeContext();
  const { tabNotes, tuningLetters } = useTabContext();
  const [copied, setCopied] = useState(false);

  const buildShareUrl = useCallback(() => {
    const tuning = GUITAR_STRING_ORDER.map(
      (note) => tuningLetters[note] ?? note.slice(0, -1).toUpperCase(),
    ).join("");

    let lastCol = -1;
    for (let col = TAB_NOTE_COUNT - 1; col >= 0; col--) {
      if (
        GUITAR_STRING_ORDER.some((note) => {
          const val = tabNotes[note]?.[col];
          return val && val !== "-";
        })
      ) {
        lastCol = col;
        break;
      }
    }

    const columns: string[] = [];
    for (let col = 0; col <= lastCol; col++) {
      columns.push(
        GUITAR_STRING_ORDER.map((note) => tabNotes[note]?.[col] ?? "-").join(
          ".",
        ),
      );
    }

    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("tuning", tuning);
    if (columns.length > 0) {
      url.searchParams.set("notes", columns.join(","));
    }
    return url.toString();
  }, [tabNotes, tuningLetters]);

  const handleCopyUrl = useCallback(async () => {
    const url = buildShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [buildShareUrl]);

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
              onClick={handleCopyUrl}
              style={{ marginBottom: "1rem" }}
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
          </section>

          <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
        </div>
      </div>
    </>
  );
}
