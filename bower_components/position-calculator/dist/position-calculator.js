/*!
 * jQuery.PositionCalculator
 * https://github.com/tlindig/position-calculator
 *
 * v1.1.2 - 2014-07-01
 *
 * Copyright (c) 2014 Tobias Lindig
 * http://tlindig.de
 *
 * License: MIT
 *
 * Author: Tobias Lindig <dev@tlindig.de>
 */
/*!
 * class PositionCalculator
 * https://github.com/tlindig/position-calculator
 *
 * Copyright (c) 2014 Tobias Lindig
 * Licensed under the MIT license.
 */

/*global define:false*/
(function(factory) {
    // make it public
    if (typeof define === 'function' && define.amd) {
        // as __named__ AMD module
        define("position-calculator", ["jquery"], factory);
    } else {
        // as Browser globals
        jQuery.PositionCalculator = factory(jQuery);
    }
}(function($) {
    "use strict"; //enable ECMAScript 5 Strict Mode

    // //////////
    // private
    var __window = window;
    var __document = document;
    var __docElement = __document.documentElement;

    var __rgx_vertical = /top|middle|bottom/;
    var __rgx_horizontal = /left|center|right/;
    var __rgx_percent = /%$/;

    var __mirror = {
        left: "right",
        center: "center",
        right: "left",
        top: "bottom",
        middle: "middle",
        bottom: "top"
    };

    /**
     * prepare selector, because jQuery do not return "window" and "document"
     *
     * @param  {selector|DOM|jQuery|null} selector value given in options
     * @return {selector|DOM|jQuery|null}  if "selector" was a string and match "window" or
     *                                     "document", than the native object will be returned.
     */
    function __normalizeSlector(selector) {
        if (typeof selector === "string") {
            if (selector === "window") {
                selector = __window;
            } else if (selector === "document") {
                selector = __document;
            }
        }
        return selector;
    }

    /**
     * Normalize the given "at" specification.
     * Use default value ('top left'), if syntax is not correct.
     *
     * @param  {string} ref     syntax: <vertical> + " " + <horizontal>
     *                          vertical: "top" | "middle" | "bottom"
     *                          horizontal: "left" | "center" | "right"
     * @return {NormAt}         Object with {y:string, x:string}
     */
    function __normalizeAt(ref) {
        var values = ref.split(" ");
        return {
            y: __rgx_vertical.test(values[0]) ? values[0] : "top",
            x: __rgx_horizontal.test(values[1]) ? values[1] : "left"
        }
    }

    /**
     * compare to NormPos with {top:number, left:number, height:number, width:number}
     *
     * @param  {NormPos} normPos1
     * @param  {NormPos} normPos2
     * @return {boolean}          true, if values are equal
     */
    function __isEqualNormPos(normPos1, normPos2) {
        if (normPos1 === normPos2) {
            return true;
        }
        if(!normPos1 || !normPos2) {
            return false;
        }
        return (normPos1.top === normPos2.top && normPos1.left === normPos2.left &&
            normPos1.height === normPos2.height && normPos1.width === normPos2.width);
    }

    /**
     * read the correct value for top, left, width and height from the given $el.
     * Can handle "window", "document", "event" and "DOM node"
     * resulting "top" and "left" are relative to document top-left corner
     *
     * @param  {jQuery} $el     input to calculate the position
     * @return {NormPos}        Object with {top:number, left:number, height:number, width:number}
     *
     **/
    function __nomrmalizePosition($el) {
        var raw = $el[0];
        if (raw.nodeType === 9) {
            // is document node
            return {
                width: $el.outerWidth(),
                height: $el.outerHeight(),
                top: 0,
                left: 0
            };
        }
        if ($.isWindow(raw)) {
            return {
                width: $el.outerWidth(),
                height: $el.outerHeight(),
                top: $el.scrollTop(),
                left: $el.scrollLeft()
            };
        }
        if (raw.preventDefault) {
            // is event
            return {
                width: 0,
                height: 0,
                top: raw.pageY,
                left: raw.pageX
            };
        }
        var offset = $el.offset();
        return {
            width: $el.outerWidth(),
            height: $el.outerHeight(),
            top: offset.top,
            left: offset.left
        };
    }

    function __refreshPosition($el, normPos) {
        var raw = $el[0];
        if (raw.nodeType === 9) {
            // is document node, top and left are always 0
            return;
        }
        if ($.isWindow(raw)) {
            normPos.top = $el.scrollTop();
            normPos.left = $el.scrollLeft();
        }
        if (raw.preventDefault) {
            // is event
            normPos.top = raw.pageY;
            normPos.left = raw.pageX;
            return;
        }

        var offset = $el.offset();
        normPos.top = offset.top;
        normPos.left = offset.left;
        return;
    }

    /**
     * get the inner boundary box of given element. Take care of scrollbars, borders, padding and so on.
     * Can handle "window", "document" and "DOM node"
     * resulting "top" and "left" are relative to document top-left corner
     *
     * @param  {jQuery} $el [description]
     * @return {NormPos}    Object with {top:number, left:number, height:number, width:number}
     */
    function __normalizeBounding($el) {
        var domElm = $el[0];
        var offset;
        if (domElm.nodeType === 9) {
            // is document node
            domElm = __docElement;
            offset = {
                top: 0,
                left: 0
            };
        } else if ($.isWindow(domElm)) {
            domElm = __docElement;
            offset = {
                top: $el.scrollTop(),
                left: $el.scrollLeft()
            };
        } else {
            offset = $el.offset();
        }

        return {
            width: domElm.clientWidth,
            height: domElm.clientHeight,
            top: offset.top + domElm.clientTop,
            left: offset.left + domElm.clientLeft
        };
    }

    function __refreshBounding($el, normPos) {
        var domElm = $el[0];
        var offset;
        if (domElm.nodeType === 9) {
            // is document node
            domElm = __docElement;
            offset = {
                top: 0,
                left: 0
            };
        } else if ($.isWindow(domElm)) {
            domElm = __docElement;
            offset = {
                top: $el.scrollTop(),
                left: $el.scrollLeft()
            };
        } else {
            offset = $el.offset();
        }

        normPos.top = offset.top + domElm.clientTop;
        normPos.left = offset.left + domElm.clientLeft;
        return;
    }

    /**
     * normalize given offset, convert percent values in pixel values.
     *
     * @param  {Object} offset      offset object with property x:{number}, y:{number}, mirror:{boolean}
     * @param  {Object} size        with properties width:{number} and height:{number} }
     * @return {Object}             offset object
     */
    function __normalizeExtraOffset(offset, size) {
        return {
            y: parseFloat(offset.y) * (__rgx_percent.test(offset.y) ? size.height / 100 :
                1),
            x: parseFloat(offset.x) * (__rgx_percent.test(offset.x) ? size.width / 100 :
                1),
            mirror: offset.mirror
        };
    }

    /**
     * Calculate the relative offset from top-left corner to the reference points
     *
     * @param  {NormPos} pos          Object with normalized position
     * @param  {{x:number, y:number}} extraOffsets    [description]
     * @param  {{x:string, y:string}} initialRefpoint [description]
     * @return {RefPoints}            Object with offset for reference points
     *                                { top:number, left:number, middle:number,
     *                                  center:number, bottom:number, right:number }
     */
    function __calculateRefpointOffsets(pos, extraOffsets, initialRefpoint) {
        var result = {
            top: 0,
            left: 0,
            middle: pos.height * 0.5,
            center: pos.width * 0.5,
            bottom: pos.height,
            right: pos.width
        };

        //add extra offset
        if (extraOffsets.y !== 0) {
            result.middle += extraOffsets.y;
            if (extraOffsets.mirror) {
                result.top += ("top" !== initialRefpoint.y) ? (extraOffsets.y * -1) :
                    extraOffsets.y;
                result.bottom += ("bottom" !== initialRefpoint.y) ? (extraOffsets.y * -1) :
                    extraOffsets.y;
            } else {
                result.top += extraOffsets.y;
                result.bottom += extraOffsets.y;
            }
        }
        if (extraOffsets.x !== 0) {
            result.center += extraOffsets.x;
            if (extraOffsets.mirror) {
                result.left += ("left" !== initialRefpoint.x) ? (extraOffsets.x * -1) :
                    extraOffsets.x;
                result.right += ("right" !== initialRefpoint.x) ? (extraOffsets.x * -1) :
                    extraOffsets.x;
            } else {
                result.left += extraOffsets.x;
                result.right += extraOffsets.x;
            }
        }

        return result;
    }

    /**
     * collect all edges that have overflow between boundary and item.
     *
     * @param  {Distance} distance  Distance Object
     * @return {Distance}           Object with
     *                              { top:number, left:number, bottom:number, right:number,
     *                                overflow:{Array.<string>|null} }
     */
    function __updateOverflow(distance) {
        var overflow = [];
        distance.top > 0 && overflow.push("top");
        distance.left > 0 && overflow.push("left");
        distance.bottom < 0 && overflow.push("bottom");
        distance.right < 0 && overflow.push("right");

        if (overflow.length) {
            distance.overflow = overflow;
        } else {
            distance.overflow = null;
        }

        return distance;
    }

    /**
     * calculate distance / overflow between boundary and item.
     *
     * @param  {NormPos} bou_Pos    NormPos of boundary
     * @param  {NormPos} item_Pos   NormPos of item
     * @return {Distance}           Object with
     *                              { top:number, left:number, bottom:number, right:number,
     *                                overflow:{Array.<string>|null} }
     */
    function __calulateDistance(bou_Pos, item_Pos) {
        var result = {
            top: bou_Pos.top - item_Pos.top,
            left: bou_Pos.left - item_Pos.left,
            bottom: (bou_Pos.top + bou_Pos.height) - (item_Pos.top + item_Pos.height),
            right: (bou_Pos.left + bou_Pos.width) - (item_Pos.left + item_Pos.width),
            overflow: []
        };

        return __updateOverflow(result);
    }

    /**
     * calculate the new fliped placement.
     *
     * {NormAt} is Object with {x:string, y:string}
     *
     * @param  {string} flip    - flip option, "item", "target", "both", "none"
     * @param  {NormAt} itemAt  - NormAt of item
     * @param  {NormAt} tarAt   - NormAt of target
     * @param  {Distance}       - current calculated distance, needed to find out, which edge have overflow
     * @return {Object|null}    - Object with placement
     *                          {
     *                              item_at:NormAt,
     *                              tar_at:NormAt
     *                          }
     *                          - null, if no overflow or if overflow on all edges
     */
    function __flipPlacement(flip, itemAt, tarAt, distance) {
        var y_overflowEdge, x_overflowEdge, flipBits;
        var item_flipedAt = {
            y: itemAt.y,
            x: itemAt.x
        };
        var tar_flipedAt = {
            y: tarAt.y,
            x: tarAt.x
        };

        if (distance.overflow.indexOf("top") !== -1) {
            y_overflowEdge = "top";
        }
        if (distance.overflow.indexOf("bottom") !== -1) {
            if (y_overflowEdge) {
                //overflow in both sides, so item is larger than boundary. Can't be resolved
                y_overflowEdge = null;
            } else {
                y_overflowEdge = "bottom";
            }
        }

        if (distance.overflow.indexOf("left") !== -1) {
            x_overflowEdge = "left";
        }
        if (distance.overflow.indexOf("right") !== -1) {
            if (x_overflowEdge) {
                //overflow in both sides, so item is larger than boundary. Can't be resolved
                x_overflowEdge = null;
            } else {
                x_overflowEdge = "right";
            }
        }

        if (!y_overflowEdge && !x_overflowEdge) {
            return null;
        }

        flip = (flip === true) ? "both" : flip;
        flipBits = 0;
        switch (flip) {
            case "item":
                flipBits = 1;
                break;
            case "target":
                flipBits = 2;
                break;
            case "both":
                flipBits = 3;
                break;
        }

        if (flipBits & 1) {
            y_overflowEdge && (item_flipedAt.y = __mirror[item_flipedAt.y]);
            x_overflowEdge && (item_flipedAt.x = __mirror[item_flipedAt.x]);
        }
        if (flipBits & 2) {
            y_overflowEdge && (tar_flipedAt.y = __mirror[tar_flipedAt.y]);
            x_overflowEdge && (tar_flipedAt.x = __mirror[tar_flipedAt.x]);
        }

        return {
            item_at: item_flipedAt,
            tar_at: tar_flipedAt
        };
    }


    /**
     * compare overflow in distancaA with overflow in distanceB.
     *
     * @param  {Distance}  distanceA  distance object, with top, right, bottom, left
     * @param  {Distance}  distanceB  distance object, with top, right, bottom, left
     * @param  {boolean} isY        axis
     * @return {boolean}            return true, if overflow of A is less than overflow of B,
     *                                         otherwise false
     */
    function __overflowLT(distanceA, distanceB, isY) {
        var a1, a2, b1, b2, edges;

        if (isY) {
            edges = ["top", "bottom"];
        } else {
            edges = ["left", "right"];
        }
        a1 = distanceA[edges[0]];
        b1 = distanceB[edges[0]];
        a2 = distanceA[edges[1]] * -1; // * -1 to get positive values for overflow
        b2 = distanceB[edges[1]] * -1;

        // set values without overflow to zero
        a1 < 0 && (a1 = 0);
        a2 < 0 && (a2 = 0);
        b1 < 0 && (b1 = 0);
        b2 < 0 && (b2 = 0);

        if (a1 < 0 && a2 < 0) {
            //take a
            return true;
        }

        if (b1 < 0 && b2 < 0) {
            // take b
            return false;
        }

        return (a1 + a2) < (b1 + b2);
    }

    function __adaptSticking(data, edges) {
        if (edges === "all") {
            edges = true;
        }
        var overflow = data.distance.overflow;

        if(!overflow.length) {
            return data;
        }

        //to prevent handling overflow in both directions of on axis
        var skipX = false;
        var skipY = false;

        var edge, diff;
        for (var i = overflow.length - 1; i >= 0; i--) {
            edge = overflow[i];
            switch (edge) {
                case "top":
                case "bottom":
                    if (!skipY && edges === true || edges.indexOf(edge) !== -1) {
                        diff = data.distance[edge];
                        data.moveBy.y += diff;
                        data.distance.top -= diff;
                        data.distance.bottom -= diff;
                        skipY = true;
                    }
                    break;

                case "left":
                case "right":
                    if (!skipX && edges === true || edges.indexOf(edge) !== -1) {
                        diff = data.distance[edge];
                        data.moveBy.x += diff;
                        data.distance.left -= diff;
                        data.distance.right -= diff;
                        skipX = true;
                    }
                    break;
            }
        }

        __updateOverflow(data.distance);

        return data;
    }

    /**
     * Class PositionCalculator
     *
     * @param {Object} options
     *
     * {selector|DOM|jQuery} item       -required- the element being positioned
     * {selector|DOM|jQuery} target     -required- the element align the positioned item against
     * {selector|DOM|jQuery|null} boundary -optional- constraints the position of item
     *                                      default: window
     *
     * {string} itemAt          -optional- placement of reference point on the item
     *                                   syntax: <vertical> + " " + <horizontal>
     *                                   vertical: "top" | "middle" | "bottom"
     *                                   horizontal: "left" | "center" | "right"
     *                          default: "top left"
     * {string} targetAt        -optional- placement of reference point on the target
     *                                     same as for "itemAt"
     *                          default: "top left"
     * {Object} itemOffset      -optional- Object with {
     *                                         y:number,      // vertical offset
     *                                         x:number,      // horizontal offset
     *                                         mirror:boolean // if offset should mirror for flip
     *                                    }
     *                          default: { y:0, x:0, mirror:true }
     *
     * {Object} targetOffset    -optional- same as for "itemOffset"
     *                          default: { y:0, x:0, mirror:true }
     *
     * {string|boolean} flip    -optional- specify the strategy to prevent that "item"
     *                                    overflows the boundary.
     *                                    "item": Only change the itemAt
     *                                    "target": Only change the targetAt
     *                                    "both"|true: Change both the itemAt and targetAt at the same time
     *                                          (to 'flip' the item to the other side of the target)
     *                                    "none"|false: Don't change placement of reference point
     *                          default: "none"
     *
     * {string|boolean} stick   -optional- will keep the item within it's boundary by sticking it to
     *                                     the edges if it normally would overflow.
     *                                     Specify sides you'd like to control (space separated) or
     *                                     "none"|false or "all"|true.
     *                          default: "none"
     *
     *
     *  Main method is calculate()
     *
     */
    function PositionCalculator(options) {
        //ensure it called with 'new'
        if (!(this instanceof PositionCalculator)) {
            return new PositionCalculator(options);
        }

        this.options =
            this.$itm =
            this.$trg =
            this.$bnd =
            this.itmAt =
            this.trgAt =
            this.itmPos =
            this.trgPos =
            this.bndPos =
            this.itmOffset =
            this.trgOffset = null;

        this._init(options);
    }
    PositionCalculator.prototype._init = function(options) {
        var o = this.options = $.extend({}, PositionCalculator.defaults, options);

        if (!o.item) {
            return null;
        }
        this.$itm = o.item.jquery ? o.item : $(o.item);
        if (this.$itm.length === 0) {
            return null;
        }

        this.$trg = o.target && o.target.jquery ? o.target : $(__normalizeSlector(o.target));
        this.$bnd = o.boundary && o.boundary.jquery ? o.boundary : $(__normalizeSlector(o.boundary));

        this.itmAt = __normalizeAt(o.itemAt);
        this.trgAt = __normalizeAt(o.targetAt);

        this.resize();

        return this; // to allow chaining
    };

    /**
     * Update intern stored values depending on size and position of elements (item, target, boundary).
     * Should be called if dimensions of an element changed.
     *
     * @return {this} allow chaining
     */
    PositionCalculator.prototype.resize = function() {
        var o = this.options;

        var item_pos = __nomrmalizePosition(this.$itm);
        var targ_pos = this.$trg.length ? __nomrmalizePosition(this.$trg) : null;
        this.bndPos = this.$bnd.length ? __normalizeBounding(this.$bnd) : null;

        if (!this.itmPos || !__isEqualNormPos(item_pos, this.itmPos)) {
            this.itmPos = item_pos;
            var item_extraOffset = __normalizeExtraOffset(o.itemOffset, item_pos);
            // negate values, because it shall be defined relative to the item reference point
            // and not relative to the corner.
            item_extraOffset.x = item_extraOffset.x * -1;
            item_extraOffset.y = item_extraOffset.y * -1;

            this.itmOffset = __calculateRefpointOffsets(item_pos, item_extraOffset,
                this.itmAt);
        }
        if (!this.trgPos || !__isEqualNormPos(targ_pos, this.trgPos)) {
            this.trgPos = targ_pos;
            if(targ_pos) {
                this.trgOffset = __calculateRefpointOffsets(
                    targ_pos,
                    __normalizeExtraOffset(o.targetOffset, targ_pos),
                    this.trgAt
                );
            }
        }

        return this; // to allow chaining
    };

    /**
     * Calculate the resulting position and boundary distance for the given placement.
     * That will not handle flip and fit.
     *
     * If target was not specified, only boundary distance will be calculated.
     * If not "item_at" or "tar_at", only boundary distance will be calculated.
     * If boundary was set to null, only new position will be calculated.
     *
     * Current position of elements (item, target, boundary) will be read from DOM.
     *
     * @param  {{x:string, y:string}|null} item_at Placement for reference point on item
     * @param  {{x:string, y:string}|null} tar_at  Placement for reference point on target
     * @return {Object}         CalculationResult, see method calculate()
     */
    PositionCalculator.prototype.calcVariant = function(item_at, tar_at) {
        var result = {
            moveBy: null,
            distance: null,
            itemAt: null,
            targetAt: null
        };

        if(this.trgPos && item_at && tar_at) {
            var tar_refpoint = {
                top: this.trgPos.top + this.trgOffset[tar_at.y],
                left: this.trgPos.left + this.trgOffset[tar_at.x]
            };
            var item_newPos = {
                top: tar_refpoint.top - this.itmOffset[item_at.y],
                left: tar_refpoint.left - this.itmOffset[item_at.x],
                height: this.itmPos.height,
                width: this.itmPos.width
            };

            result.moveBy = {
                y: item_newPos.top - this.itmPos.top,
                x: item_newPos.left - this.itmPos.left
            };
            result.distance = this.bndPos ? __calulateDistance(this.bndPos, item_newPos) : null;
            result.itemAt = item_at.y + " " + item_at.x;
            result.targetAt = tar_at.y + " " + tar_at.x;
        } else {
            result.moveBy = { y:0, x:0 };
            result.distance = this.bndPos ? __calulateDistance(this.bndPos, this.itmPos) : null;
        }

        return result;
    };

    /**
     * Calculate the distance between reference point of item and reference point of target and
     * handle overflow in the specified matter.
     *
     * @return {Object}   with:
     *     moveBy: {{y:number, x:number}} - distance between target and item as pixel values
     *     distance: {Distance|null}    - distance between item and boundary
     *                                      null, if boundary was not given
     *                                  Distance is Object with: {
     *                                      top:number, left:number,
     *                                      bottom:number, right:number,
     *                                      overflow:{Array.<string>|null}
     *                                  }
     *                                  - top, left, buttom, right - distance/overflow for this edge
     *                                  - overflow - Array with edges has overflow
     *                                             - null for no collision detected
     *     itemAt: {string|null}        - used placement of reference point at item
     *                                    syntax: <vertical> + " " + <horizontal>
     *                                    vertical: "top" | "middle" | "bottom"
     *                                    horizontal: "left" | "center" | "right"
     *                                  - null, if target was not given
     *     targetAt: {string|null}      - used placement of reference point at target
     *                                    syntax: <vertical> + " " + <horizontal>
     *                                    vertical: "top" | "middle" | "bottom"
     *                                    horizontal: "left" | "center" | "right"
     *                                  - null, if target was not given
     */
    PositionCalculator.prototype.calculate = function() {
        if (this.itmPos === null) {
            return null; // init failed
        }

        var o = this.options;

        // refresh
        // only update the position off elements and scroll offsets, but not the width or height
        __refreshPosition(this.$itm, this.itmPos);
        this.trgPos && __refreshPosition(this.$trg, this.trgPos);
        this.bndPos && __refreshBounding(this.$bnd, this.bndPos);

        var result = this.calcVariant(this.itmAt, this.trgAt);
        if (!result.distance || !result.distance.overflow) {
            //finish, because no collision
            return result;
        }

        // ////////////////////
        // collision handling: flip
        if (o.flip && o.flip !== "none" && this.trgPos) {
            var newResult;
            var flipedPlacement = __flipPlacement(o.flip, this.itmAt, this.trgAt,
                result.distance);

            if (flipedPlacement) {
                newResult = this.calcVariant(flipedPlacement.item_at, flipedPlacement.tar_at);

                if (!newResult.distance.overflow) {
                    //finish, because found placement without collision
                    return newResult;
                }

                // look for combination with fewest overflow
                var useNew = {
                    y: false,
                    x: false
                };
                useNew.y = __overflowLT(newResult.distance, result.distance, true);
                useNew.x = __overflowLT(newResult.distance, result.distance, false);

                if (useNew.y !== useNew.x) {
                    //need new distance calculation
                    result = this.calcVariant({
                        y: useNew.y ? flipedPlacement.item_at.y : this.itmAt.y,
                        x: useNew.x ? flipedPlacement.item_at.x : this.itmAt.x
                    }, {
                        y: useNew.y ? flipedPlacement.tar_at.y : this.trgAt.y,
                        x: useNew.x ? flipedPlacement.tar_at.x : this.trgAt.x
                    });
                    if (!result.distance.overflow) {
                        //finish, because found position without collision
                        return result;
                    }
                } else if (useNew.y && useNew.x) {
                    result = newResult;
                } // else use "old" result
            }
        }

        // ////////////////////
        // collision handling: stick
        if (o.stick && o.stick !== "none") {
            return __adaptSticking(result, o.stick);
        } else {
            return result;
        }
    };

    // default options
    PositionCalculator.defaults = {
        item: null,
        target: null,
        boundary: window,
        itemAt: "top left",
        targetAt: "top left",
        itemOffset: {
            y: 0,
            x: 0,
            mirror: true
        },
        targetOffset: {
            y: 0,
            x: 0,
            mirror: true
        },
        flip: "none",
        stick: "none"
    };

    // export
    return PositionCalculator;
}));
