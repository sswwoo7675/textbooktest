$(function(){
	"use strict";

	var $dragItem = $('.drag-fix');
	var $dropBox = $('.drop-fix');

	$dragItem.on('touchmove',function(event){
		event.preventDefault();
		event.stopPropagation();
	});

	$dragItem.draggable({
		helper: 'clone',
		scope: 'fbox',
		revertDuration: 0,
		start: function(){
			$(this).addClass('dragging');
		},
		stop: function(){
			$(this).removeClass('dragging');
		}
	});

	$dropBox.droppable({
		accept: '.drag-fix',
		scope: 'fbox',
		drop: function(e, ui){
			var $dropItem = $(this);
			var $dragItem = $(ui.draggable);
			var $dragdrop = $dropItem.closest('.dragdrop');
			var dragChance = $dragItem.data('chance') || $dragItem.attr('data-drop-count')*1;
			var dropChance = $dropItem.data('chance');

			if($dragItem.data('drop') === $dropItem.data('drop')){
				audioPlay('correct');
				$dropItem.append(ui.draggable.html());
				$dragItem.addClass('dropped');

				(dragChance === 1 || !dragChance) && $dragItem.draggable('option', 'disabled', true);

				// (!dropChance || $dropItem.children().not('[data-invisible]').length === dropChance) && $dropItem.droppable('option', 'disabled', true);

				dragChance && $dragItem.data('chance', --dragChance);

				if($dragdrop.find('.drag-fix.ui-draggable-disabled').length){
					$dragdrop.addClass('drop-start');
					dragFixStart.themeFn();
				}
				if($dragdrop.find('.drag-fix').length-1 === $dragdrop.find('.drag-fix.dropped').length ) {
					$dragdrop.addClass('drop-end');
					dragFixEnd.themeFn();
				}
			} else {
				audioPlay('wrong');
			}
		}
    });
});

var dragFixStart = {themeFn : function(){}}
var dragFixEnd = {themeFn : function(){}}