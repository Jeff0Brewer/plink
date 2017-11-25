function Launcher(x,y,c,sc,r,g,w,ctx){
	this.x = x;
	this.y = y;
	this.color = c;
	this.simcolor = sc;
	this.radius = r;

	this.gravity = g;
	this.wind = w;

	this.speed = 0;
	this.angle = 0;

	this.context = ctx;

	this.show = function(){
		var endx, endy;

		this.context.setLineDash([]);
		this.context.lineWidth = 2*this.radius;
		this.context.strokeStyle = this.color;
		this.context.fillStyle = this.color;

		this.context.beginPath();
		this.context.moveTo(this.x,this.y);
		var shaftlen = Math.max(this.speed, this.radius);
		this.context.lineTo((endx = this.x + Math.cos(this.angle)*shaftlen), 
						    (endy = this.y + Math.sin(this.angle)*shaftlen));

		this.context.stroke();
		drawCircle(this.context, this.x, this.y, this.radius);
	}

	this.launch = function(id, color, traillength, trailcolor, cwidth, cheight, ballstart){

		return new Ball(id, this.speed*Math.cos(this.angle), this.speed*Math.sin(this.angle), 
						this.x, this.y, this.radius, this.gravity, this.wind, color, traillength, trailcolor,
						ballstart, cwidth, cheight, this.context);
	}

	this.simulate = function(posts, len){
		var sim = new Ball(-1, this.speed*Math.cos(this.angle), this.speed*Math.sin(this.angle), 
						   this.x, this.y, this.radius, this.gravity, this.wind, "", 1, "", null, 2000, 2000);

		this.context.beginPath();
		this.context.moveTo(this.x, this.y);

		var numcollisions = 0;
		for(var i = 0; i < len; i++){
			sim.update();

			var currpost = posts;
			while(currpost != null){
				sim.checkcollision(currpost, true);
				currpost = currpost.next;
			}

			this.context.lineTo(sim.x, sim.y);
		}

		this.context.strokeStyle = this.simcolor;
		this.context.setLineDash([10,15]);
		this.context.lineWidth = 1;
		this.context.stroke();
	}
}

function Post(x,y,r,d,o,g,f,next,ctx){
	this.x = x;
	this.y = y;
	this.radius = r;
	this.damping = d;
	this.opacity = o;

	this.viewradius = r;
	this.viewopacity = o;
	this.grow = g;
	this.fade = f;

	this.next = next;
	this.prev = null;

	this.hitid = -1;

	this.context = ctx;

	this.show = function(){
		this.context.fillStyle = "rgba(0,0,0," + this.viewopacity.toString() + ")";
		drawCircle(this.context, this.x, this.y, this.viewradius);

		this.viewradius = this.viewradius*this.fade + this.radius*(1 - this.fade);
		this.viewopacity = this.viewopacity*this.fade + this.opacity*(1 - this.fade);
	}

	this.collide = function(id){
		this.viewopacity = 1;
		this.viewradius = this.radius + this.grow;
		this.hitid = id;
	}
}

