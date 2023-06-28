export interface DeeplTranslatorLocale {
  commands: {
    translate: {
      messages: {
        deepl: {
          tooManyRequests: string;
          unknownError: string;
          unsupportTarget: string;
        };
      };
    };
  };
}
