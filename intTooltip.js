const css_node = require('./intTooltip.min.css');

$(window)
	.on('resize.intTooltip', ()=>{
		IntTooltip.closeAll();
	})
	.unbind('keydown.intTooltip')
	.on('keydown.intTooltip', (e)=>{
		if(e.keyCode === 27){
			IntTooltip.closeAll();
		}
	});

const IntTooltip = {
	tooltips: {},
	bindButton: function(btn, conf){
		btn = typeof btn === 'string' ? $(btn) : btn;
		btn.click(()=>{
			this.openTooltip(btn, conf);
		});
	},
	openTooltip: function($at_obj, conf){
		conf = conf || {};
		if(typeof conf === 'string'){
			conf = {html: conf};
		}
		conf.id = conf.id || 'default';
		const tooltip = new Tooltip($at_obj, conf);
		if(IntTooltip.tooltips[conf.id]){
			IntTooltip.tooltips[conf.id].close();
		}
		IntTooltip.tooltips[conf.id] = tooltip;
		return tooltip;
	},
	closeAll:function(){
		const tooltips = IntTooltip.tooltips;
		for(var i in tooltips){
			if(tooltips.hasOwnProperty(i)){
				tooltips[i].close();
			}
			delete tooltips[i];
		}
	},
	Tooltip: Tooltip
};
IntTooltip.open = IntTooltip.openTooltip;

/**
 * A class for a single tooltip that appears at a specified object.
 */
class Tooltip{
	/**
	 * Constructs a Tooltip instance.
	 * @param  {object|array} $target - jQuery selection of element the tooltip will appear at.
	 *                                Or an array of coordinates.
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
	 * @param  {boolean} conf.clickout - If true, clicking outside the tooltip will close it. Default: false.
	 * @return {object} - This Tooltip instance.
	 */
	constructor($target, conf = {}){
		this.$target = typeof $target === 'string' ? $($target) : $target;
		this.conf = conf;
		this.conf.position = this.conf.position || 'bottom';
		this.$triangle = $('<div class="intTooltip-arrow">')
			.appendTo('body');
		this.$container = $('<div>')
			.addClass('intTooltip')
			.html(`
					<div class="intTooltip-inner">
						<div class="intTooltip-contents">
						<div class="btn-ex">&#215;</div>
						${this.conf.html}
						</div>
					</div>
			`)
			.appendTo('body');
		if(this.conf.id){
			this.$container.addClass('intTooltip-' + this.conf.id);
		}
		this.$container.find('.btn-ex').click(()=>{
			this.close();
		});
		this.reposition();
		if(this.conf.interval !== false){
			this.interval = setInterval(()=>{
				this.reposition();
			}, this.conf.interval || 1000);
		}
		setTimeout(()=>{
			if(this.conf.clickout){
				$(window).on('click.intTooltip-clickout-' + this.conf.id, (e)=>{
					if(e.target === this.$container.get(0)){
						return;
					}
					if($(e.target).closest('.intTooltip').get(0) === this.$container.get(0)){
						return;
					}
					else{
						this.close();
					}
				});
			}
		}, 1);
		return this;
	}
	reposition(){
		this.smartPosition(this.conf.position);
	}
	/**
	 * Try to position the tooltip in every direction, starting with the preferred direction.
	 * A direction fails if some of the tooltip is off-screen.
	 * @param  {string} preference - A direction, i.e. 'top', 'right', 'bottom', or 'left'.
	 * @return {null}
	 */
	smartPosition(preference){
		const coords = Tooltip.getCoords(this.$target);
		// create an array of possible directions in which the tooltip can be printed
		let psts = ['bottom', 'right', 'left', 'top'];
		// put the preferenced direction at the head of the array
		if(preference){
			psts.splice(psts.indexOf(preference), 1);
			psts = [preference].concat(psts);
		}
		// try each direction in the array in turn
		let positioned = false;
		for(let i=0; i<psts.length; i++){
			this.position(psts[i], coords);
			positioned = this.checkPosition();
			// if successfully positioned, stop
			if(positioned){
				break;
			}
		}
		// if all positions failed, set to the preferenced position
		if(!positioned){
			this.position(psts[0], coords);
		}
	}
	/**
	 * Returns true if this tooltip fits on the page.
	 * @return {boolean}
	 */
	checkPosition(){
		const coords = Tooltip.getCoords(this.$container);
		return coords.x1 > 0 &&
			coords.x2 < $(document).width() &&
			coords.y1 > 0 &&
			coords.y2 < $(document).height();
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
	static getCoords($target){
		console.log($target);
		if(($target instanceof jQuery) === false){
			return {
				x1: $target.x,
				x2: $target.x,
				cx: $target.x,
				y1: $target.y,
				y2: $target.y,
				cy: $target.y
			};
		}
		const off = $target.offset();
		return {
			x1: off.left,
			x2: off.left + $target.outerWidth(),
			cx: off.left + $target.outerWidth() / 2,
			y1: off.top,
			y2: off.top + $target.outerHeight(),
			cy: off.top + $target.outerHeight() / 2
		};
	}
	/**
	 * Position the tooltip at a direction around an object with coords
	 * @param  {string} direction - Direction to print the tooltip relative to the coords.
	 * @param  {object} coords - Coords of the target element. See CoordinateDescriptor.
	 * @return {null}
	 */
	position(direction, coords){

		if(this.last_coords){
			let coord_change;
			for(let key in coords){
				if(coords[key] !== this.last_coords[key]){
					coord_change = true;
					break;
				}
			}
			if((!coord_change) && this.last_direction === direction){
				return;
			}
		}

		// Get the "anchor" for the tooltip. That's a left-top document coordinate that determines where
		// the tooltip will appear.
		const anchor = {};
		switch(direction){
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

		let classname;
		const css = {};
		switch(direction){
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
				classname  = 'arrow-left';
				break;
			case 'bottom':
				css.top = anchor.y,
				css.left = anchor.x;
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

		this.$triangle
			.removeClass('arrow-down arrow-left arrow-up arrow-right')
			.addClass(classname)
			.css(css);

		this.$container
			.css(css)
			.css('margin-' + direction, 15);

		this.last_direction = direction;
		this.last_coords = coords;
	}
	/**
	 * Closes this tooltip, removing its elements.
	 * @return {null}
	 */
	close(){
		if(this.$container){
			this.$container.remove();
		}
		if(this.$triangle){
			this.$triangle.remove();
		}
		if(this.conf.onClose){
			this.conf.onClose();
		}
		$(window).unbind('click.intTooltip-clickout-' + this.conf.id);
		clearInterval(this.interval);
	}
}

module.exports = IntTooltip;
