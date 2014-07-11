/*  Returns the document element matching
 *  a given ID value
 */
var $id = function (id) {return document.getElementById(id); };

/*  Returns a node list or array of all elements with
 *  a given class name
 */
var $cls = function (cls) {
    if (document.getElementsByClassName) {
        return document.getElementsByClassName(cls);
    }
    var e = document.getElementsByTagName("*"), l = e.length, r = [];
    while (l--) {
        if (e[l].className.indexOf(cls) !== -1) {
            r.push(e[l]);
        }
    }
    return r;
};

/*  Returns the css styles applied to an element
 *  pass in an array of values to recieve an
 *  object back, or a string value to recieve a single
 *  value returned.
 */
var $getStyle = function (el, prop) {
    if (typeof prop === "string") {
        prop = [prop];
    }
    
    var l = prop.length, p = {};

    while (l--) {
        p[prop[l]] = getValue(el, prop[l]);
    }

    return p;

    function getValue(el, p) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
            return document.defaultView.getComputedStyle(el, "").getPropertyValue(p);
        } else if (el.currentStyle) {
            p = p.replace(/\-(\w)/g, function (c){
                return c.toUpperCase();
            });
            return el.currentStyle[p];
        }
        return undefined;
    }
};
