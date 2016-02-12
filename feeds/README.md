# Feeds SDK for Javascript

This SDK wraps and simplifies our data feeds usage [see here(https://github.com/rocket-internet-berlin/INTPOND/tree/master/fisherman#public-endpoints).
It is implemented as JQuery plugin.

# Usage

Brief example.
```html
    <script src="jquery.min.js"></script>
    <script src="feeds.min.js"></script>

    <script>
            var clientKey = '***'; // Your authentication key

            // Enable and populate feed.
            $("#some-id").datajetFeed({
                'feed': Datajet.feeds.bestsellers(),
                'clientKey': clientKey
            });
    </script>
```

More examples [here](https://github.com/rocket-internet-berlin/INTSEER/blob/master/js-sdk/example/feeds.min.html)

# API
## Invocation
```
$(selector).datajetFeed( options );
```
 * selector - JQuery selector
 * options - options object.

## Options


 * `feed` - feed object - see avaliable constructors below.
 * `clientKey` - required string - authentication key.
 * `size` - optional int - number of items to return in feed. Default is 5.
 * `from` - optional string - limits the results to be not older than the value provided. Default is 'now-24h'.
 * `resultCardHolder` - optional string - html element to wrap in result card. Default is null, no additional wrapping. Example: `resultCardHolder: "<div/>"` wraps results in additional `div`.
 * `resultClick` - optional `function(item)` - fires when user click on one of results. `item` is an item object.
 * `feedFail` - optional `function(jqXHR, status, error)` - fires when ajax call to feed endpoint fails.
 * `renderNoResults` - optional `function(feedId, elem)` - renders feed content when it returned no results.
  * `feedId` - string - feed name.
  * `elem` - JQuery object - feed itself.
 * `renderCardBody` - optional `function(card, item, ctx)` - renders single result card.
  * `card` - JQuery object - wraps single result card.
  * `item` - JS object - single item.
  * `ctx` - JS object - rendering feed context.
 * `onDataArrived` - optional `function(items)` - called when data has been arrived.

###Feeds constructos
Create feeds object for feeds specified [here](https://github.com/rocket-internet-berlin/INTPOND/tree/master/fisherman#public-endpoints)
Parameters are same as for endpoints.

`Datajet.feeds.boughtTogether(sku)`
 * `sku` - string - product sku

`Datajet.feeds.moreLikeThis(sku, method)`
 * `method` - string 
 * `sku` - string - product sku

`Datajet.feeds.bestsellers()`

`Datajet.feeds.bestDeals()`

`Datajet.feeds.mostViewed()`

`Datajet.feeds.specialDeals()`

`Datajet.feeds.recentlyViewed()`

# Build

To build compressed lib from sources run: `./build.sh`
