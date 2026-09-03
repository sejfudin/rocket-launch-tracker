export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface FcmSendResponse {
  name: string;
}

export interface FcmErrorResponse {
  error: {
    code: number;
    message: string;
    status: string;
    details?: Array<{ '@type': string; [key: string]: unknown }>;
  };
}

export interface TopicSubscriptionResponse {
  results: Array<{
    error?: string;
  }>;
}
