var express = require('express');

//get the node-uuid package for creating unique id
var unique = require('node-uuid')

var app = express();
var serv = require('http').Server(app);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json())

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});




app.use('/client', express.static(__dirname + '/client'));


app.use(express.static('client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var room_List = {};
var dbObiect;
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbObject = db.db("osProject");
    console.log("Database created!");
    dbObject.createCollection("users", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");

    });


});


app.post('/autenticate', function(req, res) {
    console.log("**************************");
    console.log('body: ' + JSON.stringify(req.body));


    var username = req.body.name;
    var password = req.body.password;


    console.log("ana hna authentication " + username + " " + password);



    var query = {
        name: username,
        password: password
    };

    var cursor = dbObject.collection("users").find(query);



    cursor.count(function(err, count) {
        if (err) {
            console.log("2na erorrrrrrrrrrrrrrrrr count");
            throw err;
        }
        console.log("**************************************************");
        console.log("Total matches: " + count);


        if (count == 0) {
            console.log("2tb3 ya 3m 2na 3omda  false " + count);
            //client.emit('authenticated',{authenticated: false});
            res.send(false);

        } else {
            console.log("2tb3 ya 3m 2na 3omda true" + count);
            //client.emit('authenticated',{authenticated: true});
            res.send(true);
        }

    });




});




function game() {
    this.room_id;
    this.player_lst = [];
    //The constant number of players in the game
    this.max_num = 2;
    //The constant number of foods in the game
    this.food_num = 150;

    //food object list
    this.food_pickup = [];
    //mine object list
    this.mine_pickup = [];
    //map of type,id

    this.collision_map = [];
    fill_map_initially(this.collision_map);


}

var timeStep = 1 / 70;

var end_initiall_fill = false;

var scene_w = 2000;
var scene_h = 2000;

// var collision_map=[];   //map of type,id2
var player_dim = 50;
var items_dim = 40;


// createa a new game instance
//var game_instance = new game_setup();

max_speed = 5;
//We need to intilaize with true.


//a player class in the server
var Player = function(startX, startY, name) {
    this.x = startX
    this.y = startY

    this.score = 50;
    this.power = 100;
    this.user_name = name;
}

function fill_part_of_map(type, x, y, id, room_id) {


    var room = room_List[room_id];
    // console.log("fill_part_of_map room_id"+room_id+ "   "+room);
    if (x > scene_w - items_dim + 1 || x < 0 || y > scene_h - items_dim + 1 || y < 0)
        return false;

    for (var i = x; i < x + items_dim; i++) {
        for (var j = y; j < y + items_dim; j++) {

            var value = [];
            value.push(type); //type 0 = player // 1=food // 2=mine
            value.push(id);
            //console.log(collision_map[i][j]);
            room.collision_map[i][j] = value;

        }
    }

    return true;


}

function free_part_of_map(type, id, room_id) {
    var item;
    // console.log("check collision3   "+room_id);
    var room = room_List[room_id];
    if (type == 1) {
        item = find_food(id, room_id);
    } else {
        item = find_mine(id, room_id);
    }
    var x = item.x;
    var y = item.y;

    for (var i = x; i < x + items_dim; i++) {
        for (var j = y; j < y + items_dim; j++) {

            var value = [];
            value.push(0); //type 0 = player // 1=food // 2=mine
            value.push(-1);
            //console.log(collision_map[i][j]);

            room.collision_map[i][j] = value;

        }
    }

}


var foodpickup = function(max_x, max_y, type, id, room_id) {
    this.x = getRndInteger(items_dim, max_x - items_dim - 1);
    this.y = getRndInteger(items_dim, max_y - items_dim - 1);

    // console.log("foodpickup room_id"+room_id);
    fill_part_of_map(1, this.x, this.y, id, room_id);

    //to_map(this.x,this.y,1,id); //food

    this.type = type;
    this.id = id;
    this.powerup;
}

var minepickup = function(x, y, type, id, room_id) {
    this.x = x - 150;
    this.y = y - 150;

    //to_map(this.x,this.y,2,id); //mine
    this.in_range = fill_part_of_map(2, this.x, this.y, id, room_id);


    this.type = type;
    this.id = id;
    this.powerup;
}

//We call physics handler 60fps. The physics is calculated here. 
setInterval(heartbeat, 1000 / 10);


