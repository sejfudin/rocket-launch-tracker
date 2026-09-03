export {};

declare global {
  // oxlint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestMetadata?: {
        spanId?: string;
        traceId?: string;
        requestStart?: bigint;
      };
    }
  }
}
