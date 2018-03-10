function player_coll (body, bodyB, shapeA, shapeB, equation) {
	
	
	//the id of the collided body that player made contact with 
	var key = body.sprite.id; 
	//the type of the body the player made contact with 
	var type = body.sprite.type; 
	
	if (type == "mine_body") {          
		//send the player collision
		socket.emit('mine_picked', {id: key}); 
	} else if (type == "food_body") {
		
		socket.emit('item_picked', {id: key}); 
	}
}