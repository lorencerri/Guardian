const Discord = require('discord.js');
const hastebin = require('hastebin-gen');

exports.run = async(client, message, args, tools) => {

    if (message.author.id !== '144645791145918464') {

        const embed = new Discord.MessageEmbed()
            .setFooter('You don\t have the proper permissions to run this.')
            .setColor(0xffffff)

        return send(embed)

    }

    function clean(text) {
        if (typeof text !== 'string')
            text = require('util').inspect(text, { depth: 0 })
        let rege = new RegExp(client.token, "gi");
        text = text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
            .replace(rege, '404: Missing Token')
        return text;
    };

    async function send(embed) {
        message.channel.send(embed);
    }

    const evalEmbed = new Discord.MessageEmbed().setColor(0xffffff)
    const code = args.join(' ');
    try {
        const evaled = clean(await eval(code));
        evalEmbed.addField('📥 Input', `\`\`\`\n${code}\n\`\`\``)
        if (evaled.constructor.name === 'Promise') evalEmbed.addField('📤 Output (Promise)', `\`\`\`xl\n${evaled}\n\`\`\``)
        else evalEmbed.addField('📤 Output', `\`\`\`xl\n${evaled}\n\`\`\``)
        evalEmbed.setColor('0x42f468')
        if (evaled.length < 800) { send(evalEmbed) }
        else {
            let url = await hastebin(evaled, "js").catch(err => console.log(err.stack));
            const newEmbed = new Discord.MessageEmbed()
                .addField('📥 Input', `\`\`\`\n${code}\n\`\`\``)
                .addField('📤 Output', `\n**[${url}](${url})**`)
                .setColor('0x42f468');
            send(newEmbed);
        }
    }
    catch (err) {
        evalEmbed.setColor('0xff0000');
        evalEmbed.addField('📤 Output', `\`\`\`xl\n${err}\n\`\`\``);

        message.channel.send(evalEmbed);
    }

};
