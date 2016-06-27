$(function(){
  const IntTooltip = require('./../intTooltip.js');

  // positional tests
  $('.positional button').click(function(){
    IntTooltip.openTooltip($(this), {
      html: $(this).attr('id'),
      position: $(this).attr('id'),
      offset: 4,
      force: true
    });
  });

  // bounder test
  $('.bounder-test button').click(function(){
    IntTooltip.openTooltip($(this), {
      html: 'Test',
      offset: 4,
      interval: false,
      $bounder: $('.bounder')
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

  $('#coordinates').click(function(){
    const x = 100;
    const y = 100;
    $('#coord-x').val(x);
    $('#coord-y').val(y);
    IntTooltip.openTooltip({x, y}, {
      html: "Test"
    });
  });

});
