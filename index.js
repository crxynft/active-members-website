const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const GUILD_ID = "Your Guild ID";
const activityCount = new Map();

discordClient.on("ready", async () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);
  const guild = await discordClient.guilds.fetch(GUILD_ID);
  await guild.members.fetch();
});

discordClient.on("messageCreate", async (message) => {
  if (message.author.bot || message.guild.id !== GUILD_ID) return;

  const userId = message.author.id;
  activityCount.set(userId, (activityCount.get(userId) || 0) + 1);

  const sortedMembers = await getSortedMembers();
  io.emit("updateMembers", sortedMembers);
});

async function getSortedMembers() {
  const guild = await discordClient.guilds.fetch(GUILD_ID);
  const sortedMembers = [...activityCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return Promise.all(
    sortedMembers.map(async ([userId, count]) => {
      const member = await guild.members.fetch(userId);
      return {
        id: userId,
        username: member.user.username,
        avatarURL: member.user.displayAvatarURL({ format: "png", size: 128 }),
        count: count,
      };
    }),
  );
}

app.get("/", async (req, res) => {
  const sortedMembers = await getSortedMembers();
  res.render("index", { members: sortedMembers });
});

io.on("connection", (socket) => {
  console.log("A user connected");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

discordClient.login(
  "Your Bot Token",
);
