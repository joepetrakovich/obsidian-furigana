import { ruleCounter } from "./rules/rule-counter";
import { ruleDate } from "./rules/rule-date";
import { ruleFix } from "./rules/rule-fix";
import { ruleMonth } from "./rules/rule-month";
import { rulePurify } from "./rules/rule-purify";

const tokenRules = [
  ruleFix,
  ruleMonth,
  ruleDate,
  ruleCounter,
  rulePurify,
];

export const sanitizeToken = (token) =>
  tokenRules.reduce((ret, rule) => rule(ret), token);
