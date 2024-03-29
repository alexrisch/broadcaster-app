# Broadcast with XMTP

![xmtp](https://github.com/xmtp/xmtp-quickstart-reactjs/assets/1447073/3f2979ec-4d13-4c3d-bf20-deab3b2ffaa1)

Broadcasting with XMTP allows you to send a single message to multiple recipients, treating each message as a direct message (DM) from the sender's wallet address to each recipient's wallet address. High volume broadcasts require careful planning to adhere to XMTP's rate limits and ensure efficient and responsible use of the network.

- **Rate Limits**: Understand and respect XMTP's rate limits to prevent network overload and ensure your messages are delivered smoothly.
- **Batch Processing**: Sending messages in batches can help manage rate limits effectively. Consider the timing and size of each batch to optimize delivery.
- **Error Handling**: Implement robust error handling to manage rate limiting responses from the network. This may include adjusting send rates or retrying failed messages.
- **User Consent**: Ensure compliance with data privacy laws by obtaining explicit consent from users for broadcast messages, especially at high volumes.

### Code example

Below are the key variables and functions we use to ensure our broadcasting code complies with XMTP's guidelines for responsible and efficient message distribution.

#### Parameters

- **XMTP_RATE_LIMIT**: Caps the number of messages at 1000 per minute to avoid network strain and spam detection.
- **XMTP_RATE_LIMIT_TIME**: Sets the wait time between message batches to 60,000 milliseconds (1 minute), matching the rate limit to prevent exceeding the message cap.
- **XMTP_RATE_LIMIT_TIME_INCREASE**: Extends the wait time to 5 minutes after hitting a rate limit error, minimizing the risk of further rate limit breaches.

#### Strategies

1. **run**: Sends messages in batches, adhering to the rate limit. It dynamically adjusts the wait time between batches upon encountering rate limit errors.
2. **runBatches**: Splits the allowed rate limit in half for a more conservative approach and includes a retry mechanism for failed messages. This function exemplifies both batch processing and robust error handling.
3. **runWait**: Adjusts wait times on a per-message basis, starting with no wait time and increasing upon encountering errors. This method offers a granular approach to error handling and rate limit management.

### Local testing

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

### Documentation

For more detailed information on broadcasting with XMTP, including code examples, best practices, and troubleshooting tips, please refer to our [official documentation](https://xmtp.org/docs/tutorials/broadcast).
