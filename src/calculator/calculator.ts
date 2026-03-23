import { Stack } from "../utils/index.js";
import Evaluator from "./evaluator.js";
import Parser from "./parser.js";
import Tokenizer from "./tokenizer.js";
import { TconstantMap, TfunctionMap, ToperatorMap } from "../types/index.js";

export default class Calculator {
  constructor(
    private CEvaluator: typeof Evaluator,
    private CParser: typeof Parser,
    private CTokenizer: typeof Tokenizer,
    private CStack: typeof Stack,
    private operators: ToperatorMap,
    private functions: TfunctionMap,
    private constants: TconstantMap,
    private precision: number,
  ) {}

  calculate(str: string) {
    let evaluator: Evaluator;
    let parser: Parser;
    let tokenizer: Tokenizer;
    try {
      evaluator = new this.CEvaluator(
        this.operators,
        this.functions,
        this.constants,
        this.CStack,
        this.precision,
      );
      parser = new this.CParser(this.operators, this.functions, this.CStack);
      tokenizer = new this.CTokenizer(
        this.operators,
        this.functions,
        this.constants,
      );
    } catch (e) {
      if (e instanceof Error) {
        throw new Error("Calc : Error loading the calculator : " + e.message);
      }
      throw e;
    }
    const inFixExpression = tokenizer.tokenize(str);
    console.log("infix : ", inFixExpression);
    const postFixExpression = parser.parse(inFixExpression);
    console.log("postfix : ", postFixExpression);
    const answer = evaluator.evaluate(postFixExpression);
    console.log("answer : ", answer);
    return answer;
  }
}
