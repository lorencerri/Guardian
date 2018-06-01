const Discord = require('discord.js');

exports.run = async(client, message, args, tools) => {

  const embed = new Discord.MessageEmbed()
    .setColor(client.color)
    .setTitle(`${message.guild.name} - Information`)
    .setDescription('**Invite URL: \nhttps://discordapp.com/api/oauth2/authorize?client_id=451829224307818517&permissions=8&scope=bot**')
    .setFooter(client.footer);
  
  message.channel.send(embed);
  
};
