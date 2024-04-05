import { Client } from "@xmtp/xmtp-js";
import { GrpcApiClient } from "@xmtp/grpc-api-client";
import { Wallet } from "ethers";

const XMTP_RATE_LIMIT = 1000;
const XMTP_RATE_LIMIT_TIME = 60 * 1000; // 1 minute
const XMTP_RATE_LIMIT_TIME_INCREASE = XMTP_RATE_LIMIT_TIME * 5; // 5 minutes

const BROADCAST_AMOUNT = 10000;

const broadcastAddresses = new Array<string>(BROADCAST_AMOUNT).fill("");
const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const run = async () => {
  const startTime = Date.now();
  const wallet = Wallet.createRandom();
  // Create the client with your wallet. This will connect to the XMTP development network by default
  console.log("Creating client");
  const client = await Client.create(wallet, {
    apiClientFactory: GrpcApiClient.fromOptions,
  });
  const batches: string[][] = [];
  let batch: string[] = [];
  const canMessageAddresses = await client.canMessage(broadcastAddresses);
  let errorCount = 0;
  for (let i = 0; i < canMessageAddresses.length; i++) {
    if (canMessageAddresses[i]) {
      batch.push(broadcastAddresses[i]);
    }
    // Add a batch of 500 addresses to the batches array
    // An introduction message is sent for new contacts, so each new message will actually be 2 messages in this case
    // We want to send 1000 messages per minute, so we split the batches in half
    // Additional optimization can be done to send messages to contacts that have already been introduced
    if (batch.length === XMTP_RATE_LIMIT) {
      batches.push(batch);
      batch = [];
    }
  }
  if (batch.length > 0) {
    batches.push(batch);
  }

  let currentRateLimitWaitTime = XMTP_RATE_LIMIT_TIME;
  for (let i = 0; i < batches.length; i++) {
    let batchWaitTime = currentRateLimitWaitTime;
    const batchResponse = await Promise.allSettled(
      batches[i].map(async (address, index) => {
        const conversation = await client.conversations.newConversation(
          address
        );
        try {
          await conversation.send("Hello from XMTP!");
        } catch (err) {
          errorCount++;
          console.log(`Rate limited, waiting ${batchWaitTime}`);
          await delay(batchWaitTime);
          try {
            await conversation.send("Hello from XMTP!");
          } catch (err) {
            errorCount++;
            currentRateLimitWaitTime = XMTP_RATE_LIMIT_TIME_INCREASE;
            batchWaitTime = currentRateLimitWaitTime;
            console.log(`Rate limited more, waiting ${batchWaitTime}`);
            await delay(batchWaitTime);
            await conversation.send("Hello from XMTP!");
          }
        }
        console.log(`Sent message for batch ${i} index ${index} to ${address}`);
      })
    );
    for (let j = 0; j < batchResponse.length; j++) {
      const element = batchResponse[j];
      if (element.status === "rejected") {
        errorCount++;
        console.error(element.reason);
        // Add error handling here
      }
    }
    if (i !== batches.length - 1) {
      // Wait between batches
      console.log(`Waiting between batches ${i} and ${i + 1}`);
      await delay(currentRateLimitWaitTime);
    }
  }
  const endTime = Date.now();

  console.log(`Total time: ${endTime - startTime}ms with ${errorCount} errors`);
};

const runBatches = async () => {
  const startTime = Date.now();
  const wallet = Wallet.createRandom();
  // Create the client with your wallet. This will connect to the XMTP development network by default
  console.log("Creating client");
  const client = await Client.create(wallet, {
    apiClientFactory: GrpcApiClient.fromOptions,
  });

  const batches: string[][] = [];
  let batch: string[] = [];
  const canMessageAddresses = await client.canMessage(broadcastAddresses);
  let errorCount = 0;
  for (let i = 0; i < canMessageAddresses.length; i++) {
    if (canMessageAddresses[i]) {
      batch.push(broadcastAddresses[i]);
    }
    // Add a batch of 500 addresses to the batches array
    // An introduction message is sent for new contacts, so each new message will actually be 2 messages in this case
    // We want to send 1000 messages per minute, so we split the batches in half
    // Additional optimization can be done to send messages to contacts that have already been introduced
    if (batch.length === XMTP_RATE_LIMIT / 2) {
      batches.push(batch);
      batch = [];
    }
  }
  if (batch.length > 0) {
    batches.push(batch);
  }

  for (let i = 0; i < batches.length; i++) {
    const batch: string[] = [];
    await Promise.all(
      batches[i].map(async (address, index) => {
        const conversation = await client.conversations.newConversation(
          address
        );
        try {
          await conversation.send("Hello from XMTP!");
          console.log(
            `Sent message for batch ${i} index ${index} to ${address}`
          );
        } catch (err) {
          errorCount++;
          console.error(err);
          batch.push(address);
          // Add error handling here
        }
      })
    );
    if (i !== batches.length - 1) {
      // Wait between batches
      console.log(`Waiting between batches ${i} and ${i + 1}`);
      await delay(XMTP_RATE_LIMIT_TIME_INCREASE);
    }
    if (batch.length > 0) {
      batches.push(batch);
    }
  }
  const endTime = Date.now();

  console.log(`Total time: ${endTime - startTime}ms with ${errorCount} errors`);
};

const runWait = async () => {
  const startTime = Date.now();
  const wallet = Wallet.createRandom();
  // Create the client with your wallet. This will connect to the XMTP development network by default
  console.log("Creating client");
  const client = await Client.create(wallet, {
    apiClientFactory: GrpcApiClient.fromOptions,
  });
  const canMessageAddresses = await client.canMessage(broadcastAddresses);
  let errorCount = 0;
  let currentWait = 0;
  for (let i = 0; i < canMessageAddresses.length; i++) {
    if (canMessageAddresses[i]) {
      const conversation = await client.conversations.newConversation(
        broadcastAddresses[i]
      );
      try {
        await conversation.send("Hello from XMTP!");
      } catch (err) {
        errorCount++;
        console.error(err);
        if (currentWait === 0) {
          currentWait = XMTP_RATE_LIMIT_TIME;
        } else if (currentWait === XMTP_RATE_LIMIT_TIME) {
          currentWait = XMTP_RATE_LIMIT_TIME_INCREASE;
        }
        await delay(currentWait);
        try {
          await conversation.send("Hello from XMTP!");
        } catch (err) {
          errorCount++;
          console.error(err);
          await delay(XMTP_RATE_LIMIT_TIME_INCREASE);
          try {
            await conversation.send("Hello from XMTP!");
          } catch (err) {
            errorCount++;
            console.error(err);
          }
        }
      }
      console.log(`Sent message ${i} to ${broadcastAddresses[i]}`);
    }
  }

  const endTime = Date.now();
  // Total time awaiting each send: 3421425ms with 8 errors ~57 minutes
  // Total time awaiting each send: 8232861ms with 24702 errors
  console.log(
    `Total time awaiting each send: ${
      endTime - startTime
    }ms with ${errorCount} errors`
  );
};

runBatches();
// runWait: Total time awaiting each send: 3421425ms with 8 errors ~57 minutes
// runBatch: Total time awaiting each send: 3354697ms with 0 errors
// Run: Total time batch greedy: 8232861ms with 24702 errors
