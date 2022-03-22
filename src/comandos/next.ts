import { joinVoiceChannel } from "@discordjs/voice";
import { Message } from "discord.js";
import getVideoId from "get-video-id";
import { playInterno } from "./play";
const yts = require( 'yt-search' )

export async function next(message: Message, vars: any) {
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
        songs.splice(1, 0, song);
    }
    
    if(!serverQueue) {
        return message.channel.send(`É necessário que eu esteja tocando alguma música para poder adicionar músicas!`);
    } else {
        serverQueue.songs.splice(1, 0, ...songs);
        if(!serverQueue.isPlaying) {
            playInterno(message.guild, serverQueue.songs[0], message, vars);
        }
        if(songs.length > 1) {
            message.channel.send(`**${songs.length}** músicas adicionadas a playlist!`);
            return;
        } else {
            message.channel.send(`A música **${songs[0].title}** foi adicionada para tocar a seguir na playlist!`);
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