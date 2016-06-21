(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }
        
        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            head.appendChild(style);
        } else if (style.styleSheet) { // for IE8 and below
            head.appendChild(style);
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            head.appendChild(style);
        }
    }
};

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var css_node = require('./intTooltip.min.css');

$(window).on('resize.intTooltip', function () {
	IntTooltip.closeAll();
}).unbind('keydown.intTooltip').on('keydown.intTooltip', function (e) {
	if (e.keyCode === 27) {
		IntTooltip.closeAll();
	}
});

var IntTooltip = {
	tooltips: {},
	bindButton: function bindButton(btn, conf) {
		var _this = this;

		btn = typeof btn === 'string' ? $(btn) : btn;
		btn.click(function () {
			_this.openTooltip(btn, conf);
		});
	},
	openTooltip: function openTooltip(at_obj, conf) {
		conf = conf || {};
		if (typeof conf === 'string') {
			conf = { html: conf };
		}
		conf.id = conf.id || 'default';
		var tooltip = new Tooltip(at_obj, conf);
		if (IntTooltip.tooltips[conf.id]) {
			IntTooltip.tooltips[conf.id].close();
		}
		IntTooltip.tooltips[conf.id] = tooltip;
		return tooltip;
	},
	closeAll: function closeAll() {
		var tooltips = IntTooltip.tooltips;
		for (var i in tooltips) {
			if (tooltips.hasOwnProperty(i)) {
				tooltips[i].close();
			}
			delete tooltips[i];
		}
	}
};
IntTooltip.open = IntTooltip.openTooltip;

/**
 * A class for a single tooltip that appears at a specified object.
 */

var Tooltip = function () {
	/**
  * Constructs a Tooltip instance.
  * @param  {object} $target - jQuery selection of element the tooltip will appear at.
  * @param  {object} conf - Options dictionary.
  * @param  {number} conf.interval - In case the $target position changes, the tooltip will poll
  * its position and reposition itself as needed. This option specifies the frequency of the poll.
  * Default: 1000 (milliseconds).
  * @param  {string} conf.id - A unique identifier for this tooltip. If this tooltip created via IntTooltip.open,
  * any tooltip on the page with this id will be closed first. By passing different IDs, you can have multiple
  * tooltips open on a single page.
  * @param	 {string} conf.html - HTML to display in the tooltip.
  * @param  {string} conf.position - The direction in which the tooltip is preferred to appear relative
  * to the $target. Options: 'top', 'right', 'bottom', and 'left'. Default: 'bottom'.
  * @return {object} - This Tooltip instance.
  */

	function Tooltip($target) {
		var _this2 = this;

		var conf = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, Tooltip);

		this.$target = $target;
		this.conf = conf;
		this.conf.position = this.conf.position || 'bottom';
		this.$triangle = $('<div class="arrow">').appendTo('body');
		this.$container = $('<div>').addClass('intTooltip').html('\n\t\t\t\t\t<div class="intTooltip-inner">\n\t\t\t\t\t\t<div class="intTooltip-contents">\n\t\t\t\t\t\t<div class="btn-ex">&#215;</div>\n\t\t\t\t\t\t' + this.conf.html + '\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t').appendTo('body');
		if (this.conf.id) {
			this.$container.addClass('intTooltip-' + this.conf.id);
		}
		this.$container.find('.btn-ex').click(function () {
			_this2.close();
		});
		this.reposition();
		if (this.interval !== false) {
			this.interval = setInterval(function () {
				_this2.reposition();
			}, this.interval || 1000);
		}
		return this;
	}

	_createClass(Tooltip, [{
		key: 'reposition',
		value: function reposition() {
			this.smartPosition(this.conf.position);
		}
		/**
   * Try to position the tooltip in every direction, starting with the preferred direction.
   * A direction fails if some of the tooltip is off-screen.
   * @param  {string} preference - A direction, i.e. 'top', 'right', 'bottom', or 'left'.
   * @return {null}
   */

	}, {
		key: 'smartPosition',
		value: function smartPosition(preference) {
			var coords = Tooltip.getCoords(this.$target);
			// create an array of possible directions in which the tooltip can be printed
			var psts = ['bottom', 'right', 'left', 'top'];
			// put the preferenced direction at the head of the array
			if (preference) {
				psts.splice(psts.indexOf(preference), 1);
				psts = [preference].concat(psts);
			}
			// try each direction in the array in turn
			var positioned = false;
			for (var i = 0; i < psts.length; i++) {
				this.position(psts[i], coords);
				positioned = this.checkPosition();
				// if successfully positioned, stop
				if (positioned) {
					break;
				} else {
					this.close();
				}
			}
			// if all positions failed, set to the preferenced position
			if (!positioned) {
				this.position(psts[0], coords);
			}
		}
		/**
   * Returns true if this tooltip fits on the page.
   * @return {boolean}
   */

	}, {
		key: 'checkPosition',
		value: function checkPosition() {
			var coords = Tooltip.getCoords(this.$container);
			return coords.x1 > 0 && coords.x2 < $(document).width() && coords.y1 > 0 && coords.y2 < $(document).height();
		}
		/**
   *
   * @typedef CoordinateDescriptor
   * @type Object
   * @property {number} x1
   * @property {number} x2
   * @property {number} y1
   * @property {number} y2
   * @property {number} cx - Center x coordinate
   * @property {number} cy - Center y coordinate
   *
   * For any jQuery selection, return an object describing its document coordinates.
   * @param  {object} $target
   * @return {CoordinateDescriptor}
   */

	}, {
		key: 'position',

		/**
   * Position the tooltip at a direction around an object with coords
   * @param  {string} direction - Direction to print the tooltip relative to the coords.
   * @param  {object} coords - Coords of the target element. See CoordinateDescriptor.
   * @return {null}
   */
		value: function position(direction, coords) {

			// Get the "anchor" for the tooltip. That's a left-top document coordinate that determines where
			// the tooltip will appear.
			var anchor = {};
			switch (direction) {
				case 'top':
					anchor.x = coords.cx;
					anchor.y = coords.y1;
					break;
				case 'right':
					anchor.x = coords.x2;
					anchor.y = coords.cy;
					break;
				case 'bottom':
					anchor.x = coords.cx;
					anchor.y = coords.y2;
					break;
				case 'left':
					anchor.x = coords.x1;
					anchor.y = coords.cy;
			}

			var classname = undefined;
			var css = {};
			switch (direction) {
				case 'top':
					css.left = anchor.x;
					css.bottom = $(document).height() - anchor.y;
					css.transform = 'translateX(-50%)';
					classname = 'arrow-down';
					break;
				case 'right':
					css.left = anchor.x;
					css.top = anchor.y;
					css.transform = 'translateY(-50%)';
					classname = 'arrow-left';
					break;
				case 'bottom':
					css.top = anchor.y, css.left = anchor.x;
					css.transform = 'translateX(-50%)';
					classname = 'arrow-up';
					break;
				case 'left':
					css.right = $(document).width() - anchor.x;
					css.top = anchor.y;
					css.transform = 'translateY(-50%)';
					classname = 'arrow-right';
					break;
			}
			this.$triangle.removeClass('arrow-down arrow-left arrow-up arrow-right').addClass(classname).css(css);

			this.$container.css(css).css('margin-' + direction, 15);
		}
		/**
   * Closes this tooltip, removing its elements.
   * @return {null}
   */

	}, {
		key: 'close',
		value: function close() {
			if (this.$container) {
				this.$container.remove();
			}
			if (this.$triangle) {
				this.$triangle.remove();
			}
			if (this.conf.onClose) {
				this.conf.onClose();
			}
			clearInterval(this.interval);
		}
	}], [{
		key: 'getCoords',
		value: function getCoords($target) {
			var off = $target.offset();
			return {
				x1: off.left,
				x2: off.left + $target.outerWidth(),
				cx: off.left + $target.outerWidth() / 2,
				y1: off.top,
				y2: off.top + $target.outerHeight(),
				cy: off.top + $target.outerHeight() / 2
			};
		}
	}]);

	return Tooltip;
}();

