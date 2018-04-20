

function movetoPointer (displayObject, pointer) {
	   
        //var angle = angleToPointer(displayObject,dx,dy);

    
		console.log("x before: "+displayObject.body.x+" y before: "+displayObject.body.y);
	

		displayObject.body.velocity.x = pointer.velocityX;
		displayObject.body.velocity.y = pointer.velocityY;
    
        // displayObject.body.x+=50;
        // displayObject.body.y+=50;

         console.log("x after: "+displayObject.body.x+" y after: "+displayObject.body.y);

        var once=false;
		setTimeout(function() {
            if(!once)
            console.log("x after: "+displayObject.body.x+" y after: "+displayObject.body.y);

			once= true;

		}, 20);

      
      /*setTimeout(function() {
          if((displayObject.x>pointer.worldX && pointer.dx>0)||(displayObject.x<pointer.worldX && pointer.dx<0))
           displayObject.body.velocity.x=0;
           
            if((displayObject.y>pointer.worldY && pointer.dy>0)||(displayObject.y<0 && pointer.dy<0))
           displayObject.body.velocity.y=0;
       
        },1);*/


	
        //return angle;

}

function move_player(displayObject, pointer)
{


    //move to the new position. 
   movetoPointer(displayObject,pointer);
    
}



function angleToPointer (displayObject, dx,dy) {

  
            return Math.atan2(dy,dx);
       
}

