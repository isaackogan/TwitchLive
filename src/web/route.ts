import {TwitchLiveHTTPClient} from "./http";

export abstract class TwitchRoute<RoutePayload, RouteResponse> {

  constructor(
      protected http: TwitchLiveHTTPClient
  ) {
  }

  abstract fetch(config: RoutePayload): Promise<RouteResponse>;

}
