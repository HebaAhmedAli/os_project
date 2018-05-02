var express = require('express');
//require p2 physics library in the server.
//var p2 = require('p2'); 
//get the node-uuid package for creating unique id
var unique = require('node-uuid')

var app = express();
var serv = require('http').Server(app);

//get the functions required to move players in the server.
//var physicsPlayer = require('./server/physics/playermovement.js');

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

//app.use('/asset',express.static(__dirname + '/asset'));


var scene_w=4000;
var scene_h=4000;

var collision_map=[];   //map of type,id


serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var player_lst = [];

//needed for physics update 
/*var startTime = (new Date).getTime();
var lastTime;*/
var timeStep= 1/70; 

var end_initiall_fill=false;


var player_dim=80;
var items_dim=40;


food_num = 150; 
	//food object list
food_pickup = [];
	//mine_object list
mine_pickup = [];


// createa a new game instance
//var game_instance = new game_setup();

max_speed =5;
  //We need to intilaize with true.


//a player class in the server
var Player = function (startX, startY) {
  this.x = startX
  this.y = startY
  
  this.score=50;
  this.power=100;
  
}

function fill_part_of_map(type,x,y,id)
{
 
 	if(x>scene_w-items_dim+1||x<0||y>scene_h-items_dim+1||y<0)
        	return false;

	for(var i=x;i<x+items_dim;i++)
	{
		for(var j=y;j<y+items_dim;j++)
		{
        
		var value=[];
		value.push(type); //type 0 = player // 1=food // 2=mine
    	value.push(id); 
    	//console.log(collision_map[i][j]);
		collision_map[i][j]=value;
	    
		}
	}

	return true;
        
		
}

function free_part_of_map(type,id)
{
    var item;
    if(type==1)
    {
       item=find_food(id);
    }
    else
    {
       item=find_mine(id);
    }
    var x=item.x;
    var y=item.y;

	for(var i=x;i<x+items_dim;i++)
	{
		for(var j=y;j<y+items_dim;j++)
		{
        
		var value=[];
		value.push(0); //type 0 = player // 1=food // 2=mine
    	value.push(-1); 
    	//console.log(collision_map[i][j]);
    	
		collision_map[i][j]=value;
	   
		}
	}

		
}


var foodpickup = function (max_x, max_y, type, id) {
	this.x = getRndInteger(items_dim, max_x - items_dim-1) ;
	this.y = getRndInteger(items_dim, max_y - items_dim-1);
    
    //console.log(end_initiall_fill);
	fill_part_of_map(1,this.x,this.y,id);
	
	//to_map(this.x,this.y,1,id); //food

	this.type = type; 
	this.id = id; 
	this.powerup; 
}

var minepickup = function (x, y, type, id) {
	this.x = x-150 ;
	this.y = y-150;
	
	//to_map(this.x,this.y,2,id); //mine
    this.in_range=fill_part_of_map(2,this.x,this.y,id);
	

	this.type = type; 
	this.id = id; 
	this.powerup; 
}

//We call physics handler 60fps. The physics is calculated here. 
setInterval(heartbeat, 1000/60);




//console.log(collision_map[2][1][0]);

/*function to_map(x,y,type,id)
{
	    var value=[];
		value.push(type); //type 0 = player // 1=food // 2=mine
		value.push(id);  //id is don't care in case player
        //collision_map.set((x,y),value);
        //
        

        collision_map[x][y]=value;
}*/
function fill_map_initially()
{

for(var i=0;i<scene_w;i++)
{
	var row=[];
	for(var j=0;j<scene_h;j++)
	{

     var value=[];
	 value.push(0); //type 0 = player // 1=food // 2=mine
	 value.push(-1); 
	 row.push(value);
	 //to_map(i,j,0,-1);
   //console.log(collision_map.get((1,2))[1]); //map of type,id

	}

	collision_map.push(row);
}

end_initiall_fill=true;
//console.log(collision_map[2367][3999]);

}


fill_map_initially(); //call it once


