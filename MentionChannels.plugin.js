/**
 * @name MentionChannels
 * @author CT-1409
 * @version 2.0.1
 */

    const config = {
        info: {
            name: "MentionChannels",
            authors: [
                {
                    name: "CT-1409",
                    discord_id: "272875632088842240",
                }
            ],
            version: "2.0.1",
            description: "Adds a button that puts the mention for the channel clicked in your message, like Discord does for users.",
        },
        changelog: [
            {
                "title": "Threads", 
                "items":[
                    "Added support for threads! \n- Thanks XxUnkn0wnxX for bringing it to my attention."
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

        const { Patcher, WebpackModules, DCM, DiscordAPI, DiscordModules } = Library;
        const channels = WebpackModules.getModule(m => m?.default?.displayName === "ChannelListTextChannelContextMenu")
        const threadchannels = WebpackModules.getModule(m => m?.default?.displayName === "ChannelListThreadContextMenu")
        const voicechannels = WebpackModules.getModule(m => m?.default?.displayName === "ChannelListVoiceChannelContextMenu")

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



                Patcher.after(channels, "default", (_, args, component) => {
                    let props = args[0]
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


                Patcher.after(voicechannels, "default", (_, args, component) => {
                    let props = args[0]
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

                Patcher.after(threadchannels, "default", (_, args, component) => {
                    let props = args[0]
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

            onLoad() {
            }

            onStop() {
                Patcher.unpatchAll();
            }

        }
    })(global.ZeresPluginLibrary.buildPlugin(config));
