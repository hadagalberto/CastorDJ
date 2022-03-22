// import prefix and token from config.json
const { prefix, token } = require("./config.json");
const { Client, Intents } = require('discord.js');
const ytdl = require('ytdl-core');
const { createAudioResource, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel } = require("@discordjs/voice");
const getVideoId = require('get-video-id');
const yts = require( 'yt-search' )
const url = require('url');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

const queue = new Map();

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

client.once("ready", () => {
    console.log(client.user.username + " is running on " + client.guilds.cache.size + " servers.");
    client.user.setActivity("zraizen_", {type: "STREAMING", url: "https://www.twitch.tv/zraizen_"});
});

client.once("reconnecting", () => {
    console.log("Reconnecting!");
});

client.once("disconnect", () => {
    console.log("Disconnected!");
});

client.on("message", async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    
    const serverQueue = queue.get(message.guild.id);
    
    if(message.content.startsWith(`${prefix}play`) || message.content.startsWith(`${prefix}p`)) {
        execute(message, serverQueue);
        return;
    } else if(message.content.startsWith(`${prefix}skip`) || message.content.startsWith(`${prefix}s`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`) || message.content.startsWith(`${prefix}t`)) {
        stop(message, serverQueue);
        return;
    } else if(message.content.startsWith(`${prefix}list`) || message.content.startsWith(`${prefix}l`)) {
        list(message, serverQueue);
        return;    
    } else {
        message.channel.send(("Comando inválido!"));
    }
});

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

async function execute(message, serverQueue) {
    const args = message.content.split(" ");
    
    const voiceChannel = message.member.voice.channel;
    if(!voiceChannel) return message.channel.send("Você precisa estar em um canal de voz para tocar música!");
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send("Preciso das permissões para entrar e falar no seu canal de voz!");
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
        
        queue.set(message.guild.id, queueContruct);
        
        queueContruct.songs.push(...songs);
        
        try {
            var connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0], message);
            if(songs.length > 1){
                return message.channel.send(`**${songs.length}** músicas adicionadas a playlist!`);
            } else {
                message.channel.send(`A música ${songs[0].title} foi adicionada à fila!`);
            }
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(...songs);
        if(!serverQueue.isPlaying) {
            play(message.guild, serverQueue.songs[0], message);
        }
        if(songs.length > 1) {
            return message.channel.send(`**${songs.length}** músicas adicionadas a playlist!`);
        } else {
            return message.channel.send(`A música **${songs[0].title}** foi adicionada a playlist!`);
        }
    }
}

async function skip(message, serverQueue){
    if(!message.member.voice.channel) return message.channel.send("Você tem que estar em um canal de voz para parar a música!");
    if(!serverQueue) return message.channel.send("Não há música que eu possa pular!");
    serverQueue.songs.shift();
    play(message.guild, serverQueue.songs[0], message);
}

async function stop(message, serverQueue){
    if(!message.member.voice.channel) return message.channel.send("Você tem que estar em um canal de voz para parar a música!");
    serverQueue.songs = [];
    const subscription = serverQueue.connection.subscribe(player);
    subscription.unsubscribe();
}

async function play(guild, song, message) {
    const serverQueue = queue.get(guild.id);
    
    if(!song) {
        queue.delete(guild.id);
        message.channel.send(`A fila acabou!`);
        return;
    }
    
    const resource = createAudioResource(ytdl(song.url, { filter: "audioonly", quality: "highestaudio", highWaterMark: 1 << 25 }));
    player.play(resource);
    
    setTimeout(() => {
        player.on(AudioPlayerStatus.Idle, () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0], message);
        });
    }, 5000);
    
    player.on('error', (err) => {
        console.error(err);
    });
    
    serverQueue.connection.subscribe(player);
    serverQueue.isPlaying = true;
    queue.set(guild.id, serverQueue);
    
    serverQueue.textChannel.send(`Tocando: **${song.title}** - ${song.url}`);
}

async function list(message, serverQueue){
    if(!serverQueue) return message.channel.send("Não há música que eu possa mostrar!");
    
    var arrays = sliceIntoChunks(serverQueue.songs, 10);
    let musicCOunt = 0;
    for(let i = 0; i < arrays.length; i++){
        let stringSend = "";
        for(let j = 0; j < arrays[i].length; j++){
            stringSend += `**${musicCOunt+1}** - **${arrays[i][j].title}**\n`;
            musicCOunt++;
        }
        message.channel.send(stringSend);
    }
}

function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

client.login(token);