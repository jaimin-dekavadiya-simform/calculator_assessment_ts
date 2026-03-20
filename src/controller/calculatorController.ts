// Controller for the calculator UI: wires view, input, history and calculator logic.
import { isDigit, getElement } from "../utils/index.js";
import Calculator from "../calculator/calculator.js";
import History from "../calculator/history.js";

// Responsible for translating clicks/keys into tokens, updating display and managing history.
export default class CalculatorController {
  history: History;
  error: boolean;
  empty: boolean;
  lastAnswer: number | undefined;
  actions: {
    [key: string]: () => void;
  };
  allowSubmit: boolean;
  dom!: {
    themeBtn: HTMLButtonElement;
    display: HTMLDivElement;
    historyDisplay: HTMLDivElement;
    buttons: HTMLDivElement;
    historyPanel: HTMLDivElement;
  };
  constructor(
    private CHistory: typeof History,
    private calculator: Calculator,
    private view: HTMLElement,
  ) {
    this.history = new this.CHistory("calc-1");
    this.error = false;
    this.empty = true;
    this.lastAnswer;
    this.actions = {
      clear: this.#clearDisplay,
      delete: this.#deleteChar,
      toggleSign: this.#toggleSign,
      reciprocal: this.#reciprocal,
      calculate: this.#handleSubmit,
    };
    this.allowSubmit = false;
    this.#initDom();
    this.#initClickHandlers();
    this.#initKeyHandlers();
    this.#displayHistory();
  }

