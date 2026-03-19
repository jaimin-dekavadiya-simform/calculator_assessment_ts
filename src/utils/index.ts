import Stack from "./stack";

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

export { Stack, isDigit, factorial };
