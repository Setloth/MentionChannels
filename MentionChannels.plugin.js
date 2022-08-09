/**
 * @name MentionChannels
 * @author Echology
 * @version 4.2.0+2
 */

const config = {
    info: {
        name: "MentionChannels",
        authors: [
            {
                name: "Echology",
                discord_id: "272875632088842240",
            },
        ],
        version: "4.2.0+2",
        description:
            "Adds a button that puts the mention for the channel clicked in your message, like Discord does for users.",
    },
    changelog: [
        {
            title: "BD Update",
            items: ["Updated plugin to follow new BD Update"],
        },
    ],
}

module.exports = !global.ZeresPluginLibrary
    ? class {
          constructor() {
              this._config = config
          }

          load() {
              BdApi.showConfirmationModal(
                  "Library Missing",
                  `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
                  {
                      confirmText: "Download Now",
                      cancelText: "Cancel",
                      onConfirm: () => {
                          require("request").get(
                              "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                              async (error, _response, body) => {
                                  if (error)
                                      return require("electron").shell.openExternal(
                                          "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                                      )
                                  await new Promise((r) =>
                                      require("fs").writeFile(
                                          require("path").join(
                                              BdApi.Plugins.folder,
                                              "0PluginLibrary.plugin.js"
                                          ),
                                          body,
                                          r
                                      )
                                  )
                              }
                          )
                      },
                  }
              )
          }

          start() {}

          stop() {}
      }
    : (([Plugin, Library]) => {
          const { Patcher, ContextMenu: DCM } = Library

          const { getModule, Filters } = BdApi.Webpack
          const getByProps = (...strs) => getModule(Filters.byProps(...strs))
          const { Permissions } = getByProps("Permissions", "ActivityTypes"),
              { SEND_MESSAGES } = Permissions
          const { can } = getByProps("can", "canEveryone")
          const { getCurrentUser } = getByProps("getCurrentUser")
          const { getChannel } = getByProps("getDMFromUserId", "getChannel")
          const { getChannelId } = getByProps(
              "getLastSelectedChannelId",
              "getChannelId"
          )
          const { ComponentDispatch } = getByProps("ComponentDispatch")
          return class MentionChannels extends Plugin {
              constructor() {
                  super()
              }

              async onStart() {
                  await this.patcher()
              }

              async patcher() {
                  const patch = (_, [props], component) => {
                      if (
                          !props.isCategory() &&
                          can({
                              permission: SEND_MESSAGES,
                              user: getCurrentUser().id,
                              context: getChannel(getChannelId()),
                          })
                      ) {
                          return [
                              DCM.buildMenuItem({
                                  type: "text",
                                  label: "Mention",
                                  action: () => {
                                      ComponentDispatch.dispatchToLastSubscribed(
                                          "INSERT_TEXT",
                                          {
                                              plainText: "<#" + props.id + ">",
                                          }
                                      )
                                  },
                              }),
                              DCM.buildMenuItem({
                                  type: "separator",
                                  id: "sep",
                              }),
                              component,
                          ]
                      }
                  }

                  DCM.getDiscordMenu("useChannelMarkAsReadItem").then(
                      (menu) => {
                          Patcher.after(menu, "default", patch)
                      }
                  )

                  DCM.forceUpdateMenus()
              }

              onLoad() {
                  DCM.forceUpdateMenus()
              }

              onStop() {
                  Patcher.unpatchAll()
              }
          }
      })(global.ZeresPluginLibrary.buildPlugin(config))
