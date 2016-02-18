window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";
    
    var game = new Phaser.Game( 1376, 450, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render:render } );
    
    function preload() {
        // Load an image and call it 'logo'.
        game.load.image( 'house', 'assets/sprites/houseBackground.png' );
        game.load.spritesheet('shadow','assets/sprites/shadowSpriteSheet81x81.png', 81,81);
        game.load.spritesheet('link', 'assets/sprites/linkSpriteSheet32x32.png',32,32);
        
        game.load.audio('creepyBreath',"assets/sfx/creepyBreath.wav");
        game.load.audio('music','assets/music/Aftermath.mp3');
    }
    
    var player; //The kid.
    var facing = 'down'; //Which way is he facing?
    var shadow; //The darkness.
    var background; //The house.
    var creepyBreath; //Who is that?
    var music;      //Who invited Kevin MacLeod?
    
    var light;      //A shape that cuts out a part of the mask.
    var lightOn = true;
    //Timers
    var lightTimer;
    var breathTimer;
    
    var cursors;
    var lightButton;
    
    function create() {
        
        //Background Setup
        background = game.add.sprite(0,0,'house');
        game.stage.backgroundColor = '#000000';
        
        background.height = game.height;
        background.width = game.width;
        
        
        //Physics Setup
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //Controls Setup
        cursors = game.input.keyboard.createCursorKeys();
        lightButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        
        //Player setup
        player = game.add.sprite(game.width/2 - 32 ,380, 'link');
        player.height = 42;
        player.width = 42;
        
        game.physics.enable(player,Phaser.Physics.ARCADE);
        player.body.collideWorldBounds = true;


        
            //Player Animations
            player.animations.add('left', [18,19,20,21,22,23,24,25,26], 6, true);
            player.animations.add('right', [27,28,29,30,31,32,33,34,35], 6, true);
            player.animations.add('up', [36,37,38,39,40,41,42,43],6, true);
            player.animations.add('down', [9,10,11,12,13,14,15,16], 6, true);
        
        
        //Shadow setup
        shadow = game.add.sprite(50, game.height/2, 'shadow');
        game.physics.enable(shadow,Phaser.Physics.ARCADE);
        shadow.body.collideWorldBounds = true;
            
            //Shadow Animations
            shadow.animations.add('flicker', [0,1,2,1,0], 1, true);
        
        
        
        //Mask setup; from Mask example.
        //	A mask is a Graphics object
        light = game.add.graphics(0,0);

        //	Shapes drawn to the Graphics object must be filled.
        light.beginFill(0x111111, 50);

        //	Here we'll draw a circle
        light.drawCircle(100, 100, 100);

        //	And apply it to the Sprite
        background.mask = light;
        player.mask = light;
        shadow.mask = light;
        
        light.x = player.x - 100;
        light.y = player.y - 100;
        
        
        //Sfx!
        creepyBreath = game.add.audio('creepyBreath');
        
        //Music!
        music = game.add.audio('music');
        
        
        //Start music!
        music.play();
            
        //Timer setup
        lightTimer = game.time.events.add(Phaser.Timer.SECOND * 40, gameOver, lightUpdate);
        breathTimer = game.time.events.add(Phaser.Timer.SECOND* 11, shadowBreathe, update);
        
        
        
        


        
    }
    
    function update() {
        
        //Player update()
            //Walking
            playerWalk();
    
        
        //Shadow updates
            //Move towards player, with great menace!
            shadowWalk();
            
    
        //Light updates
            lightUpdate();
        
    }
    
    
    function playerWalk(){

        var PLAYERSPEED = 65;
        
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        
        //Code borrowed from StarStruck example.
        if (cursors.left.isDown)
        {
        player.body.velocity.x = -1*PLAYERSPEED;

            if (facing != 'left')
                {
                player.animations.play('left');
                facing = 'left';
                }
        }
        else if (cursors.right.isDown)
        {
        player.body.velocity.x = PLAYERSPEED;

            if (facing != 'right')
            {
                player.animations.play('right');
                facing = 'right';
            }
        }
        
        else if (cursors.up.isDown){
            
            player.body.velocity.y = -1*PLAYERSPEED;
            
            if(facing != 'up'){
                player.animations.play('up');
                facing = 'up';
            }
        }
        
        else if(cursors.down.isDown){
            
            player.body.velocity.y = PLAYERSPEED;
            
            if(facing != 'down'){
                player.animations.play('down');
                facing = 'down';
                
            }
        }
    else
    {
        if (facing != 'idle')
        {
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 1;
            }
            else if(facing == 'right')
            {
                player.frame = 2;
            }
            
            else if(facing == 'up'){
                
                player.frame = 3;
            }
            
            else if(facing == 'down'){
                
                player.frame = 0;
            }

            facing = 'idle';
        }
    }
        
    }
        
    
    function shadowWalk(){
        //Move slowly towards player if player within certain distance, unless it has a light shown on it.
        
            //Always play the flicker animation.
        shadow.animations.play('flicker');

        
        shadow.body.velocity.x = 0;
        shadow.body.velocity.y = 0;
        var shadowToPlayerDist = game.math.distance(shadow.x,shadow.y, player.x, player.y);
                    
        game.physics.arcade.moveToObject(shadow,player,60);
        
        
          
    }
    
    
    function shadowBreathe(){
        
        if(!creepyBreath.isPlaying){
            var shadowToPlayerDist = game.math.distance(shadow.x,shadow.y, player.x, player.y);
            if(shadowToPlayerDist < 1000){
                creepyBreath.volume = 1 - 0.001*shadowToPlayerDist;
                creepyBreath.play();
            }
        }
    }
    
    function lightUpdate(){
        if(lightOn){
            light.x = player.x - 84;
            light.y = player.y - 84;
        }
        if(lightButton.isDown){
            if(lightOn){
                //Banished forthwith from kingdom of Rohan!
                light.x = 1500;
                light.y = 1500;
                lightOn = false;
                game.time.events.pause();
            }
            else{
                lightOn = true;
                game.time.events.resume();
            }
        }
        
    }
    
    
    function gameOver(){
        //Banish light
        light.x = 1500;
        light.y = 1500;
        //Pause game
        game.paused = true;
        
        //Place text describing your fate.
        var gameOverText = game.add.text(game.width/2 - 150, game.height-150, 'You\'ve run out of battery. \n The darkness has devoured you.', { font: '30px Arial', fill: '#fff' });

        
        
    }

    
    function render(){
        game.debug.text("Battery Life: " + game.time.events.duration, 32, 32);
        
        
    }
    
    
    
    
};
