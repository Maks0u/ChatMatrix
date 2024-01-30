class Chat extends WebSocket {
  /**
   * @param {Board} board
   * @param {string | URL} url
   */
  constructor(board, url = 'wss://irc-ws.chat.twitch.tv:443') {
    super(url);
    this.board = board;

    /**
     * Auth
     */
    this.onopen = () => {
      const params = new URLSearchParams(location.search);
      this.send(`PASS oauth:${params.get('token')}`);
      this.send('NICK Bot');
      this.send(`JOIN #${params.get('channel')}`);
    };
    /**
     * @param {MessageEvent} message
     */
    this.onmessage = message => {
      const string = message.data;

      if (isPing(string)) {
        this.sendPong(string);
        return;
      }
      if (!isMsg(string)) return;

      const msg = parseMsg(string);
      this.board.newMsg(`${msg.user} \u00b7 ${msg.message.toUpperCase()}`);
    };
    /**
     * @param {Event} error
     */
    this.onerror = error => console.error(error);
  }
  /**
   * @param {string} pingString
   */
  sendPong(pingString) {
    this.send(pingString.replace(/^PING\s/, 'PONG '));
  }
}

/**
 * @param {string} string
 * @returns {boolean}
 */
function isPing(string) {
  return /^PING\s/gm.test(string);
}
/**
 * @param {string} string
 * @returns {boolean}
 */
function isMsg(string) {
  return /PRIVMSG/gm.test(string);
}
/**
 * @param {string} string
 * @returns {{ channel: string, user: string, message: string}}
 */
function parseMsg(string) {
  const { user, channel, message } =
    /^:(?<user>.+?)!.+?@.+?\.tmi\.twitch\.tv\sPRIVMSG\s#(?<channel>.+?)\s:(?<message>.+)$/gm.exec(
      string
    ).groups;

  return { channel, user, message };
}
