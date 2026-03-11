import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface ChallengeAnswers {
  title: string;
  artist: string;
}

export interface ChallengeContextValue {
  challengeAnswers: ChallengeAnswers | null;
  setChallengeAnswers: (title: string, artist: string) => void;
  clearChallenge: () => void;
}

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [challengeAnswers, setChallengeAnswersState] =
    useState<ChallengeAnswers | null>(null);

  const setChallengeAnswers = useCallback((title: string, artist: string) => {
    setChallengeAnswersState({ title, artist });
  }, []);

  const clearChallenge = useCallback(() => {
    setChallengeAnswersState(null);
  }, []);

  return (
    <ChallengeContext.Provider
      value={{ challengeAnswers, setChallengeAnswers, clearChallenge }}
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
