
function movetoPointer (displayObject, speed,dx,dy,pointer) {
	
       // var angle = angleToPointer(displayObject,dx,dy);

    
	console.log("x before: "+displayObject.playerBody.position[0]+" y before: "+displayObject.playerBody.position[1]);
	



   // console.log("7sba1 "+ dx+" 7sba2 "+ dy);
	displayObject.playerBody.velocity[0] = dx / 0.05;
	displayObject.playerBody.velocity[1] = dy / 0.05;

	var once=false;
		setTimeout(function() {
            if(!once)
             console.log("x after: "+displayObject.playerBody.position[0]+" y after: "+displayObject.playerBody.position[1]);

			once= true;

		}, 20);



		setTimeout(function() {
           if((displayObject.playerBody.position[0]>pointer.worldX && dx>0)||(displayObject.playerBody.position[0]<pointer.worldX && dx<0))
           	displayObject.playerBody.velocity[0]=0;
           
            if((displayObject.playerBody.position[1]>pointer.worldY && dy>0)||(displayObject.playerBody.position[1]<0 && dy<0))
           	displayObject.playerBody.velocity[1]=0;
           
           

		}, 0.5);



	//return angle;

}

function move_player(displayObject, pointer)
{


    console.log("worldx "+pointer.worldX+" worldy: "+pointer.worldY);
	

    var dx = pointer.worldX- displayObject.playerBody.position[0];

       
    var dy = pointer.worldY-displayObject.playerBody.position[1] ;

    if(pointer.worldX>4000)
    {
    	pointer.worldX=4000;
    	dx=0;
    }
    else if(pointer.worldX<0)
     {
      	pointer.worldX=0;
      	dx=0
      }

    if(pointer.worldY>4000)
    {
    	pointer.worldY=4000;
 		dy=0;
    }
    else if(pointer.worldY<0)
     {
     	 pointer.worldY=0;
     	 dy=0;
     }


     displayObject.dx=dx;
     displayObject.dy=dy;
  
   console.log("dx "+dx+" dy: "+dy);
	  
    var dist=Math.sqrt(dx * dx + dy * dy);
	if (dist <= 30) {
		//movePlayer.playerBody.angle = physicsPlayer.movetoPointer(movePlayer, 0, serverPointer, 1000);
		if(dist==0)
			dist=1;
		movetoPointer(displayObject, dist,dx,dy,pointer);
	} else {
		movetoPointer(displayObject, displayObject.speed,dx,dy,pointer);	
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

