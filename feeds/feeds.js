var Datajet = Datajet || {};

Datajet.format = function(fmt, vars) {
    for ( key in vars ) {
        fmt = fmt.replace('$' + key, vars[key]);
    }
    return fmt;
};

Datajet.feeds = {};

Datajet.feeds.mostViewed = function () {
    return { 'uri': 'mostViewed' };
};

Datajet.feeds.moreLikeThis = function (sku, method) {
    method = method || 'default';
    return { 'uri': 'moreLikeThis', 'method': method, 'sku': sku };
};

Datajet.feeds.boughtTogether = function (sku) {
    return { 'uri': 'boughtTogether', 'sku': sku };
};

Datajet.feeds.bestDeals = function () {
    return { 'uri': 'bestDeals' };
};

Datajet.feeds.recentlyViewed = function () {
    return { 'uri': 'recentlyViewed' };
};

Datajet.feeds.bestsellers = function (category) {
    var result = { 'uri': 'bestsellers' };
    if ( typeof category !== 'undefined' ) {
        result.category = category;
    }
    return result;
};

Datajet.feeds.specialDeals = function () {
    return { 'uri': 'specialDeals' };
};

Datajet.feeds._itemKey = 'datajetItem';
Datajet.feeds._pondUrl = 'http://pond.datajet.io';
Datajet.feeds._feedsHost = 'http://feed.datajet.io/1.0/'; 

Datajet.feeds._getItemUniqueKey = function(item) {
    var key = item.sku;
    if ( typeof item === "undefined" ) {
        // TODO: read key property
    }
    return key;
};

Datajet.feeds._feedsElems = [];

Datajet.feeds._visitItem = function(item) {
    var url = item.url;
    if (url.indexOf('http://') != 0) {
        url = 'http://' + url;
    }
    window.location.href = url;
};

Datajet.feeds._logClick = function(item, ctx) {
    Datajet.feeds._log(ctx.options.clientKey, 'feeditemclicked', ctx.options.feed, item);
};

Datajet.feeds._logShow = function(ctx) {
    Datajet.feeds._log(ctx.clientKey, 'feeditemshowed', ctx.feed, ctx.item);
};

Datajet.feeds._log = function(clientKey, event, feed, item) {
    var payload = {
        'bid': Datajet.getBid(),
        'event': event,
        'itemId': Datajet.feeds._getItemUniqueKey(item),
        'feed': feed,
        'source': 'datafeed',
        'url': window.location.href,
        'payload': {}
    };
    if ( navigator ) {
        payload.client = {
            platform: navigator.platform,
            agent: navigator.userAgent
        };
    }
    var url = Datajet.feeds._pondUrl + '/1.0/log?' + $.param({'key': clientKey, 'p': JSON.stringify(payload)});
    $.get(url);
};

