import { Message } from "discord.js";


export default function isAdmin(message: Message, vars: any){
    var admins = vars.admins;
    if(admins.includes(message.author.id)){
        message.channel.send("**Você é um administrador!**");
    } else {
        message.channel.send("**Você não é um administrador!**");
    }
}