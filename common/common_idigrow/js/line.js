// 리사이즈 보정
var userAnswers = {};

function appZoom(){
	if(parent.ZOOMVALUE == undefined) {
		parent.ZOOMVALUE = 1;
	}
	return parent.ZOOMVALUE;
}
function offsetValue(value){
	return value/appZoom();
}

function qLine(o){
	"use strict";

	o = $('#'+o);
	var btn = '<button type="button" class="icon-btn icon-re refresh-line"><span class="sr-only">지우기</span></button>';
	var isMulti = o.hasClass('q-line-multi');

	if(isMulti){
		o.prev('.line-info').length ? o.prev('.line-info').append(btn) : o.before(btn);
	}else{
		o.after(btn);
	}

	o.prepend('<canvas id="canvas'+o.attr('id')+'" class="canvas" width="'+o.width()+'" height="'+o.height()+'"></canvas>').find('.q-line-btn').each(function(i){
		if(!$(this).attr('data-no')){
			$(this).attr('data-no',i+1);
		}
		$(this).attr('data-toggle','q-line').append('<button type="button" class="text-hide drawBtn">선택</button>');
	});


	function qLineInner(o){
		var canvas = document.getElementById(o.find('canvas').attr('id'));
		var ctx = canvas.getContext("2d");
		var btn = o.find('[data-toggle=q-line]');
		var sx, sy;
		var ex, ey;
		var drawing;
		var backup;
		var backupClear;
		var startGroup,startLine,endLine;
		var a = $(o.attr('data-target'));
		a.data('line','');
		var userValIs = o.children('input.q-userline').val();
		var userVal = userValIs ? userValIs.split(',') : [];

		let touchClientX, touchClientY, startBtn, endBtn, isDown;

		// 지우기
		a.find('.refresh-line').css('z-index','1').on('click touchstart',function(){
			a.data('line','');
			a.removeClass('answered a-checked');
			o.removeClass('drawing');
			o.find('.q-line-btn').removeClass('line-start line-done');
			ctx.clearRect(0,0,canvas.width,canvas.height);
			ctx.lineWidth = '2'
			ctx.strokeStyle = '#0042ff';
			backup='';
			backupClear='';
			$(a.find('[data-toggle=answer-line]')).removeClass('a-checked');
			o.find('input.q-userline').val('');
			userVal = [];
			userAnswers = {};
		});

		// 정답체크
		$(a.find('[data-toggle=answer-line]')).click(function(){
			var $t = $(this);
			var aD = a.attr('data-answer');
			var aL = a.data('line');
			var aLArray = aL.split(',').sort().toString();
			var chance = $t.attr('data-chance')*1,
				$target = $($t.attr('data-target')),
				isCorrect = (aD===aLArray),
				isTestType = $t.closest('.modal-test').length || $t.closest('.modal-test-blue').length,
				modal = this.dataset.modal,
				maxgroup = a.find('[data-group="'+a.data('max-group')+'"]');


			if((!isMulti && a.attr('data-answer').split(',').length > aL.split(',').length) || isMulti && maxgroup.length !== maxgroup.filter('.line-done').length){
				if($t.parent().hasClass('btn-chk-wrap')){
					showMsg($t.next('.bubble-alert'));
				}else{
					showMsg('#answerMsg');
				}
				return false;
			}

			if(chance){
				$target.data('chance') === undefined && $target.data('chance', chance);

				if(!isCorrect && $target.data('chance')){

					if($target.data('chance') ===  1 && chance === 2){
						$target.find('[data-answer="hint"]').length ? showMsg('#answerMsgHint') : showMsg('#answerMsgOnemore');
						$target.find('[data-answer="hint"]').show();
					}else{
						showMsg('#answerMsgOnemore');
					}

					$target.data('chance', $target.data('chance')-1);
					effectAudio.play('again');

					setTimeout(function(){
						$target.find('.refresh-line').trigger('click');
					},1000);

					return false;
				}
			}

			if(isCorrect || $target.data('chance') === 0){
				var answerTargetName;
				$target.find('[data-answer="hint"]').hide();

				if(!isCorrect){
					showMsg('#answerMsgCheck');
					answerTargetName = '.answer-btn-wrong';
				}else{
					showMsg('#answerMsgGood');
					!$t.parent().hasClass('btn-chk-wrap') && effectAudio.play('correct');
					answerTargetName = '.answer-btn';
				}

				if(isTestType){
					$target.find('[class^=answer-btn]').addClass('hide');

					!$target.find(answerTargetName).length && (answerTargetName = '.answer-btn');

					$target.find(answerTargetName).removeClass('hide');
					showMsg($target.find(answerTargetName).find('.bubble-alert'), 3000, true);
				}else{
					showMsg($target.find('.answer-btn').find('.bubble-alert'), 3000, true);
				}

				if(modal){
					$(modal).show(0, function  () {
						$(modal).addClass('modal-open');
					});
				}
			}

			$t.addClass('a-checked');
			a.addClass('answered');

			// 데이터 전송
			var $itemObject = $target.find('assessmentItem'),
				userVal=[],
				userDesc = $('h1:first').text(),
				userNum = $itemObject.find('.question .num').text();

			if(!$itemObject.length) return false;

			if($itemObject.closest('.modal').length){
				userDesc = $itemObject.closest('.modal').find('h2').text();
			}

			if($target.find('.q-line-both').length){
				var rework = [];
				o.find('[data-way]').each(function(i, way){
					var obj = {};
					var arr = [];
					$(this).find('[data-no]').each(function(j, ele){
						arr.push(ele.dataset.no);
					});

					obj[way.dataset.way] = arr;
					rework.push(obj);
				});

				rework.forEach((item, i) => {
					for (var val in item) {
						rework[i][val].forEach((item, i) => {
							aLArray = aLArray.replace(item, val);
						});
					}
				});

				var chars = aLArray.split(',');
				var aLArrayNew = [];

				rework.forEach((item, i) => {
					var txt = chars.reduce(function(tot,cv){
						if(cv.indexOf(Object.keys(item)[0]) === 0){
							return tot+cv.replace(Object.keys(item)[0], '');
						}else if (cv.indexOf(Object.keys(item)[0]) > 0) {
							return tot.indexOf('-') === 0 ? cv+tot : tot+cv;
 						}else{
							return tot;
						}
					},'');

					aLArrayNew.push(txt);
				});

				aLArray = aLArrayNew.join(',');
			}

			DTCaliperSensor.fire({
				correct: isCorrect,
				itemObject: $itemObject[0],
				value: $target.find('correctResponse .sr-only').text().replace(/[\n\t\r]/g,''),
				userValue: aLArray,
				description: userDesc+' '+userNum,
				pageNumber: $('#num').text()
			});
		});

		// 클릭한 곳의 라인을 지움
		function removeClickLine(answer) {console.log("ddddddddd", answer)
			answer += '';
			ctx.clearRect(0,0,canvas.width,canvas.height);
			var i = 0;

			for (var i = 0; i < userAnswers.length; i++) {
				if (userAnswers[i].isVisible) {
					drawLinePath(userAnswers[i]);
				}
			}

			for (var variable in userAnswers) {
				if(variable.split('-')[0] === answer || variable.split('-')[1] === answer){
					var vbtn = variable.split('-');
					vbtn.forEach(function(item, i){
						o.find('[data-no="'+item+'"]').removeClass('line-done');
					});
					delete userAnswers[variable];
					userVal.splice(i,1);
				}else{
					var arr = userAnswers[variable];
					drawLinePath(arr[0],arr[1],arr[2],arr[3]);
				}
				i++;
			}
			a.data('line', userVal.join(','));
			o.children('input.q-userline').val(userVal.join(','));

			!userVal.join(',') && a.find('.solution').removeClass('visible');
		}

		// 라인다시그리기
		function redrawLines() {
			for (var key in userAnswers) {
                drawLinePath(...userAnswers[key]);
            }
		}

		// 라인을 그리는 함수
		function drawLinePath(sx,sy,ex,ey) {
			ctx.beginPath();
			ctx.moveTo(sx, sy);
			ctx.lineTo(ex, ey);
			ctx.lineWidth = '4';
			ctx.strokeStyle = '#002FD4';
			ctx.stroke();
			ctx.closePath();
		}

		o.on('mousedown touchstart', function(e) {
			e.preventDefault();

            if (!e.target.className.includes('drawBtn') || !o.hasClass('make-end')) return;

            isDown = true;
            drawing = true;
            o.addClass('drawing');

            let t;
            var drawBtn = $(e.target);
            startBtn = drawBtn;

            if (drawBtn.closest('.q-line-btn').length) {
                t = drawBtn.closest('.q-line-btn');
            } else return;

            if(t.hasClass('line-done') && !isMulti){
                removeClickLine(t.data('no'));
            }

            t.addClass('line-start');

            startGroup = t.data('group');
            startLine = t.data('no');

            // 버튼의 정중앙을 시작 좌표로 설정
            sx = offsetValue(drawBtn.offset().left-o.offset().left) + drawBtn.width() / 2;
            backup = ctx.getImageData(0, 0, canvas.width, canvas.height);
            sy = offsetValue(drawBtn.offset().top-o.offset().top) + drawBtn.height() / 2;
            backupClear = ctx.getImageData(0, 0, canvas.width, canvas.height);
        });

		o.on('mousemove touchmove', function(e) {
			e.preventDefault();

			if (e.touches) {
                e.target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
                touchClientX = e.touches[0].clientX;
                touchClientY = e.touches[0].clientY;
            }

            if (!isDown) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                redrawLines();
                if (e.touches) o.trigger('touchend');
                else o.trigger('mouseup');

                return false;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawLines();

            let event = e;

            // 마우스를 버튼 부분으로 이동했을 때
            if (e.target.className.includes('drawBtn')) {
                var drawBtn = $(e.target);
                var t = drawBtn.closest('.q-line-btn');
                if (e.touches) e = e.touches[0];
                // 다른 그룹에 있는 버튼일때만 그 버튼의 정중앙으로 위치시킴

                if (startGroup !== t.data('group')) {
                    ex = offsetValue(drawBtn.offset().left-o.offset().left) + drawBtn.width() / 2;
                    ey = offsetValue(drawBtn.offset().top-o.offset().top) + drawBtn.height() / 2;
                } else {
                    if (e.touches) event = e.touches[0];
                    ex = offsetValue(event.clientX-o.offset().left);
                    ey = offsetValue(event.clientY-o.offset().top);
                }
            } else {
                if (e.touches) event = e.touches[0];
                ex = offsetValue(event.clientX-o.offset().left);
                ey = offsetValue(event.clientY-o.offset().top);
            }
            drawLinePath(sx, sy, ex, ey);
			drawing = false;

            return false;
        });

		o.on('mouseup touchend', function(e) {
			e.stopPropagation();
    		e.preventDefault();

            if (e.touches) {
                e.target = document.elementFromPoint(touchClientX, touchClientY);
            }

            isDown = false;
			endBtn = $(e.target);
            let t = $(e.target).closest('.q-line-btn');
            endLine = t.data('no');

			function init(){
				o.find('[class*=line-start]').removeClass('line-start');
                o.removeClass('drawing no-touch');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                redrawLines();
			}


            if (drawing || !e.target.className.includes('drawBtn') || startGroup === t.data('group') || !t.is('[data-toggle=q-line]') || (t.hasClass('line-done') && !isMulti) || !o.find('[class*=line-start]').length || (t.attr('data-accept') && t.attr('data-accept') != startGroup)) {
                init();
                return;
            }

            let newAD = startLine + '-' + endLine;

			if(Number(startGroup) > Number(t.data('group'))){
				newAD =endLine+'-'+startLine;
			}

            if(a.data('line').indexOf(newAD)>-1 || (startGroup && startGroup===t.attr('data-group'))){
                o.find('[class*=line-start]').removeClass('line-start');
            }  else {
                if(a.data('line')==='') {
                    a.data('line',newAD);
                } else {
                    a.data('line',a.data('line')+','+newAD);
                }

				o.find('[class*=line-start]').addClass('line-done').removeClass('line-start');
				t.addClass('line-done');

                //a.find('.solution').addClass('visible');

                backupClear = ctx.getImageData(0, 0, canvas.width, canvas.height);
                userVal.push(newAD);
                o.children('input.q-userline').val(userVal);
                userAnswers[newAD] = [sx, sy, ex, ey];
            }


            drawing = false;
            o.removeClass('drawing no-touch');
        });

		setTimeout(function(){
			o.addClass('make-end');
		},0);
	}

	// 사용자 입력 값
	function userLine(o){
		if(!o.find('input.q-userline').val()){
			return false;
		}

		var canvas = document.getElementById(o.find('canvas').attr('id'));
		var ctx;
		canvas.width=o.width();
		canvas.height=o.height();
		ctx = canvas.getContext("2d");
		var aD = o.children('input.q-userline').val();
		$(o.attr('data-target')).data('line',aD);
		var aArray = aD.split(',');

		for(var i=0;i<aArray.length;i++){
			aD = aArray[i];
			var aO = o.find('[data-no='+aD.split('-')[0]+']').children('button');

			var aO2 = o.find('[data-no='+aD.split('-')[1]+']').children('button');
			var aX = offsetValue(aO.offset().left-o.offset().left) + aO.width() / 2;
			var aY = offsetValue(aO.offset().top-o.offset().top) + aO.height() / 2;
			var aX2 = offsetValue(aO2.offset().left-o.offset().left) + aO2.width() / 2;
			var aY2 = offsetValue(aO2.offset().top-o.offset().top) + aO2.height() / 2;

			ctx.beginPath();
			ctx.moveTo(aX,aY);
			ctx.lineTo(aX2,aY2);
			ctx.lineWidth = '4'
			ctx.strokeStyle = '#002FD4';
			ctx.stroke();
			ctx.closePath();

			userAnswers[aD] = [aX, aY, aX2, aY2];

			aO.closest('.q-line-btn').addClass('line-done');
			aO2.closest('.q-line-btn').addClass('line-done');
		}
	}

	// 실행
	var userAnswers = {};

	if(parent.API_ANNOTATION_LOAD){
		var interval = setInterval(function(){
			if(!$(top.document).find('#loading').is(':visible')){
				clearInterval(interval);
				qLineInner(o);
				userLine(o);
			}
		},100);
	}else{
		qLineInner(o);
		userLine(o);
	}
}
