#!/bin/bash
set -eux

SEER_SRC="seer/lib/escape_regex.js seer/lib/persistent_storage.js seer/seer.js"
FEEDS_SRC="feeds/lib/fingerprint.js feeds/feeds.js"
SEER_JQUERY_SRC="plugins/seer.jquery.js"

./compressjs.sh $SEER_SRC seer/seer.min.js
./compressjs.sh $FEEDS_SRC feeds/feeds.min.js
./compressjs.sh $SEER_JQUERY_SRC plugins/seer.jquery.min.js
