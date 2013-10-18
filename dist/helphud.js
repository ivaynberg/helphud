(function ($, window) {

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

    var hide = function () {
        $(window).off("resize.helphud");
        $(".helphud-mask,.helphud-pointer,.helphud-tooltip,.helphud-overlay").remove();
    };

    var show = function () {
        var opts = {
            margin: 3,
            stick: 30,
            barrier: 5
        };

        var $body = $("body");

        var $container = this;

        var plane = new Plane($container);

        var $elements = $container.find('*[data-intro]');

        // build the mask geometry

        $elements.each(function () {
            plane.subtract(new Rect($(this)).explode(opts.margin));
        });

        // add the mask into dom

        plane.each(function (r) {
            var e = $("<div class='helphud-mask'></div>");
            e.css({
                left: r.left,
                top: r.top,
                width: r.width,
                height: r.height
            });
            $body.append(e);
        });

        // build the pointers and tooltips

        $elements.each(function () {

            var $element = $(this);
            var offset = $element.offset();
            var left = offset.left - opts.margin;
            var top = offset.top - opts.margin;
            var width = $element.outerWidth() + opts.margin * 2;
            var height = $element.outerHeight() + opts.margin * 2;
            var position = $element.data("position") || "bottom";

            // build the pointer

            var $pointer = $("<div class='helphud-pointer' ></div>");

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
                default:
                    $pointer.css({
                        top: top + height + opts.barrier + "px",
                        left: left + "px",
                        width: width + "px",
                        height: opts.stick + "px"
                    }).addClass("helphud-pointer-bottom");
            }

            $body.append($pointer);

            // build the tooltip

            var $text = $("<div class='helphud-tooltip' style='left:-10000px'></div>");
            $text.html($e.data("intro"));

            $body.append($text); // add to dom before positioning so it can autosize

            switch (position) {
                case "left":
                    $text.css({
                        top: top + height / 2 - $text.outerHeight() / 2 + "px",
                        left: left - opts.barrier - opts.stick - $text.outerWidth() + "px"
                    });
                    break;
                case "right":
                    $text.css({
                        top: top + height / 2 - $text.outerHeight() / 2 + "px",
                        left: left + width + opts.barrier + opts.stick + "px"
                    });
                    break;
                case "top":
                    $text.css({
                        top: top - opts.barrier - opts.stick - $text.outerHeight() + "px",
                        left: left + width / 2 - $text.outerWidth() / 2 + "px"
                    });
                    break;
                default:
                    $text.css({
                        top: top + height + opts.barrier + opts.stick + "px",
                        left: left + width / 2 - $text.outerWidth() / 2 + "px"
                    });
            }
        });

        // build the overlay

        var overlay = $("<div class='helphud-overlay'></div>");
        overlay.on("click", hide);
        $body.append(overlay);

        $(window).on("resize.helphud", function () {
            hide();
            show.apply($container);
        });
    };

    // jquery bridge

    var methods = { show: show, hide: hide };

    $.fn.helphud = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.modalize');
        }
    };
})(jQuery, window);
