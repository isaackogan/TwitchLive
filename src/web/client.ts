import {TwitchLiveHTTPClient} from "./http";
import {CreateAxiosDefaults} from "axios";

export class TwitchLiveWebClient extends TwitchLiveHTTPClient {

  constructor(
      proxy?: URL,
      axiosConfig?: CreateAxiosDefaults
  ) {
    super(axiosConfig, proxy);

  }

}


