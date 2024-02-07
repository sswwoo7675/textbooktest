$(function(){
	"use strict";

	var $dragItems = $('.drag-item');
	var $dropBox = $('.drop-item');

	$dragItems.on('touchmove',function(event){
		event.preventDefault();
		event.stopPropagation();
	});

	$dragItems.draggable({
		helper: 'clone',
		scope: 'box',
		start: function(){
			$(this).addClass('dragging');
		},
		stop: function(){
			$(this).removeClass('dragging');
		}
	});

	$dropBox.droppable({
		accept: '.drag-item',
		scope: 'box',
		drop: function(e, ui){
			var $t = $(this);
			var $dragItem = $(ui.draggable);
			var $dragdrop = $t.closest('.dragdrop');
			var dragChance = $dragItem.data('chance') || $dragItem.attr('data-chance');
			var dropChance = $t.data('chance');
			var prop = false;

			if(prop){
				return;
			}

			if (!dropChance) { // 여러개 드롭이 아니면 밀어내기 가능
				if($dragItem.parent()[0] !== this && $t.find('.drag-item').length){
					var $before = $t.find('.drag-item'),
						$beforeDrag = $dragItems.filter(function(){
							return $(this).closest($before.data('root')[0]).length;
						}).eq($before.data('index')),
						beforeDragChance = $beforeDrag.data('chance');

					$beforeDrag.draggable('option', 'disabled', false);
					$beforeDrag.attr('data-chance') && $beforeDrag.data('chance', beforeDragChance+1);
					$before.remove();
					$t.prev().val('');
					$t.prev().prop('checked', false);
				}
			}

			if($dragItem.hasClass('drag-item-clone')){
				$dragItem.parent().droppable('option', 'disabled', false).removeClass('dropped');
				$t.append(ui.draggable);
				$dragItem.css({top: 0, left: 0}).draggable();
			}else{
				var newDrag = ui.draggable.clone();
				var dragRoot = $dragItem.closest('.drag-area');
				var index = dragRoot.find('.drag-item').index($dragItem);

				(dragChance === 1 || !dragChance) && $dragItem.draggable('option', 'disabled', true);
				newDrag.removeClass('dragging ui-draggable-disabled').addClass('drag-item-clone').data({
					'index': index,
					'root': dragRoot
				}).draggable({
					scope: 'box',
					revert: true,
					revertDuration: 0
				}).on('touchmove',function(event){
					event.preventDefault();
					event.stopPropagation();
				})
				dragChance && $dragItem.data('chance', --dragChance);
			}

			(dropChance && $t.children().not('[data-invisible]').length === dropChance) && $t.droppable('option', 'disabled', true);

			$t.append(newDrag).addClass('dropped');

			if($dragdrop.find('.drag-item.ui-draggable-disabled').length){
				$dragdrop.addClass('drop-start');
				dragFncStart.themeFn();
			}
			
			if($dragdrop.find('.drop-item.dropped').length === $dragdrop.find('.drop-item').length ) {
				$dragdrop.addClass('drop-end');
				var isCorrect;
				
				$dragdrop.find('.drop-area').addClass('disabled');
				$dragdrop.find('.drop-item').each(function(){
					var thisdrop = $(this).data('drop') ;
					var childdrop = $(this).find('.drag-item').data('drop') ;
					if(thisdrop !== childdrop){
						isCorrect = false;
						return false;
					} else {
						isCorrect = true;
					}
				})
				
				if(!isCorrect) {
					audioPlay('wrong');
					showMsg('#modal-alert', '<i class="char ai-wrong"></i>다시 해 보아요.');
					setTimeout(function(){
						$dragdrop.find('[drop-refresh]').click();
					}, 500)
				} else {
					audioPlay('correct');
					showMsg('#modal-alert', '<i class="char"></i>정답이에요.');
				}
				dragFncEnd.themeFn();
			}
		}
    });
});

var dragFncStart = {themeFn : function(){}}
var dragFncEnd = {themeFn : function(){}}