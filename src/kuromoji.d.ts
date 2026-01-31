declare module 'kuromoji' {
  export interface Tokenizer {
    tokenize(text: string): unknown[];
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
