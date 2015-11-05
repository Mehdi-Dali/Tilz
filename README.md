# Tilz
Tilz is a **simple**, **lightweight**, **javascript** tool for creating tiled layouts. In other words, a way to fix vertical spacing when using CSS's property float.
### Getting started
To use Tilz, all you need is to wrap your elements inside a container element, then declare a new object as shown in this example:
###### HTML
![alt tag](https://cloud.githubusercontent.com/assets/15676122/10978603/bf8635f2-83ef-11e5-9849-67c48976e58a.png)
```html
<div class="container">
  <div class="item"></div>
  <div class="item"></div>
  <div class="item"></div>
  ...
</div>
<script src="./path/to/tilz.js"></script>
```
###### Javascript
![alt tag](https://cloud.githubusercontent.com/assets/15676122/10978604/bfafd894-83ef-11e5-8880-9b3de56be4aa.png)
```javascript
var myTiles = new Tilz("container","item",gutter,animationTime);
myTiles.start();
```
Where *gutter* (**positive integer**) is the spacing between tiles in **pixels**, and *animationTime* (**positive integer**) is the time taken for animating tiles in **milliseconds** when the layout is refreshed *(resizing the container or manually calling the organize() method)*.
