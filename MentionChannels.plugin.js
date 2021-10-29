/**
 * @name MentionChannels
 * @author CT-1409
 * @version 3.0.0
 */

const config = {
    info: {
        name: "MentionChannels",
        authors: [
            {
                name: "Echology",
                discord_id: "272875632088842240",
            }
        ],
        version: "3.0.0",
        description: "Adds a button that puts the mention for the channel clicked in your message, like Discord does for users.",
    },
    changelog: [
        {
            "title": "Fix Thingy", 
            "items":[
                "Something broke, so I unbroke it"
            ]
        }
    ]   
};

module.exports = !global.ZeresPluginLibrary ? class {

    constructor() {
        this._config = config;
    }

    load() {
        BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
            confirmText: "Download Now",
            cancelText: "Cancel",
            onConfirm: () => {
                require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, _response, body) => {
                    if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                });
            }
        });
    }

    start() { }

    stop() { }
} : (([Plugin, Library]) => {

    const reg = /(ChannelList)(.*)(ContextMenu)/gm

    const { Patcher, WebpackModules, DCM } = Library;
    const channels = WebpackModules.getModule(m => m?.default?.displayName === "ChannelListTextChannelContextMenu")
    const threadchannels = WebpackModules.getModule(m => m?.default?.displayName === "ChannelListThreadContextMenu")
    const voicechannels = WebpackModules.getModule(m => m?.default?.displayName === "ChannelListVoiceChannelContextMenu")

    const toPatch = WebpackModules.getModules(m => reg.test(m?.default?.displayName))

    const Permissions = BdApi.findModuleByProps("Permissions", "ActivityTypes").Permissions; 
    const ChannelPermissionUtils = BdApi.findModuleByProps("can", "canEveryone");
    const UserStore = BdApi.findModuleByProps("getCurrentUser");
    const ChannelStore = BdApi.findModuleByProps("getDMFromUserId", "getChannel");
    const LastChannelStore = BdApi.findModuleByProps("getLastSelectedChannelId", "getChannelId");

    return class MentionChannels extends Plugin {
        constructor() {
            super();
        }

        async onStart() {
            this.patch()
        }

        patch() {

            for(var item of toPatch) {
                
                (item)
                Patcher.after(item, "default", (_, [props], component) => {
                    let channel = props.channel

                    if (ChannelPermissionUtils.can(Permissions.SEND_MESSAGES, UserStore.getCurrentUser().id, ChannelStore.getChannel(LastChannelStore.getChannelId()))) {
                        let item = DCM.buildMenuItem({
                            label: "Mention",
                            type: "Text",
                            action: () => {
                                BdApi.findModuleByProps('ComponentDispatch').ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
                                    content: "<#"+channel.id+">"
                                })
                            }
                        })
                        component.props.children.unshift(item)
                    }
                })

            }

        }

        onLoad() {
        }

        onStop() {
            Patcher.unpatchAll();
        }

    }
})(global.ZeresPluginLibrary.buildPlugin(config));
