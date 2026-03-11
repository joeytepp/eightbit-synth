import { useEffect, useRef } from "react";
import {
  getChallengeParamsFromSearch,
  decodeChallengePayload,
} from "../../utils/shareUrl";
import { usePegContext } from "../../contexts/PegContext";
import { useTrackContext } from "../../contexts/TrackContext";
import { useChallengeContext } from "../../contexts/ChallengeContext";
import { useModal } from "../../contexts/ModalContext";
import ChallengeModal from "../ChallengeModal/ChallengeModal";

/**
 * Runs once on mount: if URL has ?mode=challenge&data=..., decodes the payload,
 * applies peg data (and optional tempo) to context, stores the challenge answers,
 * and opens the ChallengeModal for the friend to guess title/artist.
 */
export default function ChallengeLoader() {
  const { applyChallengePayload } = usePegContext();
  const { setTempo } = useTrackContext();
  const { setChallengeAnswers } = useChallengeContext();
  const { openModal } = useModal();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    const params = getChallengeParamsFromSearch(window.location.search);
    if (!params) return;

    const payload = decodeChallengePayload(params.data);
    if (!payload) return;

    appliedRef.current = true;
    applyChallengePayload(payload.lettersByPeg, payload.pegCells);
    if (payload.tempo != null && payload.tempo >= 1 && payload.tempo <= 300) {
      setTempo(payload.tempo);
    }
    window.localStorage.setItem("challenge-payload", JSON.stringify(payload));
    window.history.replaceState({}, "", window.location.pathname || "/");

    setChallengeAnswers(payload.title ?? "", payload.artist ?? "");
    openModal(<ChallengeModal />);
  }, [applyChallengePayload, setTempo, setChallengeAnswers, openModal]);

  return null;
}
