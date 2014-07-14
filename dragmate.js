/*  Dragmate manages drag and drop functionality
 *  for standard browsers and touch devices
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


    /*  Series of optional callback
     *  functions triggered when
     *  defined for this instance
     */
    this.dragmateStart = '';
    this.dragmateDrop = '';
    this.ltCallback = '';


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
        if (typeof d === "object" && d[0]) {
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
        e.stopPropagation();
        e.preventDefault();
        me.ltCnl = true;
        if (e.targetTouches) {
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
        dragDraggable(nX, nY);
        if (me.dropItemsSet === true) {
            overDropItem(nX, nY);
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
        var l = me.dropItems.length,
            bnd, di = -1;

        while (l--) {
            bnd = me.dropItems[l].getBoundingClientRect();
            if (y >= bnd.top && y <= (bnd.top + bnd.height)) {
                if (x >= bnd.left && x <= (bnd.left + bnd.width)) {
                    di = l;
                }
            }
        }
        overDropEffect(di);
        me.drop.dropElem = (di === -1) ? false : me.dropItems[di];
        return me.drop.dropElem;
    }

    /*  Applies a defined effect to a droppable element
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
        var t, nY, nX;
        e = (!e) ? window.event : e;
        if (e.type === "mouseup") {
            if (e.button !== 0) {
                return;
            }
        }

        e.stopPropagation();
        e.preventDefault();
        me.ltCnl = true;

        if (e.targetTouches) {
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

        overDropEffect(-1);
        me.drop.endX = nX;
        me.drop.endY = nY;

        if (me.dragmateDrop !== '') {
            me.dragmateDrop(e, me.drag, me.drop);
        }

        document.onmousemove = null;
        document.onmouseup = null;
        document.ontouchmove = null;
        document.ontouchend = null;
        document.body.removeChild(me.drag.visElem);
        me.dropActive = false;
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

        me.drag.dragElemY = parseFloat(sPos.top, 10);
        me.drag.dragElemX = parseFloat(sPos.left, 10);

        /* Copy styles to child nodes if present */
        if (cn > 0) {
            while (cn--) {
                if (html.childNodes[cn].nodeName !== "#text") {
                    applyStyles(html.childNodes[cn],
                        e.target.childNodes[cn]);
                }
            }
        }

        applyStyles(html, e.target);

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
        e = (!e) ? window.event : e;
        if (me.dropActive === true) {
            return;
        }
        if (e.type === "mousedown") {
            if (e.button !== 0) {
                return;
            }
        }
        e.stopPropagation();
        e.preventDefault();
        me.ltCnl = false;
        lt = setTimeout(function () {
            if (me.ltCnl === false) {
                touchLongpress(e);
            }
        }, 500);

        if (e.targetTouches) {
            var t = e.targetTouches[0] || e.changedTouches[0];
            me.drag.startX = parseFloat(t.pageX, 10);
            me.drag.startY = parseFloat(t.pageY, 10);
            document.ontouchmove = trackDrag;
            document.ontouchend = dropDraggable;
        } else {
            me.drag.startX = parseFloat(e.clientX, 10);
            me.drag.startY = parseFloat(e.clientY, 10);
            document.onmousemove = trackDrag;
            document.onmouseup = dropDraggable;
        }

        me.drag.visElem = createDragElem(e);
        me.drag.dragID = e.target.id;
        me.drag.dragElem = e.target;

        if (me.dragmateStart !== '') {
            me.dragmateStart(e);
        }
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
            if (me.ltCallback !== '') {
                me.ltCallback(e, me.ltCnl);
            }
            return;
        }
    }


    /*  Prints the list of draggable elements
     *  to the console for debugging
     */
    this.showDraggable = function () {
        var l = this.dragItems.length;
        while (l--) {
            console.log(this.dragItems[l]);
        }
    };

};