function heartbeat () {
	
	//the number of food that needs to be generated 
	//in this demo, we keep the food always at 100
	var food_generatenum = food_num - food_pickup.length; 
	
	//add the food 
	if(end_initiall_fill==true)
	addfood(food_generatenum);
	//physics stepping. We moved this into heartbeat
	//physics_hanlder();
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
		var foodentity = new foodpickup(scene_w, scene_h, 'food', unique_id);
		food_pickup.push(foodentity); 
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
		 sortPlayerListByScore();

	     ////broadcast the new score for check only
	
	    //  this.emit("gained", {new_score: movePlayer.score,id:movePlayer.id}); 

	     
	    var unique_id = unique.v4(); 
		var mineentity = new minepickup(Math.ceil(data.pointer_x),Math.ceil(data.pointer_y), 'mine', unique_id);

		if(mineentity.in_range==true)
		{
		mine_pickup.push(mineentity); 
		//set the food data back to client
		//
		
		console.log("add mine");

		io.emit("mine_update", mineentity ); 
		}
		



}



// when a new player connects, we make a new instance of the player object,
// and send a new player message to the client. 
function onNewplayer (data) {


	console.log(data);
	//new player instance
	var newPlayer = new Player(data.x, data.y);
	
	//create an instance of player body 
	/*playerBody = new p2.Body ({
		//mass: 0,
		position: [0,0]
		//fixedRotation: true
	});
	*/
	
	//add the playerbody into the player object 
	//newPlayer.playerBody = playerBody;
	//console.log("px "+newPlayer.playerBody.position[0]+" py "+newPlayer.playerBody.position[1]);
	//world.addBody(newPlayer.playerBody);
	
	console.log("created new player with id " + this.id);
	newPlayer.id = this.id; 	
	
	//this.emit('create_player', {size: newPlayer.size});
	
	//information to be sent to all clients except sender
	var current_info = {
		id: newPlayer.id, 
		x: newPlayer.x,
		y: newPlayer.y,
		
		
	}; 
	
	//send to the new player about everyone who is already connected. 	
	console.log(" lst lentgh before"+player_lst.length);
	for (i = 0; i < player_lst.length; i++) {
		existingPlayer = player_lst[i];
		var player_info = {
			id: existingPlayer.id,
			x: existingPlayer.x,
			y: existingPlayer.y, 
			

		};
		//console.log("pushing player");
		//send message to the sender-client only
		console.log(" player info  "+player_info.id);
		this.emit("new_enemyPlayer", player_info);
	}
	
	//b emit da hna bs 34an el power yzhar fe bdayet el le3b 34an da elly bycall update_power_leaderB

	this.emit("lose_power", {new_power: newPlayer.power,id:newPlayer.id}); 
	
    //this.emit("lose_power", { new_power : 100 , id : 1 }); 

	//Tell the client to make foods that are exisiting
	for (j = 0; j < food_pickup.length; j++) {
		var food_pick = food_pickup[j];
		this.emit('item_update', food_pick); 
	}

	//Tell the client to make mines that are exisiting
	for (j = 0; j < mine_pickup.length; j++) {
		var mine_pick = mine_pickup[j];
		this.emit('mine_update', mine_pick); 
	}
	
	//send message to every connected client except the sender
	this.broadcast.emit('new_enemyPlayer', current_info);
	

	player_lst.push(newPlayer); 

		console.log(" lst lentgh after"+player_lst.length);

	sortPlayerListByScore();

	
}




