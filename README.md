# Tilz
Tilz is a **simple**, **lightweight**, **javascript** tool for creating tiled layouts. In other words, a way to fix vertical spacing when using CSS's property float.
### Getting started
To start using Tilz, all you need is to wrap your elements inside a container element, then declare a new object as shown in this example:
###### HTML
```html
<div class="container">
  <div class="item"></div>
  <div class="item"></div>
  <div class="item"></div>
  ...
</div>
```
###### Javascript
```javascript
var myTiles = new Tilz("container","item",gutter,animationTime);
myTiles.start();
```