function fill_map_initially(collision_map) {

    // var room = room_List[room_id];
    for (var i = 0; i < scene_w; i++) {
        var row = [];
        for (var j = 0; j < scene_h; j++) {

            var value = [];
            value.push(0); //type 0 = player // 1=food // 2=mine
            value.push(-1);
            row.push(value);

        }
        // this.collision_map=[];
        collision_map.push(row);

    }

    end_initiall_fill = true;

}



function heartbeat() {

    //the number of food that needs to be generated 
    //in this demo, we keep the food always at 100
    for (var key in room_List) {
        var room = room_List[key];
        if (room != undefined)
            var food_generatenum = room.food_num - room.food_pickup.length;

        //add the food 
        if (end_initiall_fill == true)
            addfood(food_generatenum, room.room_id);
    }

}

function addfood(n, room_id) {

    //return if it is not required to create food 
    if (n <= 0) {
        return;
    }
    var room = room_List[room_id];

    //create n number of foods to the game
    for (var i = 0; i < n; i++) {
        //create the unique id using node-uuid
        var unique_id = unique.v4();
        var foodentity = new foodpickup(scene_w, scene_h, 'food', unique_id, room_id);
        room.food_pickup.push(foodentity);
        //set the food data back to client
        io.to(room_id).emit("item_update", foodentity);
    }
}

function add_mine(data) {
    var room_id = this.room_id;
    var room = room_List[room_id];
    var movePlayer = find_playerid(this.id, room_id);

    if (movePlayer.score - 10 >= 0)
        movePlayer.score -= 10;
    else {
        console.log("can't add mine because of your score");
        return;
    }


    //------update the board here
    sortPlayerListByScore(room_id);



    var unique_id = unique.v4();
    var mineentity = new minepickup(Math.ceil(data.pointer_x), Math.ceil(data.pointer_y), 'mine', unique_id, room_id);

    if (mineentity.in_range == true) {
        room.mine_pickup.push(mineentity);
        //set the food data back to client

        console.log("add mine");

        io.to(room_id).emit("mine_update", mineentity);
    }

}



// when a new player connects, we make a new instance of the player object,
// and send a new player message to the client. 
function onNewplayer(data) {

    //new player instance
    console.log("new player");
    var newPlayer = new Player(data.x, data.y, data.user_name);

    console.log("created new player with id " + this.id);
    newPlayer.id = this.id;


    var room_id = find_Roomid();
    var room = room_List[room_id];
    console.log("Room id " + room_id + " room: " + room_List[room_id]);
    //set the room id 
    this.room_id = room_id;
    //join the room
    this.join(this.room_id);
    this.leave(this.id);
    //this.emit('create_player', {size: newPlayer.size});

    //information to be sent to all clients except sender
    var current_info = {
        id: newPlayer.id,
        x: newPlayer.x,
        y: newPlayer.y,


    };

    //send to the new player about everyone who is already connected. 	
    console.log(" lst lentgh before" + room.player_lst.length);
    for (i = 0; i < room.player_lst.length; i++) {
        existingPlayer = room.player_lst[i];
        var player_info = {
            id: existingPlayer.id,
            x: existingPlayer.x,
            y: existingPlayer.y,


        };
        //console.log("pushing player");
        //send message to the sender-client only
        console.log(" player info  " + player_info.id);
        this.emit("new_enemyPlayer", player_info);
    }

    //b emit da hna bs 34an el power yzhar fe bdayet el le3b 34an da elly bycall update_power_leaderB

    this.emit("lose_power", {
        new_power: newPlayer.power,
        id: newPlayer.id
    });


    //Tell the client to make foods that are exisiting
    for (j = 0; j < room.food_pickup.length; j++) {
        var food_pick = room.food_pickup[j];
        this.emit('item_update', food_pick);
    }

    //Tell the client to make mines that are exisiting
    for (j = 0; j < room.mine_pickup.length; j++) {
        var mine_pick = room.mine_pickup[j];
        this.emit('mine_update', mine_pick);
    }

    //send message to every connected client except the sender
    this.broadcast.to(room_id).emit('new_enemyPlayer', current_info);


    room.player_lst.push(newPlayer);

    console.log(" lst lentgh after" + room.player_lst.length);

    sortPlayerListByScore(room_id);


}

function find_Roomid() {
    for (var key in room_List) {
        var room = room_List[key];
        if (room.player_lst.length < room.max_num) {

            return key;
        }

    }
    console.log("search for room id failed, creating new room");
    //did not find a room. create an extra room;
    var room_id = create_Room();
    return room_id;
}

