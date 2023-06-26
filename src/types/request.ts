export interface Request {
  jsonrpc: string;
  method: string;
  id: number;
  params: {
    texts: {
      text: string;
      requestAlternatives: number;
    }[];
    splitting: string;
    lang: {
      source_lang_user_selected?: string;
      target_lang: string;
    };
    timestamp: number;
    commonJobParams: {
      transcribe_as: string;
      wasSpoken: boolean;
    };
  };
}
