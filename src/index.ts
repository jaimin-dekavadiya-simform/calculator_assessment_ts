import Evaluator from "./calculator/evaluator.js";
import Parser from "./calculator/parser.js";
import Tokenizer from "./calculator/tokenizer.js";
import Stack from "./utils/stack.js";
import { operators, functions, constants } from "./calculator/operations.js";
import Calculator from "./calculator/calculator.js";
import CalculatorController from "./controller/calculatorController.js";
import History from "./calculator/history.js";
const calculator = new Calculator(
  Evaluator,
  Parser,
  Tokenizer,
  Stack,
  operators,
  functions,
  constants,
  15,
);

const view = document.getElementsByClassName("container")[0] as HTMLElement;

const calculatorController = new CalculatorController(
  History,
  calculator,
  view,
);

export { calculatorController };