  #changeTheme() {
    document.getElementsByTagName("body")[0]!.classList.toggle("dark-mode");
  }

  #initDom() {
    const themeBtn = getElement<HTMLButtonElement>(this.view, ".theme-btn");
    const displayArea = getElement<HTMLDivElement>(this.view, ".display-area");
    const display = getElement<HTMLDivElement>(displayArea, ".current-display");
    const historyDisplay = getElement<HTMLDivElement>(
      displayArea,
      ".history-display",
    );
    const buttons = getElement<HTMLDivElement>(this.view, ".button-grid");
    const historyPanel = getElement<HTMLDivElement>(
      this.view,
      ".history-panel",
    );
    this.dom = {
      themeBtn,
      display,
      historyDisplay,
      buttons,
      historyPanel,
    };
  }
  #initClickHandlers() {
    this.dom.themeBtn.addEventListener("click", this.#changeTheme.bind(this));
    this.dom.buttons.addEventListener("click", this.#handleClick.bind(this));
    getElement<HTMLButtonElement>(
      this.dom.historyPanel,
      "#clearHistoryBtn",
    ).addEventListener("click", this.#clearHistory.bind(this));

    getElement<HTMLDivElement>(
      this.dom.historyPanel,
      ".history-list",
    ).addEventListener("click", this.#handleHistoryClick.bind(this), {
      capture: true,
    });
  }
  #initKeyHandlers() {
    document.addEventListener("keydown", this.#handleKeyDown.bind(this));
  }

  #handleKeyDown(e: KeyboardEvent) {
    const key = e.key;
    const data: DOMStringMap = {};
    if (isDigit(key)) {
      data.number = key;
    } else if (["+", "-", "*", "/", "%"].includes(key)) {
      data.operator = key;
    } else if (["(", ")"].includes(key)) {
      data.bracket = key === "(" ? "left" : "right";
    } else {
      switch (key) {
        case "Enter":
          data.action = "calculate";
          break;
        case "c":
          data.action = "clear";
          break;
        case "Backspace":
          data.action = "delete";
          break;
        case ".":
          data.number = ".";
          break;
        case "^":
          data.function = "power";
          break;
        case "a":
          data.function = "ans";
          break;
        default:
          return;
      }
    }
    this.#clearError();
    this.#handleInput(data);
    e.preventDefault();
  }

  #handleClick(e: MouseEvent) {
    if (e.target instanceof HTMLElement) {
      this.#clearError();
      const data = e.target.dataset;
      this.#handleInput(data);
    } else {
      return;
    }
  }

  #handleInput(data: DOMStringMap) {
    if (data.action) {
      const action = this.actions[data.action];
      if (!action) {
        throw new Error("action not defined");
      }
      action.call(this);
    } else if (data.number) {
      this.#updateDisplay(this.#getDisplay() + data.number);
    } else if (data.operator) {
      this.allowSubmit = true;
      this.#updateDisplay(this.#getDisplay() + " " + data.operator + " ");
    } else if (data.function) {
      switch (data.function) {
        case "pi":
          this.allowSubmit = true;
          this.#updateDisplay(this.#getDisplay() + " π ");
          break;
        case "sqrt":
          this.allowSubmit = true;
          this.#updateDisplay(this.#getDisplay() + " √ ");
          break;
        case "power":
          this.allowSubmit = true;
          this.#updateDisplay(this.#getDisplay() + " ^ ");
          break;
        case "factorial":
          this.allowSubmit = true;
          this.#updateDisplay(this.#getDisplay() + " ! ");
          break;
        case "ans":
          if (this.lastAnswer !== undefined)
            this.#updateDisplay(this.#getDisplay() + this.lastAnswer);
          break;
        default:
          this.allowSubmit = true;
          this.#updateDisplay(this.#getDisplay() + " " + data.function + " ");
          break;
      }
    } else if (data.bracket) {
      this.allowSubmit = true;
      switch (data.bracket) {
        case "left":
          this.#updateDisplay(this.#getDisplay() + " ( ");
          break;
        case "right":
          this.#updateDisplay(this.#getDisplay() + " ) ");
          break;
      }
    } else {
      console.error("Invalid Click");
    }
  }

  #reciprocal() {
    let str = this.dom.display.innerHTML;
    if (isDigit(str[str.length - 1] ?? "")) {
      let index = str.lastIndexOf(" ");

      str = str.slice(0, index + 1) + " 1 / ( " + str.slice(index + 1) + " ) ";
    } else if (str[str.length - 1] === " " && str[str.length - 2] === ")") {
      let index = str.length - 3;
      let counter = 1;
      while (index >= 0 && counter != 0) {
        if (str[index] === ")") {
          counter++;
        } else if (str[index] === "(") {
          counter--;
        }
        index--;
      }
      if (counter === 0) {
        str = str.slice(0, index) + " 1 / " + str.slice(index);
      }
    }
    this.allowSubmit = true;
    this.dom.display.innerHTML = str;
  }

  #toggleSign() {
    let str = this.dom.display.innerHTML;
    if (isDigit(str[str.length - 1] ?? "")) {
      this.allowSubmit = true;
      let index = str.lastIndexOf(" ");
      if (str[index + 1] === "-") {
        str = str.slice(0, index + 1) + str.slice(index + 2);
      } else {
        str = str.slice(0, index + 1) + "-" + str.slice(index + 1);
      }
    } else if (str[str.length - 1] === " " && str[str.length - 2] === ")") {
      this.allowSubmit = true;
      let index = str.length - 3;
      let counter = 1;
      while (index >= 0 && counter != 0) {
        if (str[index] === ")") {
          counter++;
        } else if (str[index] === "(") {
          counter--;
        }
        index--;
      }
      if (counter === 0) {
        if (str[index - 1] === "-") {
          str = str.slice(0, index - 1) + str.slice(index + 1);
        } else {
          str = str.slice(0, index) + " -" + str.slice(index);
        }
      }
    }
    this.dom.display.innerHTML = str;
  }

  #deleteChar() {
    let str = this.dom.display.innerHTML;
    if (str === "0") {
      return;
    } else if (
      isDigit(str[str.length - 1] ?? "") ||
      str[str.length - 1] === "."
    ) {
      str = str.slice(0, str.length - 1);
    } else if (str[str.length - 1] === " ") {
      str = str.slice(0, str.length - 1);
      let index = str.lastIndexOf(" ");
      str = str.slice(0, index);
    } else {
      str = str.slice(0, str.length - 1);
    }

    if (str == "") {
      this.empty = true;
      this.dom.display.innerHTML = "0";
    } else {
      this.dom.display.innerHTML = str;
    }
  }

  // Read-only accessor for current display contents.
  #getDisplay() {
    return this.dom.display.innerHTML;
  }

  // Update display string; if previously empty, remove leading placeholder.
  #updateDisplay(str: string) {
    if (this.empty) {
      this.empty = false;
      this.dom.display.innerHTML = str.slice(1);
    } else {
      this.dom.display.innerHTML = str;
    }
  }

  // Clear display to initial state "0".
  #clearDisplay() {
    this.empty = true;
    this.dom.display.innerHTML = "0";
  }

  // Clear any error state and reset display to start if necessary.
  #clearError() {
    if (this.error) {
      this.empty = true;
      this.dom.display.innerHTML = "0";
    }
    this.error = false;
  }

  // Evaluate the current expression via calculator.calculate(), update history and display.
  // Catches and classifies errors (Lexer/Parser/Evaluation/Operator) and sets appropriate messages.
  #handleSubmit() {
    this.#clearError();
    const str = this.dom.display.innerHTML;
    if (!this.allowSubmit) {
      return;
    }
    try {
      const answer = this.calculator.calculate(str);
      this.dom.historyDisplay.innerHTML = this.dom.display.innerHTML;
      this.lastAnswer = answer;
      this.dom.display.innerHTML = answer.toString();
      if (!this.empty) {
        this.history.push({ expression: str, answer: answer });
      }
      this.allowSubmit = false;
      this.#displayHistory.call(this);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.startsWith("Parser")) {
          this.dom.display.innerHTML = "Invalid Expression";
        } else if (e.message.startsWith("Evaluation")) {
          this.dom.display.innerHTML = "Invalid Expression";
        } else if (e.message.startsWith("Operator")) {
          this.dom.display.innerHTML = "Math Error";
        } else if (e.message.startsWith("Lexer")) {
          this.dom.display.innerHTML = "Invalid Input";
        } else {
          this.dom.display.innerHTML = "Something Went Wrong";
        }
      }
      this.dom.display.innerHTML = "Something Went Wrong";
      console.error(e);
      this.error = true;
    }
  }

  // Render saved history items into the history panel.
  // If no items, show a friendly empty message.
  #displayHistory() {
    const historyListElement = this.dom.historyPanel.getElementsByClassName(
      "history-list",
    )[0] as HTMLDivElement;
    const historyItems = this.history.getItems();

    historyListElement.innerHTML = "";

    if (!historyItems) {
      historyListElement.innerHTML = `<p class="empty-message">No calculations yet</p>`;
      return;
    }
    for (const item of historyItems) {
      const listElement = document.createElement("div");
      listElement.className = "history-item";

      const expressionElement = document.createElement("div");
      expressionElement.className = "history-item-expression";
      expressionElement.innerHTML = item.expression;

      const resultElement = document.createElement("div");
      resultElement.className = "history-item-result";
      resultElement.innerHTML = item.answer.toString();
      listElement.appendChild(expressionElement);
      listElement.appendChild(resultElement);

      historyListElement.appendChild(listElement);
    }
  }

  // Clear persisted history and refresh the display.
  #clearHistory() {
    this.history.clear();
    this.#displayHistory();
  }

  // Handle clicks on a history entry: restore the expression to the display for editing/recalculation.
  #handleHistoryClick(e: MouseEvent) {
    if (e.target instanceof HTMLElement) {
      const expression =
        e.target.closest(".history-item")?.firstElementChild!.innerHTML;
      if (expression) {
        this.dom.display.innerHTML = expression;
        this.empty = false;
        this.allowSubmit = true;
      }
    }
  }
}
