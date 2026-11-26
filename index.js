const http = require('http');
const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Paste your text channel ID here (e.g., '123456789012345678'), or leave '' to post inside the VC's built-in text chat
const TARGET_CHANNEL_ID = '';

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  console.log(`Voice update: ${newState.member?.user.tag} | old: ${oldState.channelId} -> new: ${newState.channelId}`);

  if (newState.member?.user.bot) return;

  if (!oldState.channelId && newState.channelId) {
    try {
      const channel = TARGET_CHANNEL_ID
        ? await newState.guild.channels.fetch(TARGET_CHANNEL_ID)
        : newState.channel;

      if (!channel) {
        console.log('Error: Target channel not found.');
        return;
      }

      await channel.send({
        content: `@everyone ${newState.member} joined **${newState.channel.name}** — join the vc now!`,
        allowedMentions: { parse: ['everyone'] }
      });
      console.log(`Sent VC ping to #${channel.name}`);
    } catch (err) {
      console.error('Failed to send VC ping:', err);
    }
  }
});

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

const port = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is online\n');
}).listen(port, () => {
  console.log(`Health check server listening on port ${port}`);
});

client.login(process.env.DISCORD_TOKEN);
