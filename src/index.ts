import Translator from "@koishijs/translator";
import { FastText } from "fasttext.wasm";
import { Context, Logger, Schema, SessionError } from "koishi";
import type { Response } from "./types";
import { defineLocales, generateRequestBody } from "./utils";

const logger = new Logger("translator-deepl");

class DeeplTranslator extends Translator<DeeplTranslator.Config> {
  private id = Math.random() * 2 ** 32;
  private fastText?: FastText;

  public constructor(ctx: Context, config: DeeplTranslator.Config) {
    super(ctx, config);
    defineLocales(ctx);
  }

  public async translate(options: Translator.Result): Promise<string> {
    if (!this.fastText) {
      this.fastText = await FastText.create();
      await this.fastText.loadModel();
    }
    const {
      input,
      source,
      target = this.fastText.detect(input).toUpperCase() ===
      this.config.defaultTargetLang[0]!
        ? this.config.defaultTargetLang[1]!
        : this.config.defaultTargetLang[0]!,
    } = options;
    const { data, status } = await this.ctx.http.axios<Response>("/jsonrpc", {
      method: "post",
      baseURL: "https://www2.deepl.com",
      data: generateRequestBody(
        this.id++,
        input,
        target.toUpperCase(),
        source?.toUpperCase(),
      ),
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
        "Content-Type": "application/json",
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
          case -32600: {
            logger.error(`Unsupport target language: ${target.toUpperCase()}`);

            throw new SessionError(".deepl.unsupportTarget", { lang: target });
          }
          default:
            logger.error(
              `An unknown error has occurred${
                data.error
                  ? `: ${data.error?.message}(${data.error?.code})`
                  : ""
              }`,
            );
            throw new SessionError(".deepl.unknownError");
        }
      }
      case 429:
        logger.error("Too many requests");
        throw new SessionError(".deepl.tooManyRequests");
      default:
        return data.result.texts[0].text;
    }
  }
}

namespace DeeplTranslator {
  export interface Config {
    defaultTargetLang: string[];
  }

  export const Config: Schema<Config> = Schema.object({
    defaultTargetLang: Schema.tuple([String, String])
      .description("默认的目标语言, 当输入语言为第一个时使用第二个")
      .default(["ZH", "EN"]),
  });
}

export default DeeplTranslator;
