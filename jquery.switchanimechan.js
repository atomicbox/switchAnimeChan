/*////////////////////////////////////////////////////////////////////
switchAnimeChan - jQuery plugin (ver.1.11.1)
http://www.jquery.com
Version: 1.1

Copyright 2014 atomicbox http://atomicbox.tank.jp/
Licensed under the Creative Commons Attribution 2.1 License
http://creativecommons.org/licenses/by-nc-nd/2.1/jp/
////////////////////////////////////////////////////////////////////*/
;(function($) {
	
	/* パラメータ定義：デフォルト値 */
	var defaults = {
			viewSelector: '#swchanViewArea',
			operationSelector: 'ul.operationbtn',
			imglist : [],
			animation : false,
			autoLoop : false,
			switchSec : 1000,
			frameRate : 1000,
			frameFadeTime : 300
	}

	var userAgent = window.navigator.userAgent.toLowerCase();
	var appVersion = window.navigator.appVersion.toLowerCase();
	
	$.fn.switchAnimeChan = function(options) {
		
		/* 内部パラメータ定義 */
		var self = this;
		var entity = {};	// スライドショーの内部設定やパラメータセット
		var loadCompleteFlg = false;
		var posAbslt = {
				'position' : 'absolute',
				'top' : 0,
				'left' : 0
			};
		var loadTimerID;
		var loopTimerID;
		var isIE = (userAgent.indexOf('msie') != -1) && ((appVersion.indexOf("msie 8.") != -1) || (appVersion.indexOf("msie 7.") != -1));

		/* function ::: 初期化コントロール */
		var initCtrl = function(){
			
			loadTimerID = setInterval(loadingCtrl, 500);

			entity.settings = $.extend({}, defaults, options);
			entity.view = self.find(entity.settings.viewSelector);
			entity.operationBtn = self.find(entity.settings.operationSelector);
			entity.settings.switchSec = getSlideAnimeTime();
			entity.slideImgList = [];

			entity.view.css('visibility','hidden');

			setupCtrl();
		}

		/* function ::: DOM・CSSセットアップコントロール */
		var setupCtrl = function(){
			
			// スライドユニット初期化
			for ( var j = 0; j < entity.settings.imglist.length; j++) {
				entity.view.append('<div class="sl"></div>');

				if (entity.settings.animation) {
					// アニメーション設定
					var tmpImg = [];
					for ( var i = entity.settings.imglist[j].length - 1; i >= 0; i--) {
						var img = createImage(j + 1, entity.settings.imglist[j][i]);
						tmpImg.push(img);
					}
					entity.slideImgList.push(tmpImg);
				} else {
					// 静止画像設定
					var img = createImage(j + 1, entity.settings.imglist[j]);
					entity.slideImgList.push(img);
				}
			}
			
			// スライドユニットCSS初期化
			entity.view.css({
				'position' : 'relative'
			});
			entity.view.children('.sl').css({
				'height' : entity.view.css('height')
			});
			entity.view.children('.sl').css(posAbslt);
			$('.sl img', entity.view).css(posAbslt);

			// 初期スライドの準備
			entity.view.children('.sl:not(:first)').css('display','none');
			$('li:first', entity.operationBtn).addClass('selected');
			slideInitCtrl();
			
			// ボタンアクションの設定
			$('li', entity.operationBtn).click(function() {
				if (entity.settings.autoLoop) {
					clearTimeout(loopTimerID);
					loopTimerID = setInterval(loopAnimeCtrl, entity.settings.switchSec);
				}
				var choseId = $('li', entity.operationBtn).index($(this)) + 1;
				slideCtrl(choseId);
				btnChange(choseId);
				return false;
			});

			loadCompleteFlg = true;
		}		
		

		/* function ::: ローディングコントロール */
		var loadingCtrl = function() {
			if(loadCompleteFlg) {
				self.css('background','none');
				entity.view.css({'visibility':'visible'});
				slideCtrl(1);
				clearTimeout(loadTimerID);
				/* AUTOループ設定 */
				if (entity.settings.autoLoop) {
					loopTimerID = setInterval(loopAnimeCtrl, entity.settings.switchSec);
				}
			}			
		}
		
		/* function ::: ループアニメーションコントロール */
		var loopAnimeCtrl = function() {
			if (loadCompleteFlg) {
				var now = $('li', entity.operationBtn).index(
						$('li.selected', entity.operationBtn));
				var next = ((now + 1) % $('li', entity.operationBtn).length) + 1;
				slideCtrl(next);
				btnChange(next);
			}
		}

		/* function ::: スライドショー初期化コントロール */
		var slideInitCtrl = function() {
			$('.sl', entity.view).each(function(){
				$('img',this).not(':last').css('display','none');
			});
		}
		
		/* function ::: スライドショーコントロール */
		var slideCtrl = function(choseId) {
			choseId = (choseId) ? choseId : 1;
			entity.view.children('.sl:visible').fadeOut('slow', function() {
				$('img:not(:last)',this).stop(true, true).css('display','none');
				$('img:last',this).stop(true, true).css('display','block');
			});
			
			$('.sl:nth-child(' + choseId + ')', entity.view).stop().fadeIn('fast', function() {
				var imgNum = entity.slideImgList[choseId - 1].length;
				run(imgNum, $(this));
			});
			
			/* sub function : RUN スライドアニメーション */
			function run(current, animeSl) {
				if(current > 0) {
					var prev = current;
					current = prev - 1;

					if(current > 0){
						if (!isIE) {
							$('img:nth-child(' + current + ')', animeSl).delay(entity.settings.frameRate).fadeIn(entity.settings.frameFadeTime);
							$('img:nth-child(' + prev + ')', animeSl).delay(entity.settings.frameRate).fadeOut(entity.settings.frameRate, function(){
								run(current, animeSl);
							});
						} else {
							$('img:nth-child(' + current + ')', animeSl).delay(entity.settings.frameRate + entity.settings.frameFadeTime).css({'display':'block'});
							$('img:nth-child(' + prev + ')', animeSl).delay(entity.settings.frameRate + entity.settings.frameRate).css({'display':'none'}).queue(function(){
								run(current, animeSl);
							});
						}
					}
				}
			}
		}

		/* function ::: Imageタグの生成（スライド番号、画像URL） */
		var createImage = function(sl, url) {
			var img = new Image();
			entity.view.children('.sl:nth-child(' + sl + ')').append(img);
			img.src = url;
			return img;
		}

		/* function ::: スライドアニメーション切り替え時間算出 */
		var getSlideAnimeTime = function() {
			var time = entity.settings.switchSec;
			if(entity.settings.animation) {
				// TODO アニメーションコマ数が異なるスライドユニットに非対応（スライド1のコマ数にスライド切り替え時間が依存）
				time = (entity.settings.frameRate + entity.settings.frameFadeTime) * entity.settings.imglist[0].length + entity.settings.switchSec;
			}			
			return time;
		} 

		/* function ::: ボタン切り替え */
		var btnChange = function(sl) {
			sl = (sl) ? sl : 1;
			$('li', entity.operationBtn).removeClass('selected');
			$('li:nth-child(' + sl + ')', entity.operationBtn).addClass('selected');
		}


		initCtrl();
		
		return this;
	};
})(jQuery);