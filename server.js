// Require Packages
const Discord = require('discord.js'),
      client  = new Discord.Client();

// Extension Variables
client.prefix  = 'g!';
client.ownerID = '144645791145918464';
client.color = 0xDFE0D2;
client.footer = 'Created By Plexi Development • https://discord.gg/plexidev';
client.ignoreBots = true;
client.guildPings = new Map();

// Extension Scripts
client.tools = require('./functions.js');

// Database
const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');

client.db = new Enmap({ provider: new EnmapSQLite({ name: 'database' }) });
client.db.defer.then(() => console.log(`${client.db.size} Entries Loaded`));

// Listener Events
client.on('ready', async () => {
  client.user.setPresence({ activity: { name: `g!help | ${client.guilds.size} Servers` }, status: 'dnd' });
});

client.on('message', message => {
  
  // Return Statements
  if (message.author.bot) return;
  if (message.member.roles.find(r => r.name === 'Muted')) return;
  if (message.channel.type !== 'text') {
    
    const embed = new Discord.MessageEmbed()
      .setColor(client.color)
      .setTitle('Sorry, this bot only runs in servers!')
      .setDescription('**If you would like to invite it, please click [here](https://discordapp.com/api/oauth2/authorize?client_id=451829224307818517&permissions=8&scope=bot).**')
      .setFooter(client.footer)
    
    message.channel.send(embed);
    
  }
  
  // Collect Pings
  let user = { id: message.author.id, tag: message.author.tag };
  let pings = client.guildPings.get(message.guild.id);
  if (!pings) pings = [];
  let pinged = false;
  if (message.mentions.everyone) {
    pings.push({ target: '@everyone/@here', user: user, timestamp: Date.now() });
    pinged = true;
  }
  if (message.mentions.members && message.mentions.members.first()) {
    pinged = true;
    let members = message.mentions.members.array();
    for (var i in members) {
      if (members[i].user.bot || members[i].id === user.id) continue;
      else {
         pings.push({ target: `@${members[i].user.username}`, user: user, timestamp: Date.now() });
      }
    }
  }
  if (message.mentions.roles && message.mentions.roles.first()) {
    pinged = true;
    let roles = message.mentions.roles.array();
    for (var i in roles) {
      if (roles[i].user.bot || roles[i].id === user.id) continue;
      else {
         pings.push({ target: `@${roles[i].name}`, user: user, timestamp: Date.now() });
      }
    }
  }
  
  if (pinged) {
    client.guildPings.set(message.guild.id, pings);
    client.tools.checkPings(client, message.guild, message.author.id); 
  }
  
  // Variables
  let args = message.content.slice(client.prefix.length).trim().split(" "),
      cmd  = args.shift().toLowerCase();
  
  if (!message.content.startsWith(client.prefix)) return;
  
  if (cmd === 'help') cmd = 'commands';
  if (cmd === 'roledels') cmd = 'roledeletions';
  if (cmd === 'channeldels') cmd = 'channeldeletions';
  if (cmd === 'cd') cmd = 'channeldeletions';
  if (cmd === 'rd') cmd = 'roledeletions';
  if (cmd === 'invite') cmd = 'info';

  // Run Commands
  try {
    let commandFile = require(`./commands/${cmd}.js`);
    commandFile.run(client, message, args, client.tools);
  } catch (e) {
    console.log(e.stack);
  }

});

// Login
client.login(process.env.TOKEN);

