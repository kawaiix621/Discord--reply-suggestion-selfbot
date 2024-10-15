const { Client } = require('discord.js-selfbot-v13');

// Create a new selfbot client instance
const client = new Client({
  checkUpdate: false, // Disable the update checker
});

// Login to Discord with your account token (selfbot)

client.login('OTM0Mjk4NDg3NjA3MTQ4NTQ3.GcZZOU.YPeVJDy9wXdAha7J0q8dKzMfFbJ2IDsYxXpfXM');
    
    
// When the bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for any message event in the server
client.on('messageCreate', (message) => {
  // Check if the message is in a guild (server)
  if (message.guild) {
    const guildId = message.guild.id;
    const channelId = message.channel.id;
    
    console.log(`Guild ID: ${guildId}`);
    console.log(`Channel ID: ${channelId}`);

    // Optionally, you can add logic here to filter messages and store the IDs
    // for later use in sending messages programmatically.
  }
});
