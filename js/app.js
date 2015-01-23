/**
* Helper object holding handy functions,
* some game logic and repeating numbers
**/
var helpers = {};
helpers.xCanvas = 505;
helpers.yCanvas = helpers.yTile * helpers.rows;
helpers.columns = 5;
helpers.rows = 6;
helpers.xTile = 101;
helpers.yTile = 83;
helpers.charHeight = 102;
helpers.highScore = localStorage.highScore || 0;

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * @param {number} min
 * @param {number} max
 * @return {number} random integer between min and max
 */
helpers.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a the x position of an entity based on the column
 * @param {number} column
 * @return {number} x position
 */
helpers.columnsToXPosition = function(column) {
    return column * this.xTile - this.xTile;
};

/**
 * Returns a the y position of an entity based on the row
 * @param {number} row
 * @return {number} y position
 */
helpers.rowsToYPosition = function(row) {
    return row * this.yTile - this.charHeight;
};

/**
 * Game logic to check whether a star has been collected
 * @param {Player} player
 * @param {Star} star
 */
helpers.checkIfStarCollected = function(player, star) {
    if (player.column === star.column && player.row === star.row) {
        player.collectStar();
        star.newPosition();
        this.setHighScore(player.starCount);
    }
};

/**
 * Game logic to check whether the player collides with one of the enemies
 * @param {Player} player
 * @param {Array} array holding all the enemies
 */
helpers.checkForCollision = function(player, allEnemies) {
    allEnemies.forEach(function(enemy) {
        if (enemy.column === player.column && enemy.row === player.row) {
            player.reset();
        }
    });
};

/**
 * Draws the highscore on the canvas
 */
helpers.showHighScore = function() {
    ctx.fillStyle='yellow';
    ctx.font = '30px Serif';
    ctx.textAlign = 'right';
    ctx.fillText('Highscore: ' + this.highScore, this.xCanvas - 10, 100);
};

/**
 * Sets the highscore
 * @param {number} highscore
 */
helpers.setHighScore = function(highScore) {
    if (highScore > this.highScore) {
        this.highScore = highScore;
        localStorage.highScore = highScore;
        console.info('New highscore set! (' + highScore + ')');
    }
};


/**
* Parent Class for all Game Entities
* @param {string} link to sprite
* @param {number} column position
* @param {number} row position
* @constructor
**/
var Entity = function(sprite, column, row) {
    console.info('creating an Entity');
    this.sprite = sprite;
    this.column = column;
    this.row = row;
    this.x = helpers.columnsToXPosition(this.column);
    this.y = helpers.rowsToYPosition(this.row);
};

/**
 * Draw the entity on the screen
 * @param {boolean} if true: render by x/y position instead of column/row
 */
Entity.prototype.render = function(byXY) {
    var x, y;
    if (byXY) {
        x = this.x;
        y = this.y
    } else {
        x = helpers.columnsToXPosition(this.column);
        y = helpers.rowsToYPosition(this.row);
    }
    ctx.drawImage(Resources.get(this.sprite), x, y);
};


/**
* Enemies our player must avoid
* @param {number} speed of the enemy
* @constructor
**/
var Enemy = function(speed) {
    this.speed = speed;
    this.spriteForward = 'images/enemy-bug.png';
    this.spriteReverse = 'images/enemy-bug-reverse.png';
    this.forward = true;

    var row = helpers.getRandomInt(2,4);

    Entity.call(this, this.spriteForward, 0, row);
};
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * Update the enemy's position
 * @param {number} a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    // Multiply movement by the dt parameter to ensure the game
    // runs at the same speed for all computers
    this.x += this.speed * dt;

    // recompute column (the enemy is rendered by x/y position 
    // but for collision calculation we use column/row)
    this.column = Math.round(this.x / helpers.xTile) + 1;

    // if enemy moves off the canvas, let it turn around
    var offCanvasRight = this.x > helpers.xCanvas;
    var offCanvasLeft = this.x < -helpers.xTile;
    if (offCanvasRight || offCanvasLeft) {
        this.changeDirection();
        this.randomizeRow();
    }

};

/**
 * Update the enemy's row position
 */
Enemy.prototype.randomizeRow = function() {
    var row = helpers.getRandomInt(2,5);
    this.row = row;

    // recompute y position (the enemy is rendered by x/y position 
    // but for collision calculation we use column/row)
    this.y = helpers.rowsToYPosition(row);
};

/**
 * Change the enemy's direction
 */
Enemy.prototype.changeDirection = function() {
    this.speed = -this.speed;
    this.sprite = this.forward ? this.spriteReverse : this.spriteForward;
    this.forward = ! this.forward;
};


/**
* Player class - our lovely player
* @constructor
**/
var Player = function() {
    this.newPosition();
    this.starCount = 0;
    Entity.call(this, 'images/char-boy.png', this.column, this.row);
};
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

/**
 * Call this when a player collects a star.
 */
Player.prototype.collectStar = function() {
    this.starCount += 1;
    console.info('Yay! Your score is ' + this.starCount);
};

/**
 * Update the player's position
 */
Player.prototype.newPosition = function() {
    this.column = helpers.getRandomInt(1,5);
    this.row = 6;
};

/**
 * Reset the player's position
 */
Player.prototype.reset = function() {
    this.starCount = 0;
    this.newPosition();
    console.info('You lost... Score is back to 0');
};

/**
 * Show/Update the player's score
 */
Player.prototype.showScore = function() {
    ctx.fillStyle='yellow';
    ctx.font = '30px Serif';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + this.starCount, 10, 100);
};

/**
 * Handle keyboard input events and move the player
 * @param {string} the key we're releasing
 */
Player.prototype.handleInput = function(key) {
    if (key == 'right' && this.column < helpers.columns) {
        return this.column += 1;
    }
    if (key == 'left' && this.column > 1) {
        return this.column -= 1;
    }
    if (key == 'down' && this.row < helpers.rows) {
        return this.row += 1;
    }
    if (key == 'up' && this.row > 1) {
        return this.row -= 1;
    }
};


/**
* Star class - our player loves to collect it
* @constructor
**/
var Star = function() {
    var column = helpers.getRandomInt(1,5);
    var row = helpers.getRandomInt(2,5);
    Entity.call(this, 'images/star.png', column, row);
};
Star.prototype = Object.create(Entity.prototype);
Star.prototype.constructor = Star;

/**
 * Update the star's position
 */
Star.prototype.newPosition = function() {
    this.column = helpers.getRandomInt(1,5);
    this.row = helpers.getRandomInt(2,5);
};


// Place all enemy objects in an array called allEnemies
var allEnemies = [new Enemy(120), new Enemy(200), new Enemy(220), new Enemy(60), new Enemy(170)];

// Place a player instance in a variable called player
var player = new Player();

// Place a star instance in a variable called star
var star = new Star();


// Listen for key presses and send the keys to Player.handleInput()
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
