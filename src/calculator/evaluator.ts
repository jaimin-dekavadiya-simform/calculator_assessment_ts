import {
  TconstantMap,
  TfunctionMap,
  ToperatorMap,
  Ttoken,
} from "../types/index.js";
import { Stack } from "../utils/index.js";

export default class Evaluator {
  Stack: typeof Stack;
  stack!: Stack<number>;
  handlers: {
    [key: string]: (token: Ttoken) => void;
  };
  constructor(
    private operators: ToperatorMap,
    private functions: TfunctionMap,
    private constants: TconstantMap,
    CStack: typeof Stack,
    private precision: number,
  ) {
    this.Stack = CStack;
    this.handlers = {
      OPERATOR: this.#handleOperator.bind(this),
      FUNCTION: this.#handleFunction.bind(this),
      NUMBER: this.#handleNumber.bind(this),
      CONSTANT: this.#handleConstant.bind(this),
    };
  }
  evaluate(postfix: Ttoken[]) {
    this.stack = new this.Stack<number>();
    if (!postfix) {
      throw new Error("Evaluation : empty postfix expression");
    }
    for (const token of postfix) {
      const handler = this.handlers[token.type];
      if (!handler) {
        throw new Error("Evaluation : Token type not available");
      }
      handler(token);
    }
    if (this.stack.size() !== 1) {
      throw new Error("Evaluation : Invalid PostFix Expression");
    }
    return this.stack.pop();
  }
  #handleOperator(token: Ttoken) {
    if (this.stack.isEmpty()) {
      throw new Error("Evaluation op: Invalid PostFix Expression 1");
    }

    const operator = this.operators.get(token.value.toString());
    if (!operator) {
      throw new Error("Evaluation op: operator not found");
    }
    if (this.stack.size() < operator.arity) {
      throw new Error("Evaluation op: Invalid PostFix Expression 2");
    }
    const operands: number[] = [];
    for (let i = 0; i < operator.arity; i++) {
      operands.unshift(this.stack.pop());
    }

    const answer = operator.execute(...operands);
    this.stack.push(Number(answer.toFixed(this.precision)));
  }
  #handleFunction(token: Ttoken) {
    if (this.stack.isEmpty()) {
      throw new Error("Evaluation fn: Invalid PostFix Exression 3");
    }
    const function_op = this.functions.get(token.value.toString());
    if (!function_op) {
      throw new Error("Evaluation fn: Function not found");
    }
    if (this.stack.size() < function_op.arity) {
      throw new Error("Evaluation fn: Invalid PostFix Expression 4");
    }
    const operands: number[] = [];
    for (let i = 0; i < function_op.arity; i++) {
      operands.unshift(this.stack.pop());
    }
    const answer = function_op.execute(...operands);
    this.stack.push(Number(answer.toFixed(this.precision)));
  }
  #handleNumber(token: Ttoken) {
    const value = Number(token.value);
    this.stack.push(Number(value.toFixed(this.precision)));
  }
  #handleConstant(token: Ttoken) {
    const value = this.constants.get(token.value.toString())?.value;
    if (!value) {
      throw new Error("Evaluation :invalid key while accesing Map");
    }
    this.stack.push(Number(value.toFixed(this.precision)));
  }
}