module.exports = IntTooltip;

},{"./intTooltip.min.css":3}],3:[function(require,module,exports){
var css = ".arrow {\n  position: absolute;\n}\n.arrow-up {\n  width: 0;\n  height: 0;\n  border-left: 10px solid transparent;\n  border-right: 10px solid transparent;\n  border-bottom: 10px solid #bfbfbf;\n}\n.arrow-down {\n  width: 0;\n  height: 0;\n  border-left: 10px solid transparent;\n  border-right: 10px solid transparent;\n  border-top: 10px solid #bfbfbf;\n}\n.arrow-right {\n  width: 0;\n  height: 0;\n  border-top: 10px solid transparent;\n  border-bottom: 10px solid transparent;\n  border-left: 10px solid #bfbfbf;\n}\n.arrow-left {\n  width: 0;\n  height: 0;\n  border-top: 10px solid transparent;\n  border-bottom: 10px solid transparent;\n  border-right: 10px solid #bfbfbf;\n}\n.intTooltip {\n  max-width: 300px;\n  position: absolute;\n  padding: 10px;\n}\n.intTooltip-inner {\n  background-color: white;\n  border: 1px solid #bfbfbf;\n  position: relative;\n  padding: 1em;\n  box-shadow: 5px 5px 5px rgba(0,0,0,0.05);\n}\n.btn-ex {\n  position: absolute;\n  top: 0px;\n  right: 3px;\n  line-height: 100%;\n  color: gray;\n  cursor: pointer;\n}\n.btn-ex:hover {\n  color: black;\n}\n"; (require("browserify-css").createStyle(css, { "href": "intTooltip.min.css"})); module.exports = css;
},{"browserify-css":1}],4:[function(require,module,exports){
'use strict';

$(function () {
  var IntTooltip = require('./../intTooltip.js');

  // positional testss
  $('.positional button').click(function () {
    IntTooltip.openTooltip($(this), {
      html: $(this).attr('id'),
      position: $(this).attr('id')
    });
  });

  // multiple tooltips test
  IntTooltip.bindButton('#group1', {
    html: 'Group 1',
    id: 'group1'
  });
  IntTooltip.bindButton('#group2', {
    html: 'Group 2',
    id: 'group2'
  });
});

},{"./../intTooltip.js":2}]},{},[4]);
