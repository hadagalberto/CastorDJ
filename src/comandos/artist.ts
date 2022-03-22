import { joinVoiceChannel } from "@discordjs/voice";
import { Message } from "discord.js";
import getVideoId from "get-video-id";
import { playInterno } from "./play";
const yts = require( 'yt-search' )


export async function artist(message: Message, vars: any) {
    const args = message.content.split(" ");
    const serverQueue = vars.queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    if(!voiceChannel){
        message.channel.send("Você precisa estar em um canal de voz para tocar música!");
        return;
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        message.channel.send("Preciso das permissões para entrar e falar no seu canal de voz!");
        return
    }
    const searchTerm = args.slice(1).join(" ");
    const songsInfo = await search(searchTerm);
    const songs = [];
    
    for(let i = 0; i < songsInfo.length; i++){
        const song = {
            title: songsInfo[i].title,
            url: songsInfo[i].url,
            image: songsInfo[i].thumbnail
        };
        songs.push(song);
    }
    
    if(!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            isPlaying: false
        };
        
        vars.queue.set(message.guild.id, queueContruct);
        
        queueContruct.songs.push(...songs);
        
        try {
            var connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            queueContruct.connection = connection;
            playInterno(message.guild, queueContruct.songs[0], message, vars);
            if(songs.length > 1){
                return message.channel.send(`**${songs.length}** músicas adicionadas a playlist!`);
            } else {
                message.channel.send(`A música ${songs[0].title} foi adicionada à fila!`);
            }
        } catch (err) {
            console.log(err);
            vars.queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(...songs);
        if(!serverQueue.isPlaying) {
            playInterno(message.guild, serverQueue.songs[0], message, vars);
        }
        if(songs.length > 1) {
            message.channel.send(`**${songs.length}** músicas de ${searchTerm} adicionadas a playlist!`);
            return;
        } else {
            message.channel.send(`A música **${songs[0].title}** foi adicionada a playlist!`);
            return;
        }
    }
}

async function search(termo){
    
    let video = [];
    
    let busca = await yts(termo);
    let videos = busca.all.slice(0, 10);
    console.log(busca.all.length);
    video.push(...videos);
    
    return video;
}