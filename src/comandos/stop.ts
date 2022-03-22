import { Message } from "discord.js";


export async function musicStop(message: Message, vars: any) {
    const serverQueue = vars.queue.get(message.guild.id);
    if(!message.member.voice.channel) return message.channel.send("Você tem que estar em um canal de voz para parar a música!");
    serverQueue.songs = [];
    const subscription = serverQueue.connection.subscribe(vars.player);
    vars.player.stop();
    subscription.unsubscribe();
}