class Board {
  constructor() {
    const params = new URLSearchParams(location.search);

    this.config = {
      color: `#${params.get('color') || 'F3C'}`,
      debug: params.get('debug') === 'true',
      dimStrength: 0.125,
      drawInterval: 100,
      fontSize: parseInt(params.get('size') || 30),
      horizontal: params.get('horizontal') === 'true',
      processQueueInterval: 50,
    };

    const canvas = document.getElementById('Matrix');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.context = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.nCols = parseInt(this.width / this.config.fontSize) - 1;
    this.nRows = parseInt(this.height / this.config.fontSize) - 1;

    this.columns = new Columns(
      this.config.horizontal ? this.nRows : this.nCols
    );
    this.queue = [];
  }
  /**
   * Starts main loops
   * @returns {Board}
   */
  start() {
    setInterval(this.draw.bind(this), this.config.drawInterval);
    setInterval(this.processQueue.bind(this), this.config.processQueueInterval);
    return this;
  }
  /**
   * Main function
   */
  draw() {
    this.context.fillStyle = `rgba(0, 0, 0, ${this.config.dimStrength})`;
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.fillStyle = this.config.color;
    this.context.font = this.config.fontSize + 'px monospace';

    if (this.config.debug) this.debug();

    for (const col of this.columns.values()) {
      if (col.isAvailable()) continue;
      const x = col.x * this.config.fontSize;
      const y = col.y * this.config.fontSize;
      this.context.fillText(
        col.nextLetter(),
        this.config.horizontal ? y : x,
        this.config.horizontal ? x : y
      );
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
  /**
   * Diaplay markers in board corners
   */
  debug() {
    const x_min = this.config.fontSize;
    const y_min = this.config.fontSize;
    const x_max = BOARD.nCols * this.config.fontSize;
    const y_max = BOARD.nRows * this.config.fontSize;
    [
      ['+', x_min, y_min],
      ['+', x_max, y_min],
      ['+', x_min, y_max],
      ['+', x_max, y_max],
    ].forEach(([marker, x, y]) => this.context.fillText(marker, x, y));
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
    super([...Array(n).keys()].map(i => [i + 1, new Column(i + 1)]));
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
    const maxLength = BOARD.config.horizontal ? BOARD.nCols : BOARD.nRows;
    this.y = this.isAvailable() ? 1 : (this.y % maxLength) + 1;
    return letter;
  }
}
