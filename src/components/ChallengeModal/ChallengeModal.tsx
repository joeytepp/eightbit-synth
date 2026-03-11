import { useState } from "react";
import { useChallengeContext } from "../../contexts/ChallengeContext";
import { useTrackContext } from "../../contexts/TrackContext";
import { useModal } from "../../contexts/ModalContext";
import { hammingDistance } from "../../utils/shareUrl";
import { usePegContext } from "../../contexts/PegContext";

const MAX_ATTEMPTS = 10;

interface Feedback {
  titleDist: number;
  artistDist: number;
}

export default function ChallengeModal() {
  const { challengeAnswers, clearChallenge } = useChallengeContext();
  const { setTitle, setArtist } = useTrackContext();
  const { closeModal } = useModal();

  const [titleGuess, setTitleGuess] = useState("");
  const [artistGuess, setArtistGuess] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [revealed, setRevealed] = useState(false);

  const { playAllNotes } = usePegContext();

  if (!challengeAnswers) return null;

  const correctTitle = challengeAnswers.title;
  const correctArtist = challengeAnswers.artist;

  const finish = (title: string, artist: string) => {
    setTitle(title);
    setArtist(artist);
    clearChallenge();
    closeModal();
  };

  const handleSubmit = () => {
    const trimmedTitle = titleGuess.trim();
    const trimmedArtist = artistGuess.trim();

    const titleMatch =
      trimmedTitle.toLowerCase() === correctTitle.toLowerCase();
    const artistMatch =
      trimmedArtist.toLowerCase() === correctArtist.toLowerCase();

    if (titleMatch && artistMatch) {
      finish(correctTitle, correctArtist);
      return;
    }

    const remaining = attemptsLeft - 1;
    setAttemptsLeft(remaining);
    setFeedback({
      titleDist: hammingDistance(trimmedTitle, correctTitle),
      artistDist: hammingDistance(trimmedArtist, correctArtist),
    });

    if (remaining <= 0) {
      setRevealed(true);
    }
  };

  const handleRevealClose = () => {
    finish(correctTitle, correctArtist);
  };

  const handleGiveUp = () => {
    setRevealed(true);
    setAttemptsLeft(0);
  };

  const handlePlay = () => {
    playAllNotes();
  };

  return (
    <div
      style={{
        padding: "1.5rem",
        minWidth: "320px",
        maxWidth: "480px",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Guess the Song</h2>
      <button onClick={handlePlay}>▶️ Play</button>

      {!revealed ? (
        <>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining
          </p>

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="challenge-title"
              style={{ display: "block", marginBottom: "0.25rem" }}
            >
              Title:
            </label>
            <input
              id="challenge-title"
              type="text"
              value={titleGuess}
              onChange={(e) => setTitleGuess(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0.4rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="challenge-artist"
              style={{ display: "block", marginBottom: "0.25rem" }}
            >
              Artist:
            </label>
            <input
              id="challenge-artist"
              type="text"
              value={artistGuess}
              onChange={(e) => setArtistGuess(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0.4rem",
              }}
            />
          </div>

          {feedback && (
            <div
              style={{
                padding: "0.75rem",
                marginBottom: "1rem",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: "0 0 0.25rem" }}>
                Title: <strong>{feedback.titleDist}</strong> character
                {feedback.titleDist !== 1 ? "s" : ""} different
              </p>
              <p style={{ margin: 0 }}>
                Artist: <strong>{feedback.artistDist}</strong> character
                {feedback.artistDist !== 1 ? "s" : ""} different
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={handleSubmit}
              style={{ flex: 1, padding: "0.5rem" }}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={handleGiveUp}
              style={{ padding: "0.5rem", color: "#666" }}
            >
              Give up
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ marginBottom: "0.5rem" }}>The answer was:</p>
          <p style={{ margin: "0 0 0.25rem" }}>
            <strong>Title:</strong> {correctTitle || "(none)"}
          </p>
          <p style={{ margin: "0 0 1rem" }}>
            <strong>Artist:</strong> {correctArtist || "(none)"}
          </p>
          <button
            type="button"
            onClick={handleRevealClose}
            style={{ padding: "0.5rem 1.5rem" }}
          >
            Close
          </button>
        </>
      )}
    </div>
  );
}
