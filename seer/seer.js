var Datajet = Datajet || {};

Datajet._hostOverride = null;
Datajet._suggestUrl = '/1.1/suggest/%QUERY';
Datajet._prefetchUrl = '/1.1/prefetch/';
Datajet._queryLimit = 50;

Datajet._getUrl = function (host, endpoint, key) {
    return 'http://$host$ep?key='.replace('$host', host).replace('$ep', endpoint) + key + '&size=' + Datajet._queryLimit;
};

Datajet.euw = function(clientKey) {
    return new Datajet.Seer('euw', clientKey);
};

Datajet.usw = function(clientKey) {
    return new Datajet.Seer('usw', clientKey);
};

Datajet.apse = function(clientKey) {
    return new Datajet.Seer('apse', clientKey);
};

Datajet.sae = function(clientKey) {
    return new Datajet.Seer('sae', clientKey);
};

Datajet.Seer = function (region, clientKey) {
    var hostTemplate = 'seer$region$datajet.io';
    region = region !== '' ? '.' + region + '.': '.';
    var host = hostTemplate.replace('$region$', region);
    host = Datajet._hostOverride == null ? host: Datajet._hostOverride;

    this.seerUrl = Datajet._getUrl(host, Datajet._suggestUrl, clientKey);
    this.prefetchUrl = Datajet._getUrl(host, Datajet._prefetchUrl, clientKey);

    this.ttl = 10 * 60 * 1000;
    if (window.XMLHttpRequest) {
        this._requestor = new XMLHttpRequest();
    } else {
        this._requestor = new ActiveXObject("Microsoft.XMLHTTP");
    }

    this.storage = new PersistentStorage(this.prefetchUrl);
    this.initialize();
};

Datajet.Seer.prototype.initialize = function() {
    var storage = this.storage;
    var ttl = this.ttl;
    this._ajax(this.prefetchUrl, function(results) {
        if ( results == null ) {
            return;
        }
        for (var k in results) {
            storage.set(k, results[k], ttl);
        }
    });
};

Datajet.Seer.prototype.ajaxError = function(xhr) {
    console.log('Datajet ERROR XMLHttpRequest status: ' + xhr.status);
};

Datajet.Seer.prototype._ajax = function(url, successCb) {
    var me = this;
    this._requestor.onreadystatechange = function() {
        if (me._requestor.readyState == 4 ) {
            if(me._requestor.status == 200){
                successCb(JSON.parse(me._requestor.responseText));
            }
            else {
                me.ajaxError(me._requestor);
            }
        }
    };

    this._requestor.open('GET', url, true);
    this._requestor.withCredentials = true;
    this._requestor.send();
};

Datajet.Seer.prototype.get = function(query, cb) {
    if ( query == '') {
        cb([]);
        return;
    }
    var storage = this.storage;
    var ttl = this.ttl;

    var cached = this.storage.get(query);
    if (cached != null) {
        cb(cached);
        return;
    }
    this._ajax(this.seerUrl.replace('%QUERY', query), function(results) {
        if ( results === null ) {
            results = [];
        }
        storage.set(query, results , ttl);
        cb(results);
    });
};
