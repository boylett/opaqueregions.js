/* Welcome! If you find this code useful, please remember
 * to provide a link back to this page in your source code
 * Fork it: https://github.com/boylett/opaqueregions.js
 */

function opaqueregions(source, x, y, width, height)
{
	var canvas, context, pixels, boxes = [], collisions = [];
	
	// If image data was provided, we don't need to retrieve it from the canvas
	if(source instanceof ImageData)
	{
		canvas = { width: source.width, height: source.height };
		pixels = source;
	}
	// Otehrwise let's get the image pixel data and initialize variables
	else
	{
		canvas = (source instanceof CanvasRenderingContext2D ? source.canvas : source);
		context = (source instanceof CanvasRenderingContext2D ? source : canvas.getContext('2d'));
		pixels = context.getImageData(x ? x : 0, y ? y : 0, width ? width : canvas.width, height ? height : canvas.height);
	}
	
	// Iterate through each pixel in the image, searching for non-transparent pixels to use as box markers
	for(var i = 0; i < pixels.data.length; i += 4)
	{
		var y = Math.floor((i / 4) / canvas.width),
			x = Math.floor((i - ((y * canvas.width) * 4)) / 4);
		
		// If the current pixel is NOT transparent
		if(pixels.data[i + 3] != 0)
		{
			// If the x and y coordinates are at 0 (top/left edges of the image) or the previous pixel is transparent, create a corner
			if
			(
				(x == 0 || pixels.data[i - 1] == 0) &&
				(y == 0 || pixels.data[(i - (canvas.width * 4)) + 3] == 0)
			)
			{
				// Create a box -  start with the top left corner
				boxes.push(
				{
					top: y,
					right: null,
					bottom: null,
					left: x
				});
			}
		}
	}
	
	for(var i in boxes)
	{
		var right = null,
			bottom = null;
		
		// Now we'll scan the map again from each corner's top-left coordinates and look for the next transparent pixel
		for(var y = boxes[i].top; y < canvas.height; y ++)
		{
			// Start with the x-axis
			for(var x = boxes[i].left; x < canvas.width; x ++)
			{
				// If the pixel is valid and transparent, set the 'right' value of the box
				if(x > 0 && (pixels.data[(((y * canvas.width) + x) * 4) + 3] == 0 || x == (canvas.width - 1)) && right === null)
				{
					right = (x == (canvas.width - 1)) ? x + 1 : x;
				}
			}
			
			// If the pixel is valid and transparent, set the 'bottom' value of the box
			if(y > 0 && (pixels.data[(((y * canvas.width) + boxes[i].left) * 4) + 3] == 0 || y == (canvas.height - 1)) && bottom === null)
			{
				bottom = (y == (canvas.height - 1)) ? y + 1 : y;
			}
		}
		
		boxes[i].right = right;
		boxes[i].bottom = bottom;
	}
	
	// Search for colliding boxes and mark them
	for(var i in boxes)
	{
		for(var j in boxes)
		{
			if(
				j != i &&
				boxes[j].left < boxes[i].left + (boxes[i].right - boxes[i].left) &&
				boxes[j].left + (boxes[j].right - boxes[j].left) > boxes[i].left &&
				boxes[j].top < boxes[i].top + (boxes[i].bottom - boxes[i].top) &&
				(boxes[j].bottom - boxes[j].top) + boxes[j].top > boxes[i].left
			)
			{
				var collision = [i, j];
					collision.sort();
					collision = collision.join(',');
				
				if(collisions.indexOf(collision) == -1)
				{
					collisions.push(collision);
				}
			}
		}
	}
	
	// For each collision, measure the minimum and maximum bounds in the colliding area and merge them into a single box
	for(var i in collisions)
	{
		var collision = collisions[i].split(','),
			mintop = canvas.height,
			maxright = 0,
			maxbottom = 0,
			minleft = canvas.width;
		
		for(var j in collision)
		{
			if(boxes[collision[j]].top < mintop)
			{
				mintop = boxes[collision[j]].top;
			}
			
			if(boxes[collision[j]].right > maxright)
			{
				maxright = boxes[collision[j]].right;
			}
			
			if(boxes[collision[j]].bottom > maxbottom)
			{
				maxbottom = boxes[collision[j]].bottom;
			}
			
			if(boxes[collision[j]].left < minleft)
			{
				minleft = boxes[collision[j]].left;
			}
			
			delete boxes[collision[j]];
		}
		
		boxes.push(
		{
			top: mintop,
			right: maxright,
			bottom: maxbottom,
			left: minleft
		});
	}
	
	// Now we have an array of objects containing various box bounds :) Simples!
	return boxes;
}

/* ----- Everything below is demo code -----
 */

window.onload = function()
{
	var context = canvas.getContext('2d');

	canvas.width = 400;
	canvas.height = 400;
	
	context.fillStyle = '#F0F';
	context.fillRect(0, 0, 100, 100);
	context.fillRect(120, 20, 50, 200);
	context.fillRect(320, 60, 18, 7);
	context.fillRect(320, 60, 30, 3);
	context.fillRect(180, 10, 30, 270);
	context.fillRect(180, 10, 25, 280);
	context.fillRect(310, 310, 90, 90);
	context.fillRect(300, 320, 90, 80);
	
	var benchmark = new Date(),
		boxes = opaqueregions(context);
		benchmark = (new Date() - benchmark) / 1000;
	
	results.innerHTML += '<strong>' + boxes.length + ' Boxes Found</strong> in ' + benchmark + ' seconds<br /><br />';
	
	for(var i in boxes)
	{
		context.strokeStyle = '#00F';
		context.strokeRect(boxes[i].left, boxes[i].top, boxes[i].right - boxes[i].left, boxes[i].bottom - boxes[i].top);
		
		results.innerHTML += '<div>x: ' + boxes[i].left + ', y: ' + boxes[i].top + '</div>';
		results.innerHTML += '<div>width: ' + (boxes[i].right - boxes[i].left) + ', height: ' + (boxes[i].bottom - boxes[i].top) + '</div><br />';
	}
};
