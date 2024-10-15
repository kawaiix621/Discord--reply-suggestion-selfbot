const { Client } = require('discord.js-selfbot-v13');
const { writeToFirebase, deleteFromFirebase, readFromFirebase } = require('./firebase'); // Import Firebase functions

// Create a new Discord client
const client = new Client();

// Event listener when bot is ready
client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
  
  // Start processing approved messages
  processApprovedMessages();
});

// Function to process approved messages, send them, and delete after successful delivery
async function processApprovedMessages() {
  try {
    // Read all messages from the `approved_messages` directory
    const approvedMessages = await readFromFirebase('approved_messages/');

    // Replace this with your actual channel ID
    const channelId = '790439605655699456'; // Your Channel ID

    // Fetch the channel by ID
    const channel = client.channels.cache.get(channelId);

    // Check if the channel exists
    if (!channel) {
      console.error('Channel not found!');
      return;
    }

    // Loop through each message
    for (const [messageId, messageData] of Object.entries(approvedMessages)) {
      const { author, response } = messageData;

      // Construct the message to send (mention the user and send the response)
      const messageToSend = `@${author} ${response}`;

      try {
        // Send a message to the specified channel
        await channel.send({
          content: messageToSend,
          activity: {
            type: 3, // "Listening" activity type
          },
        });

        // Prepare the sent message data to save
        const sentMessageData = {
          author: author,
          content: response,
          timestamp: new Date().toISOString(),
        };

        // Save the sent message to the `sent_messages` directory
        await writeToFirebase(`sent_messages/${messageId}`, sentMessageData);
        console.log(`Message sent to channel and saved to sent_messages.`);

        // If the message was successfully sent, delete it from Firebase
        await deleteFromFirebase(`approved_messages/${messageId}`);
        console.log(`Deleted from approved_messages.`);

      } catch (error) {
        console.error(`Error sending message to channel:`, error);
      }

      // Wait 15 seconds before processing the next message
      await sleep(15000);
    }
  } catch (error) {
    console.error('Error processing approved messages:', error);
  }
}

// Utility function for sleep/delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Log in to Discord
client.login('OTM0Mjk4NDg3NjA3MTQ4NTQ3.GcZZOU.YPeVJDy9wXdAha7J0q8dKzMfFbJ2IDsYxXpfXM');
