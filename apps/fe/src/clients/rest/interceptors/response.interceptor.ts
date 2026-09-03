import { RestInterceptor } from "@povio/ui";
import type { AxiosError, AxiosResponse } from "axios";

export const ResponseInterceptor = new RestInterceptor((client) => {
  return client.interceptors.response.use(
    async (response: AxiosResponse) => {
      return {
        ...response,
        data: response.data === "" ? undefined : response.data,
      };
    },
    // oxlint-disable-next-line promise/prefer-await-to-callbacks
    async (error: AxiosError) => {
      throw error;
    },
  );
});
