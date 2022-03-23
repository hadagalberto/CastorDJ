import { AudioPlayerStatus, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { Message } from "discord.js";
import getVideoId from "get-video-id";
import ytdl from "ytdl-core";
const yts = require( 'yt-search' )
const voice = require('@discordjs/voice');


export async function play(message: Message, vars: any) {
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
            message.channel.send(`**${songs.length}** músicas adicionadas a playlist!`);
            return;
        } else {
            message.channel.send(`A música **${songs[0].title}** foi adicionada a playlist!`);
            return;
        }
    }
}

async function search(termo){
    
    let videoId = false;
    let playlistId = false;
    if(termo.includes('youtube.com') || termo.includes('youtu.be')){
        if(termo.includes('playlist')){
            playlistId = true;
            const current_url = new URL(termo);
            termo = current_url.searchParams.get('list');
        } else {
            videoId = true;
            termo = getVideoId(termo).id;
        }
    }
    
    let video = [];
    
    if(!videoId && !playlistId){
        let videos = await yts(termo);
        video.push(videos.all[0]);
    } else if (videoId) {
        let videos = await yts( {videoId: termo} );
        video.push(videos);
    } else {
        let playlist = await yts( {listId: termo} );
        for(let i = 0; i < playlist.videos.length; i++){
            video.push({title: playlist.videos[i].title, url: `https://www.youtube.com/watch?v=${playlist.videos[i].videoId}`, thumbnail: playlist.videos[i].thumbnail});
        }
    }
    
    return video;
}

export async function playInterno(guild, song, message, vars) {
    const serverQueue = vars.queue.get(guild.id);
    
    if(!song) {
        vars.queue.delete(guild.id);
        message.channel.send(`A fila acabou!`);
        voice.getVoiceConnection(guild.id).disconnect();
        return;
    }
    
    const resource = createAudioResource(ytdl(song.url, { filter: "audioonly", quality: "highestaudio", highWaterMark: 1 << 25 }));
    vars.player.play(resource);
    
    setTimeout(() => {
        vars.player.on(AudioPlayerStatus.Idle, () => {
            playInterno(guild, serverQueue.songs[0], message, vars);
            serverQueue.songs.shift();
        });
    }, 5000);
    
    vars.player.on('error', (err) => {
        console.error(err);
    });
    
    serverQueue.connection.subscribe(vars.player);
    serverQueue.isPlaying = true;
    vars.queue.set(guild.id, serverQueue);
    
    serverQueue.textChannel.send(`Tocando: **${song.title}** - ${song.url}`);
}