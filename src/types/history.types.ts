interface ThistoryItem {
  expression: string;
  answer: number;
}
type Taction = "clear" | "delete" | "toggleSign" | "reciprocal" | "calculate";
export type { ThistoryItem, Taction };
