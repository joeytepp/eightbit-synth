import { useEffect, useState } from "react";
import { useTabContext } from "../contexts/TabContext";

export default function useCopyTab() {
  const [isCopied, setIsCopied] = useState(false);
  const { tabNotes } = useTabContext();

  const tab = [
    ...Object.keys(tabNotes).map((key) => [key.replaceAll(/\d+/g, ""), "|"]),
  ];

  Object.values(tabNotes).forEach((cell, index) => {
    cell.forEach((cell) => {
      tab[index]?.push(cell);
    });
  });

  let lastIndex = 0;
  tab.forEach((row) => {
    row.forEach((cell, index) => {
      if (cell !== "-" && index >= lastIndex) {
        lastIndex = index;
      }
    });
  });

  const copyTab = () => {
    navigator.clipboard.writeText(
      tab.map((row) => row.slice(0, lastIndex + 1).join("-")).join("\n"),
    );
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [isCopied]);
  return { isCopied, copyTab };
}
