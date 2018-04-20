
function movetoPointer (displayObject, speed,dx,dy) {
	
       // var angle = angleToPointer(displayObject,dx,dy);

    
		 console.log("x before: "+displayObject.playerBody.position[0]+" y before: "+displayObject.playerBody.position[1]);
	



    console.log("7sba1 "+ dx+" 7sba2 "+ dy);
	displayObject.playerBody.velocity[0] = dx * speed;
	displayObject.playerBody.velocity[1] = dy * speed;

	var once=false;
		setTimeout(function() {
            if(!once)
             console.log("x after: "+displayObject.playerBody.position[0]+" y after: "+displayObject.playerBody.position[1]);

			once= true;

		}, 20);



	//return angle;

}

function move_player(displayObject, pointer)
{


       //console.log("worldx "+pointer.worldX+" worldy: "+pointer.worldY);
	

    if(pointer.worldX>4000)
    pointer.worldX=4000;
    else if(pointer.worldX<0)
      pointer.worldX=0;

    if(pointer.worldY>4000)
    pointer.worldY=4000;
    else if(pointer.worldY<0)
      pointer.worldY=0;
      
        var dx = pointer.worldX- displayObject.playerBody.position[0];

        if (dx+ displayObject.playerBody.position[0] > 4000 || dx+ displayObject.playerBody.position[0] <0)
            dx=0;

         var dy = pointer.worldY-displayObject.playerBody.position[1] ;

        if (dy+displayObject.playerBody.position[1] > 4000 || dy+ displayObject.playerBody.position[1] <0)
            dy=0;

     
   console.log("dx "+dx+" dy: "+dy);
	

        
    var dist=Math.sqrt(dx * dx + dy * dy);
	if (dist <= 30) {
		//movePlayer.playerBody.angle = physicsPlayer.movetoPointer(movePlayer, 0, serverPointer, 1000);
		if(dist==0)
			dist=1;
		displayObject.playerBody.angle = movetoPointer(displayObject, dist,dx,dy);
	} else {
		displayObject.playerBody.angle = movetoPointer(displayObject, displayObject.speed,dx,dy);	
	}
    
}



function angleToPointer (displayObject, dx,dy) {

        
        
            return Math.atan2(dy,dx);
       
}


module.exports = {
	movetoPointer: movetoPointer,
	//distanceToPointer: distanceToPointer,
	move_player:move_player,
	angleToPointer: angleToPointer
}











/*function distanceToPointer (displayObject, pointer) {

       if(pointer.worldX>4000)
          pointer.worldX=4000;
        else if(pointer.worldX<0)
            pointer.worldX=0;

        if(pointer.worldY>4000)
          pointer.worldY=4000;
        else if(pointer.worldY<0)
            pointer.worldY=0;


        var dx = displayObject.playerBody.position[0] - pointer.worldX;

        if (dx+ pointer.worldX > 4000 || dx+ pointer.worldX <0)
            dx=0;

         var dy = displayObject.playerBody.position[1] - pointer.worldY;

        if (dy+pointer.worldY > 4000 || dy+ pointer.worldY<0)
            dy=0;

		

     
        return Math.sqrt(dx * dx + dy * dy);

}
*/