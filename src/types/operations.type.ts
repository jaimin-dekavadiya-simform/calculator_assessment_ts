interface operationConfig {
  lexerString: string;
  tokenString: string;
  precedence: number;
  arity: number;
  execute: (...args: number[]) => number;
}
interface ToperatorConfig extends operationConfig {
  precedence: number;
  associativity: "left" | "right";
}
interface TfunctionConfig extends operationConfig {}
interface TconstantConfig {
  value: number;
  lexerString: string;
  tokenString: string;
}
type ToperatorMap = Map<string, ToperatorConfig>;
type TfunctionMap = Map<string, TfunctionConfig>;
type TconstantMap = Map<string, TconstantConfig>;

export type {
  ToperatorConfig,
  ToperatorMap,
  TfunctionConfig,
  TfunctionMap,
  TconstantConfig,
  TconstantMap,
};
