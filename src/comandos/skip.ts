import { Message } from "discord.js";
import { playInterno } from "./play";


export async function skip(message: Message, vars: any) {
    const serverQueue = vars.queue.get(message.guild.id);
    if(!message.member.voice.channel) return message.channel.send("Você tem que estar em um canal de voz para parar a música!");
    if(!serverQueue) return message.channel.send("Não há música que eu possa pular!");

    if(serverQueue.songs.length > 1) {
        serverQueue.songs.shift();
        playInterno(message.guild, serverQueue.songs[0], message, vars);
        message.channel.send("Pulou a música!");
    } else {
        message.channel.send("Não há música que eu possa pular!");
    }
}