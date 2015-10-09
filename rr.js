$(document).ready(function() {

//set up canvas and load all images
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 575;
canvas.height = 575;

var wallReady = false;
var wallImg = new Image();
wallImg.onload = function () {
	wallReady = true;
};
wallImg.src = "wall.jpg";

var grassReady = false;
var grassImg = new Image();
grassImg.onload = function () {
	grassReady = true;
};
grassImg.src = "grass.jpg";

var catReady = false;
var catImg = new Image();
catImg.onload = function () {
	catReady = true;
};
catImg.src = "cat.jpg";

var mouseReady = false;
var mouseImg = new Image();
mouseImg.onload = function () {
	mouseReady = true;
};
mouseImg.src = "mouse.jpg";

var cheeseReady = false;
var cheeseImg = new Image();
cheeseImg.onload = function () {
	cheeseReady = true;
};
cheeseImg.src = "cheese.jpg";

//where we'll store the positions of all the objects
var cheese = [];
var grass = [];
var walls = [];
var cats = [];
var mouse = {x: 275, y: 275};

//set up the walls and grass

function setGrass() {
	for (var x = 0; x < 15; x++) {
		for (var y = 0; y < 15; y++) {
			grass.push({x: 100 + (25 * x), y: 100 + (25 * y)})
		}
	}
	grass.splice(112, 1);
}
setGrass();

function setWalls() {
	for (var i = 0; i < canvas.width; i += 25) {
		walls.push({x: i, y: 0});
		walls.push({x: 0, y: i});
		walls.push({x: i, y: canvas.height - 25});
		walls.push({x: canvas.width - 25, y: i});
	}
}
setWalls();

//select a random open position on the canvas for the cat to spawn and create the cat
function catPos() {
	var tempx = Math.ceil(Math.random()*30)*25;
	while (tempx > 525 || tempx < 25) tempx = Math.ceil(Math.random()*30)*25;
	var tempy = Math.ceil(Math.random()*30)*25;
	while (tempy > 525 || tempy < 25) tempy = Math.ceil(Math.random()*30)*25;
	var redo = false;
	for (var i = 0; i < grass.length; i++) {
		if((tempx === grass[i].x && tempy === grass[i].y) || (tempx === mouse.x && tempy === mouse.y)) redo = true;
	}
	for (var i = 0; i < cheese.length; i++) {
		if (tempx === cheese[i].x && tempy === cheese[i].y) redo = true;
	}
	for (var i = 0; i < 6; i++) {
		for (var q = 0; q < 6; q++) {
			if (tempx === mouse.x + (25*i) && tempy === mouse.y + (25*q)) redo = true; 
		}
	}
	if (redo) catPos();
	else cats.push({x: tempx, y: tempy});
}

//create x number of cats
function createCat(num) {
	do {
		catPos();
		num -= 1;
	}
	while(num > 0);
}
createCat(1);

//remove an individual cat from the array
function removeCat(arrNum) {
	cats.splice(arrNum, 1);
}

//controls the movement of the mouse
var dir;

$(window).keydown(function(e){
	switch(e.which) {
		case 37:
			mouse.x -= 25;
			dir = "l";
			checkTouch();
			break;
		case 38:
			mouse.y -= 25;
			dir = "u";
			checkTouch();
			break;
		case 39:
			mouse.x += 25;
			dir = "r";
			checkTouch();
			break;
		case 40:
			mouse.y += 25;
			dir = "d";
			checkTouch();
			break;
		case 13:
			resetGame();
			break;
	}	
})

//for use with the mouse touching an array
function touch(arr, obj, action) {
	for (var i = 0; i < arr.length; i++) {
		if ( obj.x === arr[i].x && obj.y === arr[i].y) action(i);
	}
}

function checkTouch() {
	touch(grass, mouse, grassMove);
	touch(walls, mouse, noMove);
	touch(cats, mouse, gameOver);
	touch(cheese, mouse, cheeseTouch);
}

//for use when two different arrays touch
function touch2(arr, arr2, action) {
	for (var i = 0; i < arr.length; i++) {
		for (var z = 0; z < arr2.length; z++) {
			if ( arr2[z].x === arr[i].x && arr2[z].y === arr[i].y) {
				action(z);
			}
		}
	}
}

//for testing the touching of objects in the same array
function touch3(arr, arr2, action) {
	for (var i = 0; i < arr.length; i++) {
		for (var z = 0; z < arr2.length; z++) {
			if ( arr2[z].x === arr[i].x && arr2[z].y === arr[i].y  && z != i) {
				action(i);
			}
		}
	}
}

//testing if objects in an array are against a wall
function wallTouch(arr, arr2, direction) {
	var doesNotExist = true;
	var series = true;
	for (var i = 0; i < arr.length - 1; i++) {
		if (direction === "l" && arr[i+1].x != arr[i].x - 25) series = false;
		else if (direction === "r" && arr[i+1].x != arr[i].x + 25) series = false;
		else if (direction === "u" && arr[i+1].y != arr[i].y - 25) series = false;
		else if (direction === "d" && arr[i+1].y != arr[i].y + 25) series = false;
	}
	for (var i = 0; i < arr.length; i++){
		for (var z = 0; z < arr2.length; z++) {
			if (direction === "l" && arr2[z].x === arr[i].x - 25 && arr2[z].y === arr[i].y && series) doesNotExist = false;
			else if (direction === "r" && arr2[z].x === arr[i].x + 25 && arr2[z].y === arr[i].y && series) doesNotExist = false;
			else if (direction === "u" && arr2[z].y === arr[i].y - 25 && arr2[z].x === arr[i].x && series) doesNotExist = false;
			else if (direction === "d" && arr2[z].y === arr[i].y + 25 && arr2[z].x === arr[i].x && series) doesNotExist = false;
		}
	}
	return doesNotExist;
}

//mouse attempts to make a move that isn't possible
function noMove() {
	if (dir === "l") mouse.x += 25;
	else if (dir === "r") mouse.x -= 25;
	else if (dir === "u") mouse.y += 25;
	else mouse.y -= 25;
}

//mouse touches cat
function gameOver() {
	clearInterval(gameLoop);
	ctx.font = "100px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText("Game Over!", canvas.width/2, canvas.height/2);
	ctx.font = "25px Arial";
	ctx.fillText("Please press enter to restart...", canvas.width/2, canvas.height/2 + 50);
}

//mouse touches a cheese, increases score
var score = 0;

function cheeseTouch(arrNum) {
	cheese.splice(arrNum, 1);
	score += 10;
}

//grass touches the cheese
function cheeseTouchGrass(arrNum) {
	cheese.splice(arrNum, 1);
}

//controls the movement of the grass blocks and the resulting effects on other objects
grassPos = [];

function grassMove() {
	if (dir === "l") {
		grassPos = grass.filter(function(grass1) {
			return grass1.x <= mouse.x && grass1.y === mouse.y;
		})
		grassPos = grassPos.sort(function(a,b) {
			return b.x - a.x;
		})
		if (wallTouch(grassPos, walls, dir)) {
			for (var i = 0; i < grassPos.length; i++) {
				if (grassPos[i].x === mouse.x) grassPos[i].x -= 25;
				else if (grassPos[i].x === grassPos[i-1].x) grassPos[i].x -= 25;
			}
			touch2(grassPos, cats, singleCatMove);
			touch3(cats, cats, singleCatMove);
			touch2(grassPos, cats, singleCatMove);
			touch2(grassPos, cheese, cheeseTouchGrass);
		}
		else noMove();
	}
	if (dir === "r") {
		grassPos = grass.filter(function(grass1) {
			return grass1.x >= mouse.x && grass1.y === mouse.y;
		})
		grassPos = grassPos.sort(function(a,b) {
			return a.x - b.x;
		})
		if (wallTouch(grassPos, walls, dir)) {
			for (var i = 0; i < grassPos.length; i++) {
				if (grassPos[i].x === mouse.x) grassPos[i].x += 25;
				else if (grassPos[i].x === grassPos[i-1].x) grassPos[i].x += 25;
			}
			touch2(grassPos, cats, singleCatMove);
			touch3(cats, cats, singleCatMove);
			touch2(grassPos, cats, singleCatMove);
			touch2(grassPos, cheese, cheeseTouchGrass);
		}
		else noMove();
	}
	if (dir === "u") {
		grassPos = grass.filter(function(grass1) {
			return grass1.y <= mouse.y && grass1.x === mouse.x;
		})
		grassPos = grassPos.sort(function(a,b) {
			return b.y - a.y;
		})
		if (wallTouch(grassPos, walls, dir)) {
			for (var i = 0; i < grassPos.length; i++) {
				if (grassPos[i].y === mouse.y) grassPos[i].y -= 25;
				else if (grassPos[i].y === grassPos[i-1].y) grassPos[i].y -= 25;
			}
			touch2(grassPos, cats, singleCatMove);
			touch3(cats, cats, singleCatMove);
			touch2(grassPos, cats, singleCatMove);
			touch2(grassPos, cheese, cheeseTouchGrass);
		}
		else noMove();
	}
	if (dir === "d") {
		grassPos = grass.filter(function(grass1) {
			return grass1.y >= mouse.y && grass1.x === mouse.x;
		})
		grassPos = grassPos.sort(function(a,b) {
			return a.y - b.y;
		})
		if (wallTouch(grassPos, walls, dir)) {
			for (var i = 0; i < grassPos.length; i++) {
				if (grassPos[i].y === mouse.y) grassPos[i].y += 25;
				else if (grassPos[i].y === grassPos[i-1].y) grassPos[i].y += 25;
			}
			touch2(grassPos, cats, singleCatMove);
			touch3(cats, cats, singleCatMove);
			touch2(grassPos, cats, singleCatMove);
			touch2(grassPos, cheese, cheeseTouchGrass);
		}
		else noMove();
	}
}

//Cat AI..determines all possible moves for each cat, then selects the best move based on the move that will bring the cat closest to the mouse
var catMoves;
var catBestMove;

function checkMoves() {
	catMoves = [];
	for (var i = 0; i < cats.length; i++) {
		catMoves.push({l: {x: cats[i].x - 25, y: cats[i].y},
			r: {x: cats[i].x + 25, y: cats[i].y}, 
			u: {x: cats[i].x, y: cats[i].y - 25},
			d: {x: cats[i].x, y: cats[i].y + 25},
			uld: {x: cats[i].x - 25, y: cats[i].y - 25},
			urd: {x: cats[i].x + 25, y: cats[i].y - 25},
			dld: {x: cats[i].x - 25, y: cats[i].y + 25},
			drd: {x: cats[i].x + 25, y: cats[i].y + 25}});
	}
	for (var i = 0; i < catMoves.length; i++) {
		for (var z = 0; z < grass.length; z++) {
			if (catMoves[i].l != undefined && catMoves[i].l.x === grass[z].x  && catMoves[i].l.y === grass[z].y) delete catMoves[i].l;
			else if (catMoves[i].r != undefined && catMoves[i].r.x === grass[z].x  && catMoves[i].r.y === grass[z].y) delete catMoves[i].r;
			else if (catMoves[i].u != undefined && catMoves[i].u.x === grass[z].x  && catMoves[i].u.y === grass[z].y) delete catMoves[i].u;
			else if (catMoves[i].d != undefined && catMoves[i].d.x === grass[z].x  && catMoves[i].d.y === grass[z].y) delete catMoves[i].d;
			else if (catMoves[i].uld != undefined && catMoves[i].uld.x === grass[z].x  && catMoves[i].uld.y === grass[z].y) delete catMoves[i].uld;
			else if (catMoves[i].urd != undefined && catMoves[i].urd.x === grass[z].x  && catMoves[i].urd.y === grass[z].y) delete catMoves[i].urd;
			else if (catMoves[i].dld != undefined && catMoves[i].dld.x === grass[z].x  && catMoves[i].dld.y === grass[z].y) delete catMoves[i].dld;
			else if (catMoves[i].drd != undefined && catMoves[i].drd.x === grass[z].x  && catMoves[i].drd.y === grass[z].y) delete catMoves[i].drd;
		}
	}
	for (var i = 0; i < catMoves.length; i++) {
		for (var z = 0; z < walls.length; z++) {
			if (catMoves[i].l != undefined && catMoves[i].l.x === walls[z].x  && catMoves[i].l.y === walls[z].y) delete catMoves[i].l;
			else if (catMoves[i].r != undefined && catMoves[i].r.x === walls[z].x  && catMoves[i].r.y === walls[z].y) delete catMoves[i].r;
			else if (catMoves[i].u != undefined && catMoves[i].u.x === walls[z].x  && catMoves[i].u.y === walls[z].y) delete catMoves[i].u;
			else if (catMoves[i].d != undefined && catMoves[i].d.x === walls[z].x  && catMoves[i].d.y === walls[z].y) delete catMoves[i].d;
			else if (catMoves[i].uld != undefined && catMoves[i].uld.x === walls[z].x  && catMoves[i].uld.y === walls[z].y) delete catMoves[i].uld;
			else if (catMoves[i].urd != undefined && catMoves[i].urd.x === walls[z].x  && catMoves[i].urd.y === walls[z].y) delete catMoves[i].urd;
			else if (catMoves[i].dld != undefined && catMoves[i].dld.x === walls[z].x  && catMoves[i].dld.y === walls[z].y) delete catMoves[i].dld;
			else if (catMoves[i].drd != undefined && catMoves[i].drd.x === walls[z].x  && catMoves[i].drd.y === walls[z].y) delete catMoves[i].drd;
		}
	}
	for (var i = 0; i < catMoves.length; i++) {
		for (var z = 0; z < cats.length; z++) {
			if (catMoves[i].l != undefined && catMoves[i].l.x === cats[z].x  && catMoves[i].l.y === cats[z].y) delete catMoves[i].l;
			else if (catMoves[i].r != undefined && catMoves[i].r.x === cats[z].x  && catMoves[i].r.y === cats[z].y) delete catMoves[i].r;
			else if (catMoves[i].u != undefined && catMoves[i].u.x === cats[z].x  && catMoves[i].u.y === cats[z].y) delete catMoves[i].u;
			else if (catMoves[i].d != undefined && catMoves[i].d.x === cats[z].x  && catMoves[i].d.y === cats[z].y) delete catMoves[i].d;
			else if (catMoves[i].uld != undefined && catMoves[i].uld.x === cats[z].x  && catMoves[i].uld.y === cats[z].y) delete catMoves[i].uld;
			else if (catMoves[i].urd != undefined && catMoves[i].urd.x === cats[z].x  && catMoves[i].urd.y === cats[z].y) delete catMoves[i].urd;
			else if (catMoves[i].dld != undefined && catMoves[i].dld.x === cats[z].x  && catMoves[i].dld.y === cats[z].y) delete catMoves[i].dld;
			else if (catMoves[i].drd != undefined && catMoves[i].drd.x === cats[z].x  && catMoves[i].drd.y === cats[z].y) delete catMoves[i].drd;
		}
	}
	catBestMove = [];
	for (var i = 0; i < catMoves.length; i++) {
		catBestMove.push({x: cats[i].x, y: cats[i].y, distance: 1000});
		if (catMoves[i].hasOwnProperty("l")) {
			catMoves[i].l.distance = Math.sqrt((mouse.x-catMoves[i].l.x)*(mouse.x-catMoves[i].l.x) + (mouse.y-catMoves[i].l.y)*(mouse.y-catMoves[i].l.y));
			if (catMoves[i].l.distance < catBestMove[i].distance) { catBestMove.pop(); catBestMove.push(catMoves[i].l); }
		}
		if (catMoves[i].hasOwnProperty("r")) {
			catMoves[i].r.distance = Math.sqrt((mouse.x-catMoves[i].r.x)*(mouse.x-catMoves[i].r.x) + (mouse.y-catMoves[i].r.y)*(mouse.y-catMoves[i].r.y));
			if (catMoves[i].r.distance < catBestMove[i].distance) { catBestMove.pop(); catBestMove.push(catMoves[i].r); }
		}
		if (catMoves[i].hasOwnProperty("u")) {
			catMoves[i].u.distance = Math.sqrt((mouse.x-catMoves[i].u.x)*(mouse.x-catMoves[i].u.x) + (mouse.y-catMoves[i].u.y)*(mouse.y-catMoves[i].u.y));
			if (catMoves[i].u.distance < catBestMove[i].distance) { catBestMove.pop(); catBestMove.push(catMoves[i].u); }
		}
		if (catMoves[i].hasOwnProperty("d")) {
			catMoves[i].d.distance = Math.sqrt((mouse.x-catMoves[i].d.x)*(mouse.x-catMoves[i].d.x) + (mouse.y-catMoves[i].d.y)*(mouse.y-catMoves[i].d.y));
			if (catMoves[i].d.distance < catBestMove[i].distance) { catBestMove.pop(); catBestMove.push(catMoves[i].d); }
		}
		if (catMoves[i].hasOwnProperty("uld")) {
			catMoves[i].uld.distance = Math.sqrt((mouse.x-catMoves[i].uld.x)*(mouse.x-catMoves[i].uld.x) + (mouse.y-catMoves[i].uld.y)*(mouse.y-catMoves[i].uld.y));
			if (catMoves[i].uld.distance < catBestMove[i].distance) { catBestMove.pop(); catBestMove.push(catMoves[i].uld); }
		}
		if (catMoves[i].hasOwnProperty("urd")) {
			catMoves[i].urd.distance = Math.sqrt((mouse.x-catMoves[i].urd.x)*(mouse.x-catMoves[i].urd.x) + (mouse.y-catMoves[i].urd.y)*(mouse.y-catMoves[i].urd.y));
			if (catMoves[i].urd.distance < catBestMove[i].distance) { catBestMove.pop(); catBestMove.push(catMoves[i].urd); }
		}
		if (catMoves[i].hasOwnProperty("dld")) {
			catMoves[i].dld.distance = Math.sqrt((mouse.x-catMoves[i].dld.x)*(mouse.x-catMoves[i].dld.x) + (mouse.y-catMoves[i].dld.y)*(mouse.y-catMoves[i].dld.y));
			if (catMoves[i].dld.distance < catBestMove[i].distance) { catBestMove.pop(); catBestMove.push(catMoves[i].dld); }
		}
		if (catMoves[i].hasOwnProperty("drd")) {
			catMoves[i].drd.distance = Math.sqrt((mouse.x-catMoves[i].drd.x)*(mouse.x-catMoves[i].drd.x) + (mouse.y-catMoves[i].drd.y)*(mouse.y-catMoves[i].drd.y));
			if (catMoves[i].drd.distance < catBestMove[i].distance) { catBestMove.pop(); catBestMove.push(catMoves[i].drd); }
		}
	}
}

//all the cat movement functions, keeping cats from touching each other or being forced off the canvas
function catMove() {
	checkMoves();
	for (var i = 0; i < cats.length; i++) {
		if (catBestMove[i].x < 25 || catBestMove[i].y < 25 || catBestMove[i].x > 525 || catBestMove[i].y > 525) {
			removeCat(i);
			createCat(1);
		}
		else {
		cats[i].x = catBestMove[i].x;
		cats[i].y = catBestMove[i].y;
		}
	}
	touch3(cats, cats, singleCatMove2)
	catsCaught();
}

function singleCatMove(arrNum) {
	if (dir === "l") cats[arrNum].x -= 25;
	else if (dir === "r") cats[arrNum].x += 25;
	else if (dir === "u") cats[arrNum].y -= 25;
	else cats[arrNum].y += 25;
	checkMoves();
	cats[arrNum].x = catBestMove[arrNum].x;
	cats[arrNum].y = catBestMove[arrNum].y;
}

function singleCatMove2(arrNum) {
	checkMoves();
	cats[arrNum].x = catBestMove[arrNum].x;
	cats[arrNum].y = catBestMove[arrNum].y;
}

//cats make a move every 1 second
var catInterval = setInterval(function() {
	catMove();
}, 1000)


//if all cats are caught, turn them into cheese and start the next level
var level = 1;
var levelClear = false;

function catsCaught() {
	var allCatsCaught = true;
	for (var i = 0; i < catBestMove.length; i++) {
		if (catBestMove[i].distance != 1000) allCatsCaught = false;
	}
	if (allCatsCaught) {
		for (var i = 0; i < cats.length; i++) {
			cheese.push(cats[i]);
		}
		cats = [];
		level++;
		if (level === 2) createCat(2);
		else if (level === 3) createCat(1);
		else if (level === 4) createCat(2);
		else if (level === 5) createCat(2);
		else if (level === 6) {
			levelClear = true;
			score += 20;
			resetLevel(); 
			createCat(3);
		}
		else if (level === 7) createCat(2);
		else if (level === 8) createCat(3);
		else if (level === 9) {
			levelClear = true;
			score += 30;
			resetLevel(); 
			createCat(4);
		}
		else if (level === 10) createCat(4);
		else if (level === 11) createCat(2);
		else if (level === 12) {
			levelClear = true;
			score += 20;
			resetLevel(); 
			createCat(4);
		}
		else if (level === 13) createCat(4);
		else createCat(2);
	}
}

//resets the canvas
function resetLevel() {
	cheese = [];
	walls = [];
	grass = [];
	setWalls();
	setGrass();
	mouse = {x: 275, y: 275};
}

//resets the game
function resetGame() {
	clearInterval(gameLoop);
	cheese = [];
	grass = [];
	walls = [];
	cats = [];
	mouse = {x: 275, y: 275};
	score = 0;
	level = 1;
	levelClear = false;
	setWalls();
	setGrass();
	createCat(1);
	gameLoop = setInterval(function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		paint();
		touch(cats, mouse, gameOver);
	}, 100);
}

//renders the canvas and images
function paint() {
	if (wallReady && grassReady && catReady && mouseReady && cheeseReady) {
		ctx.fillStyle = "#7F8027";
		ctx.fillRect(0,0, canvas.width, canvas.height);
		for (var i = 0; i < walls.length; i++) {
			ctx.drawImage(wallImg, walls[i].x, walls[i].y, 25, 25);
		}
		for (var i = 0; i < grass.length; i++) {
			ctx.drawImage(grassImg, grass[i].x, grass[i].y, 25, 25);
		}
		ctx.drawImage(mouseImg, mouse.x, mouse.y, 25, 25);
		for (var i = 0; i < cats.length; i++) {
			ctx.drawImage(catImg, cats[i].x, cats[i].y, 25, 25);
		}
		for (var i = 0; i < cheese.length; i++) {
			ctx.drawImage(cheeseImg, cheese[i].x, cheese[i].y, 25, 25);
		}
		ctx.fillStyle = "white";
		ctx.fillRect(475, 5, 75, 15);
		ctx.fillStyle = "black";
		ctx.font  = "15px Arial";
		ctx.textAlign = "left";
		ctx.fillText("Score: " + score, 476, 18);
		if (levelClear) {
			ctx.font = "50px Arial";
			ctx.fillStyle = "white";
			ctx.textAlign = "center";
			ctx.fillText("Level Cleared", canvas.width/2, canvas.height/2);
			setTimeout(function () {
				levelClear = false;
			},2000);
		}
	}
}

//main game loop
var gameLoop = setInterval(function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	paint();
	touch(cats, mouse, gameOver);
}, 100);

})