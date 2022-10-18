/**
 * @name MentionChannels
 * @author Echology
 * @description Allows you to mention channels like Discord does for users
 * @version 5.0.0
 * 
 */

const { Webpack, ContextMenu } = BdApi
const { getModule, Filters } = Webpack

const getByProps = (...strs) => getModule(Filters.byProps(...strs), {searchExports: true})

const Permissions = getModule(
        (module) => {
            return Object.entries(module).some(([key, value]) => {
                return (
                    key.includes("SEND_MESSAGES") && typeof value === "bigint"
                )
            })
        },
        { searchExports: true }
    ),
    { SEND_MESSAGES } = Permissions

const { can } = getByProps("can", "canEveryone")
const { getCurrentUser } = getByProps("getCurrentUser")
const { getChannel } = getByProps("getDMFromUserId", "getChannel")
const { getChannelId } = getByProps("getLastSelectedChannelId", "getChannelId")
const ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter?._events?.INSERT_TEXT, { searchExports: true })

module.exports = (meta) => ({
    start() {
        this.unpatch = ContextMenu.patch("channel-context", this.patch)
    },
    patch(component, { channel }) {
        if (
            !channel.isCategory() &&
            can({
                permission: SEND_MESSAGES,
                user: getCurrentUser().id,
                context: getChannel(getChannelId()),
            })
        ) {
            var items= [
                ContextMenu.buildItem({
                    type: "text",
                    label: "Mention",
                    action: () => {
                        console.log("HELLO")
                        ComponentDispatch.dispatchToLastSubscribed(
                            "INSERT_TEXT",
                            {
                                plainText: "<#" + channel.id + ">",
                                // rawText: "test"
                            }
                        )
                    },
                }),
                ContextMenu.buildItem({
                    type: "separator",
                    id: "sep",
                })
            ]
            component.props.children.splice(0, 0, items)

        }
    },
    stop() {
        this.unpatch()
        ContextMenu.unpatch("channel-context", this.unpatch)
        // Cleanup when disabled
    },
})
