interface Ttoken {
  type: "CONSTANT" | "BRACKET" | "FUNCTION" | "NUMBER" | "OPERATOR";
  value: string | number;
}
interface TAcceptedMatch {
  accepted: true;
  type: Ttoken["type"];
  newIndex: number;
  value: string | number;
}
type TmatcherFunction = (
  str: string,
  startIndex: number,
  tokens?: Ttoken[],
) => TAcceptedMatch | { accepted: false };
export { Ttoken, TmatcherFunction, TAcceptedMatch };
