const Discord = require('discord.js');

exports.run = async(client, message, args, tools) => {

  const embed = new Discord.MessageEmbed()
    .setColor(client.color)
    .setTitle(`${message.guild.name} - Recent Bans`);
  
  let removals = client.db.get(`userRemovals_${message.guild.id}`) || [];
  let bans = removals.filter(r => r.type === 'guildMemberBan');
  let msg = '';
  
  if (!bans || bans.length === 0) {
   
    embed.setDescription('**No Recent Deletions...**')
         .setFooter(client.footer);
    
    return message.channel.send(embed);
    
  }
  
  bans = bans.slice(-20).reverse();
  
  for (var i in bans) msg += `\`${client.tools.parseTime(bans[i].timestamp)}\` | **${client.users.get(bans[i].executor.id) || bans[i].executor.tag}** *banned* **${bans[i].target.tag}**\n`

  embed.setDescription(msg)
       .setFooter(`${bans.length} Most Recent • ${client.footer}`);
  
  message.channel.send(embed);
  
};
