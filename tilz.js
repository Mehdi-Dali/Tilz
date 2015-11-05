/*
 * Tilz V1.0.0
 * Tiled layout tool
 * http://tilz.github.com
 * MIT License
 * by Mehdi Daldali
 */

(function (window, document) {
	
	window.Tilz = function(container,item,gutter,animationDuration) {
		this.container = container;
		this.item = item;
		this.gutter = gutter;
		this.animationDuration = animationDuration;
	}
	
	Tilz.prototype = {
	
		//return a clone of "array"
		
		cloneArray: function(array) {
		   var newObj = [];
		   for (i in array) {
				newObj[i] = array[i].slice(0);
		   }
		   return newObj;
		},
		
		//cleanEmptyIntervals (pageArray) delete all intervals of length 0
		
		cleanEmptyIntervals: function(array) {
			for (var i=0; i<array.length; i++) {
				if (array[i][0] == array[i][1]) {
					//delete interval
					array.splice(i,1);
					i--;
				}
			}
		},
		
		//fuseIntervals(pageArray) fuse adjacent intervals with same "y" value
		
		fuseIntervals: function(array) {
			for (var i=0; i<array.length; i++) {
				if (array[i+1] && array[i][2] == array[i+1][2]) {
					//fuse intervals
					fa = [array[i][0],array[i+1][1],array[i][2]];
					array.splice(i,2,fa);
					i--;
				}
			}
		},
		
		//addInterval(pageArray,interval) add tinterval to main array
		
		addInterval: function(array,interval) {
			for (var i=0; i<array.length; i++) {
				if (interval[0] >= array[i][0] && interval[0] <= array[i][1]) {
					
					for (var j=i; j<array.length; j++) {
						if (array[j] && interval[1] >= array[j][0] && interval[1] <= array[j][1]) {
							//add new intervals
							fa = [array[i][0],interval[0],array[i][2]];
							ma = [interval[0],interval[1],interval[2]];
							ea = [interval[1],array[j][1],array[j][2]];
							array.splice(i,j-i+1,fa,ma,ea);
							
							Tilz.prototype.cleanEmptyIntervals(array);
							Tilz.prototype.fuseIntervals(array);
							
							return;
						}
					}
					
				}
			}
		},
		
		//getYValues(pageArray) get y values by index of intervals and then sort them by y value and return the resulting array
		
		getYValues: function(array) {
			var yValues = [];
			for (var i=0; i<array.length; i++) {
				yValues.push([i,array[i][2]]);
			}
			yValues.sort(function(a, b) {
				return a[1] - b[1];
			});
			return yValues;
		},
		
		//placeItem(sizeX,sizeY) return found position of sizeX width and sizeY height as an array representing the space occupied vertically
		
		placeItem: function(sizeX,sizeY,array) {
			var tempArray = array;
			var yValues = Tilz.prototype.getYValues(tempArray);
			var minYValue = yValues[0][1];
			
			for (var i=0; i<yValues.length; i++) {
				if (minYValue == yValues[i][1] && tempArray[yValues[i][0]][0] + sizeX <= tempArray[yValues[i][0]][1]) {
					//place item
					var startX = tempArray[yValues[i][0]][0];
					var endX = startX + sizeX;
					var oldY = tempArray[yValues[i][0]][2];
					var newY = oldY + sizeY;
					
					//return position item at (startX,oldY)
					return [startX,endX,newY];
					
				} else if (minYValue != yValues[i][1]) {
				
						//update y in all previous intervals
						var newTempArray = Tilz.prototype.cloneArray(tempArray);
						
						for (var j=0; j<i; j++) {
							newTempArray[yValues[j][0]][2] = yValues[i][1];
						}
						Tilz.prototype.fuseIntervals(newTempArray);
						
						return Tilz.prototype.placeItem(sizeX,sizeY,newTempArray);
				}
			}
		},
		
		// Main function
		
		organize: function(instance) {
			
			if (instance === undefined) instance = this;
			
			var itemS = document.getElementsByClassName(instance.item),
				containerS = document.getElementsByClassName(instance.container),
				gutter = instance.gutter;
				mainContainerHeight = 0,
				mainContainerWidth = 0;
			
			containerS[0].style.width = "initial";
			containerS[0].style.height = "initial";
			
			var containerWidth = itemS[0].parentNode.parentNode.clientWidth;
			
			var pageArray = [[0,containerWidth,0]];
			
			Array.prototype.forEach.call(itemS, function(el, i){
				
				el.style.transition = "transform "+instance.animationDuration+"ms";
				el.style.position = "absolute";
				
				el.style.left = el.offsetLeft+"px";
				el.style.top = el.offsetTop+"px";
				
				var height = el.clientHeight + gutter;
				var interval = Tilz.prototype.placeItem(el.clientWidth+gutter,height,pageArray);
				Tilz.prototype.addInterval(pageArray,interval);
				
				var X = ((gutter/2)+interval[0]-parseInt(el.style.left.replace('px',''))) ,
					Y = ((gutter/2)+interval[2]-height-parseInt(el.style.top.replace('px','')));
				
				el.style.transform = "translateX("+X+"px) translateY("+Y+"px)";
				setTimeout(function(){
					el.style.transition = "";
					el.style.transform = "";
					el.style.left = (gutter/2)+interval[0]+"px";
					el.style.top = (gutter/2)+interval[2]-height+"px";
				},instance.animationDuration);
				
				if(mainContainerHeight < (gutter/2)+interval[2]) mainContainerHeight = (gutter/2)+interval[2];
				if(mainContainerWidth < (gutter/2)+interval[1]) mainContainerWidth = (gutter/2)+interval[1];
			});

			containerS[0].style.width = mainContainerWidth+"px";
			containerS[0].style.height = mainContainerHeight+"px";
		},
		
		// Initialisation: organizing tiles and refreshing when window is resized
		
		start: function() {
			
			var instance = this;
			Tilz.prototype.organize(instance);
			
			window.addEventListener("resize",function(e){
					Tilz.prototype.organize(instance);
			},false);
		}
	
	}
	
}(window, document));
