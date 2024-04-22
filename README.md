# Broadcast with XMTP

![xmtp](https://github.com/xmtp/xmtp-quickstart-reactjs/assets/1447073/3f2979ec-4d13-4c3d-bf20-deab3b2ffaa1)

Broadcasting with XMTP allows you to send a single message to multiple recipients, treating each message as a direct message (DM) from the sender's wallet address to each recipient's wallet address. High volume broadcasts require careful planning to adhere to XMTP's rate limits and ensure efficient and responsible use of the network.

- **Network Activation**: Before sending a broadcast message, verify that each recipient's wallet is activated on the XMTP network with `canMessage`. Only activated wallets can receive and view messages.
- **Rate Limiting**: XMTP imposes rate limits to maintain network health and prevent spam. Familiarize yourself with these limits and design your message sending strategy to comply with them. [FAQ](https://xmtp.org/docs/faq#rate-limiting).
- **User Consent**: In accordance with data privacy laws, obtain explicit consent from users before sending them broadcast messages. [Read more](https://xmtp.org/docs/build/user-consent).

> ⚠️
> Without explicit consent from the recipients, broadcast messages are more likely to be flagged as spam, significantly reducing their deliverability. [Read more](https://xmtp.org/docs/build/user-consent).

### Code example

Below are the key variables and functions we use to ensure the broadcasting code complies with XMTP's guidelines for responsible and efficient message distribution.

#### Parameters

- `XMTP_RATE_LIMIT`: Caps the number of messages at 1000 per minute to avoid network strain and spam detection.
- `XMTP_RATE_LIMIT_TIME`: Sets the wait time between message batches to 60,000 milliseconds (1 minute), matching the rate limit to prevent exceeding the message cap.
- `XMTP_RATE_LIMIT_TIME_INCREASE`: Extends the wait time to 5 minutes after hitting a rate limit error, minimizing the risk of further rate limit breaches.

#### Strategies

1. **run**: Sends messages in batches, adhering to the rate limit. It dynamically adjusts the wait time between batches upon encountering rate limit errors.
2. **runBatches**: Splits the allowed rate limit in half for a more conservative approach and includes a retry mechanism for failed messages. This function exemplifies both batch processing and robust error handling.

3. **runWait**: Adjusts wait times on a per-message basis, starting with no wait time and increasing upon encountering errors. This method offers a granular approach to error handling and rate limit management.

> This implementation uses the gRPC API client to improve performance. To learn more, refer to the [gRPC API client documentation](https://github.com/xmtp/xmtp-node-js-tools/tree/main/packages/grpc-api-client).

#### Implementing caching with fs-persistence

To enhance the efficiency of handling conversations in XMTP, implementing a caching mechanism is crucial. By using `fs-persistence` (or Redis), the system can quickly verify the existence of a conversation without the need to reload and check all conversations. This approach significantly speeds up both the initial and subsequent requests, reducing wait times and avoiding timeouts.

For more details on setting up `fs-persistence` with XMTP, refer to the [fs-persistence documentation](https://github.com/xmtp/xmtp-node-js-tools/tree/main/packages/fs-persistence).

The necessity for this caching mechanism arises from the need to determine whether `newConversation` is continuing an existing conversation or initiating a new one. This check helps prevent duplicate conversations with the same user, adhering to privacy restrictions.

### Local testing

Requirements:

- Yarn v4 (grpc api client works only with Yarn)
- Node >18

To install dependencies:

```bash
yarn install
```

To run:

```bash
yarn start
```

### Documentation

For more detailed information on broadcasting with XMTP, including code examples, best practices, and troubleshooting tips, please refer to the [official documentation](https://xmtp.org/docs/tutorials/broadcast).
