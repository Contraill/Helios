import type { AdapterErrorKind } from "./types";

export class DataAdapterError extends Error {
  readonly kind: AdapterErrorKind;
  readonly statusCode?: number;

  constructor(
    kind: AdapterErrorKind,
    message: string,
    options: { cause?: unknown; statusCode?: number } = {},
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = "DataAdapterError";
    this.kind = kind;
    this.statusCode = options.statusCode;
  }
}
