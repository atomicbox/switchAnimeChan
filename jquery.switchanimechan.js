/*////////////////////////////////////////////////////////////////////
SwitchAnimeChan - jQuery plugin (ver.1.11.1)
http://www.jquery.com
Version: 1.0

Copyright 2014 atomicbox http://atomicbox.tank.jp/
Licensed under the Creative Commons Attribution 2.1 License
http://creativecommons.org/licenses/by-nc-nd/2.1/jp/
////////////////////////////////////////////////////////////////////*/
;(function($) {
	
	/* パラメータ定義：デフォルト値 */
	var defaults = {
			frameRate : 500,
			frameFadeTime : 300,
			frameSelector: '.switchAnimeChan-frame',
			autoLoop : false,
			switchSec : 4000,
			naviButtonUse: true,
			naviButtonSelector: '',
			naviButtonPosition: 'inner'
	}

	var userAgent = window.navigator.userAgent.toLowerCase();
	var appVersion = window.navigator.appVersion.toLowerCase();
	
	$.fn.switchAnimeChan = function(options) {
		
		/* 内部パラメータ定義 */
		var self = this;
		var entity = {};	// 内部設定セット
		self.setupCompleteFlg = false;
		self.preloadCompleteFlg = false;
		self.frameSetupCompleteFlg = false;
		self.loadTimerID = false;
		self.imgPreLoadTimerID = false;
		self.loopTimerID = false;
		var isIE = (userAgent.indexOf('msie') != -1) && ((appVersion.indexOf("msie 8.") != -1) || (appVersion.indexOf("msie 7.") != -1));

		/* function ::: 初期化コントロール */
		var initCtrl = function(){

			// パラメータ設定
			entity.settings = $.extend({}, defaults, options);

			// ローディング開始
			self.css('position','relative');
			entity.settings.loading = self.append('<div class="switchAnimeChan-loading">Loading</div>').find('.switchAnimeChan-loading');
			self.loadTimerID = setTimeout(loadingCtrl, 300);

			// 画像のプリロード処理
			entity.loadImgLen = self.find('img').length;	// ローディング対象画像数
			preLoadCtrl();
			
			entity.settings.frames = self.find(entity.settings.frameSelector);
			entity.settings.framesLen = entity.settings.frames.length;	// frame枚数
			entity.settings.frames.css('display','none');
			entity.settings.switchSec = getSlideAnimeTime();

			setupCtrl();
		}

		/* function ::: DOM・CSSセットアップコントロール */
		var setupCtrl = function(){

			// DOM要素セットアップ
			entity.settings.frames.wrapAll('<div class="switchAnimeChan-view">');
			entity.settings.view = self.find('.switchAnimeChan-view');
			entity.settings.frames.each(function(){
				$(this).find('img').wrapAll('<div class="switchAnimeChan-container">');
			});
			
			if(entity.settings.naviButtonUse){
				if(entity.settings.naviButtonSelector) {
					entity.settings.defaultNaviButtonUse = false;
					entity.settings.naviButton = $(entity.settings.naviButtonSelector);
				} else {
					entity.settings.naviButtonContainer = self.append('<div class="switchAnimeChan-naviButtonContainer">').find('.switchAnimeChan-naviButtonContainer');
					entity.settings.naviButton = entity.settings.naviButtonContainer.append('<ul class="switchAnimeChan-naviButton">').find('.switchAnimeChan-naviButton');
					for(var i=0;i<entity.settings.framesLen; i++){
						entity.settings.naviButton.append('<li>'+ i +'</li>');
					}
					entity.settings.naviButtonContainer.addClass(entity.settings.naviButtonPosition);
				}
			}
			
			// 初期化
			entity.settings.frames.css({'width':'100%','position':'absolute','top':0,'left':0});
			entity.settings.frames.find('img').css({'position':'absolute','top':0,'left':0});
			setupFrame();

			// イベントセットアップ
			if(entity.settings.naviButtonUse){
				entity.settings.naviButton.find('li').on('click', function() {
					var index = entity.settings.naviButton.find('li').index($(this));
					if (entity.settings.autoLoop) {
						clearTimeout(self.loopTimerID);
						self.play(index);
						self.loopTimerID = setTimeout(function(){
							playNextCtrl();
						}, entity.settings.switchSec);
					} else {
						self.play(index);
					}
				});
			}			

			self.setupCompleteFlg = true;
		}		
		

		/* function ::: ローディングコントロール */
		var loadingCtrl = function() {
			if(self.preloadCompleteFlg && self.frameSetupCompleteFlg && self.setupCompleteFlg) {
				// ローディングタイマー停止
				if (self.loadTimerID !== false) {
					clearTimeout(self.loadTimerID);
			    }
				
				if (entity.settings.autoLoop) {
					entity.settings.loading.fadeOut('slow',function(){
						self.play(0);
						/* AUTOループ設定 */
						self.loopTimerID = setTimeout(function(){
							playNextCtrl();
						}, entity.settings.switchSec);
					});
				} else {
					entity.settings.loading.fadeOut('slow',function(){
						self.play(0);
					});
				}
			} else {
				// ローディングタイマー延長
				self.loadTimerID = setTimeout(loadingCtrl, 300);
			}			
		}
		
		/* function ::: プリロードコントロール */
		preLoadCtrl.progress = 0;
		preLoadCtrl.mostHeight = 0;
		function preLoadCtrl() {
			if(entity.loadImgLen > 0) {
					$('img', self).each(function(index){
						// 画像のプリロード
						var image = new Image();
						image.onload = function(){
							preLoadCtrl.progress++;
							preLoadCtrl.mostHeight = (image.height > preLoadCtrl.mostHeight) ? image.height : preLoadCtrl.mostHeight;
							// 画像読み込み完了判定
							if(preLoadCtrl.progress == entity.loadImgLen){
								self.preloadCompleteFlg = true;
							}
						};
						image.src = $(this).attr('src');
					});
			} else {
				self.preloadCompleteFlg = true;
			}
		}
		
		/* function ::: フレーム初期化コントロール */
		var setupFrame = function(){
			// 画像読み込み完了後にセットアップ
			if(self.preloadCompleteFlg) {
				if (self.imgPreLoadTimerID !== false) {
					clearTimeout(self.imgPreLoadTimerID);
				}
				// 各フレームの1枚目のコマ画像以外を非表示に初期化
				entity.settings.frames.each(function(){
					var mainImg = $('img:first',this);
					$(this).find('.switchAnimeChan-container').css({'width':mainImg[0].width,'height':mainImg[0].height});
					$('img',this).not(':last').css('display','none');
				});
				// ビュー・フレームの高さを設定
				entity.settings.view.animate({'height' : preLoadCtrl.mostHeight},'slow',function(){
					self.frameSetupCompleteFlg = true;
				});
			} else {
				// プリロードタイマー延長
				self.imgPreLoadTimerID = setTimeout(setupFrame, 200);
			}
		}	
		
		/* function ::: ループアニメーションコントロール */
		var playNextCtrl = function() {
			var next = entity.settings.frames.index(entity.settings.frames.filter(':visible'));
			next = validFrameIndex(next+1);
			self.play(next);
			self.loopTimerID = setTimeout(function(){
				playNextCtrl();
			}, entity.settings.switchSec);
		}

		/* function ::: スライドアニメーション切り替え時間算出 */
		var getSlideAnimeTime = function() {
			var time = entity.settings.switchSec;
			// TODO アニメーションコマ数が異なるスライドユニットに非対応（スライド1のコマ数にスライド切り替え時間が依存）
			var coma = entity.settings.frames.filter(':first').find('img').length;
			time = (entity.settings.frameRate + entity.settings.frameFadeTime) * coma + entity.settings.switchSec * 2;
			return time;
		} 

		/* function ::: ボタン切り替え */
		var navButtonCtrl = function(index) {
			var navBtnActive = entity.settings.naviButton.find('li:nth-child('+ (index+1) +')');
			navBtnActive.siblings().removeClass('button-active');
			navBtnActive.addClass('button-active');
		}
		
		var validFrameIndex = function(index) {
			// フレーム番号がしきい値を超える場合ループする
			if (index >= entity.settings.framesLen) {
				index = 0;
			} else if (index < 0) {
				index = entity.settings.framesLen - 1;
			}
			return index;
		}
		
		/** PUBLIC FUNCTIONS **/
		
		/* function ::: アニメーション再生（index:再生フレームインデックス） */
		self.play = function(index){
			index = (index) ? index : 0;
			
			if(entity.settings.naviButtonUse){
				navButtonCtrl(index);
			}
			
			// 表示中のフレームをリセット
			entity.settings.frames.filter(':visible').fadeOut('slow', function() {
				$(this).find('img').stop(true, true).css('display','none');
				$(this).find('img:last').stop(true, true).css('display','block');
			});
			
			// 指定インデックスのフレームのアニメーションを開始
			entity.settings.frames.filter(':nth-child(' + (index+1) + ')').stop(true, true).fadeIn('fast', function() {
				run($(this).find('img').length, $(this));
			});
			
			/* sub function : RUN スライドアニメーション */
			function run(current, frameObj) {
				if(current > 0) {
					var prev = current;
					current = prev - 1;

					if(current > 0){
						if (!isIE) {
							$('img:nth-child(' + current + ')', frameObj).delay(entity.settings.frameRate).fadeIn(entity.settings.frameFadeTime);
							$('img:nth-child(' + prev + ')', frameObj).delay(entity.settings.frameRate).fadeOut(entity.settings.frameRate, function(){
								run(current, frameObj);
							});
						} else {
							$('img:nth-child(' + current + ')', frameObj).delay(entity.settings.frameRate + entity.settings.frameFadeTime).css({'display':'block'});
							$('img:nth-child(' + prev + ')', frameObj).delay(entity.settings.frameRate + entity.settings.frameRate).css({'display':'none'}).queue(function(){
								run(current, frameObj);
							});
						}
					}
				}
			}
		}

		initCtrl();
		
		return this;
	};
})(jQuery);