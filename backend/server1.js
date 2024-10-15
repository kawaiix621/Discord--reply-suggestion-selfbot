const { Client } = require('discord.js-selfbot-v13');
const { writeToFirebase, deleteFromFirebase, readFromFirebase } = require('./firebase'); // Import Firebase functions

// Import the Google Generative AI SDK
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const client = new Client();

// Initialize the Google Generative AI
const apiKey = 'AIzaSyAeNwJMeMRONTt2myClDFPGD7bihIyS2as';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Queue to hold incoming requests
let requestQueue = [];
let isProcessingQueue = false;

// Function to interact with Google Generative AI and generate suggestions
async function generateSuggestions(messageContent) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(`
      You are kawaii621,
      your name is kawaii, your dad is a nigerian, your mom is a japanese.
      you only know how to speak english, yoruba and a little bit of spanish you are learning on duolingo
      you like BeNADs , Mike, Billy Monday, Keone, and all the NADs
      You Love the Monad EVM compactible Blockchain project and you are 
      Excited for the Mainnet Comming in Q1 of 2024.
      You are currently studying Electrical and Electronics Engineering in a private university in Nigeria, 
      Most of your life has been spent in Nigeria,
      You are playful in the way you talk at times and sarcastic.
      you are an artist learning blockchain development and yapping in a Discord server "monad". 
      you are not a web3 trader, you only do art, code and you are learning electrical electronics engineering.
      you are to Reply to all messages as short as possible, between 2 to 10 words. Don't bother telling anyone about yourself, what you do, or what you are doing unless they specifically ask. Here is a slang dictionary:\n\n{
        "slangDictionary": {
          "gmon": "good morning",
          "gnad": "good night",
          "omg": "oh my god",
          "gmond": "good morning",
          "brb": "be right back",
          "lol": "laugh out loud",
          "idk": "I don't know",
          "btw": "by the way",
          "tbh": "to be honest",
          "smh": "shaking my head",
          "rofl": "rolling on the floor laughing",
          "fyi": "for your information",
          "ttyl": "talk to you later",
          "lmao": "laughing my ass off",
          "wyd": "what are you doing",
          "np": "no problem",
          "yolo": "you only live once",
          "bff": "best friend forever",
          "ikr": "I know, right?",
          "nvm": "never mind",
          "tgif": "thank God it's Friday",
          "omw": "on my way",
          "afk": "away from keyboard",
          "imo": "in my opinion"
        }. Note, I want my response strictly in json format like this:
        {
          suggestion_1: 'Smart contracts are cool',
          suggestion_2: 'Solidity is fun'
        } 
      }\nThis is a message from the monad server "${messageContent}". Generate a really convincing short response as JSON, like: 
      {
        suggestion_1: 'Your suggestion 1',
        suggestion_2: 'Your suggestion 2'
      }
    `);
    const suggestions = JSON.parse(result.response.text());
    return suggestions;

  } catch (error) {
    console.error('Error generating suggestions from Google Generative AI:', error);
    throw error;
  }
}


// Rate-limited function to process the queue at a controlled rate (1 request every 4 seconds)
async function processQueue() {
if (isProcessingQueue || requestQueue.length === 0) return;

isProcessingQueue = true;

while (requestQueue.length > 0) {
const { messageContent, messageId, author } = requestQueue.shift(); // Added author here

try {
  // Generate suggestions using Google Generative AI
  const suggestions = await generateSuggestions(messageContent);

  // Construct processed message data
  const processedMessageData = {
    id: messageId,
    content: messageContent,
    author: author, // Include author in processed data
    suggestion_1: suggestions.suggestion_1,
    suggestion_2: suggestions.suggestion_2,
  };

  // Save the processed message to Firebase
  await writeToFirebase(`processed_messages/${messageId}`, processedMessageData);
  console.log(`Processed message ${messageId} saved with AI suggestions`);
} catch (error) {
  console.error(`Error processing message ${messageId}:`, error);
}

// Wait for 4 seconds before processing the next request to maintain the 15 requests per minute limit
await sleep(4000);
}

isProcessingQueue = false;
}


// Utility function for sleep/delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



// Event listener for when a message is created
client.on("messageCreate", async (message) => {
try {
if (message.content === 'ping') {
  message.reply('pong');
  return;
}

// Save raw message before processing
const messageData = {
  author: message.author.username, // Capture the author
  content: message.content,
  timestamp: new Date().toISOString(),
};

// Push the message to the request queue
requestQueue.push({
  messageId: message.id,
  messageContent: message.content,
  author: messageData.author, // Include author in queue data
});

// Start processing the queue if it's not already being processed
if (!isProcessingQueue) {
  processQueue();
}
} catch (error) {
console.error('Error adding message to queue:', error);
}
});





// Event listener when bot is ready
client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);

  // Start processing approved messages (this part remains unchanged)
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

 // processApprovedMessages();

});

client.login('OTM0Mjk4NDg3NjA3MTQ4NTQ3.GcZZOU.YPeVJDy9wXdAha7J0q8dKzMfFbJ2IDsYxXpfXM');

