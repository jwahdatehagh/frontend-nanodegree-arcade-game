// helpers
var helpers = {};
helpers.xCanvas = 505;
helpers.yCanvas = helpers.yTile * helpers.yTilesNum;
helpers.xTilesNum = 5;
helpers.yTilesNum = 6;
helpers.xTile = 101;
helpers.yTile = 83;
helpers.xTileCenter = helpers.xTile/2;
helpers.yTileCenter = helpers.yTile/2;
helpers.charHeight = 102;
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
helpers.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


/**
Parent Class for all Game Entities
@param {string} link to sprite
@param {number} column position
@param {number} row position
**/
var Entity = function(sprite, column, row) {
    console.info('creating an Entity');
    this.sprite = sprite;
    this.x = column * helpers.xTile - helpers.xTile;
    this.y = row * helpers.yTile - helpers.charHeight;
};


// Draw the entity on the screen, required method for game
Entity.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Enemies our player must avoid
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

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;

    // if enemy moves off the canvas, let it turn around
    var offCanvasRight = this.x > helpers.xCanvas;
    var offCanvasLeft = this.x < -helpers.xTile
    if (offCanvasRight || offCanvasLeft) {
        this.changeDirection();
        this.randomizeRow();
    }

};
Enemy.prototype.randomizeRow = function() {
    var row = helpers.getRandomInt(2,4);
    this.y = row * helpers.yTile - helpers.charHeight;
};
Enemy.prototype.changeDirection = function() {
    this.speed = -this.speed;
    this.sprite = this.forward ? this.spriteReverse : this.spriteForward;
    this.forward = ! this.forward;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    var column = helpers.getRandomInt(1,5);
    var row = helpers.getRandomInt(5,6);
    Entity.call(this, 'images/char-boy.png', column, row);
};
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {};
Player.prototype.handleInput = function(key) {
    if (key == 'right' && this.x < helpers.xTilesNum * helpers.xTile) {
        return this.x += helpers.xTile;
    }
    if (key == 'left' && this.x > 0) {
        return this.x -= helpers.xTile;
    }
    if (key == 'down' && this.y < helpers.yTilesNum * helpers.yTile) {
        return this.y += helpers.yTile;
    }
    if (key == 'up' && this.y > 0) {
        return this.y -= helpers.yTile;
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [new Enemy(120), new Enemy(200), new Enemy(220), new Enemy(50)];
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
