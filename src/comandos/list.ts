import { Message } from "discord.js";


export async function list(message: Message, vars: any) {
    const serverQueue = vars.queue.get(message.guild.id);
    if(!serverQueue) return message.channel.send("Não há música que eu possa listar!");
    var arrays = sliceIntoChunks(serverQueue.songs, 10);
    let musicCount = 0;
    for(let i = 0; i < arrays.length; i++){
        let stringSend = "";
        for(let j = 0; j < arrays[i].length; j++){
            if(musicCount == 0){
                stringSend += `**Atual** - **${arrays[i][j].title}**\n`;
            } else {
                stringSend += `**${musicCount+1}** - **${arrays[i][j].title}**\n`;
            }
            musicCount++;
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