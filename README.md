# Seer SDK for Javascript

This SDK handles requests to the Seer API and simplifies integration of Seer into a Javascript application. It supports prefetching and caching of suggestions, which greatly improves responsiveness of the suggestions for the end-user.

The SDK does not have any dependencies on 3rd party libraries and plays well with other frameworks like jQuery.

# Usage

```html
    <script src="seer/seer.min.js"></script>

    <script>
            var clientKey = '***'; // Your authentication key
            var suggest = Datajet.usw(key); // Defines the Seer API to use. Use Datajet.usw if your users are in Americas, Datajet.euw for EMEA, and Datajet.apse for Asian region. 

            var term = 'iph'; // Search term entered by the user
            suggest.get(term, function(suggestions) { 
                // Suggestions are stored in the 'suggestion' array
            });
    </script>
```

More examples [here](https://github.com/rocket-internet-berlin/INTSEER/blob/master/js-sdk/examples/index.html)

# API

### Datajet.Seer(region, clientKey)
 - Creates Seer object with given regin and clientKey. Region can be one of `'', 'usw', 'apse'`

### Datajet.usw(clientKey)
 - Shortcut for `Datajet.Seer('usw', clientKey);`

### Datajet.apse(clientKey)
 - Shortcut for `Datajet.Seer('apse', clientKey);`

### Seer.get(term, cb)
 - Get suggestion list.
 * `term` - the term for suggestions
 * `cb` - callback for results. Should be the function with signature: `function (itesm) { }`

### Seer.ajaxError(xhr)
 - Called when something wrong happend during ajax call. Can be overriden with custom callback.
 * `xhr` - XMLHttpRequest object 

# Build

To build compressed lib from sources run: `./build.sh`

It will build both standalone and jquery-dependend version in `seer/` folder

The script uses this shell-script to combinde and compress sources: https://github.com/dfsq/compressJS.sh
It requires access to Google Closure Compiler online.
