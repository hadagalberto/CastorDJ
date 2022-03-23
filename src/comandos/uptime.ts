import { Message } from "discord.js";


export default function uptime(message: Message, vars: any){
    let uptime = Math.floor(vars.client.uptime / 1000);
    let days = Math.floor(uptime / 86400);
    let hours = Math.floor(uptime / 3600);
    let minutes = Math.floor(uptime / 60);
    let seconds = Math.floor(uptime % 60);

    let stringSend = "**Uptime:**\n";
    if(days > 0){
        stringSend += `${days} dia(s)\n`;
    }
    if(hours > 0){
        stringSend += `${hours} hora(s)\n`;
    }
    if(minutes > 0){
        stringSend += `${minutes} minuto(s)\n`;
    }
    if(seconds > 0){
        stringSend += `${seconds} segundo(s)\n`;
    }
    message.channel.send(stringSend);
}