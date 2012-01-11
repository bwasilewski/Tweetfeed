(function($){
$.fn.tweetfeed = function(options) {
	
	// Set up default values and variables
	
	var defaults = {
		limit : 10,
		onComplete : function(userFunction) {
			userFunction();
		},
		afterMarkup : '',
		hashes : []
	},
		obj = this,
		userNamesComplete = 0,
		hashesComplete = 0,
		tweetArray = [],
		hashLimit,
		hashUrl = 'http://search.twitter.com/search.json?q=',
		afterMarkup,
		userUrl;
		
	// Itterates through tweets array
	// and appends them to the page
	
	function appendHTML(arrObj) {
		var html = '',
			user,
			text;
		for(var m = 0; m < options.limit; m++) {
			user = arrObj[m].user;
			text = arrObj[m].text;
			
			html += '<p><a target="_blank" href="http://www.twitter.com/' + user + '">@' + user + '</a>: ' + text + '</p>' + afterMarkup;
		}
		
		$(obj).append(html);
		options.onComplete();
	}
	
	function compareDates(a, b) {
		var dateA = new Date(a.timestamp),
			dateB = new Date(b.timestamp);
		return dateB - dateA;
	}
	
	function replaceURLwithLink(text) {
		var exp = /(\b(http?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
		
		var urlPos = text.indexOf('http://');
		
		console.log(urlPos);
		
		return text.replace(exp, '<a href="$1" target="_blank">$1</a>'); 
	}
	
	function checkHashesComplete() {
		tweetArray.sort(compareDates);
		appendHTML(tweetArray);
	}
	
	function searchForHashes() {
		var tweets = [],
			counter = 0;
		
		for (var y = 0; y <= hashLimit; y++) {
			if(y < hashLimit) {
				hashUrl+= options.hashes[y].replace(/#/gi, '%23') + '+OR+';
			} else if (y === hashLimit) {
				hashUrl+= options.hashes[y].replace(/#/gi, '%23');
			}
		}
		
		hashUrl+= '&rpp=' + options.limit;
		
		$.getJSON(hashUrl + '&callback=?', function(json) {
			
			if(json.results.length > 0) {
				
				$.each(json.results, function(j, item) {
					
					if(counter < options.limit - 1) {
						tweetArray.push({user: item.from_user, text: replaceURLwithLink(item.text), timestamp: item.created_at});
						counter++;
					} else {
						checkHashesComplete();
						return false;
					}
				});
			} else {
				checkHashesComplete();
				return false;
			}
		});
	}
	
	function checkUserNamesComplete() {
		userNamesComplete++;
		if(userNamesComplete == options.users.length) {
			if(hashLimit > 0) {
				searchForHashes();
			} else {
				tweetArray.sort(compareDates);
				appendHTML(tweetArray);
			}
		}
	}
	
	
	function getUserFeeds(theUrl, obj) {
		var counter = 0,
			tweets = [];
		
		$.getJSON(theUrl + '&callback=?', function(json) {
			$.each(json, function(x, tweet) {
				if(counter < options.limit) {
					tweetArray.push({user: tweet.user.screen_name, text: replaceURLwithLink(tweet.text), timestamp: tweet.created_at});

					counter++;
				} else {
					checkUserNamesComplete();
					return false;
				}
			});
		}); 
	}
	
	function init() {
		options = $.extend(defaults, options);	
		
		if(options.hashes !== undefined) {
			hashLimit = options.hashes.length - 1;
		} else {
			hashLimit = 0;
		}
		
		if(options.afterMarkup !== '') {
			afterMarkup = options.afterMarkup;
		}
		
		for(var i = 0; i < options.users.length; i++) {
			userUrl = 'http://api.twitter.com/statuses/user_timeline.json?screen_name='+options.users[i];
			getUserFeeds(userUrl, obj);
		}
	}
	
	
	// INIT THE PLUGIN
	init();

	
};
})(jQuery);