function create_Room() {
    //create new room id;
    var new_roomid = unique.v4();
    //create a new room object
    var new_game = new game();
    new_game.room_id = new_roomid;

    room_List[new_roomid] = new_game;
    return new_roomid;
}

//instead of listening to player positions, we listen to user inputs 
function onInputFired(data) {

    var this_client = this;
    // console.log("input fired"+this.room_id+"  "+this.id);
    var movePlayer = find_playerid(this.id, this.room_id);


    if (!movePlayer) {
        //console.log('no player'); 

        return;
    }


    var serverPointer = {

        worldX: data.pointer_worldx,
        worldY: data.pointer_worldy
    }


    if (serverPointer.worldX > scene_w - player_dim - 1)
        serverPointer.worldX = scene_w - player_dim - 1;
    if (serverPointer.worldX < 0)
        serverPointer.worldX = 0;
    if (serverPointer.worldY > scene_h - player_dim - 1)
        serverPointer.worldY = scene_h - player_dim - 1;
    if (serverPointer.worldY < 0)
        serverPointer.worldY = 0;



    //new player position to be sent back to client. 
    var info = {

        worldX: serverPointer.worldX,
        worldY: serverPointer.worldY,
        speed: max_speed,

    }


    //send to sender (not to every clients). 
    this.emit('input_recieved', info);

    //data to be sent back to everyone except sender 
    var moveplayerData = {
        id: movePlayer.id,
        worldX: serverPointer.worldX,
        worldY: serverPointer.worldY,
        speed: max_speed,

    }

    //send to everyone except sender 
    this.broadcast.to(this.room_id).emit('enemy_move', moveplayerData);
    move_player(movePlayer, serverPointer, this_client);


}

function move_player(movePlayer, serverPointer, this_client) {
    var stepx = 0.1;
    var stepy = 0.1;

    var newx = (serverPointer.worldX - movePlayer.x) * stepx + movePlayer.x;
    var newy = (serverPointer.worldY - movePlayer.y) * stepy + movePlayer.y;


    var point1 = {
        x: movePlayer.x,
        y: movePlayer.y
    };
    //var point2={x:serverPointer.worldX,y:serverPointer.worldY};
    var point2 = {
        x: newx,
        y: newy
    };
    var result = getEquationOfLineFromTwoPoints(point2, point1);

    //var stepx=(point2.x-point1.x)/30;
    if (result.gradient == Infinity) {
        // console.log("if 1");
        while (movePlayer.y < newy) {
            // console.log("check collision 1  "+this_client.room_id);
            check_collision_while_moving(movePlayer, this_client);
            movePlayer.y += stepy;
            // console.log("movePlayer.y "+movePlayer.y);
            if (movePlayer.y < 0) {
                movePlayer.y = 0;

                break;
            } else if (movePlayer.y > scene_h - player_dim - 1) {
                movePlayer.y = scene_h - player_dim - 1;
                break;
            }
        }
    } else if (result.gradient == -Infinity) {
        // console.log("if 2");
        while (movePlayer.y > newy) {
            check_collision_while_moving(movePlayer, this_client);
            movePlayer.y -= stepy;
            // console.log("movePlayer.y "+movePlayer.y);
            if (movePlayer.y < 0) {
                movePlayer.y = 0;
                break;
            } else if (movePlayer.y > scene_h - player_dim - 1) {
                movePlayer.y = scene_h - player_dim - 1;
                break;
            }
        }
    } else if (result.gradient == 0) {
        // console.log("if 3");
        while (movePlayer.x < newx) {
            check_collision_while_moving(movePlayer, this_client);
            movePlayer.x += stepx;
            if (movePlayer.x < 0) {
                movePlayer.x = 0;
                break;
            } else if (movePlayer.x > scene_w - player_dim - 1) {
                movePlayer.x = scene_w - player_dim - 1;
                break;
            }
        }
    } else if (result.gradient == -0) {
        // console.log("if 4");
        while (movePlayer.x > newx) {
            check_collision_while_moving(movePlayer, this_client);
            movePlayer.x -= stepx;
            if (movePlayer.x < 0) {
                movePlayer.x = 0;
                break;
            } else if (movePlayer.x > scene_w - player_dim - 1) {
                movePlayer.x = scene_w - player_dim - 1;
                break;
            }
        }
    } else {

        if (movePlayer.x < newx) {
            // console.log("if 5");

            while (movePlayer.x < newx) {

                movePlayer.y = result.gradient * movePlayer.x + result.yIntercept;
                // console.log("movePlayer.y "+movePlayer.y);
                if (movePlayer.y < 0) {
                    movePlayer.y = 0;
                    break;
                } else if (movePlayer.y > scene_h - player_dim - 1) {
                    movePlayer.y = scene_h - player_dim - 1;
                    break;
                }
                check_collision_while_moving(movePlayer, this_client);
                movePlayer.x += stepx;
                if (movePlayer.x < 0) {
                    movePlayer.x = 0;
                    break;
                } else if (movePlayer.x > scene_w - player_dim - 1) {
                    movePlayer.x = scene_w - player_dim - 1;
                    break;
                }
            }

        } else {
            // console.log("if 6");
            while (movePlayer.x > newx) {

                // console.log("result ",result.gradient,result.yIntercept);

                movePlayer.y = result.gradient * movePlayer.x + result.yIntercept;
                // console.log("movePlayer.y "+movePlayer.y);
                if (movePlayer.y < 0) {
                    movePlayer.y = 0;
                    break;
                } else if (movePlayer.y > scene_h - player_dim - 1) {
                    movePlayer.y = scene_h - player_dim - 1;
                    break;
                }
                check_collision_while_moving(movePlayer, this_client);
                movePlayer.x -= stepx;
                if (movePlayer.x < 0) {
                    movePlayer.x = 0;
                    break;
                } else if (movePlayer.x > scene_w - player_dim - 1) {
                    movePlayer.x = scene_w - player_dim - 1;
                    break;
                }
            }
        }

    }


}

