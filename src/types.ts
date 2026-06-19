export interface RawToken {
  word_id: number | null;
  word_type: string;
  word_position: number;
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string;
  conjugated_form: string;
  basic_form: string | null;
  reading?: string;
  pronunciation?: string;
}

export interface ProcessedToken {
  s: string;
  r: string;
  p: number;
}

export type TokenRule = (tokens: RawToken[]) => RawToken[];
