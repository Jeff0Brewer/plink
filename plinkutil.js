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