const Discord = require('discord.js');

exports.run = async(client, message, args, tools) => {

  const embed = new Discord.MessageEmbed()
    .setColor(client.color)
    .setTitle(`${message.guild.name} - Commands`)
    .setFooter(client.footer);
  
  let commands = [
    ['recent', 'Displays recent server activity'],
    ['pings', 'Displays recent ping activity'],
    ['bans', 'Displays recent server bans'],
    ['kicks', 'Displays recent server kicks'],
    ['channelDels', 'Displays recent server channel deletions'],
    ['roleDels', 'Displays recent server role deletions'],
    ['monitoring', 'Displays currently monitoring activities'],
    ['commands', 'Displays current bot commands'],
    ['limits', 'Displays server action limits']
  ]
  
  let description = '';
  for (var i in commands) description += `**\`g!${commands[i][0]}\`** - *${commands[i][1]}*\n`;
  
  embed.setDescription(description);
 
  message.channel.send(embed);
  
};
