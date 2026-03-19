interface Ttoken {
  type: "CONSTANT" | "BRACKET" | "FUNCTION" | "NUMBER" | "OPERATOR";
  value: string;
}

export { Ttoken };
