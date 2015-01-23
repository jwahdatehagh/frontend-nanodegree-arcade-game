// helpers
var helpers = {};
helpers.xCanvas = 505;
helpers.yCanvas = helpers.yTile * helpers.rows;
helpers.columns = 5;
helpers.rows = 6;
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
helpers.columnsToXPosition = function(column) {
    return column * this.xTile - this.xTile;
};
helpers.rowsToYPosition = function(row) {
    return row * this.yTile - this.charHeight;
};
helpers.checkIfStarCollected = function(player, star) {
    if (player.column === star.column && player.row === star.row) {
        player.collectStar();
        star.newPosition();
    }
};
helpers.checkForCollision = function(player, allEnemies) {
    allEnemies.forEach(function(enemy) {
        if (enemy.column === player.column && enemy.row === player.row) {
            player.reset();
        }
    });
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
    this.column = column;
    this.row = row;
    this.x = helpers.columnsToXPosition(this.column);
    this.y = helpers.rowsToYPosition(this.row);
};


// Draw the entity on the screen, required method for game
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

    // recompute column
    this.column = Math.round(this.x / helpers.xTile) + 1;


    // if enemy moves off the canvas, let it turn around
    var offCanvasRight = this.x > helpers.xCanvas;
    var offCanvasLeft = this.x < -helpers.xTile;
    if (offCanvasRight || offCanvasLeft) {
        this.changeDirection();
        this.randomizeRow();
    }

};
Enemy.prototype.randomizeRow = function() {
    var row = helpers.getRandomInt(2,5);
    this.row = row;
    this.y = helpers.rowsToYPosition(row);
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
    this.newPosition();
    this.starCount = 0;
    Entity.call(this, 'images/char-boy.png', this.column, this.row);
};
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.collectStar = function() {
    this.starCount += 1;
    console.info('Yay! Your score is ' + this.starCount);
};
Player.prototype.newPosition = function() {
    this.column = helpers.getRandomInt(1,5);
    this.row = 6;
};
Player.prototype.reset = function() {
    this.starCount = 0;
    this.newPosition();
    console.info('You lost... Score is back to 0');
};
Player.prototype.showScore = function() {
    ctx.fillStyle="yellow";
    ctx.font = "30px Serif";
    ctx.fillText("Score: " + this.starCount, 10, 100);
}

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

var Star = function() {
    var column = helpers.getRandomInt(1,5);
    var row = helpers.getRandomInt(2,5);
    Entity.call(this, 'images/star.png', column, row);
};
Star.prototype = Object.create(Entity.prototype);
Star.prototype.constructor = Star;

Star.prototype.newPosition = function() {
    this.column = helpers.getRandomInt(1,5);
    this.row = helpers.getRandomInt(2,5);
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [new Enemy(120), new Enemy(200), new Enemy(220), new Enemy(60), new Enemy(170)];
// var allEnemies = [new Enemy(50)];
var player = new Player();
var star = new Star();


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
