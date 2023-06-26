import type { Request } from "./types";

const getTimestamp = (str: string) => {
  const timestamp = new Date().getUTCMilliseconds();
  const iCount = [...str].filter((c) => c === "i").length;

  if (iCount !== 1) return timestamp - (timestamp % (iCount + 1)) + iCount + 1;
  else return timestamp;
};

const getText = (str: string, id: number) =>
  (id + 5) % 29 === 0 || (id + 3) % 13 === 0
    ? str.replace(/"method":"/g, '"method" : "')
    : str;

export const generateRequestBody = (
  id: number,
  text: string,
  targetLang: string,
  sourceLang?: string
): Request => ({
  jsonrpc: "2.0",
  method: "LMT_handle_texts",
  id,
  params: {
    texts: [
      {
        text: getText(text, id),
        requestAlternatives: 0,
      },
    ],
    splitting: "newlines",
    lang: {
      target_lang: targetLang,
      ...(sourceLang ? { source_lang_user_selected: sourceLang } : {}),
    },
    timestamp: getTimestamp(text),
    commonJobParams: {
      transcribe_as: "",
      wasSpoken: false,
    },
  },
});
