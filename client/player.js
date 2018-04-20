

function movetoPointer (displayObject, speed,dx,dy) {
	
       // var angle = angleToPointer(displayObject,dx,dy);

    
		console.log("x before: "+displayObject.body.x+" y before: "+displayObject.body.y);
	

		displayObject.body.velocity.x = dx * speed;
		displayObject.body.velocity.y = dy* speed;

        var once=false;
		setTimeout(function() {
            if(!once)
             console.log("x after: "+displayObject.body.x+" y after: "+displayObject.body.y);

			once= true;

		}, 20);

      
	
        //return angle;

}

function move_player(displayObject, pointer)
{

    if(pointer.worldX>4000)
    pointer.worldX=4000;
    else if(pointer.worldX<0)
      pointer.worldX=0;

    if(pointer.worldY>4000)
    pointer.worldY=4000;
    else if(pointer.worldY<0)
      pointer.worldY=0;
      
        var dx = pointer.worldX-displayObject.body.x;
        if (dx+ displayObject.body.x > 4000 || dx+ displayObject.body.x <0)
            dx=0;

        var dy = pointer.worldY-displayObject.body.y ;
        if (dy+displayObject.body.y> 4000 || dy+displayObject.body.y<0)
            dy=0;



    speed = Math.sqrt(dx * dx + dy * dy)/0.05;
    
    //move to the new position. 
    displayObject.angle = movetoPointer(displayObject, speed, dx,dy);
    
}



function angleToPointer (displayObject, dx,dy) {

        

        
            return Math.atan2(dy,dx);
       
}

/*
function distanceToPointer (displayObject, pointer) {


    if(pointer.worldX>4000)
    pointer.worldX=4000;
    else if(pointer.worldX<0)
      pointer.worldX=0;

    if(pointer.worldY>4000)
    pointer.worldY=4000;
    else if(pointer.worldY<0)
      pointer.worldY=0;
      
        var dx = displayObject.x - pointer.worldX;
        if (dx+ pointer.worldX > 4000 || dx+ pointer.worldX <0)
            dx=0;

        var dy = displayObject.y - pointer.worldY;
        if (dy+pointer.worldY > 4000 || dy+ pointer.worldY<0)
            dy=0;


        return Math.sqrt(dx * dx + dy * dy);

}
*/