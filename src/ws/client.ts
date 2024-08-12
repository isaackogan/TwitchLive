import WebSocket from 'ws';

export class TwitchLiveWSClient {

  private _socket?: WebSocket;
  private pingInterval: number = 1000 * 60;
  private pingTimeout: NodeJS.Timeout | undefined;

  constructor(
      public readonly creatorId: string,
      private wsConnectUrl = 'wss://irc-ws.chat.twitch.tv'
  ) {
  }

  /**
   * Connect to the WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._socket = new WebSocket(this.wsConnectUrl);
      this._socket.on('open', () => this.connectRoom().then(resolve));
      this._socket.on('error', (err: Error) => reject(err));
      this._socket.on('close', () => this.onClose());
    });
  }

  private async connectRoom() {

    // Anonymously authenticate to Twitch
    this._socket?.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
    this._socket?.send(`PASS SCHMOOPIIE`);
    this._socket?.send("NICK justinfan12345");
    this._socket?.send("USER justinfan23334 8 * :justinfan23334");

    // Join the room
    this._socket?.send(`JOIN #${this.creatorId}`);

    // Start the ping interval
    this.pingTimeout = setInterval(() => this._socket?.send("PING"), this.pingInterval);
  }

  private onClose() {
    clearInterval(this.pingTimeout);
    this._socket = undefined;
  }

  get isConnected(): boolean {
    return this._socket?.readyState === WebSocket.OPEN;
  }

  get socket() {
    return this._socket
  }

}