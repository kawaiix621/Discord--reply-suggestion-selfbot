const { Client } = require('discord.js-selfbot-v13');
const { writeToFirebase } = require('./firebase'); // Import Firebase functions

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

// Function to interact with Google Generative AI and generate suggestions
async function generateSuggestions(messageContent) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(`
      You are kawaii621, you are an artist learning blockchain development and yapping in a Discord server monad. Reply to all messages as short as possible, between 1 to 10 words. Don't bother telling anyone about yourself, what you do, or what you are doing unless they specifically ask. Here is a slang dictionary:\n\n{
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

    // The response is already JSON, so we can directly parse it.
    const suggestions = JSON.parse(result.response.text());
    return suggestions;

  } catch (error) {
    console.error('Error generating suggestions from Google Generative AI:', error);
    throw error; // Rethrow the error so it can be caught by the parent function
  }
}

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.content === 'ping') {
      message.reply('pong');
      return;
    }

    // Save raw message before processing
    const messageData = {
      author: message.author.username,
      content: message.content,
      timestamp: new Date().toISOString()
    };

    // Generate AI suggestions for the message
    const suggestions = await generateSuggestions(message.content);

    // Processed message data with suggestions
    const processedMessageData = {
      ...messageData,
      suggestion_1: suggestions.suggestion_1,
      suggestion_2: suggestions.suggestion_2
    };

    // Log the processed message data
    console.log('Processed Message Data:', suggestions);

    // Save processed message with suggestions to `processed_messages/`
    await writeToFirebase(`processed_messages/${message.id}`, processedMessageData);
    console.log('Processed message saved to Firebase with AI suggestions');
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

client.login('NTQ0MTUwNDc3NTU4OTA2ODgy.GXk6bE.edvmMvoqMNEOtnMSEHyMs4UwnRjbXvr-C9G68I');