function Ball(id,xvel,yvel,x,y,r,g,w,c,tl,tc,next,cw,ch,ctx){
	this.id = id;

	this.xvel = xvel;
	this.yvel = yvel;

	this.x = x;
	this.y = y;
	this.radius = r;
	this.gravity = g;
	this.wind = w;
	this.color = c;

	this.traillength = tl;
	this.trailcolor = tc;
	this.points = [];
	for(var i = 0; i < this.traillength; i++)
		this.points[i] = new point(x,y);
	this.end = 0;

	this.next = next;
	this.prev = null;

	this.canvwidth = cw;
	this.canvheight = ch;
	this.context = ctx;

	this.update = function(){
		this.x += this.xvel;
		this.y += this.yvel;

		this.xvel -= Math.sign(this.xvel)*Math.pow(this.xvel, 2)*this.wind;
		this.yvel -= Math.sign(this.yvel)*Math.pow(this.yvel, 2)*this.wind;
		this.yvel += this.gravity;

		if(this.points[this.end].y > this.canvheight ||
		   this.points[this.end].x < 0 ||
		   this.points[this.end].x > this.canvwidth){
			if(this.next != null)
				this.next.prev = this.prev;
			if(this.prev != null)
				this.prev.next = this.next;
		}

		return this.next;
	}

	this.checkcollision = function(p, sim){
		var d, ret;
		if((d = distance(this.x,this.y,p.x,p.y)) < p.radius + this.radius){
			if(!sim)
				p.collide(this.id);

			var v = Math.sqrt(Math.pow(this.xvel, 2) + Math.pow(this.yvel, 2));
			var dx = (p.x - this.x)/d;
			var dy = (p.y - this.y)/d;
			var pcol = dx*this.xvel + dy*this.yvel;
			var px = -(dx)*pcol;
			var py = -(dy)*pcol;
			this.xvel = p.damping*((this.xvel/v)*(v - pcol) + px);
			this.yvel = p.damping*((this.yvel/v)*(v - pcol) + py);
			this.x = p.x - dx*(p.radius + this.radius);
			this.y = p.y - dy*(p.radius + this.radius);
		}
	}

	this.show = function(){
		this.points[this.end].x = this.x;
		this.points[this.end].y = this.y;
		this.end = (this.end + 1) % this.traillength;

		this.drawtrail();

		this.context.fillStyle = this.color;
		drawCircle(this.context,this.x,this.y,this.radius);
	}

	this.drawtrail = function(){
		var inc = this.traillength - 1;
		var start = (this.end + inc) % this.traillength;

		var width = this.radius;
		var widthinc = width/this.traillength;

		var s1 = [];
		var s2 = [];
		var slen = 0;

		var prevpoint = this.points[start];
		var prevline = new line(prevpoint, prevpoint);

		for(var ind = (start + inc) % this.traillength; ind != this.end; ind = (ind + inc) % this.traillength){
			var currline = new line(prevpoint, this.points[ind]);

			var xl = 0;
			xl += currline.xp != 0 ? 1 : 0;
			xl += prevline.xp != 0 ? 1 : 0;
			var xp = (xl > 0) ? (currline.xp + prevline.xp) / xl : 0;

			var yl = 0;
			yl += currline.yp != 0 ? 1 : 0;
			yl += prevline.yp != 0 ? 1 : 0;
			var yp = (yl > 0) ? (currline.yp + prevline.yp) / yl : 0;

			if(xp != 0 || yp != 0){
				s1.push(new point(prevpoint.x + width*xp, prevpoint.y + width*yp));
				s2.push(new point(prevpoint.x - width*xp, prevpoint.y - width*yp));
				slen++;
			}

			width -= widthinc;
			prevpoint = this.points[ind];
			prevline = currline;
		}

		if(slen > 0){
			this.context.beginPath();
			this.context.moveTo(s1[0].x, s1[0].y);

			for(var i = 0; i < slen; i++)
				this.context.lineTo(s1[i].x, s1[i].y);

			this.context.lineTo(this.points[this.end].x, this.points[this.end].y);

			for(var i = slen - 1; i >= 0; i--)
				this.context.lineTo(s2[i].x, s2[i].y);
			
			this.context.closePath();
			this.context.fillStyle = this.trailcolor;
			this.context.fill('nonzero');
		}
	}
}

function point(x,y){
	this.x = x;
	this.y = y;
}

function line(a, b){
	this.x = a.x - b.x;
	this.y = a.y - b.y;
	this.len = Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
	if(this.len != 0){
		this.xp = this.y/this.len;
		this.yp = -this.x/this.len;
	}
	else{
		this.xp = 0;
		this.yp = 0;
	}
}

function drawCircle(ctx, x, y, r) {
	x -= r;
	y -= r;
  	var kappa = .5522848,
        o = r * kappa,
        xe = x + 2*r,
        ye = y + 2*r,
        xm = x + r,
        ym = y + r;

  	ctx.beginPath();
  	ctx.moveTo(x, ym);
  	ctx.bezierCurveTo(x, ym - o, xm - o, y, xm, y);
  	ctx.bezierCurveTo(xm + o, y, xe, ym - o, xe, ym);
  	ctx.bezierCurveTo(xe, ym + o, xm + o, ye, xm, ye);
  	ctx.bezierCurveTo(xm - o, ye, x, ym + o, x, ym);
  	ctx.closePath();
  	ctx.fill();
}

function distance(x1, y1, x2, y2){
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}