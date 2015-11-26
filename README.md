# opaqueregions.js
Quick javascript function to retrieve non-transparent regions from a transparent canvas

## Usage
`opaqueregions(source, x, y, width, height)`

`source` can either be a `<canvas>` element, `CanvasRenderingContext2D` instance (ie. `canvas.getContext('2d')`) or `ImageData` object (ie. `context.getImageData(...)`)

`x` and `y` are the starting coordinates for the search while `width` and `height` indicate the size of the search box.  
These can be left blank to search the entire image, and will be ignored if an `ImageData` object is supplied.

## Returns
Returns an `Array` containing multiple `Object`s, for example:
````js
[
	{
		top: 100,
		right: 500,
		bottom: 100,
		left: 100
	},
	{
		top: 100,
		right: 100,
		bottom: 100,
		left: 500
	}
]
````
