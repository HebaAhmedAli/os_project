

function movetoPointer (displayObject, speed, pointer) {
	
        var angle = angleToPointer(displayObject, pointer);

    
		console.log("x before: "+displayObject.body.x+" y before: "+displayObject.body.y);
	

		displayObject.body.velocity.x = Math.cos(angle) * speed;
		displayObject.body.velocity.y = Math.sin(angle) * speed;

        var once=false;
		setTimeout(function() {
            if(!once)
             console.log("x after: "+displayObject.body.x+" y after: "+displayObject.body.y);

			once= true;

		}, 20);

      
	
        return angle;

}

function distanceToPointer (displayObject, pointer) {


     
        var dx = displayObject.x - pointer.worldX;
        var dy = displayObject.y - pointer.worldY;
        return Math.sqrt(dx * dx + dy * dy);

}

function angleToPointer (displayObject, pointer) {

        
        
            return Math.atan2(pointer.worldY - displayObject.y, pointer.worldX - displayObject.x);
       
}