var socket; 
socket = io.connect();


     

document.getElementById('entername').addEventListener('click', function(e) {
  // Stop submit redirection
  e.preventDefault();
  
    document.getElementById("gameDiv").style.display = "block";

    // Join game
    join();
 
  
});  


	
var join = function() {
 
  // Start the sketch
 
 
			console.log("connected to server my check"); 
	       

	        //createPlayer();
	        // gameProperties.in_game = true;
	        // send the server our initial position and tell it we are connected
	        // 
	         var play = new p5(main);
	       // socket.emit('new_player', {x: 0, y: 0});

           
 
};
