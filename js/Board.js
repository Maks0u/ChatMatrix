class Board {
  constructor() {
    const canvas = document.getElementById('Matrix');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.context = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    const params = new URLSearchParams(location.search);
    this.color = `#${params.get('color') || 'F3C'}`;
    this.fontSize = parseInt(`${params.get('size') || '30'}`);

    this.dimStrength = 0.125;
    this.drawInterval = 100;
    this.processQueueInterval = 50;

    this.nCols = parseInt(this.width / this.fontSize);
    this.nRows = parseInt(this.height / this.fontSize);

    this.columns = new Columns(this.nCols);
    this.queue = [];
  }
  /**
   * Starts main loops
   * @returns {Board}
   */
  start() {
    setInterval(this.draw.bind(this), this.drawInterval);
    setInterval(this.processQueue.bind(this), this.processQueueInterval);
    return this;
  }
  /**
   * Main function
   */
  draw() {
    this.context.fillStyle = `rgba(0, 0, 0, ${this.dimStrength})`;
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.fillStyle = this.color;
    this.context.font = this.fontSize + 'px monospace';

    for (const col of this.columns.values()) {
      if (col.isAvailable()) continue;
      const x = col.x * this.fontSize;
      const y = col.y * this.fontSize;
      this.context.fillText(col.nextLetter(), x, y);
    }
  }
  /**
   * Sends the oldest message in queue to the columns map
   */
  processQueue() {
    if (this.columns.isAnyAvailable() && this.queue.length > 0) {
      this.columns.newMsg(this.queue.shift());
    }
  }
  /**
   * Adds message to queue
   * @param {string} msg
   */
  newMsg(msg) {
    this.queue.push(msg);
  }
}

/**
 * @type {Map<number, Column>}
 */
class Columns extends Map {
  /**
   * Init n columns
   * @param {number} n
   */
  constructor(n = 0) {
    super([...Array(n).keys()].map(i => [i, new Column(i)]));
  }
  /**
   * Display a message to a random available column
   * @param {string} msg
   */
  newMsg(msg) {
    this.getRandomAvailableColumn().setMsg(msg);
  }
  /**
   * Checks if any column is available
   * @returns {boolean}
   */
  isAnyAvailable() {
    return new Set([...this.values()].map(col => col.isAvailable())).has(true);
  }
  /**
   * Picks a random available column
   * @returns {Column}
   */
  getRandomAvailableColumn() {
    const ids = [];
    this.forEach((col, i) => {
      if (col.isAvailable()) ids.push(i);
    });
    const id = ids[Math.floor(Math.random() * ids.length)];
    return this.get(id);
  }
}

class Column {
  constructor(x) {
    this.x = x;
    this.y = 1;
    this.message = '';
  }
  /**
   * Checks if this column is available
   * @returns {boolean}
   */
  isAvailable() {
    return !this.message.length;
  }
  /**
   * Sets message
   * @param {string} msg
   */
  setMsg(msg) {
    this.message = msg;
  }
  /**
   * Returns next letter of current message
   * @returns {string}
   */
  nextLetter() {
    if (this.isAvailable()) {
      this.y = 1;
    }
    const letter = this.message.slice(0, 1);
    this.message = this.message.slice(1);
    this.y = this.isAvailable() ? 1 : (this.y % BOARD.nRows) + 1;
    return letter;
  }
}
