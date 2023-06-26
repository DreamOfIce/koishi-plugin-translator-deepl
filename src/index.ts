import Translator from "@koishijs/translator";
import { Schema } from "koishi";
import type { Response } from "./types";
import { generateRequestBody } from "./utils";

class DeeplTranslator extends Translator<DeeplTranslator.Config> {
  private id = Math.random() * 2 ** 32;

  public override async translate(options: Translator.Result): Promise<string> {
    const { input, source, target = "ZH" } = options;
    const { data, status } = await this.ctx.http.axios<Response>("POST", {
      url: "/translate",
      baseURL: "https://ww2.deepl.com",
      data: generateRequestBody(
        this.id++,
        input,
        target.toUpperCase(),
        source?.toUpperCase()
      ),
      headers: {
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "User-Agent": "DeepL-iOS/2.9.0 iOS 16.5.0 (iPad13,1)",
        "x-app-os-name": "iPadOS",
        "x-app-os-version": "16.5.0",
        "x-app-device": "iPad13,1",
        "x-app-build": "490306",
        "x-app-version": "2.9",
      },
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 400 || status === 429,
    });

    switch (status) {
      case 400: {
        switch (data.error?.code) {
          case -32600:
            throw new Error(
              `Unsupport target language: ${target.toUpperCase()}`
            );
          default:
            throw new Error(
              `An unknown error has occurred${
                data.error
                  ? `: ${data.error?.message}(${data.error?.code})`
                  : ""
              }`
            );
        }
      }
      case 429:
        throw new Error("Too many requests");
      default:
        return data.result.texts[0].text;
    }
  }
}

namespace DeeplTranslator {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Config {}

  export const Config: Schema<Config> = Schema.object({});
}

export default DeeplTranslator;
