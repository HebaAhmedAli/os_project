var socket; 
socket = io.connect();


canvas_width = window.innerWidth * window.devicePixelRatio;
canvas_height = window.innerHeight * window.devicePixelRatio;

game = new Phaser.Game(canvas_width,canvas_height, Phaser.CANVAS, 'gameDiv');

//the enemy player list 
var enemies = [];

var gameProperties = { 
	gameWidth: 4000,
	gameHeight: 4000,
	game_elemnt: "gameDiv",
	in_game: false,
};


var every_50=true;
var main = function(game){
};

/*function onsocketConnected () {
	console.log("connected to server"); 
	createPlayer();
	gameProperties.in_game = true;
	// send the server our initial position and tell it we are connected
	socket.emit('new_player', {x: 0, y: 0, angle: 0});
}*/

function keyDown(event) {
  //console.log(event);
 //console.log(event.keyCode);  
  if(event.keyCode==32 )
  {
  	var pointer = game.input.mousePointer;
    socket.emit('please_add_mine',{
				pointer_x: pointer.worldX, 
				pointer_y: pointer.worldY, 
				
			});
  }

}

// When the server notifies us of client disconnection, we find the disconnected
// enemy and remove from our game
function onRemovePlayer (data) {
	var removePlayer = findplayerbyid(data.id);
	// Player not found
	if (!removePlayer) {
		//console.log('Player not found: ', data.id)
		return;
	}
	
	removePlayer.player.destroy();
	enemies.splice(enemies.indexOf(removePlayer), 1);
}

function createPlayer () {
	player = game.add.graphics(0, 0);
	player.radius = 100;

	// set a fill and line style
	player.beginFill(0xffd900);
	player.lineStyle(2, 0xffd900, 1);
	player.drawCircle(0, 0, player.radius * 2);
	player.endFill();
	player.anchor.setTo(0.5,0.5);
	player.body_size = player.radius; 
	//set the initial size;
	player.initial_size = player.radius;

  
	// draw a shape
	game.physics.p2.enableBody(player, true);
	player.body.clearShapes();
	player.body.addCircle(player.body_size, 0 , 0); 
	player.body.data.shapes[0].sensor = true;
	//enable collision and when it makes a contact with another body, call player_coll
	player.body.onBeginContact.add(player_coll, this); 
	
	//We need this line to make camera follow player
	game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.5, 0.5);
}

// this is the enemy class. 
var remote_player = function (id, startx, starty, start_angle) {
	this.x = startx;
	this.y = starty;
	//this is the unique socket id. We use it as a unique name for enemy
	this.id = id;
	this.angle = start_angle;
	
	this.player = game.add.graphics(this.x , this.y);
	//intialize the size with the server value
	this.player.radius =100;

	// set a fill and line style
	this.player.beginFill(0xffd900);
	this.player.lineStyle(2, 0xffd900, 1);
	this.player.drawCircle(0, 0, this.player.radius * 2);
	this.player.endFill();
	this.player.anchor.setTo(0.5,0.5);
	//we set the initial size;
	this.initial_size = 100;
	//we set the body size to the current player radius
	this.player.body_size = this.player.radius; 
	this.player.type = "player_body";
	this.player.id = this.id;





	// draw a shape
	game.physics.p2.enableBody(this.player, true);
	this.player.body.clearShapes();
	this.player.body.addCircle(this.player.body_size, 0 , 0); 
	this.player.body.data.shapes[0].sensor = true;

}

//Server will tell us when a new enemy player connects to the server.
//We create a new enemy in our game.
function onNewPlayer (data) {
	//enemy object 
	var new_enemy = new remote_player(data.id, data.x, data.y, data.angle); 
	enemies.push(new_enemy);
}

//Server tells us there is a new enemy movement. We find the moved enemy
//and sync the enemy movement with the server
function onEnemyMove (data) {
	
	var movePlayer = findplayerbyid (data.id); 
	
	if (!movePlayer) {
		return;
	}
	
	var newPointer = {
		worldX:data.worldX,
		worldY:data.worldY,
		velocityX: data.vx,
		velocityY: data.vy, 
		dx:data.dx,
		dy:data.dy
	}
	
	move_player(movePlayer.player, newPointer);
}

//we're receiving the calculated position from the server and changing the player position
function onInputRecieved (data) {
	
	//we're forming a new pointer with the new position
	var newPointer = {
		worldX:data.worldX,
		worldY:data.worldY,
		velocityX: data.vx,
		velocityY: data.vy,
		dx:data.dx,
		dy:data.dy
	}
	
	//var distance = distanceToPointer(player, newPointer);
	move_player(player, newPointer);
	//we're receiving player position every 50ms. We're interpolating 
	//between the current position and the new position so that player
	//does jerk. 
	//speed = distance/0.05;
	
	//move to the new position. 
	//player.angle = movetoPointer(player, speed, newPointer);
	
}


function onGained (data) {

// console.log("id: "+data.id+" score: "+data.new_score)
}

function onKilled (data) {
	console.log("player killed");
	player.destroy();
}

function onlose_power(data)
{

	update_power_leaderB(data);

	//console.log("id: "+data.id+" power: "+data.new_power)
}



//This is where we use the socket id. 
//Search through enemies list to find the right enemy of the id.
function findplayerbyid (id) {
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i].id == id) {
			return enemies[i]; 
		}
	}
}

