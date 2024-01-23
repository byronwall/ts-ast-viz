// modified from https://github.com/nicoespeon/abracadabra/blob/main/src/ast/transformation.ts

import { parse as babelParse, type ParserOptions } from "@babel/parser";
import { type Visitor } from "@babel/traverse";
import { type File } from "@babel/types";
import * as recast from "recast";

type Code = string;

export type AST = File;

export { Binding, NodePath, Scope } from "@babel/traverse";
export type { Visitor };

export const BABEL_PARSER_OPTIONS: ParserOptions = {
  sourceType: "module",
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  startLine: 1,

  // Tokens are necessary for Recast to do its magic ✨
  tokens: true,

  plugins: [
    "asyncGenerators",
    "bigInt",
    "classPrivateMethods",
    "classPrivateProperties",
    "classProperties",
    // Not compatible with "decorators-legacy"
    // "decorators",
    "decorators-legacy",
    "doExpressions",
    "dynamicImport",
    // Make tests fail, not sure why
    // "estree",
    "exportDefaultFrom",
    "exportNamespaceFrom",
    // Not compatible with "typescript"
    // "flow",
    // "flowComments",
    "functionBind",
    "functionSent",
    "importMeta",
    "jsx",
    "logicalAssignment",
    "nullishCoalescingOperator",
    "numericSeparator",
    "objectRestSpread",
    "optionalCatchBinding",
    "optionalChaining",
    "partialApplication",
    ["pipelineOperator", { proposal: "minimal" }],
    "placeholders",
    "throwExpressions",
    "topLevelAwait",
    "typescript",
  ],
};

export function parse(code: Code): AST {
  try {
    return recast.parse(code, {
      parser: {
        parse: (source: Code) => babelParse(source, BABEL_PARSER_OPTIONS),
      },
      // VS Code considers tabs to be of size 1
      tabWidth: 1,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    throw new Error(
      `I can't build the AST from the source code. This may be due to a syntax error that you can fix. Here's what went wrong: ${message}`
    );
  }
}
