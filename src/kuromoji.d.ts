declare module 'kuromoji' {
  export interface Tokenizer {
    tokenize(text: string): any[];
  }

  export interface TokenizerBuilder {
    build(): Promise<Tokenizer>;
  }

  export interface Kuromoji {
    builder(option: { inMemoryDicFiles?: any[]; dicPath?: string }): TokenizerBuilder;
    dictionaryBuilder(): any;
    Tokenizer: any;
  }

  const kuromoji: Kuromoji;
  export default kuromoji;
}
