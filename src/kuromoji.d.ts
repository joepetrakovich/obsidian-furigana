import { RawToken } from './types';

declare module 'kuromoji' {
  export interface Tokenizer {
    tokenize(text: string): RawToken[];
  }

  export interface TokenizerBuilder {
    build(): Promise<Tokenizer>;
  }

  export interface Kuromoji {
    builder(option: { inMemoryDicFiles?: unknown[]; dicPath?: string }): TokenizerBuilder;
    dictionaryBuilder(): unknown;
    Tokenizer: unknown;
  }

  const kuromoji: Kuromoji;
  export default kuromoji;
}