//Jquery plugin code
(function ($) {
    var checkVisibility = function() {

        $.each(Datajet.feeds._feedsElems, function(i, elem) {

            elem.find('.datajetCard').each(function(i, el) {
                var rect  = el.getBoundingClientRect();
                var data = $(el).data(Datajet.feeds._itemKey);
                if ( typeof data === 'undefined') {
                    // TODO: to fix this.
                    return;
                }
                if (rect.top >= 0 && rect.left >= 0 
                    && rect.top + rect.height * 0.6 <= $(window).height() 
                    && rect.left + rect.width * 0.6 <= $(window).width() 
                ) { 
                    // observable on screen
                    if (data.inViewPort) {
                        return;
                    }
                    data.inViewPort = true;
                    Datajet.feeds._logShow(data);
                }
                else {
                    if (data.inViewPort) {
                        data.inViewPort = false;
                    }
                }
            });
        });
    };

    $(window).scroll(function(){ checkVisibility(); });

    $.fn.datajetFeed = function (options) {
        var options = $.extend({}, $.fn.datajetFeed.defaults, options);

        var feed = options.feed;
        var feedUri = options.feed.uri;
        delete feed.uri;

        var getUrl = function (feed, params) {
            return Datajet.feeds._feedsHost + feed + '?' + $.param(params); 
        };

        var url = getUrl(feedUri, $.extend({
            'key': options.clientKey,
            'size': options.size,
            'from': options.from,
            'uuid': Datajet.getBid()
        },
        feed));

        var renderNoResults = options.renderNoResults;
        var renderResultCard = function(ctx, resultId, item) {
            var div = $('<div />', {
                class: 'datajetCard',
                id: resultId,
                click: function() {
                    Datajet.feeds._logClick(item, ctx);
                    ctx.options.resultClick(item);
                }
            }).data(Datajet.feeds._itemKey, {
                'item': item,
                'feed': feedUri,
                'clientKey': ctx.options.clientKey,
                'inViewPort': false
            });
            ctx.options.renderCardBody(div, item, ctx);
            
            return div;
        };

        var $this = this;
        var feedId = feedUri;

        var context = { options: options };

        var _onDataArrived = function(data) {
            try {
                options.onDataArrived(data);
            }
            catch (e) {}
        };

        $.getJSON(url, function( data ) {
            $this.empty();
            if ( (typeof data === "undefined") || (data === null) || data.length == 0 ) {
                _onDataArrived([]);
                renderNoResults(feedId, $this);
                return;
            }
            _onDataArrived(data);
            $.each(data, function(key, item) {
                var card = renderResultCard(context, feedId + "-result-" + key, item);
                if (options.resultCardHolder) {
                    var cardHolder = $(options.resultCardHolder);       
                    cardHolder.append(card);
                    $this.append(cardHolder);
                }
                else { 
                    $this.append(card);
                }
            });
            checkVisibility();
        }).fail(function(jqXHR, status, error) {
            options.feedFail(jqXHR, status, error);
        });

        Datajet.feeds._feedsElems.push(this);

        return this;
    };

    $.fn.datajetFeed.defaults = {
        size: 5,
        from: 'now-24h',

        currencyPrefix: '$',
        maxLenTitle: 21,
        maxLenSubtitle: 80,

        resultCardHolder: null,

        resultClick: function(item) { },

        feedFail: function(jqXHR, status, error) { console.log(jqXHR, status, error); },

        onDataArrived: function (data) {},

        renderNoResults: function(feedId, elem) {
            elem.html(Datajet.format('<div id="noResults$id" class="noResults"><h2>Sorry, we haven’t found any items to show here.</h2></div>', {
                'id': feedId
            }));
        },

        renderCardBody: function(card, item, ctx) {
            var maxLenTitle = ctx.options.maxLenTitle;
            var maxLenSubtitle = ctx.options.maxLenSubtitle;
            var title = item.title;
            var subtitle = '';
            var currencyPrefix = ctx.options.currencyPrefix;

            if (title.length > maxLenTitle) {
                var s = title.trunc(maxLenTitle, true);
                subtitle = title.substr(s.length).trunc(maxLenSubtitle, true);
                title = s;
            }

            var price = currencyPrefix + item.price, strikePrice = '';
            if (item.special_price) {
                price = currencyPrefix+item.special_price;
                strikePrice = currencyPrefix+item.price;
            }
            card.css({'cursor': 'pointer'})
            .append($("<img/>", { class: "cardImage", src: item.image, click: function(){ Datajet.feeds._visitItem(item); }}))
            .append($("<p/>", { class: "cardTitle", text: title}))
            .append($("<p/>", { class: "cardSubtitle", text: subtitle}))
            .append($("<p/>", { class: "cardPrice"})
            .append($("<span/>", { class: "cardCurrentPrice", text: price}))
            .append($("<span/>", { class: "cardStrikedPrice", text: strikePrice})))
            .click(function () { Datajet.feeds._visitItem(item); });
        }
    };
})(jQuery);