function check_collision_while_moving(movePlayer, this_client) {

    var player_centerx = Math.ceil(movePlayer.x) + player_dim / 2;

    var player_centery = Math.ceil(movePlayer.y) + player_dim / 2;
    var room_id = this_client.room_id;

    var collide_coin = is_collide(player_centerx, player_centery, 1, room_id);
    var collide_mine = is_collide(player_centerx, player_centery, 2, room_id);


    if (collide_coin != -1) {
        //coin

        // console.log("coin collide");

        free_part_of_map(1, collide_coin, room_id);

        onitemPicked(collide_coin, movePlayer, room_id);



    }
    if (collide_mine != -1) {

        console.log("mine collide 	" + this_client.room_id);

        free_part_of_map(2, collide_mine, room_id);
        //mine
        onminePicked(collide_mine, movePlayer, this_client);



    }
}

function is_collide(center_x, center_y, type, room_id) {
    var room = room_List[room_id];
    var arr_x = [0, 0, player_dim / 2, -player_dim / 2, player_dim / 2, -player_dim / 2, player_dim / 2, -player_dim / 2];
    var arr_y = [player_dim / 2, -player_dim / 2, 0, 0, player_dim / 2, -player_dim / 2, -player_dim / 2, player_dim / 2];

    for (var i = 0; i < arr_x.length; i++) {
        //console.log(center_x+arr_x[i],center_y+arr_y[i]);
        if (room.collision_map[center_x + arr_x[i]][center_y + arr_y[i]][0] == type) {

            return room.collision_map[center_x + arr_x[i]][center_y + arr_y[i]][1];
        }
    }

    return -1;

}

//call when a client disconnects and tell the clients except sender to remove the disconnected player
function onClientdisconnect() {
    console.log('disconnect');

    var room_id = this.room_id;
    var room = room_List[room_id];

    var removePlayer = find_playerid(this.id, room_id);

    if (removePlayer) {
        room.player_lst.splice(room.player_lst.indexOf(removePlayer), 1);
    }

    console.log("removing player " + this.id);
    //send message to every connected client except the sender
    this.broadcast.to(room_id).emit('remove_player', {
        id: this.id
    });

    sortPlayerListByScore(room_id);
    // this.reload();
}

// find player by the the unique socket id 
function find_playerid(id, room_id) {

    var room = room_List[room_id];
    if (id == undefined) {
        console.log("msh la2e l player");
        return;
    }
    if (room == undefined) {
        // console.log("msh la2e l room");
        return;
    }

    for (var i = 0; i < room.player_lst.length; i++) {

        if (room.player_lst[i].id == id) {
            return room.player_lst[i];
        }
    }
    console.log("player not found" + id);
    return false;
}


