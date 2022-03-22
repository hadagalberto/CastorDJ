import { Message } from "discord.js";


export default function servers(message: Message, vars: any){
    let serversNames = [];
    vars.client.guilds.cache.forEach(element => {
        serversNames.push(element.name);
    });

    let arrays = sliceIntoChunks(serversNames, 10);
    for(let i = 0; i < arrays.length; i++){
        let stringSend = i == 0 ? "**Servidores:**\n" : "";
        for(let j = 0; j < arrays[i].length; j++){
            stringSend += `${arrays[i][j]}\n`;
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