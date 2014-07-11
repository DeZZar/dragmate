dragmate
========
Creating this repository for the dragmate plugin.

Dragmate is a project to provide a drag drop management framework available for both touch and mouse devices.

In this initial draft dragmate replicates the native 'draggable' functionality provided by browsers and allows any page element to be defined as a 'draggable' item and any other page elements as 'droppable' items.

Dragmate will recognise when a draggable item is clicked/touched, replicate the drag effect and optionally fire any defined callback functions when a 'draggable' item is dropped on a 'droppable' item.

Example usage:
1) Include the dragmate.js and common.js files in your project

2) Start a new dragmate instance:
var d = new dragmate();

3) Define the draggable items. Provide either a single class selector, id selector or htmlelement object or an array of a combination of all:
d.setDraggable(".drag_class");

4) Define the droppable items. Provide either a single class selector, id selector or htmlelement object or an array of a combination of all:
d.setDroppable("#dropZone");

Both the setDroppable and setDraggable methods can be run at any time to add new page elements to the respective collections.

5) Define a callback function that dragmate will run once a drag/drop combination of events is triggered: 
d.dragmateDrop = function(e, drag, drop) {}

Dragmate will pass all callback functions the current window event and two objects containing information from the drag/drop events.

Refer lines 41 to 70 in the dragmate.js file for an overview of these two objects.

This draft has been tested on:
Google Chrome Version 26.0.1410.64
Firefox 24.0
iPad 2 (iOS 7.1.2) with Chrome, Safari and Opera Coast
