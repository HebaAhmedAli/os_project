var express = require('express');
//require p2 physics library in the server.
var p2 = require('p2'); 
//get the node-uuid package for creating unique id
var unique = require('node-uuid')

var app = express();
var serv = require('http').Server(app);
//get the functions required to move players in the server.
var physicsPlayer = require('./server/physics/playermovement.js');

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var player_lst = [];

//needed for physics update 
var startTime = (new Date).getTime();
var lastTime;
var timeStep= 1/70; 

//the physics world in the server. This is where all the physics happens. 
//we set gravity to 0 since we are just following mouse pointers.
var world = new p2.World({
  gravity : [0,0]
});

//create a game class to store basic game data
var game_setup = function() {
	//The constant number of foods in the game
	this.food_num = 150; 
	//food object list
	this.food_pickup = [];
	//mine_object list
	this.mine_pickup = [];
	//game size height
	this.canvas_height = 4000;
	//game size width
	this.canvas_width = 4000; 
}

// createa a new game instance
var game_instance = new game_setup();


//a player class in the server
var Player = function (startX, startY, startAngle) {
  this.x = startX
  this.y = startY
  this.angle = startAngle
  this.speed = 500;
  //We need to intilaize with true.
  this.sendData = true;
 
  //this.size = getRndInteger(40, 100);
  this.size=100;
  this.score=50;
  this.power=100;
}




var foodpickup = function (max_x, max_y, type, id) {
	this.x = getRndInteger(10, max_x - 10) ;
	this.y = getRndInteger(10, max_y - 10);
	this.type = type; 
	this.id = id; 
	this.powerup; 
}

var minepickup = function (x, y, type, id) {
	this.x = x-150 ;
	this.y = y-150;
	this.type = type; 
	this.id = id; 
	this.powerup; 
}

//We call physics handler 60fps. The physics is calculated here. 
setInterval(heartbeat, 1000/60);



//Steps the physics world. 
function physics_hanlder() {
	var currentTime = (new Date).getTime();
	timeElapsed = currentTime - startTime;
	var dt = lastTime ? (timeElapsed - lastTime) / 1000 : 0;
    dt = Math.min(1 / 10, dt);
    world.step(timeStep);
}

function heartbeat () {
	
	//the number of food that needs to be generated 
	//in this demo, we keep the food always at 100
	var food_generatenum = game_instance.food_num - game_instance.food_pickup.length; 
	
	//add the food 
	addfood(food_generatenum);
	//physics stepping. We moved this into heartbeat
	physics_hanlder();
}

function addfood(n) {
	
	//return if it is not required to create food 
	if (n <= 0) {
		return; 
	}
	
	//create n number of foods to the game
	for (var i = 0; i < n; i++) {
		//create the unique id using node-uuid
		var unique_id = unique.v4(); 
		var foodentity = new foodpickup(game_instance.canvas_width, game_instance.canvas_height, 'food', unique_id);
		game_instance.food_pickup.push(foodentity); 
		//set the food data back to client
		io.emit("item_update", foodentity); 
	}
}

function add_mine(data)
{
	     var movePlayer = find_playerid(this.id); 
	

	     if(movePlayer.score-10>=0)
	     movePlayer.score-=10;
	     else
	     {
          console.log("can't add mine because of your score");
          return;
	     }


	     //------update the board here
	     ////broadcast the new score for check only
	
	      this.emit("gained", {new_score: movePlayer.score,id:movePlayer.id}); 

	     
	    var unique_id = unique.v4(); 
		var mineentity = new minepickup(data.pointer_x,data.pointer_y, 'mine', unique_id);
		game_instance.mine_pickup.push(mineentity); 
		//set the food data back to client
		io.emit("mine_update", mineentity ); 
}



// when a new player connects, we make a new instance of the player object,
// and send a new player message to the client. 
function onNewplayer (data) {
	console.log(data);
	//new player instance
	var newPlayer = new Player(data.x, data.y, data.angle);
	
	//create an instance of player body 
	playerBody = new p2.Body ({
		mass: 0,
		position: [0,0],
		fixedRotation: true
	});
	
	//add the playerbody into the player object 
	newPlayer.playerBody = playerBody;
	world.addBody(newPlayer.playerBody);
	
	console.log("created new player with id " + this.id);
	newPlayer.id = this.id; 	
	
	this.emit('create_player', {size: newPlayer.size});
	
	//information to be sent to all clients except sender
	var current_info = {
		id: newPlayer.id, 
		x: newPlayer.x,
		y: newPlayer.y,
		angle: newPlayer.angle,
		size: newPlayer.size,
		
	}; 
	
	//send to the new player about everyone who is already connected. 	
	for (i = 0; i < player_lst.length; i++) {
		existingPlayer = player_lst[i];
		var player_info = {
			id: existingPlayer.id,
			x: existingPlayer.x,
			y: existingPlayer.y, 
			angle: existingPlayer.angle,	
			size: existingPlayer.size

		};
		console.log("pushing player");
		//send message to the sender-client only
		this.emit("new_enemyPlayer", player_info);
	}
	
	//Tell the client to make foods that are exisiting
	for (j = 0; j < game_instance.food_pickup.length; j++) {
		var food_pick = game_instance.food_pickup[j];
		this.emit('item_update', food_pick); 
	}

	//Tell the client to make mines that are exisiting
	for (j = 0; j < game_instance.mine_pickup.length; j++) {
		var mine_pick = game_instance.mine_pickup[j];
		this.emit('mine_update', mine_pick); 
	}
	
	//send message to every connected client except the sender
	this.broadcast.emit('new_enemyPlayer', current_info);
	

	player_lst.push(newPlayer); 
}