client.on('guildBanAdd', async guild => {

  // Fetch audit log
  let audit = await client.tools.fetchLastAudit(guild, 'MEMBER_BAN_ADD');
  if (!audit) return;

  let target = audit.target;
  let exec = audit.executor;
  
  if (client.ignoreBots && target.bot) return;
  
  let data = {
    target: {
      id: target.id,
      tag: `@${target.username}#${target.discriminator}`
    },
    executor: {
      id: exec.id,
      tag: `@${exec.username}#${exec.discriminator}`
    },
    timestamp: Date.now(),
    type: 'guildMemberBan'
  }
  
  // Push To Database - Guild
  if (client.db.has(`userRemovals_${guild.id}`)) client.db.push(`userRemovals_${guild.id}`, data);
  else client.db.set(`userRemovals_${guild.id}`, [data]);
  
  // Push To Database - Member
  if (client.db.has(`userRemovals_${guild.id}_${exec.id}`)) client.db.push(`userRemovals_${guild.id}_${exec.id}`, data);
  else client.db.set(`userRemovals_${guild.id}_${exec.id}`, [data]);
  
  // Check Action Count
  client.tools.check(client, guild, exec.id, 'userRemovals');
  
});

client.on('guildMemberRemove', async member => {
  
  // Fetch Audit Log
  let audit = await client.tools.fetchLastAudit(member.guild, 'MEMBER_KICK');
  if (!audit) return;

  // Return if NOT kicked
  if (member.id !== audit.target.id) return;
  if (audit.action !== 'MEMBER_KICK') return;
  
  let target = audit.target;
  let exec = audit.executor;
  
  if (client.ignoreBots && target.bot) return;
  
  let data = {
    target: {
      id: target.id,
      tag: `@${target.username}#${target.discriminator}`
    },
    executor: {
      id: exec.id,
      tag: `@${exec.username}#${exec.discriminator}`
    },
    timestamp: Date.now(),
    type: 'guildMemberKick'
  }
  
  // Push To Database - Guild
  if (client.db.has(`userRemovals_${member.guild.id}`)) client.db.push(`userRemovals_${member.guild.id}`, data);
  else client.db.set(`userRemovals_${member.guild.id}`, [data]);
  
  // Push To Database - Member
  if (client.db.has(`userRemovals_${member.guild.id}_${exec.id}`)) client.db.push(`userRemovals_${member.guild.id}_${exec.id}`, data);
  else client.db.set(`userRemovals_${member.guild.id}_${exec.id}`, [data]);
  
  // Check Action Count
  client.tools.check(client, member.guild, exec.id, 'userRemovals');
  
});

client.on('channelDelete', async channel => {

  // Fetch Audit Log
  let audit = await client.tools.fetchLastAudit(channel.guild, 'CHANNEL_DELETE');
  if (!audit || audit.action !== 'CHANNEL_DELETE') return;
  
  let exec = audit.executor;
  
  let data = {
    target: {
      tag: `#${channel.name}`
    },
    executor: {
      id: exec.id,
      tag: `@${exec.username}#${exec.discriminator}`
    },
    timestamp: Date.now(),
    type: 'guildChannelDelete'
  }
  
  // Push To Database - Guild
  if (client.db.has(`channelDeletions_${channel.guild.id}`)) client.db.push(`channelDeletions_${channel.guild.id}`, data);
  else client.db.set(`channelDeletions_${channel.guild.id}`, [data]);
  
  // Check Action Count
  client.tools.check(client, channel.guild, exec.id, 'channelDeletions');

})

client.on('roleDelete', async role => {
  
  // Fetch Audit Log
  let audit = await client.tools.fetchLastAudit(role.guild, 'ROLE_DELETE');
  if (!audit || audit.action !== 'ROLE_DELETE') return;

  let exec = audit.executor;
  
  let data = {
    target: {
      tag: `@${role.name}`
    },
    executor: {
      id: exec.id,
      tag: `@${exec.username}#${exec.discriminator}`
    },
    timestamp: Date.now(),
    type: 'guildRoleDelete'
  }
  
  // Push To Database - Guild
  if (client.db.has(`roleDeletions_${role.guild.id}`)) client.db.push(`roleDeletions_${role.guild.id}`, data);
  else client.db.set(`roleDeletions_${role.guild.id}`, [data]);
  
  // Check Action Count
  client.tools.check(client, role.guild, exec.id, 'roleDeletions');
  
})

/* Uptime Robot
/ - This can be removed if not hosted on Glitch
- You can also use an external service for uptime */ 

const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);