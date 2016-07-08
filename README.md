# IntTooltip #

IntTooltip is a simple plug-and-play jQuery-based library for opening a tooltip on a page at a specified element. It is meant to be bundled with Browserify and bundles with CSS via the [Browserify-CSS](https://www.npmjs.com/package/browserify-css) transform.

Features:
* Tooltips poll their targets for changes in position or dimensions and automatically reposition themselves accordingly.
* Tooltips can contain asynchronously loaded content, such as images, and will still position themselves correctly.

**Warning**: Currently, IntTooltip assumes that jQuery is globally accessible via `$`.

## Example usage ##

```
const IntTooltip = require('int-tooltip');
const tooltip = IntTooltip.open('#some-button', {
  position: 'top',
  html: 'Hello world!',
  onClose: function(){
    console.log('closed!');
  }
});
```

## IntTooltip ##

### IntTooltip.open($target, opts) ###
Opens a tooltip around `$target` with `opts`. Closes all another tooltips unless `opts.id` is set.

- **$target**: jQuery selection. Required. The element around which the tooltip will appear.
- **opts**: Object. Optional. Configuration options for the tooltip. See `Tooltip.constructor` below.

Returns a tooltip instance. You can use this to append additional elements to the tooltip via `tooltip.$container`.


### IntTooltip.bindButton($selection, opts) ###
When the user clicks `$selection`, a tooltip with `opts` will open.


### IntTooltip.closeAll() ###
Closes all open tooltips. Executes if any tooltips are open and the user hits the `escape` key.

## Tooltip ##

### constructor($target, opts) ###

- **target**: jQuery selection. Required. The element around which the tooltip will appear.
- **opts**: Object. Optional. Configuration options.
- **opts.html**: String. HTML to print to the tooltip.- **opts.onClose**: Function. Fires when this tooltip is closed.
- **opts.position**: String. Optional. The preferred direction in which the tooltip will appear, relative to $target. Options: "top", "right", "bottom", "left". Defaults to "bottom". If part of the tooltip appears off-screen in this direction, it will try other directions.
- **opts.id**: String. Optional. A unique identifier for the tooltip. Defaults to `default`. If opened via `IntTooltip.open`, any tooltip that shares this ID will be closed first.
- **opts.interval**: Number or boolean. Optional. The frequency at which the tooltip should check the $target for a change in position or dimension. If `false`, no polling is conducted. Defaults to `1000`.
- **opts.clickout**: Boolean. Optional. If `true`, clicking outside the tooltip will close it. Default: `false`.

### close() ###
Closes this tooltip.

### reposition() ###
Repositions the tooltip.

## CSS ##

To override any CSS rules, simply examine `intTooltip.scss`.

## Testing ##

To test, run `npm run build-test`. Then, open `test/test.html` and visually check to the tooltip in all the test cases.