function find_food(id, room_id) {

    var room = room_List[room_id];
    for (var i = 0; i < room.food_pickup.length; i++) {
        if (room.food_pickup[i].id == id) {
            return room.food_pickup[i];
        }
    }

    return false;
}

function find_mine(id, room_id) {
    var room = room_List[room_id];
    for (var i = 0; i < room.mine_pickup.length; i++) {
        if (room.mine_pickup[i].id == id) {
            return room.mine_pickup[i];
        }
    }

    return false;
}

// called 
//1.When the player picks up coins
//2.When the new player connects
//3.When the player disconnects (exits without dying).
//4.When the player dies (his power becomes zero)

function sortPlayerListByScore(room_id) {

    var room = room_List[room_id];
    if (room == undefined) {
        return;
    }
    room.player_lst.sort(function(a, b) {
        return b.score - a.score;
    });

    var playerListSorted = [];
    for (var i = 0; i < room.player_lst.length; i++) {
        //mafrood lsa el username
        // console.log(room.player_lst[i].user_name);
        playerListSorted.push({
            user_name: room.player_lst[i].user_name,
            score: room.player_lst[i].score
        });
    }
    // console.log(playerListSorted);
    io.to(room_id).emit("leader_board", playerListSorted);
}



function onitemPicked(id, movePlayer, room_id) {
    //var movePlayer = find_playerid(this.id); 
    var room = room_List[room_id];
    var object = find_food(id, room_id);

    if (!object) {

        return;
    }

    //increase player score
    movePlayer.score += 1;

    //update the board here

    room.food_pickup.splice(room.food_pickup.indexOf(object), 1);

    sortPlayerListByScore(room_id);

    // console.log("item id : "+id+" movePlayer.score "+movePlayer.score)

    io.to(room_id).emit('itemremove', object);

}

function onminePicked(id, movePlayer, this_client) {
    //var movePlayer = find_playerid(this.id); 
    console.log("mine picking 	" + room_List[this_client.room_id].mine_pickup.length);
    var room_id = this_client.room_id;
    var room = room_List[this_client.room_id];
    var object = find_mine(id, room_id);
    if (!object) {

        return;
    }

    //decrease player power
    movePlayer.power -= 10;
    //broadcast the new power for updating power 
    this_client.emit("lose_power", {
        new_power: movePlayer.power,
        id: movePlayer.id
    });

    if (movePlayer.power <= 0) {

        this_client.emit("killed");

        this_client.broadcast.to(room_id).emit('remove_player', {
            id: this_client.id
        });

        room.player_lst.splice(room.player_lst.indexOf(movePlayer), 1);
        sortPlayerListByScore(room_id);


    }

    room.mine_pickup.splice(room.mine_pickup.indexOf(object), 1);


    io.to(room_id).emit('mineremove', object);
    //this.emit('item_picked');       //-------------------?
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}




// io connection 
var io = require('socket.io')(serv, {});

io.sockets.on('connection', function(socket) {
    console.log("socket connected");

    // listen for disconnection; 
    socket.on('disconnect', onClientdisconnect);

    // listen for new player
    socket.on("new_player", onNewplayer);

    //listen for new player inputs. 
    socket.on("input_fired", onInputFired);
    //socket.on("authentication",authentication)

    //listen if player got items 
    socket.on('item_picked', onitemPicked);
    socket.on('mine_picked', onminePicked);

    socket.on('please_add_mine', add_mine);

    socket.on('chat message', function(msg) {
        console.log('a user need to chat ' + msg);
        io.to(this.room_id).emit('chat message', msg);
    });
});




function getEquationOfLineFromTwoPoints(point1, point2) {
    var lineObj = {
            gradient: (point1.y - point2.y) / (point1.x - point2.x)
        },
        parts;

    lineObj.yIntercept = point1.y - lineObj.gradient * point1.x;
    lineObj.toString = function() {
        if (Math.abs(lineObj.gradient) === Infinity) {
            return 'x = ' + point1.x;
        } else {
            parts = [];

            if (lineObj.gradient !== 0) {
                parts.push(lineObj.gradient + 'x');
            }

            if (lineObj.yIntercept !== 0) {
                parts.push(lineObj.yIntercept);
            }

            return 'y = ' + parts.join(' + ');
        }
    };

    return lineObj;
}

/*
console.log(getEquationOfLineFromTwoPoints(point2, point1));
//if gradient=infinity or - infinity x sabta wnzwd aw nall al y
//if gradient=0 or - 0 y sabta wnzwd aw nall al x
*/