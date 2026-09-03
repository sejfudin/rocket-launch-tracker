/**
 * Standard status response
 */
export interface IStatusResponse {
  /**
   *  Status of the response
   *  @default ok
   */
  status: string;

  /**
   * Human-readable explanation of the status
   */
  message: string;

  /**
   * Alphanumeric code of the message type
   */
  code: string;
}
