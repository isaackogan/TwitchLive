import {TwitchLiveWebClient} from "./web/client";
import {CreateAxiosDefaults} from "axios";
import {EventEmitter} from "node:events";
import {LiveEvent} from "./event";
import {TwitchLiveWSClient} from "./ws/client";
import {RawData} from "ws";
import {IRCMessage, parseIrcResponse} from "./ws/ircParser";

export * from "./web/client";
export * from "./web/http";


export class TwitchLiveClient extends EventEmitter {

  public readonly web: TwitchLiveWebClient;
  public readonly ws: TwitchLiveWSClient;

  private _isConnected: boolean = false;

  constructor(
      public readonly username: string,
      public readonly httpProxy?: URL,
      protected readonly axiosConfig?: CreateAxiosDefaults
  ) {
    super();
    this.web = new TwitchLiveWebClient(httpProxy, axiosConfig);
    this.ws = new TwitchLiveWSClient(username);
  }

  public async start() {

    try {

      // Connect
      const promise: Promise<void> = this.ws.connect();

      // Register listeners
      this.ws.socket?.on("message", this.onMessage.bind(this));
      this.ws.socket?.on("error", (error) => this.emit(LiveEvent.ERROR, error));
      this.ws.socket?.on("close", () => this.disconnect());

      // Mark as connected once complete
      await promise;
      this._isConnected = true;
      this.emit(LiveEvent.CONNECTED);

    } catch (ex) {
      this.emit(LiveEvent.CONNECT_ERROR, ex);
    }
  }

  private onMessage(data: RawData) {
    const messages: IRCMessage[] = parseIrcResponse(data.toString());
    this.emit(LiveEvent.IRC_MESSAGE, messages);

    for (const message of messages) {
      if (message.commandId === "PRIVMSG") {
        this.emit(LiveEvent.COMMENT, message)
      }
    }

  }

  public disconnect<T extends unknown>(error?: T): void {

    if (!this._isConnected) {
      return;
    }

    this._isConnected = false;
    this.emit(LiveEvent.DISCONNECTED, error);

  }

  get isConnected(): boolean {
    return this._isConnected;
  }

}