//instead of listening to player positions, we listen to user inputs 
function onInputFired (data) {
	var movePlayer = find_playerid(this.id, this.room); 
	
	
	if (!movePlayer) {
		return;
		console.log('no player'); 
	}

	//when sendData is true, we send the data back to client. 
	if (!movePlayer.sendData) {
		return;
	}
	
	//every 50ms, we send the data. 
	setTimeout(function() {movePlayer.sendData = true}, 50);
	//we set sendData to false when we send the data. 
	movePlayer.sendData = false;
	
	//Make a new pointer with the new inputs from the client. 
	//contains player positions in server
	var serverPointer = {
		x: data.pointer_x,
		y: data.pointer_y,
		worldX: data.pointer_worldx, 		
		worldY: data.pointer_worldy
	}
	
	//moving the player to the new inputs from the player
	if (physicsPlayer.distanceToPointer(movePlayer, serverPointer) <= 30) {
		movePlayer.playerBody.angle = physicsPlayer.movetoPointer(movePlayer, 0, serverPointer, 1000);
	} else {
		movePlayer.playerBody.angle = physicsPlayer.movetoPointer(movePlayer, movePlayer.speed, serverPointer);	
	}
	
	//new player position to be sent back to client. 
	var info = {
		x: movePlayer.playerBody.position[0],
		y: movePlayer.playerBody.position[1],
		angle: movePlayer.playerBody.angle
	}

	//send to sender (not to every clients). 
	this.emit('input_recieved', info);
	
	//data to be sent back to everyone except sender 
	var moveplayerData = {
		id: movePlayer.id, 
		x: movePlayer.playerBody.position[0],
		y: movePlayer.playerBody.position[1],
		angle: movePlayer.playerBody.angle,
	}
	
	//send to everyone except sender 
	this.broadcast.emit('enemy_move', moveplayerData);
}

//call when a client disconnects and tell the clients except sender to remove the disconnected player
function onClientdisconnect() {
	console.log('disconnect'); 

	var removePlayer = find_playerid(this.id); 
		
	if (removePlayer) {
		player_lst.splice(player_lst.indexOf(removePlayer), 1);
	}
	
	console.log("removing player " + this.id);
	
	//send message to every connected client except the sender
	this.broadcast.emit('remove_player', {id: this.id});
	
}

// find player by the the unique socket id 
function find_playerid(id) {

	for (var i = 0; i < player_lst.length; i++) {

		if (player_lst[i].id == id) {
			return player_lst[i]; 
		}
	}
	
	return false; 
}


function find_food (id) {
	for (var i = 0; i < game_instance.food_pickup.length; i++) {
		if (game_instance.food_pickup[i].id == id) {
			return game_instance.food_pickup[i]; 
		}
	}
	
	return false;
}

function find_mine (id) {
	for (var i = 0; i < game_instance.mine_pickup.length; i++) {
		if (game_instance.mine_pickup[i].id == id) {
			return game_instance.mine_pickup[i]; 
		}
	}
	
	return false;
}


function onitemPicked (data) {
	var movePlayer = find_playerid(this.id); 

	var object = find_food(data.id);	
	if (!object) {
		console.log(data);
		console.log("could not find object");
		return;
	}
	
	//increase player score
	movePlayer.score += 1; 
	//broadcast the new score for check only
	
	 this.emit("gained", {new_score: movePlayer.score,id:movePlayer.id}); 

	 //update the board here
	
	game_instance.food_pickup.splice(game_instance.food_pickup.indexOf(object), 1);
	

	io.emit('itemremove', object); 
	
}
function onminePicked (data) {
	var movePlayer = find_playerid(this.id); 

	var object = find_mine(data.id);	
	if (!object) {
		console.log(data);
		console.log("could not find object");
		return;
	}
	
	//decrease player power
	movePlayer.power -= 10; 
	//broadcast the new power for check only 3alban
	this.emit("lose_power", {new_power: movePlayer.power,id:movePlayer.id}); 

	if(movePlayer.power<=0)
	{

		this.emit("killed");
		
		this.broadcast.emit('remove_player', {id: this.id});

		player_lst.splice(player_lst.indexOf(movePlayer), 1);
	

	}
	
	game_instance.mine_pickup.splice(game_instance.mine_pickup.indexOf(object), 1);
	

	io.emit('mineremove', object); 
	//this.emit('item_picked');       //-------------------?
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

 // io connection 
var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
	console.log("socket connected"); 
	
	// listen for disconnection; 
	socket.on('disconnect', onClientdisconnect); 
	
	// listen for new player
	socket.on("new_player", onNewplayer);
	
	//listen for new player inputs. 
	socket.on("input_fired", onInputFired);

	//listen if player got items 
	socket.on('item_picked', onitemPicked);
	socket.on('mine_picked', onminePicked);

	socket.on('please_add_mine',add_mine);
});