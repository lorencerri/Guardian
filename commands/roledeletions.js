const Discord = require('discord.js');

exports.run = async(client, message, args, tools) => {

  const embed = new Discord.MessageEmbed()
    .setColor(client.color)
    .setTitle(`${message.guild.name} - Recent Role Deletions`);
  
  let removals = client.db.get(`roleDeletions_${message.guild.id}`);
  let msg = '';
  
  if (!removals || removals.length === 0) {
   
    embed.setDescription('**No Recent Deletions...**')
         .setFooter(client.footer);
    
    return message.channel.send(embed);
    
  }
  
  removals = removals.slice(-20).reverse();
  
  for (var i in removals) msg += `\`${client.tools.parseTime(removals[i].timestamp)}\` | **${client.users.get(removals[i].executor.id) || removals[i].executor.tag}** *deleted* **${removals[i].target.tag}**\n`

  embed.setDescription(msg)
       .setFooter(`${removals.length} Most Recent • ${client.footer}`);
  
  message.channel.send(embed);
  
};
