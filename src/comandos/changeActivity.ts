import { Message } from "discord.js";


export default function changeActivity(message: Message, vars: any){
    let activity = message.content.split(" ").slice(1).join(" ");
    if(activity == ""){
        message.channel.send("**Erro:** Informe uma atividade.");
        return;
    }
    vars.client.user.setActivity(activity);
    message.channel.send("**Atividade alterada com sucesso!**");
}