var game = new Phaser.Game(800, 600, Phaser.AUTO, 'area', { preload: preload, create: create, update: update
//    ,render: render
});

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('heart', 'assets/heart.png');

    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('cat', 'assets/baddie.png', 32, 31);

    game.load.audio('fondoFx','assets/fondoFx.mp3');
    game.load.audio('coin', 'assets/coin.mp3');
    game.load.audio('oh', 'assets/oh.mp3');
}

var player;
var cat;
var platforms;
var cursors;
var stars;
var score = 0;
var scoreText;
var gameOver;
var heart = 0;
var coin;
var oh;
var fondoFx;
var walk = 0;
var col = 0;

function create() {
    //coins audio
    coin = game.add.audio('coin');
    // rest life
    oh = game.add.audio('oh');

    //backgroundsound
    fondoFx = game.add.audio('fondoFx');
    fondoFx.play();

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    //enemy cat
    cat = game.add.sprite(700, game.world.height - 150, 'cat');
    game.physics.arcade.enable(cat);
    cat.body.bounce.y = 0.9;
    cat.body.gravity.y = 300;
    cat.body.collideWorldBounds = true;
    cat.animations.add('left', [0, 1], 10, true);
    cat.animations.add('right', [2, 3], 10, true);

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 400;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
    //Score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //game over
    gameOver = game.add.text(300, 300, 'GAME OVER', { fontSize: '300px', fill: '#F00' });
    gameOver.visible = false;

    // life
    heart = game.add.group();

    for (var i = 0; i < 3; i++)
    {
        var local = heart.create(game.world.width - 600 + (50 * i), 30, 'heart');
        local.anchor.setTo(0.5, 0.5);
        local.scale.set(0.5);

    }
}

function update() {
    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(cat, platforms);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;


    // var tween = game.add.tween(cat).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    if (walk == 0){
    for (var i = 0; i<= 300; i++){
            cat.body.velocity.x = i;
            cat.animations.play('right');
            if(i==300 && cat.body.touching.down){
                cat.body.velocity.y = -350;
            }
            if(cat.body.x > 750){
                walk = 1;
            }
        }
    }
    if (walk == 1){

        for (var i = 0; i<= 300; i++){
            cat.body.velocity.x = -i;
            cat.animations.play('left');
            if(i==300 && cat.body.touching.down){
                cat.body.velocity.y = -350;
            }
            if(cat.body.x < 10){
                walk = 0;
            }
        }
    }

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }


    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //checks to see if the player overlaps whit the cat (enemy), if he does call the colEnemi function
    game.physics.arcade.overlap(player, cat, colEnemi, null, this);

    if(col > 0){
        col--;
    }
}

// function render() {
//     game.debug.soundInfo(fondoFx, 20, 32);
// }

function collectStar (player, star) {
    //play audio
    coin.play();
    // Removes the star from the screen
    star.kill();
    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
    }

function colEnemi (player, cat) {

    if(col == 0){
        //rest life
        live = heart.getFirstAlive();
        //play audio
        oh.play();
        live.kill();
        if (heart.countLiving() < 1) {
            player.kill();
            // cat.kill();
            gameOver.visible = true;

        }
        col = 50;
    }

}