//instead of listening to player positions, we listen to user inputs 
function onInputFired (data) {

	var this_client=this;
	var movePlayer = find_playerid(this.id, this.room); 
	
	
	if (!movePlayer) {
		//console.log('no player'); 

		return;
			}


	var serverPointer = {
		
		worldX: data.pointer_worldx, 		
		worldY: data.pointer_worldy
	}
	
	//moving the player to the new inputs from the player
	/*var dist=physicsPlayer.distanceToPointer(movePlayer, serverPointer);
	if (dist <= 30) {
		//movePlayer.playerBody.angle = physicsPlayer.movetoPointer(movePlayer, 0, serverPointer, 1000);
		movePlayer.playerBody.angle = physicsPlayer.movetoPointer(movePlayer, dist, serverPointer);
	} else {
		movePlayer.playerBody.angle = physicsPlayer.movetoPointer(movePlayer, movePlayer.speed, serverPointer);	
	}*/

	//physicsPlayer.move_player(movePlayer, serverPointer);
	
	if(serverPointer.worldX>scene_w-player_dim-1)
		serverPointer.worldX=scene_w-player_dim-1;
	if(serverPointer.worldX<0)
		serverPointer.worldX=0;
	if(serverPointer.worldY>scene_h-player_dim-1)
		serverPointer.worldY=scene_h-player_dim-1;
	if(serverPointer.worldY<0)
		serverPointer.worldY=0;
	

	//movePlayer.x=serverPointer.worldX;
	//movePlayer.y=serverPointer.worldY;
	//console.log(movePlayer.x,movePlayer.y);
	

	//new player position to be sent back to client. 
	var info = {
		
		worldX: serverPointer.worldX, 		
		worldY: serverPointer.worldY,
		speed:max_speed,
		
	}

	 //console.log("x after: "+movePlayer.playerBody.position[0]+" y after: "+movePlayer.playerBody.position[1]);


	//send to sender (not to every clients). 
	this.emit('input_recieved', info);
	
	//data to be sent back to everyone except sender 
	var moveplayerData = {
		id: movePlayer.id, 
		worldX: serverPointer.worldX, 		
		worldY: serverPointer.worldY,
		speed:max_speed,
		
	}
	
	//send to everyone except sender 
	this.broadcast.emit('enemy_move', moveplayerData);

	//collision_map.get((Math.ceil(movePlayer.x),Math.ceil(movePlayer.y)))[0]
	
	//console.log("player position actual "+data.player_positionx+" "+data.player_positiony);

	move_player(movePlayer,serverPointer,this_client);


}

