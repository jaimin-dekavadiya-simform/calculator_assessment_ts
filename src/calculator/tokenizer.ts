import {
  TAcceptedMatch,
  TconstantConfig,
  TconstantMap,
  TfunctionConfig,
  TfunctionMap,
  TmatcherFunction,
  ToperatorConfig,
  ToperatorMap,
  Ttoken,
} from "../types/index.js";

export default class Tokenizer {
  private operators: ToperatorConfig[];
  private functions: TfunctionConfig[];
  private constants: TconstantConfig[];
  private matchers: TmatcherFunction[];
  constructor(
    operators: ToperatorMap,
    functions: TfunctionMap,
    constants: TconstantMap,
  ) {
    this.operators = [...operators.values()];
    this.functions = [...functions.values()];
    this.constants = [...constants.values()];
    this.matchers = [
      this.#readNumber,
      this.#readOperator,
      this.#readParenthesis,
      this.#readFunction,
      this.#readConstant,
    ];
  }

  tokenize(str: string): Ttoken[] {
    if (str.length === 0) {
      throw new Error("Lexer : can not tokenize empty string");
    }
    const tokens: Ttoken[] = [];

    const functionCounter = { value: 0 };
    let index = 0;
    while (index < str.length) {
      let accepted = false;
      if (/\s/.test(str[index]!)) {
        index++;
        continue;
      }
      for (const matcher of this.matchers) {
        const res = matcher.call(this, str, index, tokens);
        if (res.accepted) {
          this.#implicitBefore(res, tokens);
          tokens.push({ type: res.type, value: res.value });
          index = res.newIndex;
          accepted = true;
          this.#implicitAfter(res, tokens, functionCounter);

          break;
        }
      }

      if (!accepted) {
        throw new Error("Lexer : Invalid Input");
      }
    }

    return tokens;
  }

  #implicitBefore(res: TAcceptedMatch, tokens: Ttoken[]) {
    if (
      res.type === "CONSTANT" ||
      res.type === "NUMBER" ||
      (res.type === "BRACKET" && res.value === "(")
    ) {
      let lastToken = tokens[tokens.length - 1];

      if (
        lastToken?.type === "NUMBER" ||
        lastToken?.type === "CONSTANT" ||
        (lastToken?.type === "BRACKET" && lastToken?.value === ")")
      ) {
        tokens.push({ type: "OPERATOR", value: "*" });
      }
    }
  }

  #implicitAfter(
    res: TAcceptedMatch,
    tokens: Ttoken[],
    functionCounter: { value: number },
  ) {
    if (res.type === "FUNCTION") {
      tokens.push({ type: "BRACKET", value: "(" });
      functionCounter.value++;
    } else if (res.type === "NUMBER" || res.type === "CONSTANT") {
      while (functionCounter.value !== 0) {
        functionCounter.value--;
        tokens.push({ type: "BRACKET", value: ")" });
      }
    }
  }

  #readNumber(str: string, startIndex: number) {
    let i = startIndex;
    let decimalFlag = false;
    while (i < str.length && (this.#isDigit(str[i]!) || str[i] === ".")) {
      if (str[i] === ".") {
        if (decimalFlag) {
          throw new Error("Lexer : Number Format not allowed");
        }
        decimalFlag = true;
        i++;
      } else {
        i++;
      }
    }
    if (i == startIndex) {
      return { accepted: false } as const;
    }
    return {
      accepted: true,
      type: "NUMBER",
      newIndex: i,
      value: Number(str.slice(startIndex, i)),
    } as const;
  }

  #readOperator(str: string, startIndex: number, tokens?: Ttoken[]) {
    if (!tokens) {
      throw new Error("Tokens are required");
    }
    if (str[startIndex] === "-") {
      console.log("Tries");
      if (this.#isNegative(tokens)) {
        return {
          accepted: true,
          type: "OPERATOR",
          value: "NEG",
          newIndex: startIndex + 1,
        } as const;
      }
      return {
        accepted: true,
        type: "OPERATOR",
        value: "-",
        newIndex: startIndex + 1,
      } as const;
    }
    if (str[startIndex] === "+") {
      if (this.#isNegative(tokens)) {
        return {
          accepted: true,
          type: "OPERATOR",
          value: "PLUS",
          newIndex: startIndex + 1,
        } as const;
      }
      return {
        accepted: true,
        type: "OPERATOR",
        value: "+",
        newIndex: startIndex + 1,
      } as const;
    }

    for (const operator of this.operators) {
      let lexerString = operator.lexerString;
      if (str.startsWith(lexerString, startIndex)) {
        return {
          accepted: true,
          type: "OPERATOR",
          value: operator.tokenString,
          newIndex: startIndex + lexerString.length,
        } as const;
      }
    }
    return { accepted: false } as const;
  }

  #readParenthesis(str: string, startIndex: number) {
    let value = "";
    if (str[startIndex] === ")") {
      value = ")";
    } else if (str[startIndex] === "(") {
      value = "(";
    } else {
      return { accepted: false } as const;
    }
    return {
      accepted: true,
      type: "BRACKET",
      value: value,
      newIndex: startIndex + 1,
    } as const;
  }

  #readFunction(str: string, startIndex: number) {
    for (const func of this.functions) {
      let lexerString = func.lexerString;
      if (str.startsWith(lexerString, startIndex)) {
        return {
          accepted: true,
          type: "FUNCTION",
          value: func.tokenString,
          newIndex: startIndex + lexerString.length,
        } as const;
      }
    }
    return {
      accepted: false,
    } as const;
  }

  #readConstant(str: string, startIndex: number) {
    for (const constant of this.constants) {
      let lexerString = constant.lexerString;
      if (str.startsWith(lexerString, startIndex)) {
        return {
          type: "CONSTANT" as const,
          accepted: true,
          value: constant.tokenString,
          newIndex: startIndex + lexerString.length,
        } as const;
      }
    }
    return {
      accepted: false,
    } as const;
  }

  #isDigit(char: string) {
    const charCode = char.charCodeAt(0);
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    return false;
  }

  #isNegative(tokens: Ttoken[]) {
    if (tokens.length === 0) {
      return true;
    } else if (
      ["CONSTANT", "NUMBER"].includes(tokens[tokens.length - 1]!.type) ||
      [")", "!"].includes(tokens[tokens.length - 1]!.value.toString())
    ) {
      return false;
    }
    return true;
  }
}
