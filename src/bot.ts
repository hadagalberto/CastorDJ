import { createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';
import { Client, Intents, Message } from 'discord.js';
import { artist } from './comandos/artist';
import isAdmin from './comandos/isAdmin';
import { list } from './comandos/list';
import { next } from './comandos/next';
import { play } from './comandos/play';
import servers from './comandos/servers';
import { skip } from './comandos/skip';
import { musicStop } from './comandos/stop';
import uptime from './comandos/uptime';
import userid from './comandos/userid';
const fs = require('fs')

class Bot {
    
    public client: Client;
    private prefix: string;
    
    public vars: any = {};
    
    constructor() {
    }
    
    async authenticate(_token: string, _prefix: string): Promise<Client> {
        var promise = new Promise<Client>((resolve) => {
            this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
            this.prefix = _prefix;
            this.setupBot();
            this.client.login(_token);

            resolve(this.client);
        });

        return promise;
    }
    
    async sendMessage(message, text){
        message.channel.send(text);
    }

    async setupBot(){
        this.vars = {
            client: this.client,
            queue: new Map(),
            player: createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause
                }
            }),
            admins: JSON.parse(fs.readFileSync('./config.json', 'utf8')).admins
        }
        this.setupCommands();
        this.client.on("ready", () => {
            console.log(this.client.user.username + " está presente em " + this.client.guilds.cache.size + " servidores.");
            this.client.user.setActivity("zraizen_", {type: "STREAMING", url: "https://www.twitch.tv/zraizen_"});
        });
    }
    
    async setupCommands() {
        this.client.on('message', (message: Message) => {
            if(message.author.bot) return;
            if(!message.content.startsWith(this.prefix)) return;
            
            if(message.content.startsWith(`${this.prefix}play`) || message.content.startsWith(`${this.prefix}p `)) {
                play(message, this.vars);
                return;
            } else if(message.content.startsWith(`${this.prefix}skip`) || message.content.startsWith(`${this.prefix}s`) && !message.content.startsWith(`${this.prefix}st`) && !message.content.startsWith(`${this.prefix}stop`) && !message.content.startsWith(`${this.prefix}servers`)) {
                skip(message, this.vars);
                return;
            } else if(message.content.startsWith(`${this.prefix}stop`) || message.content.startsWith(`${this.prefix}st`)) {
                musicStop(message, this.vars);
                return;
            } else if(message.content.startsWith(`${this.prefix}list`) || message.content.startsWith(`${this.prefix}l`)) {
                list(message, this.vars)
                return;
            } else if(message.content.startsWith(`${this.prefix}ping`)) {
                this.sendMessage(message, "Pong!");
                return;
            } else if(message.content.startsWith(`${this.prefix}artista`) || message.content.startsWith(`${this.prefix}art`)) {
                artist(message, this.vars);
                return;
            } else if(message.content.startsWith(`${this.prefix}pnext`) || message.content.startsWith(`${this.prefix}pn `)) {
                next(message, this.vars);
                return;                
            } else if(message.content.startsWith(`${this.prefix}servers`) ) {
                servers(message, this.vars);
                return;
            } else if(message.content.startsWith(`${this.prefix}uptime`) || message.content.startsWith(`${this.prefix}up`)) {
                uptime(message, this.vars);
                return;
            } else if(message.content.startsWith(`${this.prefix}isadmin`) || message.content.startsWith(`${this.prefix}ia`)) {
                isAdmin(message, this.vars);
                return;
            } else if(message.content.startsWith(`${this.prefix}userid` || `${this.prefix}uid`)) {
                userid(message, this.vars);
                return;
            } else if(message.content.startsWith(`${this.prefix}setactivity` || `${this.prefix}sa`)) {
                this.sendMessage(message, "**Erro:** Informe uma atividade.");
            } else if(message.content.startsWith(`${this.prefix}help`)) {
                this.sendMessage(message, `Olá, eu sou o ${this.client.user.username}\n` +
                "Para usar meus comandos, digite:\n" +
                "`" + this.prefix + "play` ou `" + this.prefix + "p` - Para tocar uma música\n" +
                "`" + this.prefix + "skip` ou `" + this.prefix + "s` - Para pular uma música\n" +
                "`" + this.prefix + "stop` ou `" + this.prefix + "st` - Para parar a música e limpar a playst\n" +
                "`" + this.prefix + "list` ou `" + this.prefix + "l` - Para listar as músicas que estão tocando\n" +
                "`" + this.prefix + "artista` ou `" + this.prefix + "art` - Para adicionar 10 músicas de um artista/grupo\n" +
                "`" + this.prefix + "pnext` ou `" + this.prefix + "pn` - Para adicionar uma música para ser tocada a seguir\n" +
                "`" + this.prefix + "servers` - Para ver quantos servidores estão conectados\n" +
                "`" + this.prefix + "uptime` ou `" + this.prefix + "up` - Para ver o tempo de atividade do bot\n" +
                "`" + this.prefix + "isadmin` ou `" + this.prefix + "ia` - Para ver se você é um administrador\n" +
                "`" + this.prefix + "userid` ou `" + this.prefix + "uid` - Para ver o seu ID\n" +
                "`" + this.prefix + "setactivity` ou `" + this.prefix + "sa` - Para alterar a atividade do bot\n" +
                "`" + this.prefix + "ping` - Para ver se o bot está online\n" +
                "`" + this.prefix + "help` - Para ver os comandos`");
                return;
            } else {
                this.sendMessage(message, "Comando inválido!");
                return;
            }
        });
    }
    
}
export default Bot;