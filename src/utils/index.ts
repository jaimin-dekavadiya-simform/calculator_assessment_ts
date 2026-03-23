import Stack from "./stack.js";

function isDigit(char: string) {
  const charCode = char.charCodeAt(0);
  if (charCode >= 48 && charCode <= 57) {
    return true;
  }
  return false;
}

function factorial(n: number): number {
  if (n <= 1) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}

function getElement<T extends Element>(
  parent: Document | Element,
  selector: string,
): T {
  const el = parent.querySelector(selector);
  if (!el) {
    throw new Error(`Element not found: ${selector}`);
  }
  return el as T;
}

export { Stack, isDigit, factorial, getElement };
