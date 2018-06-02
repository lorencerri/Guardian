const Discord = require('discord.js'),
      sm = require('string-similarity'),
      ms = require('parse-ms');

module.exports = {
  
  parseTime: function(milliseconds, from, seconds) {
      var string = '', obj;
      if (!from) obj = ms(Date.now() - milliseconds);
      else obj = ms(milliseconds)
      if (obj.days === 1) string += ` ${obj.days} day `
      else if (obj.days > 1) string += ` ${obj.days} days `
      if (obj.hours === 1) string += `${obj.hours} hour `
      else if (obj.hours > 1) string += `${obj.hours} hours `
      if (obj.minutes === 1) string += `${obj.minutes} minute `
      else if (obj.minutes > 1) string += `${obj.minutes} minutes `
      if (seconds && obj.seconds === 1) string += `${obj.seconds} second `
      else if (seconds && obj.seconds > 1) string += `${obj.seconds} seconds `
      if (string === '') string = 'Just now'
      else string += 'ago'
      return string;
    },
  
  fetchLastAudit: async function(guild, type) {
    const getInfo = new Promise((resolve, error) => {
          setTimeout(function(){ // The timeout is to make sure audit log has updated
            if (type) {
              guild.fetchAuditLogs({limit: 1, type: type}).then(item => {
                resolve(item.entries.first())
              }).catch(e => {
                console.log(`Invalid permissions in ${guild.name}`);
                return false;
              })
            } else {
              guild.fetchAuditLogs({limit: 1}).then(item => {
                resolve(item.entries.first())
              }).catch(e => {
                console.log(`Invalid permissions in ${guild.name}`);
                return false;
              })
            }
          }, 500)
        });
      return getInfo;
  },
  
  checkPings: async function(client, guild, id) {
    
    // Fetch Limits
    let limits = client.db.get(`actionLimits_${guild.id}`);
    if (!limits) limits = {};
    let currentLimit = {};
    currentLimit.minute = limits.pingsPM || 5;
    currentLimit.hour = limits.pingPH || 15;
    
    // Fetch Data
    let pings = client.guildPings.get(guild.id);
    pings = pings.filter(p => p.user.id === id);
    let pingsPM = pings.slice(parseInt(`-${currentLimit.minute}`)).reverse();
    let pingsPH = pings.slice(parseInt(`-${currentLimit.hour}`)).reverse();
    
    let reached = null;
    if (pingsPM[currentLimit.minute - 1] && Date.now() - pingsPM[currentLimit.minute - 1].timestamp < 60000) reached = 'Minute';
    else if (pingsPH[currentLimit.hour - 1] && Date.now() - pingsPH[currentLimit.hour - 1].timestamp < 3.6e+6) reached = 'Hour';
    
    if (!reached) return;
    else {
      
      // Add Muted Role
      let muted = guild.roles.find(r => r.name === 'Muted');
      if (muted) guild.members.get(id).roles.add(muted);
      
      if (client.isNode) return;
      
      // Post Announcement
      let channel = guild.channels.find(c => c.name === 'mutes' || c.name === 'mute-repeals');
      if (channel) {
       
        let msg = '';
        let user = client.users.get(id);
        
        if (reached === 'Minute') for (var i in pingsPM) msg += `\`${module.exports.parseTime(pingsPM[i].timestamp)}\` | **${pingsPM[i].user.tag}** *pinged* **${pingsPM[i].target}**\n` 
        else for (var i in pingsPH) msg += `\`${module.exports.parseTime(pingsPH[i].timestamp)}\` | **${pingsPH[i].user.tag}** *pinged* **${pingsPH[i].target}**\n`;
      
        const embed = new Discord.MessageEmbed()
          .setColor(client.color)
          .setTitle(`Ping Limit Reached! - ${reached}`)
          .addField('Recent Actions', msg)
          .addField('Limit Reached By', user, true)
          .addField('Automatic Action Taken', '**Muted Role Added**', true);
        
        // Send Embed
        user.send(embed).catch(err => console.log(err));
        channel.send(embed).catch(err => console.log(err));
        
      }
      
    }
    
  },
  
  check: async function(client, guild, execID, type) {
    
    // Fetch Limits
    let limits = client.db.get(`actionLimits_${guild.id}`);
    if (!limits) limits = {};
    
    let currentLimit = {};
    
    // Types
    if (type === 'userRemovals') {
      
      currentLimit.minute = limits.removalsPM || 5;
      currentLimit.hour = limits.removalsPH || 15;
      
    } else if (type === 'roleDeletions') {
     
      currentLimit.minute = limits.roleDeletionsPM || 4;
      currentLimit.hour = limits.roleDeletionsPH || 12;
      
    } else if (type === 'channelDeletions') {
       
      currentLimit.minute = limits.channelDeletionsPM || 4;
      currentLimit.hour = limits.channelDeletionsPH || 12;
      
    }
    
    // Fetch Data
    let data = client.db.get(`${type}_${guild.id}_${execID}`);
    if (!data) data = [];

    // Splice Limits
    let dataMinute = data.slice(parseInt(`-${currentLimit.minute}`)).reverse();
    let dataHour = data.slice(parseInt(`-${currentLimit.hour}`)).reverse();
    
    // Check Reached
    let reached = null;
    if (dataMinute[currentLimit.minute - 1] && Date.now() - dataMinute[currentLimit.minute - 1].timestamp < 60000) reached = 'Minute';
    if (dataHour[currentLimit.hour - 1] && Date.now() - dataHour[currentLimit.hour - 1].timestamp < 3.6e+6) reached = 'Hour';

    // Act Accordingly
    if (!reached) return;
    else {
      
      // Remove Roles
      guild.members.get(execID).roles.set([]);
      
      if (client.isNode) return;
      
      // Output Message
      let msg = '',
          action = '',
          executor = client.users.get(execID);

      // Check Types
      if (type === 'userRemovals') type = '*kicked/banned*';
      if (type === 'roleDeletions') type = '*deleted*';
      if (type === 'channelDeletions') type = '*deleted*';

      if (reached === 'Minute') for (var i in dataMinute) msg += `\`${module.exports.parseTime(dataMinute[i].timestamp)}\` | **${dataMinute[i].executor.tag}** ${type} **${dataMinute[i].target.tag}**\n` 
      else for (var i in dataHour) msg += `\`${module.exports.parseTime(dataHour[i].timestamp)}\` | **${dataHour[i].executor.tag}** ${type} **${dataHour[i].target.tag}**\n`;
      
      // Form Embed
      const embed = new Discord.MessageEmbed()
        .setColor(client.color)
        .setTitle(`Limit Reached! - ${reached}`)
        .addField('Recent Actions', msg)
        .addField('Limit Reached By', executor, true)
        .addField('Automatic Action Taken', '**All Roles Removed**', true);
      
      // Send Embed
      executor.send(embed).catch(err => console.log(err));
      guild.owner.send(embed).catch(err => console.log(err));
      
    }
      
    
    
  }
  
}
