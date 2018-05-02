
canvas_width = window.innerWidth * window.devicePixelRatio;
canvas_height = window.innerHeight * window.devicePixelRatio;

//game = new Phaser.Game(canvas_width,canvas_height, Phaser.CANVAS, 'gameDiv');


//the enemy player list 
var enemies=[];

// player score list to be updated when any player picks a coin 
var player_scores = [];  
var player;
var my_power; 
var s1;

var newPointer= {
	worldX:0,
	worldY:0,
	speed: 0,
	acc: 0
};

var player_img,food_img,bomb_img;


var every_50=true;

var old_mousex,old_mousey;


/*function onsocketConnected () {
	console.log("connected to server"); 
	createPlayer();
	gameProperties.in_game = true;
	// send the server our initial position and tell it we are connected
	socket.emit('new_player', {x: 0, y: 0, angle: 0});
}*/

function keyDown(event) {
  //console.log(event);

  if(event.keyCode==65 )
  {

  	console.log("key "+event.keyCode);  
  	//var pointer = game.input.mousePointer;
  	socket.emit('please_add_mine',{
  		pointer_x: player.position.x, 
  		pointer_y: player.position.y, 

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
	
	removePlayer.player.remove();
	enemies.splice(enemies.indexOf(removePlayer), 1);
}




function createPlayer () {

/*player = s1.createSprite(0,0,20,20);
  
player.addAnimation("moving", "client/asset2/player.png", "client/asset2/player.png");
*/ 

 socket.emit('new_player', {x: 0, y: 0});


player = s1.createSprite(0, 0,20,20);
player_img.resize(150,150);
player.addImage(player_img);



	
}

// this is the enemy class. 
var remote_player = function (id, startx, starty) {
	
	this.id = id;
	this.x=startx;
	this.y=starty;

/*
 this.player = s1.createSprite(startx, starty,20,20);
  
 this.player.addAnimation("moving", "client/asset2/player.png", "client/asset2/player.png");
 */

 this.player = s1.createSprite(startx, starty,20,20);
  player_img.resize(150,150);
 this.player.addImage(player_img);


	

}

//Server will tell us when a new enemy player connects to the server.
//We create a new enemy in our game.
function onNewPlayer (data) {
	//enemy object 
	console.log(" new enemy ");
	var new_enemy = new remote_player(data.id, data.x, data.y); 
	enemies.push(new_enemy);
}

//Server tells us there is a new enemy movement. We find the moved enemy
//and sync the enemy movement with the server
function onEnemyMove (data) {
	
	var movePlayer = findplayerbyid (data.id); 
	
	if (!movePlayer) {
		return;
	}
	
	
  /*var x_sign=-1,y_sign=-1;
  if(data.worldX-movePlayer.player.position.x>0)
     x_sign=1;
  
  if(data.worldY-movePlayer.player.position.y>0)
     y_sign=1;
  
   //console.log((data.worldX-player.position.x),(data.worldY-player.position.y));
 
  movePlayer.player.velocity.x = x_sign*data.speed;
  movePlayer.player.velocity.y =y_sign*data.speed;*/

  movePlayer.player.velocity.x = (data.worldX-movePlayer.player.position.x)/30;
  movePlayer.player.velocity.y =(data.worldY-movePlayer.player.position.y)/30;

}

//we're receiving the calculated position from the server and changing the player position
function onInputRecieved (data) {



   //player.maxSpeed = data.speed;
  /*var x_sign=-1,y_sign=-1;
  if(data.worldX-player.position.x>0)
     x_sign=1;
  
  if(data.worldY-player.position.y>0)
     y_sign=1;
  
   //console.log((data.worldX-player.position.x),(data.worldY-player.position.y));
  
  player.velocity.x = x_sign*data.speed;
  player.velocity.y =y_sign*data.speed;*/

  player.velocity.x = (data.worldX-player.position.x)/30;
  player.velocity.y =(data.worldY-player.position.y)/30;


  
 // move_player(data);
	
}



function onKilled (data) {
	console.log("player killed");
	player.remove();
}

function onlose_power(data)
{

	my_power = data.new_power;
}



//This is where we use the socket id. 
//Search through enemies list to find the right enemy of the id.
function findplayerbyid (id) {

	//console.log(enemies.length);
	for (var i = 0; i < enemies.length; i++) {

		if (enemies[i].id == id) {
			return enemies[i]; 
		}
	}
}

function drawLeaderBoard(s) {


	/*s.rectMode(s.CORNER); // Default rectMode is CORNER
	s.fill(255); // Set fill to white
	s.rect(canvas_width/2+player.position.x -200,player.position.y -canvas_height/2, 200, 300); // Draw white rect using CORNER mode
*/


	var score_text = 'Score Board\n';
	var usermaxlen=6;
	var maxplayerDisplay =10;

	//draw power 

	var power_text='My Power:  ';
	power_text += my_power;
	s.textSize(15);
	s.text(power_text, canvas_width/2+player.position.x -200, player.position.y -canvas_height/2+10,200 ,300 ); // Text wraps within text box



	

	// draw Score 
	 var display = Math.min(maxplayerDisplay,player_scores.length);

	 //console.log("player scores len "+player_scores.length);
	for (var i = 0; i <display; i++) {
		//mafrood lsa el username
		var username="";
		if (player_scores[i].id.length > usermaxlen)
		{
			for (var j=0;j<=usermaxlen;j++){

				username+= player_scores[i].id[j];
			}
			username+="...";

		}
		else username = player_scores[i].id;
		
		score_text+= (i+1);
		score_text += ". ";
		score_text += username+ " : ";
		score_text+= player_scores[i].score
		score_text += '\n';
	}

	if (maxplayerDisplay < player_scores.length )
	{
		score_text+=".\n"+".\n"+".\n";
	}	

	//console.log(score_text);
	s.textSize(15);
	s.text(score_text, canvas_width/2+player.position.x -200, player.position.y -canvas_height/2+50,200 ,300 ); // Text wraps within text box

}

//update player scores
function scoreUpdate (data) {


	//console.log("score update");
	
	player_scores.length=0;
	for (var i = 0; i <data.length; i++) {
		
		
		//mafrood lsa el username

		player_scores.push({id: data[i].id, score: data[i].score});
		
	}


	//console.log("check push  "+player_scores[0].id)
 
}

var main=function(s){

	s1=s;
	s.preload=function ()
	{
  // load image
  player_img = s.loadImage("client/asset/player.png");

  food_img=s.loadImage("client/asset/coin2.png");	
  bomb_img= s.loadImage("client/asset/bomb.png");	
}
s.setup=function(){

    
    //food_sprites = new s.Group();
    // mine_sprites = new s.Group();

	 var canvas =s.createCanvas(canvas_width,canvas_height);

     //s.background(255, 0, 200);

        // Move the canvas so it’s inside our <div id="sketch-holder">.
        canvas.parent('gameDiv');


        createPlayer();



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
		//socket.on('gained', onGained);

		socket.on('lose_power',onlose_power);
		
		// check for item removal
		socket.on ('itemremove', onitemremove); 
		socket.on ('mineremove', onmineremove); 
		// check for item update
		socket.on('item_update', onitemUpdate); 
		//mine update
		socket.on('mine_update', onmineUpdate); 
		socket.on ('leader_board', scoreUpdate);  

		document.addEventListener('keydown', keyDown);

		//createLeaderBoard();
		//
		//
		setInterval(function() {

			every_50= true;
            //console.log("every 20");

		}, 40);
        
       /*setInterval(function() {

			
            console.log("position ",player.position.x,player.position.y);
            console.log("old mouse ",old_mousex,old_mousey);

		}, 5);*/

		



	}


	s.draw=function(){	
		//console.log(canvas_width, canvas_height, s1.mouseX, s1.mouseY);

		s.push(); //3lshan trag3 alcamera 3nd 0,0 laan translate bt accumelate

		s.translate(canvas_width / 2, canvas_height / 2);
		//s.scale(1.2);
		s.translate(-player.position.x, -player.position.y);

		s.background(200);

		
		//player.overlap(food_sprites,player_coll);
       // player.overlap(mine_sprites,player_coll_mine);

		s.fill(0);
		s.ellipse(0,0,20,20);
		s.ellipse(500,500,20,20);
		drawLeaderBoard(s);  // to update score and my power

      

if(every_50)
{
	every_50=false;
	       	
			 socket.emit('input_fired', {
				
				pointer_worldx: s1.mouseX+player.position.x-canvas_width / 2, 
				pointer_worldy: s1.mouseY+player.position.y-canvas_height / 2, 
				//player_positionx:player.position.x,
				//player_positiony:player.position.y,
			 });

			 //old_mousex=s1.mouseX+player.position.x-canvas_width / 2;
			 //old_mousey= s1.mouseY+player.position.y-canvas_height / 2;

		}


      // i think here is the right place but don't work
	  s1.drawSprites();
	  //console.log(player.position.x, player.position.y, s1.mouseX, s1.mouseY);
	   s.pop();
	 
	}
	


}


