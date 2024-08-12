import {HttpsProxyAgent} from "https-proxy-agent";
import {CookieJar} from "tough-cookie";
import axios, {AxiosInstance, CreateAxiosDefaults} from "axios";
import {createCookieAgent} from "http-cookie-agent/http";
import {HttpProxyAgent} from "http-proxy-agent";
import {wrapper} from "axios-cookiejar-support";
import * as zlib from "node:zlib";

export const DEFAULT_HEADERS: Record<string, string> = {
  "Accept-Encoding": "gzip, deflate",
  "Accept-Language": "en-CA,en;q=0.9",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "Origin": "https://www.twitch.tv/",
  "Host": "irc-ws.chat.twitch.tv",
  "Pragma": "no-cache",
  "Sec-Websocket-Extensions": "permessage-deflate; client_max_window_bits",
  "Sec-Websocket-Version": "13",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
}

export class TwitchLiveHTTPClient {

  public readonly axios: AxiosInstance

  constructor(
      axiosConfig?: CreateAxiosDefaults,
      public readonly proxy?: URL,
      public readonly cookies: CookieJar = new CookieJar(),
  ) {
    this.axios = TwitchLiveHTTPClient.createAxios(this.cookies, this.proxy, axiosConfig)
    TwitchLiveHTTPClient.addGzipMiddleware(this.axios);
  }

  public static addGzipMiddleware(instance: AxiosInstance) {

    instance.interceptors.response.use(response => {
      const encoding = response.headers['content-encoding'];

      if (encoding && encoding.includes('gzip')) {
        return new Promise((resolve, reject) => {
          zlib.gunzip(response.data, (err, dezipped) => {
            if (err) {
              return reject(err);
            }
            response.data = dezipped.toString();
            resolve(response);
          });
        });
      }

      return response;
    }, error => {
      return Promise.reject(error);
    });

  }

  /**
   * Creating a special Axios client capable of proxying AND retaining the cookie jar.
   * https://github.com/3846masa/http-cookie-agent/issues/238#issuecomment-1236493872
   */
  public static createAxios(
      cookies: CookieJar,
      proxy?: URL,
      axiosConfig?: CreateAxiosDefaults
  ): AxiosInstance {
    axiosConfig ||= {};

    const baseConfig: CreateAxiosDefaults = {
      headers: {...DEFAULT_HEADERS, ...axiosConfig?.headers || {}},
      validateStatus: () => true,
      ...axiosConfig
    }

    if (!proxy) {
      return wrapper(
          axios.create(
              {
                jar: cookies,
                ...baseConfig
              }
          )
      )
    }

    const HttpProxyCookieAgent = createCookieAgent(HttpProxyAgent);
    const HttpsProxyCookieAgent = createCookieAgent(HttpsProxyAgent);

    const cookieAgentParams: any = {
      cookies: {jar: cookies},
      host: proxy?.hostname,
      port: proxy?.port,
      password: proxy?.password
    }

    return axios.create(
        {
          httpAgent: new HttpProxyCookieAgent(cookieAgentParams),
          httpsAgent: new HttpsProxyCookieAgent(cookieAgentParams),
          ...baseConfig
        }
    )

  }


}


