//the food list
var food_pickup = [];
var mine_pickup = [];

// search through food list to find the food object
function finditembyid (id) {
	
	for (var i = 0; i < food_pickup.length; i++) {

		if (food_pickup[i].id == id) { 
			return food_pickup[i]; 
		}
	}
	
	return false; 
}

// search through food list to find the food object
function findminebyid (id) {
	
	for (var i = 0; i < mine_pickup.length; i++) {

		if (mine_pickup[i].id == id) {
			return mine_pickup[i]; 
		}
	}
	
	return false; 
}

// function called when new food is added in the server.
function onitemUpdate (data) {
	food_pickup.push(new food_object(data.id, data.type, data.x, data.y)); 
}

// function called when new mine is added in the server.
function onmineUpdate (data) {
	mine_pickup.push(new mine_object(data.id, data.type, data.x, data.y)); 
}

// function called when food needs to be removed in the client. 
function onitemremove (data) {
	
	var removeItem; 
	removeItem = finditembyid(data.id);
	food_pickup.splice(food_pickup.indexOf(removeItem), 1); 
	
	//destroy the phaser object 
	removeItem.item.destroy(true,false);
	
}

// function called when mine needs to be removed in the client. 
function onmineremove (data) {
	
	var removeItem; 
	removeItem = findminebyid(data.id);
	mine_pickup.splice(mine_pickup.indexOf(removeItem), 1); 
	
	//destroy the phaser object 
	removeItem.item.destroy(true,false);
	
}

// the food class
var food_object = function (id, type, startx, starty, value) {
	// unique id for the food.
	//generated in the server with node-uuid
	this.id = id; 
	
	//positinon of the food
	this.posx = startx;  
	this.posy = starty; 
	this.powerup = value;
	
	//create a circulr phaser object for food
	/*this.item = game.add.graphics(this.posx, this.posy);
	this.item.beginFill(0xFF0000);
	this.item.lineStyle(2, 0xFF0000, 1);
	this.item.drawCircle(0, 0, 20);
	*/

	 
	this.item =  game.add.sprite(this.posx, this.posy, 'food');
	this.item.scale.setTo(0.25 , 0.25 );
	this.item.type = 'food_body';
	this.item.id = id;
	
	game.physics.p2.enableBody(this.item, false);
	this.item.body.clearShapes();
	this.item.body_size = 10;
	this.item.body.addCircle(this.item.body_size, 0, 0);
	this.item.body.data.gravityScale = 0;
	this.item.body.data.shapes[0].sensor = true;


}


var mine_object = function (id, type, startx, starty, value) {
	// unique id for the food.
	//generated in the server with node-uuid
	this.id = id; 
	
	//positinon of the food
	this.posx = startx;  
	this.posy = starty; 
	this.powerup = value;
	
	//create a circulr phaser object for food
	/*this.item = game.add.graphics(this.posx, this.posy);
	this.item.beginFill(0xFFFF00);
	this.item.lineStyle(2, 0xFFFF00, 1);
	this.item.drawCircle(0, 0, 20);
	*/

	this.item =  game.add.sprite(this.posx, this.posy, 'bomb');
	this.item.scale.setTo(0.15 , 0.15 );

	this.item.type = 'mine_body';
	this.item.id = id;
	
	game.physics.p2.enableBody(this.item, false);
	this.item.body.clearShapes();
	this.item.body_size = 10; 
	this.item.body.addCircle(this.item.body_size, 0, 0);
	this.item.body.data.gravityScale = 0;
	this.item.body.data.shapes[0].sensor = true;

}