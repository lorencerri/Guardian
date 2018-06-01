const Discord = require('discord.js');

exports.run = async(client, message, args, tools) => {

  const embed = new Discord.MessageEmbed()
    .setColor(client.color)
    .setTitle(`${message.guild.name} - Recent Activity`)
    .setFooter(client.footer);
  
  let pings = (client.guildPings.get(message.guild.id) || []).slice(-10).reverse();
  let removals = client.db.get(`userRemovals_${message.guild.id}`) || [];
  let kicks = (removals.filter(r => r.type === 'guildMemberKick') || []).slice(-10).reverse();
  let bans = (removals.filter(r => r.type === 'guildMemberBan') || []).slice(-10).reverse();
  let roleDeletions = (client.db.get(`roleDeletions_${message.guild.id}`) || []).slice(-10).reverse();
  let channelDeletions = (client.db.get(`channelDeletions_${message.guild.id}`) || []).slice(-10).reverse();

  let pingsMsg = '';
  let kicksMsg = '';
  let bansMsg = '';
  let roleDeletionsMsg = '';
  let channelDeletionsMsg = '';
  
  for (var i in pings) pingsMsg += `\`${client.tools.parseTime(pings[i].timestamp)}\` | **${client.users.get(pings[i].user.id) || pings[i].user.tag}** *pinged* **${pings[i].target}**\n`
  for (var i in kicks) kicksMsg += `\`${client.tools.parseTime(kicks[i].timestamp)}\` | **${client.users.get(kicks[i].executor.id) || kicks[i].executor.tag}** *kicked* **${kicks[i].target.tag}**\n`
  for (var i in bans) bansMsg += `\`${client.tools.parseTime(bans[i].timestamp)}\` | **${client.users.get(bans[i].executor.id) || bans[i].executor.tag}** *banned* **${bans[i].target.tag}**\n`
  for (var i in roleDeletions) roleDeletionsMsg += `\`${client.tools.parseTime(roleDeletions[i].timestamp)}\` | **${client.users.get(roleDeletions[i].executor.id) || roleDeletions[i].executor.tag}** *deleted* **${roleDeletions[i].target.tag}**\n`
  for (var i in channelDeletions) channelDeletionsMsg += `\`${client.tools.parseTime(channelDeletions[i].timestamp)}\` | **${client.users.get(channelDeletions[i].executor.id) || channelDeletions[i].executor.tag}** *deleted* **${channelDeletions[i].target.tag}**\n`

  embed.addField(`Pings (${pings.length})`, pingsMsg || '**No Recent Pings...**');
  embed.addField(`Kicks (${kicks.length})`, kicksMsg || '**No Recent Kicks...**');
  embed.addField(`Bans (${bans.length})`, bansMsg || '**No Recent Bans...**');
  embed.addField(`Role Deletions (${roleDeletions.length})`, roleDeletionsMsg || '**No Recent Deletions...**');
  embed.addField(`Channel Deletions (${channelDeletions.length})`, channelDeletionsMsg || '**No Recent Deletions...**');
  
  message.channel.send(embed);
  
};
