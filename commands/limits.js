const Discord = require('discord.js');

exports.run = async(client, message, args, tools) => {

  // Create Embed
  const embed = new Discord.MessageEmbed()
    .setTitle(`${message.guild.name} - Action Limits`)
    .setColor(client.color)
    .setFooter(client.footer);
  
  // Fetch Limits
  let limits = client.db.get(`actionLimits_${message.guild.id}`);
  if (!limits) limits = {};
  
  if (!args[0]) {

    let data = [
      `\n__Channel Deletions__`,
      `1. Per Minute: \`${limits.channelDeletionsPM || 4}\``,
      `2. Per Hour: \`${limits.channelDeletionsPH || 12}\``,
      `Action: **\`Remove All Roles\`**`,
      `\n__Role Deletions__`,
      `3. Per Minute: \`${limits.roleDeletionsPM || 4}\``,
      `4. Per Hour: \`${limits.roleDeletionsPH || 12}\``,
      `Action: **\`Remove All Roles\`**`,
      `\n__Kicks/Bans__`,
      `5. Per Minute: \`${limits.removalsPM || 5}\``,
      `6. Per Hour: \`${limits.removalsPH || 15}\``,
      `Action: **\`Remove All Roles\`**`,
      `\n__Pings__`,
      `7. Per Minute: \`${limits.pingsPM || 5}\``,
      `8. Per Hour: \`${limits.pingsPH || 15}\``,
      `Action: **\`Add Muted Role\`**\n`
    ]

    let msg = '';
    for (var i in data) msg += `${data[i]}\n`;

    // Update Embed
    embed.setDescription(`\n*If a user reaches any of these values,\nthe follow action will be applied to their account.*\n**${msg}**`)
         .addField('Changing Limits...', '**`g!limits index value`**\n\n**Example: \`g!limits 7 10\`**\nThis would set the max pings per minute to 10');

    // Send Embed
    message.channel.send(embed);
    
  } else {
   
    if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(embed.setTitle('Invalid Permissions').setFooter('Sorry, this requires the administrator permission.'));
    if (!args[1]) return message.channel.send(embed.setTitle('Invalid Usage').setDescription('**Example:** `g!limits 7 10`\n*-> This would set the max pings per minute to 10*'));
    args[1] = parseInt(args[1]);
    if (!args[1]) return message.channel.send(embed.setTitle('Invalid Usage').setDescription('**Example:** `g!limits 7 10`\n*-> This would set the max pings per minute to 10*'));
    if (args[1] > 30 || args[1] < 3) return message.channel.send(embed.setTitle('Invalid Value').setFooter('Sorry, the value has to be between 3 & 30!'))
    args[0] = parseInt(args[0]);
    
    let index = '';
    if (args[0] == 1) index = 'channelDeletionsPM';
    if (args[0] == 2) index = 'channelDeletionsPH';
    if (args[0] == 3) index = 'roleDeletionsPM';
    if (args[0] == 4) index = 'roleDeletionsPH';
    if (args[0] == 5) index = 'removalsPM';
    if (args[0] == 6) index = 'removalsPH';
    if (args[0] == 7) index = 'pingsPM';
    if (args[0] == 8) index = 'pingsPH';
    
    limits[index] = args[1];
    client.db.set(`actionLimits_${message.guild.id}`, limits);
    
    embed.setTitle('Successfully Updated')
         .setFooter(`Updated ${index} to ${args[1]}`)
    
    message.channel.send(embed);
    
  }
  
};
