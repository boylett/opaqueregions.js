function opaqueregions(source, x, y, width, height)
{
	// Get the image pixel data and initialize variables
	var canvas = (source instanceof CanvasRenderingContext2D ? source.canvas : source),
		context = (source instanceof CanvasRenderingContext2D ? source : canvas.getContext('2d')),
		pixels = context.getImageData(x ? x : 0, y ? y : 0, width ? width : canvas.width, height ? height : canvas.height),
		boxes = [];
	
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
				if(x > 0 && (pixels.data[(((y * canvas.width) + x) * 4) + 3] == 0 || x >= (canvas.width - 1)) && right === null)
				{
					right = x;
				}
			}
			
			// If the pixel is valid and transparent, set the 'bottom' value of the box
			if(y > 0 && (pixels.data[(((y * canvas.width) + boxes[i].left) * 4) + 3] == 0 || y >= (canvas.height - 1)) && bottom === null)
			{
				bottom = y;
			}
		}
		
		boxes[i].right = right;
		boxes[i].bottom = bottom;
	}
	
	// Now we have an array of objects containing various box bounds :) Simples!
	return boxes;
}
