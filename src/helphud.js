(function ($, document, window, undefined) {
    "use strict";

    var Rect = function () {
        var offset, e;
        if (arguments.length == 1) {
            e = arguments[0];
            if (e instanceof Rect) {
                this.left = e.left;
                this.top = e.top;
                this.width = e.width;
                this.height = e.height;
            } else {
                offset = e.offset();
                this.left = offset.left;
                this.top = offset.top;
                this.width = e.outerWidth();
                this.height = e.outerHeight();
            }
        } else if (arguments.length == 4) {
            this.left = arguments[0];
            this.top = arguments[1];
            this.width = arguments[2];
            this.height = arguments[3];
        }
    };

    Rect.prototype.explode = function (pixels) {
        this.left -= pixels;
        this.top -= pixels;
        this.width += pixels * 2;
        this.height += pixels * 2;
        return this;
    };

    Rect.prototype.intersection = function (other) {
        var a = this, b = other;

        var x0 = Math.max(a.left, b.left);
        var x1 = Math.min(a.left + a.width, b.left + b.width);

        if (x0 <= x1) {

            var y0 = Math.max(a.top, b.top);
            var y1 = Math.min(a.top + a.height, b.top + b.height);

            if (y0 <= y1) {
                return new Rect(x0, y0, x1 - x0, y1 - y0);
            }
        }
        return null;
    };


    Rect.prototype.subtract = function (other) {
        var result, intersect, a = this, b = other;

        if (a.intersection(b) === null) {
            return [new Rect(a)];
        }

        result = [];

        var top = a.top;
        var height = a.height;

        var ar = a.left + a.width;
        var ab = a.top + a.height;

        var br = b.left + b.width;
        var bb = b.top + b.height;

        if (b.top > a.top) {
            result.push(new Rect(a.left, a.top, a.width, b.top - a.top));
            top = b.top;
            height -= b.top - a.top;
        }
        if (bb < ab) {
            result.push(new Rect(a.left, bb, a.width, ab - bb));
            height = bb - top;
        }
        if (b.left > a.left) {
            result.push(new Rect(a.left, top, b.left - a.left, height));
        }
        if (br < ar) {
            result.push(new Rect(br, top, ar - br, height));
        }
        return result;
    };

    Rect.prototype.toString = function () {
        return "[Rect left=" + this.left + ", top=" + this.top + ", width=" + this.width + ", height=" + this.height + "]";
    };

    var Plane = function (rect) {
        if (!(rect instanceof Rect)) {
            rect = new Rect(rect);
        }
        this.rects = [rect];
    };

    Plane.prototype.each = function (c) {
        for (var i = 0; i < this.rects.length; i++) {
            c.call(this, this.rects[i]);
        }
    };

    Plane.prototype.subtract = function (rect) {
        var result = [];

        if (!(rect instanceof Rect)) {
            rect = new Rect(rect);
        }

        this.each(function (r) {
            var sub = r.subtract(rect);
            for (var i = 0; i < sub.length; i++) {
                result.push(sub[i]);
            }
        });
        this.rects = result;
    };

    Plane.prototype.toString = function () {
        var result = "[Plane ";
        this.each(function (r) {
            result += r.toString() + " ";
        });
        return result + "]";
    };

    var throttle = function (quiet, fn) {
        var timer;
        return function () {
            if (timer) window.clearTimeout(timer);
            timer = window.setTimeout(function () {
                timer = undefined;
                fn();
            }, quiet);
        };
    };

    var opts = {
        margin: 3,
        stick: 30,
        barrier: 5
    };

    var hide = function () {
        var $overlay = $(".helphud-overlay"),
            trigger = $overlay.data("trigger"),
            $container = $overlay.data("container");
        $container.removeClass("helphud-shown").trigger($.Event("helphud-hidden"));
        $overlay.fadeOut({
            complete: function () {
                destroy.apply(this, arguments);
            }
        });
        if (trigger) { trigger.focus(); }
    };

    var destroy = function () {
        $(window).off(".helphud");
        var $overlay = $(".helphud-overlay"),
            $container = $overlay.data("container");

        // hide panels (put them back)

        $overlay.find(".helphud-panel").each(function () {
            var $panel = $(this),
                $marker = $panel.data("marker");

            $panel.toggle(false);
            $marker.before($panel).remove();
        });

        // hide more

        if ($overlay.data("more")) {
            hideMore($overlay.data("more"));
        }

        // reparent content we mightve moved into the tooltips from content nodes
        $overlay.find(".helphud-tooltip,[data-from]").each(function () {
            var $tooltip = $(this);
            var $holder = $($tooltip.data("from"));
            $tooltip.contents().each(function () {
                $holder.append(this);
            });
        });

        $overlay.remove();
    };

    var center = function ($element) {
        $element.css({
            position: "absolute",
            top: Math.max(0, (($(window).height() - $element.outerHeight()) / 2) +
                $(window).scrollTop()) + "px",
            left: Math.max(0, (($(window).width() - $element.outerWidth()) / 2) +
                $(window).scrollLeft()) + "px"
        });
    };

    function findFocusables($container) {
        function isFocusable(element) {
            var name=element.nodeName.toLowerCase();
            var tabIndex=$.attr(element, "tabindex");
            var hasTabIndex=tabIndex !== null && tabIndex !== undefined;
            var enabled=true;
            if (name === "input" || name === "select" || name === "textarea" || name === "button" || name === "object") {
                enabled = !element.disabled;
                if (enabled) {
                    var fieldset = $(element).closest("fieldset")[0];
                    if (fieldset) {
                        enabled=!fieldset.disabled;
                    }
                }
            } else if ("a" === name) {
                enabled = element.href||hasTabIndex;
            } else {
                enabled = hasTabIndex;
            }

            return enabled;
        }
        
        var matches=[];
        $container.find(":visible").each(function() {
            if (isFocusable(this)) {
                matches.push(this);
            }
        });
        return $(matches);
    }

    function initFocus($container) {
        var $focusable;
        var median=$(document).scrollTop()+$(window).height()/2;
        var $focusables=findFocusables($container);

        $focusables.each(function() {
            if ($focusable === undefined) {
                // initial seed
                $focusable = $(this);
                return true;
            }
            
            var $this=$(this);
            if (Math.abs(median-$focusable.position().top) > Math.abs(median-$this.position().top)) {
                $focusable=$this;
            }
        });
        
        if ($focusable && $focusable.length > 0) {
            $focusable.get(0).focus();
        }
    }

    function trapTab($container) {
        return function(e) {
            if (e.which === 9) { // tab
                e.stopPropagation();

                var $focusables=findFocusables($container);
                
                if ($focusables.length < 1) {
                    e.preventDefault();
                    return;
                }
                
                var firstFocusable=$focusables.get(0);
                var lastFocusable=$focusables.get($focusables.length-1);
                
                if (!e.shiftKey && e.target === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                } else if (e.shiftKey && e.target === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            }
        };
    }

    var showMore = function (id) {
        var trigger=document.activeElement;
        var $overlay = $(".helphud-overlay");
        $overlay.data("more", id);

        var $mask = $("<div class='helphud-more-mask'></div>");
        $overlay.append($mask);
        $mask.bind("click", hideMore);

        var $container = $("<div class='helphud-more-container'><div class='helphud-more-body' tabindex='0'></div><div class='helphud-more-commands'><a class='helphud-more-close' href='#'>Close</a></div></div>");
        $container.data("trigger", trigger);
        var $body = $container.find(".helphud-more-body");

        var $marker = $("<div class='helphud-marker'></div>");
        var $more = $("#" + id);

        $more.trigger($.Event("helphud-shown"))
            .data("marker", $marker)
            .before($marker)
            .removeClass("helphud-more");

        $body.append($more);

        $overlay.append($container);
        
        positionMore($overlay);

        initFocus($container);
        $container.on("keydown", trapTab($container));
        $container.on("keydown", function(e) {
            if (e.which === 27) { // esc
                hideMore();
                e.stopPropagation();
                e.preventDefault();
            }
        });
    };

    function isMoreShown($overlay) {
        return $overlay.find(".helphud-more-container").length>0;
    }

    function positionMore($overlay) {
        var $mask=$overlay.find("div.helphud-more-mask");
        if ($mask.length) {
            $mask.height($overlay.height());
        }
        var $container=$overlay.find("div.helphud-more-container");
        if ($container.length) {
            center($container);
        }
    }

    var hideMore = function () {
        var $overlay = $(".helphud-overlay");
        var $more = $("#" + $overlay.data("more"));
        var $marker = $more.data("marker");
        var $container=$overlay.find(".helphud-more-container");
        var trigger=$container.data("trigger");
        $more.trigger($.Event("helphud-hidden"));
        $marker.before($more).remove();
        $more.removeData("marker").addClass("helphud-more");
        $container.remove();
        $overlay.find(".helphud-more-mask").remove();
        $overlay.removeData("more");
        if (trigger) { trigger.focus(); }
    };

    var show = function () {
        var self = this;
        build.apply(this, arguments);
        $(".helphud-overlay").toggle(false).fadeIn({
            complete: function () {
                self.addClass("helphud-shown").trigger($.Event("helphud-shown"));
            }
        });
    };

    var positionMask = function($overlay) {
        
        var $elements=$overlay.data("elements");
        var $container=$overlay.data("container");

        var plane = new Plane($overlay);

        $elements.each(function () {
            if ($(this).data("highlight") !== false) {
                plane.subtract(new Rect($(this)).explode(opts.margin));
            }
        });

        $overlay.find("div.helphud-mask").remove();

        plane.each(function (r) {
            var e = $("<div class='helphud-mask'></div>");
            e.css({
                left: r.left,
                top: r.top,
                width: r.width,
                height: r.height
            });
            $overlay.append(e);
        });
    };

    function positionHint($hint) {
        var position=$hint.data("position");
        
        var $element=$hint.data("element");
        var offset = $element.offset();
        var left = offset.left - opts.margin;
        var top = offset.top - opts.margin;
        var width = $element.outerWidth() + opts.margin * 2;
        var height = $element.outerHeight() + opts.margin * 2;

        // position hint

        switch (position) {
            case "left":
                $hint.css({
                    top: top + height / 2 - $hint.outerHeight() / 2 + "px",
                    left: left - opts.barrier - opts.stick - $hint.outerWidth() + "px"
                });
                break;
            case "right":
                $hint.css({
                    top: top + height / 2 - $hint.outerHeight() / 2 + "px",
                    left: left + width + opts.barrier + opts.stick + "px"
                });
                break;
            case "top":
                $hint.css({
                    top: top - opts.barrier - opts.stick - $hint.outerHeight() + "px",
                    left: left + width / 2 - $hint.outerWidth() / 2 + "px"
                });
                break;
            case "center":
                $hint.css({
                    top: top + height / 2 - $hint.outerHeight() / 2 + "px",
                    left: left + width / 2 - $hint.outerWidth() / 2 + "px"
                });
                break;
            default: // bottom
                $hint.css({
                    top: top + height + opts.barrier + opts.stick + "px",
                    left: left + width / 2 - $hint.outerWidth() / 2 + "px"
                });
        }

        // position pointer

        var $pointer=$hint.data("pointer");

        switch (position) {
            case "left":
                $pointer.css({
                    top: top,
                    left: left - opts.stick - opts.barrier + "px",
                    width: opts.stick + "px",
                    height: height
                }).addClass("helphud-pointer-left");
                break;
            case "right":
                $pointer.css({
                    top: top,
                    left: left + width + opts.barrier + "px",
                    width: opts.stick + "px",
                    height: height
                }).addClass("helphud-pointer-right");
                break;
            case "top":
                $pointer.css({
                    top: top - opts.stick - opts.barrier + "px",
                    left: left + "px",
                    width: width + "px",
                    height: opts.stick + "px"
                }).addClass("helphud-pointer-top");
                break;
            case "center":
                $pointer.remove();
                break;
            default: // bottom
                $pointer.css({
                    top: top + height + opts.barrier + "px",
                    left: left + "px",
                    width: width + "px",
                    height: opts.stick + "px"
                }).addClass("helphud-pointer-bottom");
        }
        
    }

    function position($overlay) {
        $overlay.height(Math.max($(document).height(), $(window).height()));
        positionMask($overlay);
        $overlay.find("div.helphud-tooltip").each(function() { positionHint($(this)); });
        positionMore($overlay);
    }

    var build = function () {
        var trigger = document.activeElement;
        var $body = $("body");
        var $container = this;

        // filter duplicate data-intro values

        var selectors = [];
        $(this).find('*[data-intro]:visible').each(function() {
            var intro = $(this).attr('data-intro');
            var selector = "*[data-intro=\""+intro+"\"]:visible:first";
            if($.inArray(selector, selectors) < 0) {
                selectors.push(selector);
            }
        });
        var $elements = selectors.length > 0 ? $container.find(selectors.join(',')) : $container.find('*[data-intro]:visible');

        // build the div that will contain helphud hints and mask

        var $overlay = $("<div class='helphud-overlay'></div>");
        $overlay.data("container", $container);
        $overlay.data("elements", $elements);
        $overlay.data("trigger", trigger);
        $body.append($overlay);

        $overlay.on("click", function (e) {
            var $target = $(e.target);
            var $layers = $target.add($target.parentsUntil(".helphud-overlay"));

            var more;
            $layers.each(function () {
                more = $(this).data("more");
                return more === undefined;
            });

            if (more) {
                showMore(more);
                e.preventDefault();
                return;
            }

            var moreClose = false;
            $layers.each(function () {
                moreClose = $(this).hasClass("helphud-more-close");
                return moreClose === false;
            });

            if (moreClose) {
                hideMore();
                e.preventDefault();
                return;
            }

            var keep = ($target.hasClass("helphud-ignore") ||
                $target.parents(".helphud-ignore").length > 0 ||
                $target.hasClass("helphud-more-container") ||
                $target.parents(".helphud-more-container").length > 0 ||
                $target.hasClass("helphud-more-mask"));

            if (keep === false) {
                hide();
            }
        });
        
        $overlay.on("keydown", trapTab($overlay));
        $overlay.on("keydown", function(e) {
            if (e.which === 27) { // esc
                hide();
                e.stopPropagation();
                e.preventDefault();
            }
        });

        // build hints

        $elements.each(function () {

            var $element = $(this);
            var position = $element.data("position") || "bottom";

            // build hint

            var content = $element.data("intro");

            var hintId = "";
            if (content.length > 0 && content.charAt(0) === '#') {
                hintId = " "+content.substring(1);
            }
            
            var $hint = $("<div tabindex='0' class='helphud-tooltip"+hintId+"' style='left:-10000px'></div>");
            $hint.data("element", $element);
            $hint.data("position", position);

            if (content.length > 0 && content.charAt(0) === '#') {
                $(content).contents().each(function () {
                    $hint.append(this);
                });
                $hint.data("from", content);
            } else {
                $hint.html($element.data("intro"));
            }

            $overlay.append($hint); // add to dom before positioning so it can autosize

            // build pointer
            var $pointer = $("<div class='helphud-pointer' ></div>");
            $overlay.append($pointer);
            $hint.data("pointer", $pointer);
        });

        // show panels

        $container.find(".helphud-panel").each(function () {
            var $panel = $(this);
            if ($panel.parent().is(":visible")) {
                var $marker = $("<div class='helphud-marker'></div>");
                $(this).data("marker", $marker).before($marker).appendTo($overlay).toggle(true);
            }
        });

        position($overlay);

        initFocus($overlay);

        // handle window resizing and scrolling
        $(window)
            .on("resize.helphud", throttle(50, function() { position($overlay); }))
            .on("scroll.helphud", throttle(50, function() { position($overlay); }));
    };


    // jquery bridge

    var methods = { show: show, hide: hide };

    $.fn.helphud = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.helphud');
        }
    };
})(jQuery, document, window);
