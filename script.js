"use strict";

var tcp = {
	opts: {
		topComments: 3,
		sortType: 'top',
		eventType: 'click',
		topColour: '#444'
	},
	addTopLinks: function (page) {
		var i, len, link, li, parent, articleID, tmp, first,
			ele = page || document,
			a = ele.querySelectorAll('.listing-page .linklisting .comments:not(.empty)');
		if (a.length) {
			for (i = 0, len = a.length; i < len; i += 1) {
				if (!a[i].parentNode.querySelector('.toplink') && /[0-9]/.test(a[i])) {
					articleID = a[i].getAttribute('href');
					articleID = articleID.substring(articleID.indexOf('/comments/') + 10, articleID.indexOf('/comments/') + 16);
					link = document.createElement('a');
					li = document.createElement('li');
					li.appendChild(link);
					link.className = 'toplink';
					tmp = "java";
					link.href = tmp + 'script:;';
					link.setAttribute('id', 'toplink' + articleID);
					link.setAttribute('style', 'color:' + tcp.opts.topColour + ';text-decoration:none;');
					link.textContent = ' top';
					parent = a[i].parentNode.parentNode;
					first = parent.querySelector('.first + li');
					parent.insertBefore(li, first);
					tcp.addListener(link, articleID);
				}
			}
		}
	},
	addListener: function (link, id) {
		link.addEventListener(tcp.opts.eventType, function () {
			tcp.retrieveTopComments(this, id);
		});
	},
	kill_preview: function () {
		this.parentNode.removeChild(this);
	},
	retrieveTopComments: function (ele, articleID) {
		var pre, url, xhr, thisPre, sort;
		sort = (tcp.opts.sortType === 'hot') ? '' : '&sort=' + tcp.opts.sortType;
		ele = ele.parentNode.parentNode.parentNode;
		if (!document.querySelector('#preview' + articleID)) {
			pre = document.createElement('div');
			pre.setAttribute('id', 'preview' + articleID);
			pre.classList.add('loading');
			pre.addEventListener('click', tcp.kill_preview);
			ele.querySelector('.flat-list.buttons').insertBefore(pre, null);
			url = 'http://www.reddit.com/comments/' + articleID + '/.json?limit=' + (tcp.opts.topComments + 5) + sort;
			xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4 && xhr.status === 200) {
					tcp.onloadJSON(xhr);
				}
			};
			xhr.send(null);
		} else {
			thisPre = document.querySelector('#preview' + articleID);
			thisPre.parentNode.parentNode.style.marginBottom = '';
			thisPre.parentNode.removeChild(thisPre);
		}
	},
	onloadJSON: function (response) {
		var i, len, content, contentDiv, article, author, linkiid, linkid, commid, score,
			newHtml = '',
			comments = JSON.parse(response.responseText),
			commentsLength = comments[1].data.children.length,
			articleID = comments[0].data.children[0].data.id,
			permalink = comments[0].data.children[0].data.permalink;
		len = tcp.opts.topComments < commentsLength ? tcp.opts.topComments : commentsLength;
		for (i = 0; i < len; i += 1) {
			content = comments[1].data.children[i].data.body_html;
			if (content) {
				contentDiv = document.createElement('div');
				contentDiv.innerHTML = content;
				content = contentDiv.firstChild.textContent;
				author = comments[1].data.children[i].data.author;
				score = comments[1].data.children[i].data.score;
				linkiid = comments[1].data.children[i].data.link_id;
				linkid = linkiid.replace("t3_", "");
				commid = comments[1].data.children[i].data.id;
				newHtml += (i > 0 ? '<hr>' : '');
				newHtml += '<a class="link" target="_blank" href="/u/' + author;
				newHtml += '">' + author + '</a>';
				newHtml += '<span class="points">| score: ' + score + '</span>';
				newHtml += '<a class="permalink" target="_blank" href="' + permalink + commid + '">permalink</a><br />' + content;
			}
		}
		article = document.querySelector('#preview' + articleID);
		if (article) {
			article.classList.remove('loading');
			article.innerHTML = newHtml;
			article.parentNode.parentNode.style.marginBottom = (article.offsetHeight + 16) + 'px';
			article.removeEventListener(tcp.opts.eventType, tcp.kill_preview);
		}
	},
	addStyle: function () {
		var style,
			sheet = '';
		sheet += "div[id^=preview]{box-sizing:border-box;-moz-box-sizing:border-box;background:#fff;border-radius:5px;border:1px solid #dbdbdb;white-space:normal;padding:5px;position:absolute;margin:8px 0;}";
		sheet += ".loading:before{content:\"Loading...\";}div[id^=preview] .md{border:1px solid #ddd;background:#f0f0f0;box-sizing:border-box;-moz-box-sizing:border-box;margin:3px 0;box-sizing:border-box;padding:2px 8px;}";
		sheet += "div[id^=preview] .md *{white-space:normal;}";
		sheet += "div[id^=preview] .link,div[id^=preview] .md a{font-weight:bold;color:#369!important;}";
		sheet += ".listing-page .linklisting .buttons li { vertical-align: top; }";
		sheet += ".permalink { float: right; color: #666;}.points{color:#333;font-weight:bold;margin-left:.5em;}"
		sheet += ".res-nightmode div[id^=preview] .link{ color: rgba(20, 150, 220, 0.8)!important; }";
		sheet += ".res-nightmode div[id^=preview]{ background: #333!important;border-color:#666!important }";
		sheet += ".res-nightmode .toplink{ color: #eee!important; }";
		sheet += ".res-nightmode div[id^=preview] .points{ color: #ddd!important; }";
		sheet += ".res-nightmode div[id^=preview] .permalink{ color: #ccc!important; }";
		sheet += ".res-nightmode div[id^=preview] .md{ background: #666!important;border-color: #222!important; }";
		sheet += ".res-nightmode div[id^=preview] hr{ border-color: #777!important; }";
		style = document.createElement('style');
		style.type = 'text/css';
		style.textContent = sheet;
		document.querySelector('head').appendChild(style);
	},
	init: function () {
		document.body.addEventListener('DOMNodeInserted', function (e) {
			if ((e.target.tagName === 'DIV') && (e.target.getAttribute('id') && e.target.getAttribute('id').indexOf('siteTable') !== -1)) {
				tcp.addTopLinks(e.target);
			}
		}, true);
		tcp.addStyle();
		tcp.addTopLinks();
	}
};

if (!/^https?:\/\/(?:[a-z]+)\.reddit\.com\/(?:r\/\w+)\/comments/i.test( location.href )) {
	chrome.storage.sync.get('options', function(e) {
		if (e.options) {
			tcp.opts.topComments = e.options.topComments;
			tcp.opts.sortType = e.options.sortType;
			tcp.opts.eventType = e.options.eventType;
			tcp.opts.topColour = e.options.topColour;
			tcp.init();
		} else {
			tcp.init();
		}
	});
}