function move_player(movePlayer,serverPointer,this_client)
{
	  var stepx=0.1;
      var stepy=0.1;

      var newx=(serverPointer.worldX-movePlayer.x)*stepx+movePlayer.x;
      var newy=(serverPointer.worldY-movePlayer.y)*stepy+movePlayer.y;


     var point1={x:movePlayer.x,y:movePlayer.y};
     //var point2={x:serverPointer.worldX,y:serverPointer.worldY};
     var point2={x:newx,y:newy};
     var result=getEquationOfLineFromTwoPoints(point2, point1);

     console.log("old position "+point1.x+" "+point1.y);
     console.log("mouse "+serverPointer.worldX+" "+serverPointer.worldY);
      console.log("new position "+point2.x+" "+point2.y);
    //if gradient=infinity or - infinity x sabta wnzwd aw nall al y
    //if gradient=0 or - 0 y sabta wnzwd aw nall al x    yIntercept
    
     //var stepx=(point2.x-point1.x)/30;
     //var stepy=(point2.y-point1.y)/30;
   
     if(result.gradient==Infinity)
    {
      console.log("if 1");
      while(movePlayer.y<newy)
      {
      	check_collision_while_moving(movePlayer,this_client);
      	movePlayer.y+=stepy;
      	console.log("movePlayer.y "+movePlayer.y);
        if(movePlayer.y<0)
        {
        		movePlayer.y=0;

        		break;
        }
        else if(movePlayer.y>scene_h-player_dim-1)
        {
        	movePlayer.y=scene_h-player_dim-1;
        		break;
        }
      }
    }
    else if(result.gradient==-Infinity)
    {
    	console.log("if 2");
      while(movePlayer.y>newy)
      {
      	check_collision_while_moving(movePlayer,this_client);
      	movePlayer.y-=stepy;
      	console.log("movePlayer.y "+movePlayer.y);
      	if(movePlayer.y<0)
        {
        		movePlayer.y=0;
        		break;
        }
        else if(movePlayer.y>scene_h-player_dim-1)
        {
        	movePlayer.y=scene_h-player_dim-1;
        		break;
        }
      }
    }
    else if(result.gradient==0)
    {
    	console.log("if 3");
    	while(movePlayer.x<newx)
      {
      	check_collision_while_moving(movePlayer,this_client);
      	movePlayer.x+=stepx;
      	if(movePlayer.x<0)
        {
        		movePlayer.x=0;
        		break;
        }
        else if(movePlayer.x>scene_w-player_dim-1)
        {
        	movePlayer.x=scene_w-player_dim-1;
        		break;
        }
      }
    }
    else if(result.gradient==-0)
    {
    	console.log("if 4");
      while(movePlayer.x>newx)
      {
      	check_collision_while_moving(movePlayer,this_client);
      	movePlayer.x-=stepx;
      	if(movePlayer.x<0)
        {
        		movePlayer.x=0;
        		break;
        }
        else if(movePlayer.x>scene_w-player_dim-1)
        {
        	movePlayer.x=scene_w-player_dim-1;
        		break;
        }
      }
    }
    else
    {

     if(movePlayer.x<newx)
     {
     	console.log("if 5");
     	
     while(movePlayer.x<newx)
	 {

	 movePlayer.y=result.gradient*movePlayer.x+result.yIntercept;
	 console.log("movePlayer.y "+movePlayer.y);
	  if(movePlayer.y<0)
        {
        		movePlayer.y=0;
        		break;
        }
        else if(movePlayer.y>scene_h-player_dim-1)
        {
        	movePlayer.y=scene_h-player_dim-1;
        		break;
        }
     check_collision_while_moving(movePlayer,this_client);
     movePlayer.x+=stepx;
     if(movePlayer.x<0)
        {
        		movePlayer.x=0;
        		break;
        }
        else if(movePlayer.x>scene_w-player_dim-1)
        {
        	movePlayer.x=scene_w-player_dim-1;
        		break;
        }
	 }
   
     }
     else
     {
     	console.log("if 6");
     while(movePlayer.x>newx)
	 {

	 console.log("result ",result.gradient,result.yIntercept);

	 movePlayer.y=result.gradient*movePlayer.x+result.yIntercept;
	 console.log("movePlayer.y "+movePlayer.y);
	 if(movePlayer.y<0)
        {
        		movePlayer.y=0;
        		break;
        }
        else if(movePlayer.y>scene_h-player_dim-1)
        {
        	movePlayer.y=scene_h-player_dim-1;
        		break;
        }
     check_collision_while_moving(movePlayer,this_client);
     movePlayer.x-=stepx;
     if(movePlayer.x<0)
        {
        		movePlayer.x=0;
        		break;
        }
        else if(movePlayer.x>scene_w-player_dim-1)
        {
        	movePlayer.x=scene_w-player_dim-1;
        		break;
        }
	 }
     }
   
    }
	

}

function check_collision_while_moving(movePlayer,this_client)
{

     var player_centerx=Math.ceil(movePlayer.x)+player_dim/2;

	 var player_centery=Math.ceil(movePlayer.y)+player_dim/2;
	 
	 var collide_coin=is_collide(player_centerx,player_centery,1);
	 var collide_mine=is_collide(player_centerx,player_centery,2);
	 
     
	 if(collide_coin!=-1)
    {
     //coin
     
		console.log("coin collide");
     
        free_part_of_map(1,collide_coin);

        onitemPicked(collide_coin,movePlayer);
   
	
     
    }
    if(collide_mine!=-1)
    {
     
		console.log("mine collide");
    
 	    free_part_of_map(2,collide_mine);
   	    //mine
  	   onminePicked(collide_mine,movePlayer,this_client);
   
		
     
    }
}

