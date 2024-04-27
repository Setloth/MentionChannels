/**
 * @name MentionChannels
 * @author Setloth (Echology)
 * @description Allows you to mention channels like Discord does for users
 * @version 5.2.0
 *
 */

const { Webpack, ContextMenu } = BdApi;
const { getModule, Filters } = Webpack;

const getByProps = (...strs) =>
  getModule(Filters.byKeys(...strs), { searchExports: true });
 
const Permissions = getModule(
    (module) => {
      return Object.entries(module).some(([key, value]) => {
        return key.includes("SEND_MESSAGES") && typeof value === "bigint";
      });
    },
    { searchExports: true }
  ),
  { SEND_MESSAGES } = Permissions;

const { can } = getModule(Filters.byKeys("can", "canEveryone"));
const { getCurrentUser } = getModule(Filters.byKeys("getCurrentUser")); 
const { getChannel } = getModule(Filters.byKeys("getDMFromUserId", "getChannel")); 
const { getChannelId } =  getModule(Filters.byKeys("getLastSelectedChannelId"));

module.exports = class MentionChannels {
  constructor() {
    this.ComponentDispatch = getModule(
      (m) => m.dispatch && m.emitter?._events?.INSERT_TEXT,
      { searchExports: true }
    );
    this.patches = [];
  }

  start() {
    this.patches = [
      ContextMenu.patch("channel-context", this.patch),
      ContextMenu.patch("thread-context", this.patch),
    ];
  }

  patch(component, { channel }) {
    if (
      !channel.isCategory() &&
      can({
        permission: SEND_MESSAGES,
        user: getCurrentUser().id,
        context: getChannel(getChannelId()),
      })
    ) {
      var items = [
        ContextMenu.buildItem({
          type: "text",
          label: "Mention",
          action: () => {
            var ComponentDispatch =
              this?.ComponentDispatch ||
              getModule((m) => m.dispatch && m.emitter?._events?.INSERT_TEXT, {
                searchExports: true,
              });
            ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
              plainText: "<#" + channel.id + ">",
            });
          },
        }),
        ContextMenu.buildItem({
          type: "separator",
        }),
      ];
      component.props.children.splice(0, 0, items);
    }
  }
  
  stop() {
    for (var unpatch of this.patches) {
      unpatch();
    }
  }
};