function createLeaderBoard() {
	var leaderBox = game.add.graphics(game.width * 0.81, game.height * 0.05);
	leaderBox.fixedToCamera = true;
	// draw a rectangle
	leaderBox.beginFill(0xD3D3D3, 0.3);
    leaderBox.lineStyle(2, 0x202226, 1);
    leaderBox.drawRect(0, 0, 300, 400);
	
	var style = { font: "13px Press Start 2P", fill: "black", align: "left", fontSize: '18px'};
	
	leader_text = game.add.text(10, 50, "", style);
	leader_text.anchor.set(0);

	leader_text_pow = game.add.text(10, 10, "", style);
	//leader_text_pow.anchor.set(0);

	leaderBox.addChild(leader_text);

	leaderBox.addChild(leader_text_pow);

}


function update_power_leaderB(data)
{

	
	var board_string = ""; 
	board_string = board_string.concat("My Power",": ",(data.new_power).toString() + "\n");
	leader_text_pow.setText(board_string);

}

//leader board
function lbupdate (data) {
	//this is the final board string.
	var board_string = ""; 
	var maxlen = 10;
	var maxPlayerDisplay = 10;
	var mainPlayerShown = false;
	
	for (var i = 0;  i < data.length; i++) {
		//if the mainplayer is shown along the iteration, set it to true
	
		if (mainPlayerShown && i >= maxPlayerDisplay) {
			break;
		}
		
		//if the player's rank is very low, we display maxPlayerDisplay - 1 names in the leaderboard
		// and then add three dots at the end, and show player's rank.
		if (!mainPlayerShown && i >= maxPlayerDisplay - 1 && socket.id == data[i].id) {
			board_string = board_string.concat(".\n");
			board_string = board_string.concat(".\n");
			board_string = board_string.concat(".\n");
			mainPlayerShown = true;
		}
		
		//here we are checking if user id is greater than 10 characters, if it is 
		//it is too long, so we're going to trim it.
		if (data[i].id.length >= 10) {
			var username = data[i].id;
			var temp = ""; 
			for (var j = 0; j < maxlen; j++) {
				temp += username[j];
			}
			
			temp += "...";
			username = temp;
		
			board_string = board_string.concat(i + 1,": ");
			board_string = board_string.concat(username," ",(data[i].score).toString() + "\n");
		
		} else {
			board_string = board_string.concat("\n");
		}
		
	}
	
	//console.log(board_string);
	leader_text.setText(board_string); 
}



main.prototype = {
	preload: function() {

		//load assets for coin and bomb
		game.load.image('food', 'client/asset/coin2.png');	
		game.load.image('bomb', 'client/asset/bomb.png');	

		game.stage.disableVisibilityChange = true;
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		game.world.setBounds(0, 0, gameProperties.gameWidth, gameProperties.gameHeight, true, true, true, true);
		game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.setBoundsToWorld();
		game.physics.p2.gravity.y = 0;
		game.physics.p2.applyGravity = false; 
		game.physics.p2.enableBody(game.physics.p2.walls, false); 
		// physics start system
		//game.physics.p2.setImpactEvents(true);

		

    },
	
	create: function () {
		game.stage.backgroundColor = 0xE1A193;;
		console.log("client started");

		if(socket.connected)
		{
			console.log("connected to server my check"); 
	         createPlayer();
	         gameProperties.in_game = true;
	        // send the server our initial position and tell it we are connected
	        socket.emit('new_player', {x: 0, y: 0, angle: 0});
		}
		//socket.on("connect", onsocketConnected);

		//socket.on("connect", onsocketConnected); 
		
		//listen to new enemy connections
		socket.on("new_enemyPlayer", onNewPlayer);
		//listen to enemy movement 
		socket.on("enemy_move", onEnemyMove);
		//when received remove_player, remove the player passed; 
		socket.on('remove_player', onRemovePlayer); 
		//when the player receives the new input
		socket.on('input_recieved', onInputRecieved);

         //when the player gets killed
		socket.on('killed', onKilled);
		//when the player gains in score
		socket.on('gained', onGained);

		socket.on('lose_power',onlose_power);
		
		// check for item removal
		socket.on ('itemremove', onitemremove); 
		socket.on ('mineremove', onmineremove); 
		// check for item update
		socket.on('item_update', onitemUpdate); 
		//mine update
		socket.on('mine_update', onmineUpdate); 
		socket.on ('leader_board', lbupdate); 

		document.addEventListener('keydown', keyDown);

		createLeaderBoard();
	},
	
	update: function () {
		// emit the player input
		
		//move the player when the player is made 
		
		if (gameProperties.in_game) {
		
		setTimeout(function() {
           
			every_50= true;

		}, 50);

	
	       if(every_50)
	       	 {
	       	 	every_50=false;

	       	 //we're making a new mouse pointer and sending this input to 
			//the server.
			var pointer = game.input.mousePointer;
					
			//Send a new position data to the server 
			socket.emit('input_fired', {
				
				pointer_worldx: pointer.worldX, 
				pointer_worldy: pointer.worldY, 
			});

	       	 }
			
		}
	}
}

var gameBootstrapper = {
    init: function(gameContainerElementId){
		game.state.add('main', main);
		game.state.start('main'); 
    }
};;

gameBootstrapper.init("gameDiv");