function is_collide(center_x,center_y,type)
{
 
 var arr_x=[0,0,player_dim/2,-player_dim/2,player_dim/2,-player_dim/2,player_dim/2,-player_dim/2];
 var arr_y=[player_dim/2,-player_dim/2,0,0,player_dim/2,-player_dim/2,-player_dim/2,player_dim/2];

for(var i=0;i<arr_x.length;i++)
{
	//console.log(center_x+arr_x[i],center_y+arr_y[i]);
	if(collision_map[center_x+arr_x[i]][center_y+arr_y[i]][0]==type)
	{
	 
     return collision_map[center_x+arr_x[i]][center_y+arr_y[i]][1];
	}
}

return -1;

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

	sortPlayerListByScore();
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
	for (var i = 0; i < food_pickup.length; i++) {
		if (food_pickup[i].id == id) {
			return food_pickup[i]; 
		}
	}
	
	return false;
}

function find_mine (id) {
	for (var i = 0; i < mine_pickup.length; i++) {
		if (mine_pickup[i].id == id) {
			return mine_pickup[i]; 
		}
	}
	
	return false;
}

// called 
//1.When the player picks up coins
//2.When the new player connects
//3.When the player disconnects (exits without dying).
//4.When the player dies (his power becomes zero)

function sortPlayerListByScore() {
	player_lst.sort(function(a,b) {
		return b.score - a.score;
	});
	
	var playerListSorted = [];
	for (var i = 0; i < player_lst.length; i++) {
		//mafrood lsa el username
		playerListSorted.push({id: player_lst[i].id, score: player_lst[i].score});
	}
	console.log(playerListSorted);
	io.emit("leader_board", playerListSorted);
}



function onitemPicked (id,movePlayer) {
	//var movePlayer = find_playerid(this.id); 

	var object = find_food(id);	
	if (!object) {
		//console.log(data);
		//console.log("could not find object");
		return;
	}
	
	//increase player score
	movePlayer.score += 1; 
	//broadcast the new score for check only
	
	// this.emit("gained", {new_score: movePlayer.score,id:movePlayer.id}); 

	 //update the board here
	
	food_pickup.splice(food_pickup.indexOf(object), 1);
	
	sortPlayerListByScore();

	console.log("item id : "+id+" movePlayer.score "+movePlayer.score)

	io.emit('itemremove', object); 
	
}
function onminePicked (id,movePlayer,this_client) {
	//var movePlayer = find_playerid(this.id); 

	var object = find_mine(id);	
	if (!object) {
		//console.log(data);
		//console.log("could not find object");
		return;
	}
	
	//decrease player power
	movePlayer.power -= 10; 
	//broadcast the new power for updating power 
	this_client.emit("lose_power", {new_power: movePlayer.power,id:movePlayer.id}); 

	if(movePlayer.power<=0)
	{

		this_client.emit("killed");
		
		this_client.broadcast.emit('remove_player', {id: this_client.id});

		player_lst.splice(player_lst.indexOf(movePlayer), 1);
		sortPlayerListByScore();


	}
	
	mine_pickup.splice(mine_pickup.indexOf(object), 1);
	

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

	socket.on('chat message', function(msg){
		console.log('a user need to chat '+msg);
		io.emit('chat message', msg);
});
});




 function getEquationOfLineFromTwoPoints(point1, point2) {
    	var lineObj = {
    		gradient: (point1.y - point2.y) / (point1.x - point2.x)
    	}, parts;
     
    	lineObj.yIntercept = point1.y - lineObj.gradient * point1.x;
    	lineObj.toString = function() {
    		if(Math.abs(lineObj.gradient) === Infinity) {
    			return 'x = ' + point1.x;
    		}
    		else {
    			parts = [];
     
    			if(lineObj.gradient !== 0) {
    				parts.push(lineObj.gradient + 'x');
    			}
     
    			if(lineObj.yIntercept !== 0) {
    				parts.push(lineObj.yIntercept);
    			}
     
    			return 'y = ' + parts.join(' + ');
    		}
    	};
     
    	return lineObj;
    }



/*var point1={x:2,y:5};
var point2={x:4,y:5};
console.log(getEquationOfLineFromTwoPoints(point2, point1));
//if gradient=infinity or - infinity x sabta wnzwd aw nall al y
//if gradient=0 or - 0 y sabta wnzwd aw nall al x
*/