/*
 * Tilz V1.1.0
 * Tiled layout tool
 * http://mehdi-dali.github.io/Tilz/
 * MIT License
 * by Mehdi Dali.
 */

(function (window, document) {
    'use strict';
    window.Tilz = function (container, item, gutter, animationDuration) {
        this.container = container;
        this.item = item;
        this.gutter = gutter;
        this.animationDuration = animationDuration;
    };

    window.Tilz.prototype = {

        // return a clone of "array"
        cloneArray: function (array) {
            var i, newArr = [];
            for (i = 0; i < array.length; i++) {
                newArr[i] = array[i].slice(0);
            }
            return newArr;
        },

        // cleanEmptyIntervals (pageArray) delete all intervals of length 0

        cleanEmptyIntervals: function (array) {
            var i;
            for (i = 0; i < array.length; i++) {
                if (array[i][0] === array[i][1]) {
                    //delete interval
                    array.splice(i, 1);
                    i--;
                }
            }
        },

        // fuseIntervals(pageArray) fuse adjacent intervals with same "y" value

        fuseIntervals: function (array) {
            var i, fa;
            for (i = 0; i < array.length; i++) {
                if (array[i + 1] && array[i][2] === array[i + 1][2]) {
                    //fuse intervals
                    fa = [array[i][0], array[i + 1][1], array[i][2]];
                    array.splice(i, 2, fa);
                    i--;
                }
            }
        },

        // addInterval(pageArray,interval) add tinterval to main array

        addInterval: function (array, interval) {
            var i, j, fa, ma, ea;
            for (i = 0; i < array.length; i++) {
                if (interval[0] >= array[i][0] && interval[0] <= array[i][1]) {

                    for (j = i; j < array.length; j++) {
                        if (array[j] && interval[1] >= array[j][0] && interval[1] <= array[j][1]) {
                            //add new intervals
                            fa = [array[i][0], interval[0], array[i][2]];
                            ma = [interval[0], interval[1], interval[2]];
                            ea = [interval[1], array[j][1], array[j][2]];
                            array.splice(i, j - i + 1, fa, ma, ea);

                            window.Tilz.prototype.cleanEmptyIntervals(array);
                            window.Tilz.prototype.fuseIntervals(array);

                            return;
                        }
                    }

                }
            }
        },

        // getYValues(pageArray) get y values by index of intervals and then sort them by y value and return the resulting array

        getYValues: function (array) {
            var i, yValues = [];
            for (i = 0; i < array.length; i++) {
                yValues.push([i, array[i][2]]);
            }
            yValues.sort(function (a, b) {
                return a[1] - b[1];
            });
            return yValues;
        },

        // placeItem(sizeX,sizeY) return found position of sizeX width and sizeY height as an array
        // representing the space occupied vertically

        placeItem: function (sizeX, sizeY, array) {
            var i, j, tempArray, newTempArray, yValues, minYValue, startX, endX, oldY, newY;

            tempArray = array;
            yValues = window.Tilz.prototype.getYValues(tempArray);
            minYValue = yValues[0][1];

            for (i = 0; i < yValues.length; i++) {
                if (minYValue === yValues[i][1] && tempArray[yValues[i][0]][0] + sizeX <= tempArray[yValues[i][0]][1]) {
                    //place item
                    startX = tempArray[yValues[i][0]][0];
                    endX = startX + sizeX;
                    oldY = tempArray[yValues[i][0]][2];
                    newY = oldY + sizeY;

                    //return position item at (startX,oldY)
                    return [startX, endX, newY];

                } else if (minYValue !== yValues[i][1]) {

                    //update y in all previous intervals
                    newTempArray = window.Tilz.prototype.cloneArray(tempArray);

                    for (j = 0; j < i; j++) {
                        newTempArray[yValues[j][0]][2] = yValues[i][1];
                    }
                    window.Tilz.prototype.fuseIntervals(newTempArray);

                    return window.Tilz.prototype.placeItem(sizeX, sizeY, newTempArray);
                }
            }
        },

        // Main function

        organize: function (currentObj, animDur) {

            if (currentObj === undefined) { currentObj = this; }

            var itemS, containerS, gutter, mainContainerHeight, mainContainerWidth, containerWidth, pageArray;

            containerS = document.getElementsByClassName(currentObj.container);

            Array.prototype.forEach.call(containerS, function (cnt) {
                itemS = cnt.getElementsByClassName(currentObj.item);
                gutter = currentObj.gutter;
                mainContainerHeight = 0;
                mainContainerWidth = 0;

                cnt.style.width = "initial";
                cnt.style.height = "initial";

                containerWidth = itemS[0].parentNode.parentNode.clientWidth;
                pageArray = [[0, containerWidth, 0]];

                Array.prototype.forEach.call(itemS, function (el) {
                    var height, width, interval, X, Y, newLeft, newTop;

                    el.style.position = "absolute";
                    el.dataset.TilzX == undefined && (el.dataset.TilzX = "0px");
                    el.dataset.TilzY == undefined && (el.dataset.TilzY = "0px");

                    height = parseFloat(window.getComputedStyle(el, null).getPropertyValue("height").replace('px', '')) + gutter;
                    width = parseFloat(window.getComputedStyle(el, null).getPropertyValue("width").replace('px', '')) + gutter;

                    width = Math.floor(width);//fix for floatingpoint dimensions (percent values)

                    interval = window.Tilz.prototype.placeItem(width, height, pageArray);
                    window.Tilz.prototype.addInterval(pageArray, interval);

                    X = (gutter / 2) + interval[0];
                    Y = (gutter / 2) + interval[2] - height;

                    el.keyframes = [{
                        transform: "translate3d(" + el.dataset.TilzX + ", " + el.dataset.TilzY + ", 0px)"
                    }, {
                            transform: "translate3d(" + X + "px, " + Y + "px, 0px)"
                    }];

                    el.animProps = {
                        duration: animDur,
                        easing: "ease-in-out",
                        fill: "forwards"
                    }

                    var animation = el.animate(el.keyframes, el.animProps);

                    Promise.all([animation.finished]).then( function () {
                        el.dataset.TilzX = "" + X + "px";
                        el.dataset.TilzY = "" + Y + "px";
                    });

                    if (mainContainerHeight < (gutter / 2) + interval[2]) { mainContainerHeight = (gutter / 2) + interval[2]; }
                    if (mainContainerWidth < (gutter / 2) + interval[1]) { mainContainerWidth = (gutter / 2) + interval[1]; }
                });

                cnt.style.width = mainContainerWidth + "px";
                cnt.style.height = mainContainerHeight + "px";
            });
        },

        // Initialisation: organizing tiles and refreshing when window is resized

        start: function () {

            var currentObj = this, oldWidth = window.innerWidth;

            window.Tilz.prototype.organize(currentObj, 0);

            window.addEventListener("resize", function () {
                if (window.innerWidth !== oldWidth) {
                    oldWidth = window.innerWidth;
                    window.Tilz.prototype.organize(currentObj, currentObj.animationDuration);
                }
            }, false);
        }

    };

}(window, document));