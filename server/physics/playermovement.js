function movetoPointer (displayObject, speed, pointer) {


	
	var angle = angleToPointer(displayObject, pointer);



	displayObject.playerBody.velocity[0] = Math.cos(angle) * speed;
	displayObject.playerBody.velocity[1] = Math.sin(angle) * speed;


	return angle;

}

function distanceToPointer (displayObject, pointer) {

       if(pointer.worldX>4000)
          pointer.worldX=4000;
        else if(pointer.worldX<0)
            pointer.worldX=0;

        if(pointer.worldY>4000)
          pointer.worldY=4000;
        else if(pointer.worldY<0)
            pointer.worldY=0;

		var dx = displayObject.playerBody.position[0] - pointer.worldX;


        var dy = displayObject.playerBody.position[1] - pointer.worldY;

        return Math.sqrt(dx * dx + dy * dy);

}

function angleToPointer (displayObject, pointer) {

       
            return Math.atan2(pointer.worldY - displayObject.playerBody.position[1], 
			pointer.worldX - displayObject.playerBody.position[0]);
       
}

//we export these three functions 
module.exports = {
	movetoPointer: movetoPointer,
	distanceToPointer: distanceToPointer,
	angleToPointer: angleToPointer
}