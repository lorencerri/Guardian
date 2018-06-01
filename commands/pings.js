const Discord = require('discord.js');

exports.run = async(client, message, args, tools) => {

  const embed = new Discord.MessageEmbed()
    .setColor(client.color)
    .setTitle(`${message.guild.name} - Recent Pings`);
  
  let pings = client.guildPings.get(message.guild.id);
  let msg = '';
  
  if (!pings || pings.length === 0) {
   
    embed.setDescription('**No Recent Pings...**')
         .setFooter(client.footer);
    
    return message.channel.send(embed);
    
  }
  
  pings = pings.slice(-20).reverse();
  
  for (var i in pings) msg += `\`${client.tools.parseTime(pings[i].timestamp)}\` | **${client.users.get(pings[i].user.id) || pings[i].user.tag}** *pinged* **${pings[i].target}**\n`

  embed.setDescription(msg)
       .setFooter(`${pings.length} Most Recent • ${client.footer}`);
  
  message.channel.send(embed);
  
};
