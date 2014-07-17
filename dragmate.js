/*  Copyright (c) 2014 Derrick Goostrey
 *  Dragmate manages drag and drop functionality
 *  for document elements. Use dragmate to
 *  enable any document element/s to be dragged and
 *  dropped onto other document elements.
 *  Dragmate provides a framework to trigger
 *  callback functions on drag start and drop
 *  and will output the document element being dragged
 *  the starting and end screen positions and the
 *  document element that recieved a drop.
 */
var dragmate = function () {

    /*  Collection of drag and drop
     *  elements and true/false flag
     *  for successful setup
     */
    this.dragItems = [];
    this.dropItems = [];
    this.dragItemsSet = false;
    this.dropItemsSet = false;


    /*  Dragmate events that callabck functions can be assigned to.
     *
     *  ondragstart. Event triggered once a valid draggable
     *  element is moved for the first time. Only run once 
     *  per drag. dragstartevt assigned true once callback is run
    */
    this.ondragstart = null;
    this.dragstartevt = false;


    /*  ondragmove. Event is triggered continuously during the
     *  drag. Passed the window event, drag & drop objects.
    */
    this.ondragmove = null;


    /*  ondragend. Event is triggered when a drag event ends
     *  passed the window event, drag & drop objects.
     */
    this.ondragend = null;


    /*  ondrop. Event is only triggered when a draggable element
     *  is released/dropped whilst within the bounds of a defined
     *  droppable element.
     */
    this.ondrop = null;


    /*  onlongtouch. Event is triggered when a long touch is
     *  detected on a valid draggable element.
     */
    this.onlongtouch = null;


    /*  Properties set once a drag event
     *  is active.
     */
    this.dropActive = false;


    /*  Properties set for long touch control
     *  Set ltTime to define how long to wait before
     *  triggering the long touch callback
     *  ltCnl set to true when a drag event starts
     *  which cancels the long touch
     */
    this.ltCnl = false;
    this.ltTime = 500;


    /*  Dragmate drag object
     *  Contains the last element to be
     *  dragged, its starting co-ordinates
     *  The duplicate 'visual' element created
     *  for the drag effect
     *  and the drag events starting co-ordinates.
     *  This object will be passed to all callback
     *  functions provided.
     */
    this.drag = {
        dragElem    : '',
        dragElemX   : 0,
        dragElemY   : 0,
        visElem     : '',
        startX      : 0,
        startY      : 0
    };

    /*  Dragmate drop object
     *  Contains the last element that recieved
     *  a valid drop or dragover and the
     *  co-ordinates of the last drop event.
     *  This object will be passed to all callback
     *  functions provided.
     */
    this.drop = {
        dropElem    : false,
        endX        : 0,
        endY        : 0
    };


    /*  Dragmates drag event can optionally monitor
     *  if the current drag position is directly over
     *  a droppable element (within the outer bounds of
     *  a droppable elements screen position).
     *  This can be used to apply css styles to the
     *  droppable element or to trigger the overdroppable
     *  event if a callback is required.
     *  By default this monitoring is disabled.
     *  Note: If an implementation contains a large
     *  number of droppable zones, monitoring for contact
     *  with a droppable element may increase 
     *  resource requirements
     */
    this.monitorOverDrop = false;
    this.dragOnEffect = "1px solid #1DACDA";
    this.dragOffEffect = "1px solid #CCCCCC";


    /*  Self reference*/
    var me = this;


    /*  Accepts a string or array of ID's, Classes 
     *  or document elements to include in the 
     *  draggable elements collection
     */
    this.setDraggable = function (d) {
        var l;
        if (typeof d === "object" && d[0]) {
            l = d.length;
            while (l--) {
                this.dragItemsSet = this.incDragDropItem(d[l], this.dragItems);
            }
        } else {
            this.dragItemsSet = this.incDragDropItem(d, this.dragItems);
        }

        if (this.dragItemsSet === true) {
            this.registerDraggable();
        }
    };


    /*  Accepts a string or array of ID's, Classes 
     *  or document elements to include in the 
     *  droppable elements collection
     */
    this.setDroppable = function (d) {
        var l;
        if (typeof d === "object") {
            l = d.length;
            while (l--) {
                this.dropItemsSet = this.incDragDropItem(d[l], this.dropItems);
            }
        } else {
            this.dropItemsSet = this.incDragDropItem(d, this.dropItems);
        }
    };


    /*  Adds document elements to a given collection.
     *  Expecting either a string or a dom object and
     *  the collection object.
     */
    this.incDragDropItem = function (i, col) {
        var e = (typeof i !== "string") ? [i] : this.el(i),
            l = e.length || 0;

        if (e !== false) {
            while (l--) {
                col.push(e[l]);
            }
            return true;
        }
        return false;
    };


    /*  Returns an array of page elements based on
     *  standard css .class or #id selectors
     */
    this.el = function (e) {
        var s = e.substring(0, 1), //selector
            t = e.substring(1, e.length), //tag name
            nl = '',
            rl = [],
            l = 0;

        if (s === ".") { //class selector
            nl = $cls(t);
        } else if (s === "#") { //id selector
            nl = $id(t);
        } else {
            return false; //unrecognised
        }
        /*  determine what sort of page elements
         *  we have. Either a single node, a node list
         *  or an array of nodes
         */
        if (nl[0]) {
            l = nl.length;
            if (l > 0) {
                while (l--) {
                    rl.push(nl[l]);
                }
            }
        } else {
            rl.push(nl);
        }
        return rl;
    };


    /*  Adds event listeners to each of the draggable
     *  elements provided
     */
    this.registerDraggable = function () {
        var l = this.dragItems.length;
        while (l--) {
            this.dragItems[l].addEventListener("mousedown", gotDraggable, false);
            this.dragItems[l].addEventListener("touchstart", gotDraggable, false);
        }
    };


    /*  Moves a draggable item as the mouse/touch
     *  movements are tracked
     */
    function dragDraggable(x, y) {
        var yd = y - me.drag.startY,
            xd = x - me.drag.startX;

        /*  compare mouse/touch starting position with
         *  current position. Apply difference to the copy
         *  visual element for the current drag event
         */
        me.drag.visElem.style.display = "block";
        me.drag.visElem.style.top = (me.drag.dragElemY + yd) + "px";
        me.drag.visElem.style.left = (me.drag.dragElemX + xd) + "px";
    }


    /*  Monitors mouse or touch screen position
     *  after a draggable element has been
     *  clicked/touched
     */
    function trackDrag(e) {
        var t, nY, nX;
        e = (!e) ? window.event : e;
        /*  prevent default behaviour*/
        e.stopPropagation();
        e.preventDefault();

        /*  once drag is detected, cancel the long
         *  touch event
         */
        me.ltCnl = true;
        if (me.dragstartevt === false) {
            me.dragstartevt = true;
            /*  Run dragstart callback if defined */
            if (me.ondragstart !== null) {
                me.ondragstart(e, me.drag);
            }
        }

        if (e.targetTouches) {
            /*  working with touch device*/
            t = e.targetTouches[0] || e.changedTouches[0];
            if (t.pageX !== 0 && t.pageY !== 0) {
                nY = t.pageY;
                nX = t.pageX;
            }
        } else {
            if (e.clientX !== 0 && e.clientY !== 0) {
                nY = e.clientY;
                nX = e.clientX;
            }
        }

        /*  move the draggable element*/
        dragDraggable(nX, nY);

        /*  track movement over droppable elements
         *  if droppable elements have been defined
         *  and drag monitoring is on.
         */
        if (me.dropItemsSet === true && me.monitorOverDrop === true) {
            overDropItem(nX, nY);
        }

        /*  run dragmove callback if defined
         *  note: specifically called AFTER any overDropItem
         *  monitoring if enabled to ensure drop object is
         *  updated prior to passing to callback
         */
        if (me.ondragmove !== null) {
            me.ondragmove(e, me.drag, me.drop);
        }
    }


    /*  Compares drop location to the droppable
     *  elements in the droppable collection. 
     *  If drop location is within the boundaries 
     *  of a droppable element, the element 
     *  is returned and added to the dragmate drop
     *  object. False returned if the drag is not
     *  over a droppable element.
     */
    function overDropItem(x, y) {
        var l = me.dropItems.length, bnd, di = -1;

        while (l--) {
            bnd = me.dropItems[l].getBoundingClientRect();
            /*  check the current screen position of the drag
             *  is inside the boundaries of a droppable element
             */
            if (y >= bnd.top && y <= (bnd.top + bnd.height)) {
                if (x >= bnd.left && x <= (bnd.left + bnd.width)) {
                    di = l;
                }
            }
        }
        /*  apply visuals*/
        overDropEffect(di);

        /*  assign the droppable element to the drop object*/
        me.drop.dropElem = (di === -1) ? false : me.dropItems[di];

        /*  return the droppable element (or false)*/
        return me.drop.dropElem;
    }


    /*  Applies border css to a droppable element within the
     *  dropItems array as defined by the overDropItem method
     */
    function overDropEffect(i) {
        var l = me.dropItems.length;
        while (l--) {
            if (l === i) {
                me.dropItems[l].style.border = me.dragOnEffect;
            } else {
                me.dropItems[l].style.border = me.dragOffEffect;
            }
        }
    }


    /*  Manages the 'drop' event on a draggable element.
     *  Removes the temp visiual element and current event
     *  listeners for the document/window, records
     *  the drop position in the dragmate drop 
     *  object and fires any drop callback if defined.
     */
    function dropDraggable(e) {
        var t;
        e = (!e) ? window.event : e;
        if (e.type === "mouseup") {
            if (e.button !== 0) {
                return;
            }
        }

        /*  restrict default behaviour*/
        e.stopPropagation();
        e.preventDefault();
        me.ltCnl = true;

        /*  reset dragstart event firing*/
        me.dragstartevt = false;

        if (e.targetTouches) {
            /*  working with touch device*/
            t = e.targetTouches[0] || e.changedTouches[0];
            /*  get the final screen position*/
            if (t.pageX !== 0 && t.pageY !== 0) {
                me.drop.endX = t.pageX;
                me.drop.endY = t.pageY;
            }
        } else {
            if (e.clientX !== 0 && e.clientY !== 0) {
                /*  get the final screen position*/
                me.drop.endX = e.clientX;
                me.drop.endY = e.clientY;
            }
        }

        /*  If we're not already tracking the drag event
         *  now check if the drop was over a droppable element
         *  otherwise, we already have the drop co-ordinates
         *  as the last drag movement
         */
        if (me.monitorOverDrop !== true) {
            overDropItem(me.drop.endX, me.drop.endY);
        }

        /*  remove any visual hover over drag zone effects*/
        overDropEffect(-1);

        /*  remove event handlers*/
        document.onmousemove = null;
        document.onmouseup = null;
        document.ontouchmove = null;
        document.ontouchend = null;
        /*  remove copy visual element*/
        document.body.removeChild(me.drag.visElem);
        /*  drag/drop no longer active*/
        me.dropActive = false;

        /*  run drop callback function if defined and valid drop*/
        if (me.drop.dropElem !== false) {
            if (me.ondrop !== null) {
                me.ondrop(e, me.drag, me.drop);
            }
        }

        /*  run dragend callback if defined*/
        if (me.ondragend !== null) {
            me.ondragend(e, me.drag, me.drop);
        }
    }


    /*  Applys the styles of one element to another
     *  styles to copy are defined in an array passed
     *  to dependent function $getStyles
     */
    function applyStyles(n, t) {
        var cN,
            name,
            ltr,
            prop,
            pos,
            s = $getStyle(t, [
                "width",
                "height",
                "border",
                "font-size",
                "color",
                "border-color",
                "padding",
                "vertical-align",
                "margin",
                "white-space",
                "list-style",
                "line-height"
            ]);

        for (prop in s) {
            if (s.hasOwnProperty(prop)) {
                pos = prop.indexOf("-");
                if (pos !== -1) {
                    cN = prop.split("-");
                    name = cN[0];
                    ltr = cN[1].charAt(0);
                    ltr = ltr.toUpperCase();
                    name = name + ltr + cN[1].substring(1, cN[1].length);
                } else {
                    name = prop;
                }
                if (s[prop] === '') {
                    s[prop] = "none";
                }
                n.style[name] = s[prop];
            }
        }
    }


    /*  Creates a replica of the dom element
     *  selected for drag and wraps it in a new
     *  'div' element. Copys styles using from
     *  the original element using the applyStyles function.
     */
    function createDragElem(e) {
        var html = e.target.cloneNode(true),
            nd = document.createElement('div'),
            cn = e.target.childNodes.length,
            sPos = e.target.getBoundingClientRect();

        /*  assign draggable elements starting screen position*/
        me.drag.dragElemY = parseFloat(sPos.top, 10);
        me.drag.dragElemX = parseFloat(sPos.left, 10);

        /*  Copy styles from the target nodes children
         *  to the new copy nodes children if if present 
         */
        if (cn > 0) {
            while (cn--) {
                if (html.childNodes[cn].nodeName !== "#text") {
                    applyStyles(html.childNodes[cn],
                        e.target.childNodes[cn]);
                }
            }
        }

        /*  Copy styles to the new copy element*/
        applyStyles(html, e.target);

        /*  appy styles for visual control*/
        nd.style.position = "fixed";
        nd.style.opacity = "0.75";
        nd.style.pointerEvents = "none";
        nd.style.display = "none";
        nd.id = "mover";
        nd.appendChild(html);
        document.body.appendChild(nd);
        return nd;
    }


    /*  Run when a draggable element is 
     *  clicked/touched
     */
    function gotDraggable(e) {
        var lt, t;
        e = (!e) ? window.event : e;
        if (me.dropActive === true) {
            /*  Cancel if a drag is already in progress */
            return;
        }
        if (e.type === "mousedown") {
            /*  Only accept left click to begin a drag event */
            if (e.button !== 0) {
                return;
            }
        }

        /*  restrict default behaviours*/
        e.stopPropagation();
        e.preventDefault();
        me.ltCnl = false;
        lt = setTimeout(function () {
            if (me.ltCnl === false) {
                /*  Wait half a second to
                 *  to trigger long touch events
                 */
                touchLongpress(e);
            }
        }, 500);

        if (e.targetTouches) {
            /*  working with a touch device */
            /*  assign the drag start screen position*/
            t = e.targetTouches[0] || e.changedTouches[0];
            me.drag.startX = parseFloat(t.pageX, 10);
            me.drag.startY = parseFloat(t.pageY, 10);
            /*  assign event listeners to document */
            document.ontouchmove = trackDrag;
            document.ontouchend = dropDraggable;
        } else {
            /*  assign the drag start screen position*/
            me.drag.startX = parseFloat(e.clientX, 10);
            me.drag.startY = parseFloat(e.clientY, 10);
            /*  assign event listeners to document */
            document.onmousemove = trackDrag;
            document.onmouseup = dropDraggable;
        }

        /*  Create a duplicate of the draggable element
         *  and assign it to the drag object
         */
        me.drag.visElem = createDragElem(e);
        me.drag.dragID = e.target.id;
        me.drag.dragElem = e.target;

        /*  Drop active is now true*/
        me.dropActive = true;
    }


    /*  Runs the long touch callback once a
     *  long touch has been detected.
     *  Callback function passed the event object
     *  and the long touch cancel value by default
     */
    function touchLongpress(e) {
        e = (!e) ? window.event : e;
        if (e.targetTouches) {
            if (me.onlongtouch !== null) {
                me.onlongtouch(e, me.ltCnl);
            }
            return;
        }
    }
};
