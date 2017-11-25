var c = document.getElementById("c");
c.width = window.innerWidth;
c.height = window.innerHeight;
var ctx = c.getContext("2d");

var radius = 10;
var gravity = .6;
var wind = .0005;
var color = "rgb(0,0,0)";
var traillength = 40;
var trailcolors = ["rgba(0,0,255,.5)",
				   "rgba(0,255,0,.5)",
				   "rgba(255,0,0,.5)"];
var nextid = 0;
var balls = null;

var launchercolor = "rgb(0,0,0)";
var launchersimcolor = "rgba(255,0,0,.75)";
var launchersmoothness = .8;
var launcherspeed = 2;
var launcher = new Launcher(c.width/2, c.height/2, launchersmoothness, launcherspeed, 
						    launchercolor, launchersimcolor, radius, gravity, wind, ctx);
var simlength = 500;

var radmax = 100;
var radmin = 60;
var damping = 1;
var opacity = .5;
var grow = 5;
var fade = .95;
var posts = new Post(Math.random()*c.width, Math.random()*c.height, Math.random()*(radmax - radmin) + radmin,
					 damping, opacity, grow, fade, null, ctx);

var KEY_UP = 87,
	KEY_DOWN = 83,
	KEY_LEFT = 65,
	KEY_RIGHT = 68;

var up = false,
	down = false,
	left = false,
	right = false;

var mouse = new point(0,0);


setInterval(function(){
	ctx.clearRect(0,0,c.width,c.height);

	launcher.control(up, down, left, right);
	launcher.aimto(mouse);
	launcher.simulate(posts, simlength);

	var currball = balls;
	while(currball != null)
		currball = currball.update();

	currball = balls;
	while(currball != null){
		var currpost = posts;
		while(currpost != null){
			currball.checkcollision(currpost, false);
			currpost = currpost.next;
		}
		currball = currball.next;
	}

	currball = balls;
	while(currball != null){
		currball.show();
		currball = currball.next;
	}

	currpost = posts;
	var testid = currpost.hitid;
	var goal = true;
	while(currpost != null){
		currpost.show();
		goal = goal && currpost.hitid == testid && currpost.hitid != -1;
		currpost = currpost.next;
	}	

	if(goal){
		var overlap = true;
		while(overlap){
			var post = new Post(Math.random()*c.width, Math.random()*c.height, Math.random()*(radmax - radmin) + radmin,
						        damping, opacity, grow, fade, posts, ctx);
			overlap = distance(post.x, post.y, launcher.x, launcher.y) < 2*post.radius;
			var currpost = posts;
			while(currpost != null && !overlap){
				overlap = overlap | distance(currpost.x, currpost.y, post.x, post.y) < post.radius + currpost.radius;
				currpost = currpost.next;
			}
		}
		posts.prev = post;
		posts = post;
	}

	launcher.show();
	}, 10);

document.body.onresize = function(){
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	var currball = balls;
	while(currball != null){
		currball.canvwidth = c.width;
		currball.canvheight = c.height;
		currball = currball.next;
	}
};

document.body.onkeydown = function(e){
	up = up | e.keyCode == KEY_UP;
	down = down | e.keyCode == KEY_DOWN;
	left = left | e.keyCode == KEY_LEFT;
	right = right | e.keyCode == KEY_RIGHT;
};

document.body.onkeyup = function(e){
	up = up && e.keyCode != KEY_UP;
	down = down && e.keyCode != KEY_DOWN;
	left = left && e.keyCode != KEY_LEFT;
	right = right && e.keyCode != KEY_RIGHT;
}

c.onmousemove = function(e){
	mouse.x = e.clientX;
	mouse.y = e.clientY;
};

c.onmousedown = function(e){
	var ball = launcher.launch(nextid, color, traillength, trailcolors[Math.floor(Math.random()*trailcolors.length)],
							   c.width, c.height, balls);
	if(balls != null)
		balls.prev = ball;
	balls = ball;

	nextid++;
};
