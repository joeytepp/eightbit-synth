import { useCallback, useState } from "react";
import { GUITAR_STRING_ORDER } from "../constants";
import { useTabContext } from "../contexts/TabContext";

export default function useUrlParams() {
  const { setTabNote } = useTabContext();

  const [overrideNoteOrder, setOverrideNoteOrder] = useState<(string | null)[]>(
    [],
  );
  const [urlParamsApplied, setUrlParamsApplied] = useState(false);

  const applyTabNotes = useCallback(
    (notes: string[][]) => {
      notes.forEach((noteRow, noteRowIndex) => {
        noteRow.forEach((noteValue, noteValueIndex) => {
          const note =
            overrideNoteOrder[noteValueIndex] ??
            GUITAR_STRING_ORDER[noteValueIndex];
          setTabNote(note, noteRowIndex, noteValue);
        });
      });
    },
    [overrideNoteOrder, setTabNote],
  );

  const loadUrlParams = useCallback(() => {
    if (urlParamsApplied) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);

    setUrlParamsApplied(true);
    const noteOrderFromQuery = searchParams.get("tuning");

    const parsedOverrideNoteOrder = noteOrderFromQuery?.split("");

    if (parsedOverrideNoteOrder?.length === GUITAR_STRING_ORDER.length) {
      setOverrideNoteOrder(
        parsedOverrideNoteOrder as unknown as (string | null)[],
      );
    }

    const notesFromQuery = searchParams.get("notes");

    const parsedNotesFromQuery = notesFromQuery
      ?.split(",")
      ?.map((note) => note.split("."));

    console.log(parsedNotesFromQuery);

    if (!parsedNotesFromQuery?.length) {
      return;
    }

    applyTabNotes(parsedNotesFromQuery);
  }, [urlParamsApplied, applyTabNotes]);

  return { loadUrlParams, overrideNoteOrder };
}
