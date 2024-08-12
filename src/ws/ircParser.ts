export type TwitchTags = {
  badgeInfo?: string,
  badges?: string,
  clientNonce?: string,
  color?: string,
  displayName?: string,
  emotes?: string,
  firstMsg?: string,
  flags?: string,
  id?: string,
  mod?: string,
  returningChatter?: string,
  roomId?: string,
  subscriber?: string,
  tmiSentTs?: string,
  turbo?: string,
  userId?: string,
  userType?: string

}

export type IRCMessage = {
  raw: string,
  tags: TwitchTags | Record<string, string>,
  commandHostname: string,
  commandId: "PRIVMSG" | string,
  roomName: string,
  commandValue: string
}

export function parseIrcMessage(message: string): IRCMessage {
  const parts: string[] = message.split(":");
  const prefixStr: string = parts[0].startsWith("@") ? parts[0].slice(1) : parts[0];
  const commandData: string[] = parts[1].split(" ");
  const commandHostname: string = commandData[0];
  const commandId: string = commandData[1];
  const roomName: string = commandData[2];
  const commandValue: string = parts[2]

  const tagData: Record<string, string> = {};

  prefixStr.split(";").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key.length > 0) {
      const keyAsCamelCase = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      tagData[keyAsCamelCase] = value;
    }
  });

  return {
    raw: message,
    tags: tagData,
    commandHostname,
    commandId,
    roomName,
    commandValue
  }
}

export function parseIrcResponse(data: string) {
  const parsedMessages = [];

  for (let message of data.trim().split("\r\n")) {
    const parsedMessage = parseIrcMessage(message);
    parsedMessages.push(parsedMessage);
  }

  return parsedMessages;
}