import { ProcessedToken, RawToken, TokenRule } from "./types";
import { ruleCounter } from "./rules/rule-counter";
import { ruleDate } from "./rules/rule-date";
import { ruleFix } from "./rules/rule-fix";
import { ruleMonth } from "./rules/rule-month";
import { rulePurify } from "./rules/rule-purify";

const tokenRules: TokenRule[] = [
  ruleFix,
  ruleMonth,
  ruleDate,
  ruleCounter,
];

export const sanitizeToken = (token: RawToken[]): ProcessedToken[] => {
  const rawTokens = tokenRules.reduce((ret, rule) => rule(ret), token);
  return rulePurify(rawTokens);
};

const renderKana = (hirakana: string): string => escapeHtml(hirakana);
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const kanaConvert = (kana: string, isHiraToKata: boolean): string => {
  if (isHiraToKata && !/[ぁ-ん]/.test(kana)) {
    return kana;
  }
  if (!isHiraToKata && !/[ァ-ン]/.test(kana)) {
    return kana;
  }
  const MAGIC = isHiraToKata ? 96 : -96;
  return String.fromCharCode(kana.charCodeAt(0) + MAGIC);
};

const hira2kata = (str: string): string => str.split('').map((c) => kanaConvert(c, true)).join('');
const sameKana = (kana1: string, kana2: string): boolean => hira2kata(kana1) === hira2kata(kana2);
const countSameChar = (arr: string[], char: string): number => arr.reduce((a, b) => {
  if (b === char) {
    a += 1;
  }
  return a;
}, 0);

interface SurfaceGroupItem {
  s: string;
  isKanji: boolean;
  r: string[];
  p: number;
}

// smash the token into the substring which not mixed kanji and kana
const smash = (tkn: ProcessedToken): ProcessedToken[] => {
  let lastIsKanji: boolean | undefined;
  // prepare the data structure
  const surfaceGroup: SurfaceGroupItem[] = [...tkn.s].reduce((group, curr, idx) => {
    const isKanji = (/[一-龯々]/).test(curr);
    if (idx === 0 || !isKanji || isKanji !== lastIsKanji) {
      group.push({
        s: curr,
        isKanji,
        r: [],
        p: tkn.p + idx,
      });
    } else {
      // should merge
      const last = group[group.length - 1]!;
      last.s = `${last.s}${curr}`;
    }

    lastIsKanji = isKanji;
    return group;
  }, [] as SurfaceGroupItem[]);

  // attach reading
  const readArray = [...tkn.r];
  surfaceGroup.forEach((s, idx) => {
    const next = surfaceGroup[idx + 1];
    for (let i = 0, len = readArray.length; i < len; i += 1) {
      const curr = readArray[0]!;
      const currIsSingle = (countSameChar(readArray, curr) === 1);

      if (
        s.r.length
        && next
        && sameKana(next.s, curr)
        && currIsSingle) {
        // matched the first kana
        // dont break when there are same curr in the readArray
        // break then try the next char in the surface form
        break;
      }

      // move the current kana to the reading
      s.r.push(curr);
      readArray.shift();

      if (!s.isKanji) {
        // current char of the surface form is not a kanji
        // break because the kana can only be matched one by one
        break;
      }
    }
  });

  return surfaceGroup
    .filter((sg) => sg.isKanji)
    .map((sg) => ({
      s: sg.s,
      r: sg.r.join(''),
      p: sg.p,
    }));
};

// renders kanji with unselectable furigana
const renderKanji = (hirakana: string, kanji: string): string => {
  return `<ruby>${kanji}<rt class="furigana" data-rt="${hirakana}"></rt></ruby>`;
};

export const renderRuby = (text: string, token: ProcessedToken[]): string => {
  // smash the token to the kanji-only token
  const smashed = token.reduce((ret, tkn) => ret.concat(smash(tkn)), [] as ProcessedToken[]);

  // create blocks from smashed token
  let pos = 0;
  const blocks: { s: string; r?: string }[] = [];
  smashed.forEach((r) => {
    if (r.p !== pos) {
      blocks.push({
        s: text.substring(pos, r.p),
      });
      pos = r.p;
    }
    blocks.push({
      s: r.s,
      r: r.r,
    });
    pos += r.s.length;
  });

  if (text.length > pos) {
    blocks.push({
      s: text.substring(pos),
    });
  }

  let output = '';
  blocks.forEach((b) => {
    if (b.r) {
      // contains kanji
      output = output.concat(renderKanji(b.r, b.s));
    } else {
      // all kana or unparsed kanji
      output = output.concat(renderKana(b.s));
    }
  });

  return output;
};
