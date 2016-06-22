$(function(){
  const IntTooltip = require('./../intTooltip.js');

  // positional testss
  $('.positional button').click(function(){
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
    id: 'group2',
  });
  IntTooltip.bindButton('#clickout', {
    html: 'If you click outside this box, the Tooltip should close',
    clickout: true
  });

});
