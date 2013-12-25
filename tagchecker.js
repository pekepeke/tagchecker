/*
 * tagcheck.js
 * �^�O�̑Ή��G���[���`�F�b�N���A���ʃE�B���h�E�ɕ\������
 * @author tockri
 * ���ρA�Ĕz�z�A���X���R�ɂ���Ă�������
 */
(function(w) {
	// remove inplanted script tag
	(function() {
		var scriptTag = document.body.lastChild;
		if (scriptTag.tagName == 'SCRIPT' && scriptTag.id == 'tagcheck-script') {
			document.body.removeChild(scriptTag);
		}
	})();
	if (!w) {
		return;
	}

	
	// prepare result window
	(function() {
		var wd = w.document;
		wd.open();
		var resultHTML = [
			'<html>',
			'<head>',
			'<title>tagcheck result</title>',
			'<style type="text/css">',
			'* {font-size:10pt;margin:0;padding:0;font-family:sans-serif;}',
			'h1 {background:#339; padding:5px; color:white}',
			'ol li{margin-left:30px;}',
			'#loading {padding:3em;text-align:center;background-image:url(loading.gif);background-repeat:no-repeat;',
			'background-position:center center;height:100px;}',
			'#summary {margin:10px;padding:1em; color:#660;font-weight:bold;}',
			'#list {margin:10px;padding:1em; background:#eee;border:1px solid gray} ',
			'#source{margin:10px;padding:3px;border:1px solid gray;background:#eee;}',
			'.ln{background:white;width:30px;border-right:4px solid #9999cc;float:left;clear:both;padding-right:4px;text-align:right;margin-right:4px;}',
			'.error{color:white;background:orange;font-weight:demi;}',
			'.error a:link {text-decoration:none;}',
			'a:focus {background:red;}',
			'.success{border: 1px solid green;background:#ccffcc}',
			'.fail{border:1px solid red;background:#ffcccc}',
			'.show{display:block;}',
			'.none{display:none;}',
			'.o{background:#fbe7b6;}',
			'.e{background:#ead6a5;}',
			'</style>',
			'</head>',
			'<body>',
			'<div id="loading">now computing...',
			'</div>',
			'<div id="resultarea" class="none">',
			'<h1>�`�F�b�N���ʊT�v</h1>',
			'<div id="summary"></div>',
			'<h1>�^�O�Ή��G���[�ꗗ</h1>',
			'<div id="list"></div>',
			'<h1>HTML�\�[�X</h1>',
			'<div id="source"></div>',
			'<div id="debug"></div>',
			'</div>',
			'</body>',
			'</html>'
		];
		wd.write(resultHTML.join("\n"));
		wd.close();
		var $ = function(id) {
			return w.document.getElementById(id);
		}
		var pos = function(elem) {
			var html = document.documentElement;
			var rect = elem.getBoundingClientRect();
			var left = rect.left - html.clientLeft;
			var top = rect.top - html.clientTop;
			return {left:left, top:top};
		}
		
		w.showResult = function(html, closed, errors) {
			// hide loading message
			var ldiv = $('loading');
			ldiv.parentNode.removeChild(ldiv);
			//ldiv.className = 'none';
			var errorCount = errors.length;
			
			// show summary
			(function() {
				var sdiv = $('summary');
				var message = (
					errorCount == 0 ? '�f���炵���I�Ƃ肠�����^�O�̑Ή������͊����ł��I'
					: errorCount == 1 ? '�ɂ����I1����������ƑΉ����Ă��Ȃ��^�O������܂��B'
					: '�c�O�A' + errorCount + '�̃^�O��������ƑΉ����Ă��܂���B'
				);
				sdiv.innerHTML = message;
				sdiv.className = errorCount ? 'fail' : 'success';
			})();
			
			// show sourcecode
			(function() {
				var sourceLine = 1;
				// make source code html
				var re = function(htmlCode) {
					return htmlCode.replace(/[<>&\r\n \t]/g, function(c) {
						switch(c) {
						case '<':
							return '&lt;';
						case '>':
							return '&gt;';
						case '&':
							return '&amp;';
						case "\r":
							return '';
						case "\n":
							var cls = sourceLine % 2 == 0 ? 'e' : 'o';
							return '</div>\n<div class="ln">' + (++sourceLine) 
									+ '</div><div class="' + cls + '">&nbsp;';
						case "\t":
							return "&nbsp;&nbsp;&nbsp;&nbsp;";
						case " ":
							return "&nbsp;";
						}
					});
				}
				var sourceCode = ['<div class="ln">1</div><div class="e">&nbsp;'];
				errors.sort(function(a, b) {
					return a.head - b.head;
				});
				var rular = 0;
				for (var i = 0, l = errors.length; i < l; i++) {
					var uc = errors[i];
					if (rular < uc.tail) {
						var head = re(html.substring(rular, uc.head));
						var tag = re(html.substring(uc.head, uc.tail));
						sourceCode.push(head, 
										'<span class="error">', 
										'<a id = "a' + uc.id + '"',
										' title="' + uc.message + '"',
										' href="javascript:go(\'d' + uc.id + '\');">',
										tag, 
										'</a></span>');
						uc.lineNumber = sourceLine;
						rular = uc.tail;
					}
				}
				sourceCode.push(re(html.substring(rular)), '<br clear="all">');
				
				var div = $('source');
				div.innerHTML = sourceCode.join("");
			})();
			
			
			
			// show list
			(function() {
				var listHTML = ['<ol>'];
				for (var i = 0, l = errors.length; i < l; i++) {
					var uc = errors[i];
					listHTML.push('<li>',
							'(' + uc.lineNumber + '�s��) ',
							'<a id="d' + uc.id + '"',
							' href="javascript:go(\'a' + uc.id + '\');">&lt;',
							uc.tagName + uc.attr,
							'&gt;</a> : ',
							uc.message,
							'</li>');
				}
				listHTML.push('</ol>');
				$('list').innerHTML = listHTML.join("");
			})();

			$('resultarea').className = 'show';
			//$('debug').innerHTML = closed.toSource();
		};
		w.go = function(id) {
			var before = w.scrollY || 0;
			var elem = $(id);
			elem.focus();
			var after = w.scrollY || 0;
			
			var wh = w.innerHeight;
			var top = pos(elem).top;
			var M = 50;
			if (top < M) {
				w.scrollBy(0, -wh / 2);
			} else if (wh - M < top) {
				w.scrollBy(0, wh / 2);
			}
		};
		
		return w;
	})();
	
	// Get html code by re-request
	var html = (function() {
		var ajax = (function() {
			try {
				return window.XMLHttpRequest ? new XMLHttpRequest()
					: (ActiveXObject ? new ActiveXObject('Msxml2.XMLHTTP') : null);
			} catch (e) {
				return new ActiveXObject('Microsoft.XMLHTTP');
			}
		})();
		ajax.open("GET", location.href, false);
		ajax.send('');
		return ajax.responseText;
	})();
	var opened = {};
	var closed = {};
	var errors = [];
	var debug = [];
	var ignoring = [];

	// ����������v�f�̃^�O
	var EMPTYTAG = ['img', 'link', 'meta', 'br', 'hr', 'input', 
				'embed', 'area', 'base', 'basefont', 'bgsound',
				'param', 'wbr', 'col'];
	EMPTYTAG.indexOf = EMPTYTAG.indexOf || function(str) {
		for (var i = 0, l = this.length; i < l; i++) {
			if (this[i] == str) {
				return i;
			}
		}
		return -1;
	};
	
	// �����]�[������������
	(function() {
		var ignorePattern = /(<script[^>]*>[\s\S]*?<\/script>)|(<\!--[\s\S]*?-->)/igm;
		var found = null;
		while (found = ignorePattern.exec(html)) {
			var head = found.index;
			var tail = head + found[0].length;
			ignoring.push({
				head: head,
				tail: tail
			});
			ignorePattern.lastIndex = tail;
			//console.debug(found[0]);
		}
	})();
	function inIgnoring(index) {
		for (var i = 0; i < ignoring.length; i++) {
			var ig = ignoring[i];
			if (ig.head <= index && index < ig.tail) {
				return true;
			} else if (index < ig.head) {
				break;
			}
		}
		return false;
	}

	
	// �J�����܂ܕ��Ă��Ȃ��^�O����������
	(function() {
		// ���^�O�̊J�n�ʒu��Ԃ�
		var closure = function(html, index, tagName) {
			var closeRe = new RegExp("<(/)?" + tagName + "( [^>]*)?>", "igm");
			closeRe.lastIndex = index;
			var depth = 1;
			var r = null;
			while (r = closeRe.exec(html)) {
				if (r[1] == '/') {
					if (--depth == 0) {
						// ���łɑ��̕��^�O�ɂȂ��Ă�ꍇ��false
						return closed[r.index] ? false : {
							head:r.index,
							tail:r.index + r[0].length
						};
					}
				} else {
					depth ++;
				}
			}
			return false;
		};
		var openPattern = /<([a-zA-Z1-9:]+)([^>]*)>/gm;
		var found = null;
		while(found = openPattern.exec(html)) {
			if (inIgnoring(found.index)) {
				continue;
			}
			var head = found.index;
			var tail = head + found[0].length;
			var tagName = found[1].toLowerCase();
			var attr = found[2];
				
			if (EMPTYTAG.indexOf(tagName) >= 0 || (attr && attr.charAt(attr.length - 1) == '/')) {
				// ��v�f�^�O
				closed[head] = {
					open: head, 
					openTail: tail,
					close: head, 
					closeTail: tail,
					tagName: tagName, 
					attr: attr
				};
			} else {
				var cls = closure(html, tail, tagName);
				if (cls) {
					opened[head] = closed[cls.head] = {
						open: head, 
						openTail: tail,
						close: cls.head, 
						closeTail: cls.tail,
						tagName: tagName, 
						attr: attr
					};
				} else {
					errors.push({
						id: errors.length,
						head:head, 
						tail:tail, 
						tagName: tagName, 
						attr: attr, 
						message: "�^�O�����Ă��܂���"
					});
				}
			}
			openPattern.lastIndex = tail;
		}
	})();
	
	// �J���^�O���Ȃ����^�O����������
	(function() {
		var closePattern = /<\/([a-zA-Z1-9:]+)>/gm;
		var found = null;
		while(found = closePattern.exec(html)) {
			if (inIgnoring(found.index)) {
				continue;
			}
			var head = found.index;
			var tail = head + found[0].length;
			var tagName = found[1].toLowerCase();
			var attr = '';
			if (EMPTYTAG.indexOf(tagName) < 0) {
				if (!closed[found.index]) {
					errors.push({
						id: errors.length,
						head:head,
						tail:tail,
						tagName: '/' + tagName,
						attr: attr,
						message: "�J���^�O������܂���"
					});
				}
			}
			closePattern.lastIndex = tail;
		}
	})();
	
	// ��ɊJ�����^�O����ɕ��Ă���悤�ȉӏ����Ȃ����`�F�b�N����
	(function() {
		var checked = [];
		for (var i in opened) {
			var cl = opened[i];
			for (var j = checked.length - 1; j >= 0; j--) {
				var ch = checked[j];
				if (ch.open < cl.open 
					&& cl.open < ch.close 
					&& ch.close < cl.close) {
					// �e�J��-�q�J��-�e����-�q����̏�
					errors.push({
						id: errors.length,
						head: ch.close,
						tail: ch.closeTail,
						tagName: '/' + ch.tagName,
						attr: '',
						message: '&lt;' + cl.tagName + cl.attr + '&gt;������ɕ��Ă��܂��Ă��܂�'
					});
					errors.push({
						id: errors.length,
						head: cl.close,
						tail: cl.closeTail,
						tagName: '/' + cl.tagName,
						attr: '',
						message: '&lt;' + ch.tagName + ch.attr + '&gt;������ŕ��Ă��܂��Ă��܂�'
					});
				} else if (ch.close < cl.open) {
					// ���ڂ��Ă���n�_�ł��łɕ��Ă�̂̓`�F�b�N����O��
					checked.splice(j, 1);
				}
			}
			checked.push(cl);
		}
	})();
	
	w.showResult(html, closed, errors);
	
})(w);