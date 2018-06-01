const Discord = require('discord.js');

exports.run = async (client, message, args, tools) => {

  // Form Embed
  const embed = new Discord.MessageEmbed()
    .setColor(client.color);
  
  if (message.author.id !== client.ownerID) {
    
    // Modify Embed
    embed.setFooter('Sorry, this command is reserved for developers.');
    
    // Send Response
    return message.channel.send(embed);
    
  }
  
  // Modify Embed (Default)
  embed.setFooter(`Successfully reloaded: ${args[0]}`);
  
  // Delete from cache
  try {
    delete require.cache[require.resolve(`./${args[0]}.js`)];
  } catch (e) {
    // Modify Embed (Error Fallback)
    embed.setFooter(`Unable to reload: ${args[0]}`);
  }
  
  message.channel.send(embed);

}