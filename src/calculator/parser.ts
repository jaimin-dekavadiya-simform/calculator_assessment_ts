import {
  TfunctionConfig,
  TfunctionMap,
  ToperatorConfig,
  ToperatorMap,
  Ttoken,
} from "../types/index.js";
import { Stack } from "../utils/index.js";

export default class Parser {
  stack!: Stack<Ttoken>;
  output: Ttoken[] = [];
  handlers: {
    [key: string]: (token: Ttoken, expectOperand: { value: boolean }) => void;
  };
  constructor(
    private operators: ToperatorMap,
    private functions: TfunctionMap,
    private CStack: typeof Stack,
  ) {
    this.handlers = {
      OPERATOR: this.#handleOperator.bind(this),
      FUNCTION: this.#handleFunction.bind(this),
      NUMBER: this.#handleNumber.bind(this),
      CONSTANT: this.#handleConstant.bind(this),
      BRACKET: this.#handleBracket.bind(this),
    };
  }
  parse(tokens: Ttoken[]): Ttoken[] {
    this.output = [];
    this.stack = new this.CStack<Ttoken>();

    const expectOperand = { value: true };
    if (!tokens) {
      throw new Error("Parser : Input tokens can not be zero");
    }
    for (const token of tokens) {
      const handler = this.handlers[token.type];
      if (!handler) {
        throw new Error("Parser : Token type not available");
      }
      handler(token, expectOperand);
    }
    while (!this.stack.isEmpty()) {
      let top = this.stack.pop();
      if (top.type === "BRACKET") {
        throw new Error("Parser : Invalid Bracket Expression");
      }
      this.output.push(top);
    }
    return this.output;
  }

  #handleOperator(token: Ttoken, expectOperand: { value: boolean }) {
    if (
      token.value !== "NEG" &&
      token.value !== "PLUS" &&
      expectOperand.value
    ) {
      throw new Error("Parser : Operand expected");
    }
    if (token.value !== "!") {
      expectOperand.value = true;
    }

    if (this.stack.isEmpty()) {
      this.stack.push(token);
      return;
    }
    const operator = this.operators.get(token.value.toString());
    if (!operator) {
      throw new Error("Parser : oeprator not found");
    }
    let top_token = this.stack.peek();
    let top: ToperatorConfig | TfunctionConfig | undefined =
      top_token.type === "OPERATOR"
        ? this.operators.get(top_token.value.toString())
        : this.functions.get(top_token.value.toString());

    while (
      !this.stack.isEmpty() &&
      this.stack.peek().type !== "BRACKET" &&
      top &&
      this.#shouldPop(top, operator)
    ) {
      this.output.push(this.stack.pop());
      if (!this.stack.isEmpty()) {
        top = this.operators.get(this.stack.peek().value.toString());
      }
    }
    this.stack.push(token);
    return;
  }

  #handleFunction(token: Ttoken, expectOperand: { value: boolean }) {
    expectOperand.value = true;
    this.stack.push(token);
  }
  #handleNumber(token: Ttoken, expectOperand: { value: boolean }) {
    expectOperand.value = false;
    this.output.push(token);
  }
  #handleConstant(token: Ttoken, expectOperand: { value: boolean }) {
    expectOperand.value = false;
    this.output.push(token);
  }
  #handleBracket(token: Ttoken, expectOperand: { value: boolean }) {
    if (token.value === "(") {
      expectOperand.value = true;
      this.stack.push(token);
    } else {
      expectOperand.value = false;
      while (this.stack.peek().type !== "BRACKET") {
        this.output.push(this.stack.pop());
        if (this.stack.isEmpty()) {
          throw new Error("Parser  : Invalid Bracket Expression");
        }
      }
      this.stack.pop();
    }
  }
  #shouldPop(
    top: ToperatorConfig | TfunctionConfig,
    operator: ToperatorConfig,
  ) {
    return (
      top.precedence > operator.precedence ||
      (top.precedence === operator.precedence &&
        operator.associativity !== "right")
    );
  }
}
