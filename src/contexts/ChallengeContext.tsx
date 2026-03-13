import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  TITLE_LOCAL_STORAGE_KEY,
  ARTIST_LOCAL_STORAGE_KEY,
} from "../constants";
import { decodeSharePayload } from "../utils/shareUrl";

export interface ChallengeAnswers {
  title: string;
  artist: string;
}

export interface ChallengeContextValue {
  title: string;
  artist: string;
  setTitle: (title: string) => void;
  setArtist: (artist: string) => void;
  challengeAnswers: ChallengeAnswers | null;
  setChallengeAnswers: (title: string, artist: string) => void;
  clearChallenge: () => void;
}

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState(() => {
    return localStorage.getItem(TITLE_LOCAL_STORAGE_KEY) ?? "";
  });
  const [artist, setArtist] = useState(() => {
    return localStorage.getItem(ARTIST_LOCAL_STORAGE_KEY) ?? "";
  });

  const [challengeAnswers, setChallengeAnswersState] =
    useState<ChallengeAnswers | null>(null);

  const setChallengeAnswers = useCallback((t: string, a: string) => {
    setChallengeAnswersState({ title: t, artist: a });
  }, []);

  const clearChallenge = useCallback(() => {
    setChallengeAnswersState(null);
  }, []);

  useEffect(() => {
    localStorage.setItem(TITLE_LOCAL_STORAGE_KEY, title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem(ARTIST_LOCAL_STORAGE_KEY, artist);
  }, [artist]);

  const appliedShareRef = useRef(false);
  useEffect(() => {
    if (appliedShareRef.current) return;
    appliedShareRef.current = true;
    const payload = decodeSharePayload(
      window.location.href.split("/").pop() || "",
    );
    if (payload) {
      setTitle(payload.title);
      setArtist(payload.artist);
    }
  }, []);

  return (
    <ChallengeContext.Provider
      value={{
        title,
        artist,
        setTitle,
        setArtist,
        challengeAnswers,
        setChallengeAnswers,
        clearChallenge,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallengeContext(): ChallengeContextValue {
  const ctx = useContext(ChallengeContext);
  if (ctx === null) {
    throw new Error(
      "useChallengeContext must be used within ChallengeProvider",
    );
  }
  return ctx;
}
