export interface Response {
  jsonrpc: string;
  id: number;
  error?: {
    code: number;
    message: string;
    data: {
      what: string;
    };
  };
  result: {
    texts: [
      {
        alternatives: string[];
        text: string;
      },
    ];
    lang: string;
    lang_is_confident: boolean;
    detectedLanguages: Record<string, number>;
  };
}
