const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 960,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

var score=document.getElementById('addscrore');

let asteroidCounter = 0;
let laserCounter = 0;
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highscore").innerText = highScore;

console.log(highScore);

function preload () {
    this.load.image('space', 'assets/space.jpg');
    this.load.image('spaceship', 'assets/spaceship.png');
    this.load.image('laser', 'assets/laser.png');
    this.load.image('asteroid', 'assets/asteroid.png');
     this.load.image('hit', 'assets/hit.png');
        this.load.image('destroyed', 'assets/destroyed.png');
}

function create () {
    this.space = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'space').setOrigin(0, 0);
    this.spaceship = this.physics.add.image(window.innerWidth / 2, window.innerHeight / 2, 'spaceship').setOrigin(0.5, 0.5);
    this.spaceship.setScale(0.2);


    this.lasers = this.physics.add.group({
        defaultKey: 'laser',
        maxSize: -1, // Infinite lasers
        runChildUpdate: true
    });
    
    this.asteroids = this.physics.add.group();
 this.physics.pause();
    let countdown = 3;
    let countdownText = this.add.text(320, 480, 'Get Ready: ' + countdown, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    let timer = this.time.addEvent({
        delay: 1000,
        repeat: 3,
        callback: () => {
            countdown--;
            if (countdown > 0) {
                countdownText.setText('Get Ready: ' + countdown);
            } else {
                countdownText.setText('GO!');
            }
        },
        callbackScope: this
    });

    this.time.delayedCall(4000, () => {
        this.physics.resume();
        countdownText.destroy();



     this.time.addEvent({
        delay: 200,
        callback: fireLaser,
        callbackScope: this,
        loop: true
    });
});


    for (let i = 0; i < 1; i++) {
        var asteroid = this.asteroids.create(Phaser.Math.Between(0, 640), Phaser.Math.Between(0, 200), 'asteroid');
        asteroid.id = asteroidCounter++;
        asteroid.setScale(Phaser.Math.FloatBetween(0.1, 1));
		asteroid.body.velocity.x = Phaser.Math.Between(-20, 20);
        asteroid.body.velocity.y = Phaser.Math.Between(20, 60);
        asteroid.setCollideWorldBounds(true);
                asteroid.setBounce(1);
        asteroid.health = asteroid.scale * 10;


    }
      this.asteroids.children.iterate(function (child) {
      child.displayWidth = child.width * child.scaleX;
      child.displayHeight = child.height * child.scaleY;
    });

    this.physics.add.overlap(this.spaceship, this.asteroids, gameOver, null, this);
    this.physics.add.overlap(this.lasers, this.asteroids, laserHitAsteroid, null, this);

    this.asteroidSpawnCount = 0;

}

function update() {
    this.space.tilePositionY += 2;

    const targetX = this.input.activePointer.x;
    const targetY = this.input.activePointer.y;


    this.spaceship.x = Phaser.Math.Linear(this.spaceship.x, targetX, 0.1);
    this.spaceship.y = Phaser.Math.Linear(this.spaceship.y, targetY, 0.1);

    var a_count=1;
    if (this.asteroids.countActive(true) === 0 && this.asteroidSpawnCount < 9999) {
            this.asteroidSpawnCount++;

            for (let i = 0; i < a_count + this.asteroidSpawnCount; i++) {
                var asteroid = this.asteroids.create(Phaser.Math.Between(0, 640), Phaser.Math.Between(0, 200), 'asteroid');
                asteroid.id = asteroidCounter++;
                asteroid.setScale(Phaser.Math.FloatBetween(0.1, 1));
                asteroid.body.velocity.x = Phaser.Math.Between(-20, 20);
                asteroid.body.velocity.y = Phaser.Math.Between(20, 60);
                asteroid.setCollideWorldBounds(true);
                asteroid.setBounce(1);
                asteroid.health = asteroid.scale * 10;
            }

              this.asteroids.children.iterate(function (child) {
            child.displayWidth = child.width * child.scaleX;
            child.displayHeight = child.height * child.scaleY;
            });
            a_count++;
    }

    this.lasers.children.each(function(laser) {
        if (laser.active) {
            // console.log('Laser ', laser.id, ': X=', laser.x, ', Y=', laser.y);
            if (laser.y < 0) {
                laser.disableBody(true, true);
            }
        }
    });


}


function fireLaser() {
    var laser = this.lasers.get();

    if (!laser) return;

    laser.id = laserCounter++;
    laser.enableBody(true, this.spaceship.x, this.spaceship.y, true, true);
    laser.setScale(0.1);
    laser.setActive(true);
    laser.setVisible(true);

    this.physics.velocityFromRotation(this.spaceship.rotation - Math.PI / 2, 900, laser.body.velocity);
}
function laserHitAsteroid(laser, asteroid) {
console.log("HIT");
    laser.disableBody(true, true);

    const damage = 1;
    const currentNumber = parseInt(score.innerText, 10);
  const newNumber = currentNumber + 5;
  score.innerText = newNumber;
    asteroid.health -= damage;
        var hit = this.add.image(asteroid.x, asteroid.y + asteroid.displayHeight/3, 'hit').setScale(5);
        this.time.delayedCall(300, function() { hit.destroy(); }, [], this);
        asteroid.setScale(asteroid.scale * 0.9);

        if (asteroid.health <= 0) {
         asteroid.setTexture('destroyed');
         var destr = this.add.image(asteroid.x, asteroid.y + asteroid.displayHeight, 'destroyed');
         this.time.delayedCall(300, function() { destr.destroy(); }, [], this);
         const currentNumber = parseInt(score.innerText, 10);
         const newNumber = currentNumber + 20;
         score.innerText = newNumber;
           asteroid.health -= damage;
       
        asteroid.disableBody(true, true);
      


        }



}
function gameOver(spaceship, asteroid) {
    spaceship.disableBody(true, true);
    var destrship = this.add.image(spaceship.x, spaceship.y + spaceship.displayHeight, 'destroyed');
    this.time.delayedCall(300, function() { destrship.destroy(); }, [], this);
    currscore= parseInt(score.innerText, 10);
    console.log(currscore);
    if (currscore > highScore) {
        highScore = currscore;
        localStorage.setItem("highScore", highScore);
        document.getElementById("highScore").innerText = highScore;
      }

  this.add.text(320, 480, 'Game Over', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    this.scene.pause();

}
