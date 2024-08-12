TwitchLive
==================
A Node.JS library to connect to Twitch stream chats and grab some of that sweet, freely available data.

TwitchLive is a Node.JS library designed to connect to Twitch livestreams and receive realtime chat events.
This is particularly useful for use cases where Twitch's official API is too permissions-restrictive

> **Warning:**<br/>This is a <u>reverse-engineering</u> project. Unless you are capable of maintaining it, do not use this in production systems. I do fix issues as they arise, but on my own time.

Join the [community discord (yes, TikTokLive Discord)](https://discord.gg/e2XwPNTBBr) and visit
the `#twitch-support` channel for questions, contributions and ideas.


## Table of Contents

- [Getting Started](#getting-started)
- [Licensing](#license)

## Getting Started

1. Install the module via npm from the **Coming Soon** repository

```shell script
npm i twitchlive
```

2. Create your first chat connection

```typescript
import {TwitchLiveClient, LiveEvent} from "twitchlive";

const client = new TwitchLiveClient(
    "cheese.whiz"
);

client.on(LiveEvent.CONNECTED, (e: undefined) => {
  console.log('Connected!')
});

```

### Current Events

```typescript
export enum LiveEvent {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error",
  FETCH_COMMENTS = "fetch_comments",
  COMMENT = "comment",
  EMOJI = "emoji"
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
