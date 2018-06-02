const Discord = require('discord.js');

exports.run = async(client, message, args, tools) => {

  const embed = new Discord.MessageEmbed()
    .setColor(client.color)
    .setTitle('Node Information')
    .addField('What Are Nodes?', '*Nodes are separate servers, hosted in different locations to ensure 100% uptime.*')
    .addField('How Do They Work?', '*Nodes can only carry out actions based on the set limits, they also output some text as confirmations, but the primary server handles the majority of those.*')
    .addField('How Many Are Running?', '*There is currently **1** node running alongside the primary server, with more coming soon.*')
  
  message.channel.send(embed);
  
};
