import { Message } from "discord.js";


export default function userid(message: Message, vars: any){
    message.channel.send(`**ID do usuário:** ${message.author.id}`);
}