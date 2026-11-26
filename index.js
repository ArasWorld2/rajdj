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

// Paste your text channel ID here, or leave '' to post inside the VC's own text chat
const TARGET_CHANNEL_ID = '';

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  // Ignore bots
  if (newState.member?.user.bot) return;

  // Trigger only when someone freshly joins a VC (was not in a VC before, and is in one now)
  if (!oldState.channelId && newState.channelId) {
    const channel = TARGET_CHANNEL_ID
      ? newState.guild.channels.cache.get(TARGET_CHANNEL_ID)
      : newState.channel;

    if (!channel) return;

    await channel.send({
      content: `@everyone ${newState.member} joined **${newState.channel.name}** — join the vc now!`,
      allowedMentions: { parse: ['everyone'] }
    });
  }
});

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

// Keep-alive HTTP server for Northflank health checks
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is online\n');
}).listen(port, () => {
  console.log(`Health check server listening on port ${port}`);
});

client.login(process.env.DISCORD_TOKEN);
