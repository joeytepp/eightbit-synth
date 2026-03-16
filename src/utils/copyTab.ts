import { useEffect, useState } from "react";
import { usePegContext } from "../contexts/PegContext";

export default function useCopyTab() {
  const [isCopied, setIsCopied] = useState(false);
  const { pegCells } = usePegContext();

  const tab = [
    ...Object.keys(pegCells).map((key) => [key.replaceAll(/\d+/g, ""), "|"]),
  ];

  Object.values(pegCells).forEach((cell, index) => {
    cell.forEach((cell) => {
      tab[index]?.push(cell);
    });
  });

  const copyTab = () => {
    navigator.clipboard.writeText(tab.map((row) => row.join("-")).join("\n"));
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
