const Discord = require('discord.js');

exports.run = async (client, message, args, tools) => {
  
  let online = client.guilds.get('451829319589691394').emojis.find(e => e.name === 'online').toString();
  let offline = client.guilds.get('451829319589691394').emojis.find(e => e.name === 'offline').toString();
  
  // Form Embed
  const embed = new Discord.MessageEmbed()
    .setColor(client.color)
    .setTitle('Currently Monitoring')
    .setDescription(`**${online} Pings\n${online} Kicks\n${online} Bans\n${online} Channel Deletions\n${online} Role Deletions**`);
  
  message.channel.send(embed);

}