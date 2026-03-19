interface token {
  type: "CONSTANT" | "BRACKET" | "FUNCTION" | "NUMBER";
  value: string;
}

export { token };
