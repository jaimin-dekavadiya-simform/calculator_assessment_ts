import {
  TconstantMap,
  TfunctionConfig,
  TfunctionMap,
  ToperatorConfig,
  ToperatorMap,
  Ttoken,
} from "@/types";
import { Stack } from "@/utils";

export default class Parser {
  Stack: typeof Stack;
  stack!: Stack<Ttoken>;
  output: Ttoken[] = [];
  constructor(
    private operators: ToperatorMap,
    private functions: TfunctionMap,
    private constants: TconstantMap,
    private CStack: typeof Stack,
  ) {
    this.Stack = CStack;
  }
  parse(tokens: Ttoken[]): Ttoken[] {
    this.output = [];
    this.stack = new this.Stack<Ttoken>();

    const expectOperand = { value: true };
    if (!tokens) {
      throw new Error("Parser : Input tokens can not be zero");
    }
    for (const token of tokens) {
      switch (token.type) {
        case "OPERATOR":
          this.#handleOperator(token, expectOperand);
          break;
        case "FUNCTION":
          this.#handleFunction(token, expectOperand);
          break;
        case "NUMBER":
          this.#handleNumber(token, expectOperand);
          break;
        case "CONSTANT":
          this.#handleConstant(token, expectOperand);
          break;
        case "BRACKET":
          this.#handleBracket(token, expectOperand);
          break;
        default:
          throw new Error("Parser : Token type not available");
          break;
      }
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
    const operator = this.operators.get(token.value);
    if (!operator) {
      throw new Error("Parser : oeprator not found");
    }
    let top_token = this.stack.peek();
    let top: ToperatorConfig | TfunctionConfig | undefined =
      top_token.type === "OPERATOR"
        ? this.operators.get(top_token.value)
        : this.functions.get(top_token.value);

    while (
      !this.stack.isEmpty() &&
      this.stack.peek().type !== "BRACKET" &&
      top &&
      this.#shouldPop(top, operator)
    ) {
      this.output.push(this.stack.pop());
      if (!this.stack.isEmpty()) {
        top = this.operators.get(this.stack.peek().value);
      }
    }
    this.stack.push(token);
    return;
  }

  #handleFunction(token: Ttoken, expectOperand: { value: boolean }) {
    expectOperand.value = true;
    this.stack.push(token);
    return;
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
    if (top.precedence > operator.precedence) {
      return true;
    } else if (top.precedence < operator.precedence) {
      return false;
    } else {
      if (operator.associativity === "right") {
        return false;
      }
      return true;
    }
  }
}
