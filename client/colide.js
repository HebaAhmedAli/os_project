function player_coll (player, item) {
	
	console.log("collide score")
	
	//the id of the collided body that player made contact with 
	var key = item.id; 
	//the type of the body the player made contact with 
	var type = item.type; 
	
	if (type == "mine_body") {          
		//send the player collision
		socket.emit('mine_picked', {id: key}); 
	} else if (type == "food_body") {
		
		socket.emit('item_picked', {id: key}); 
	}
}

function player_coll_mine(player,item)
{

 console.log("collide bomb")
	
	//the id of the collided body that player made contact with 
	var key = item.id; 
	//the type of the body the player made contact with 
	var type = item.type; 
	
	if (type == "mine_body") {          
		//send the player collision
		socket.emit('mine_picked', {id: key}); 
		 console.log("da5lt el if")
	
	} else if (type == "food_body") {
		
		socket.emit('item_picked', {id: key}); 
	}

}