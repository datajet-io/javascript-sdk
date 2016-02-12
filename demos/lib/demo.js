/**
 * Checklist-model
 * AngularJS directive for list of checkboxes
 */
angular.module('checklist-model', [])
    .directive('checklistModel', ['$parse', '$compile', function ($parse, $compile) {
        function contains(arr, item, comparator) {
            if (angular.isArray(arr)) {
                for (var i = arr.length; i--;) {
                    if (comparator(arr[i], item)) {
                        return true;
                    }
                }
            }
            return false;
        }

        function add(arr, item, comparator) {
            arr = angular.isArray(arr) ? arr : [];
            if (!contains(arr, item, comparator)) {
                arr.push(item);
            }
            return arr;
        }

        function remove(arr, item, comparator) {
            if (angular.isArray(arr)) {
                for (var i = arr.length; i--;) {
                    if (comparator(arr[i], item)) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            return arr;
        }

        function postLinkFn(scope, elem, attrs) {
            $compile(elem)(scope);
            var getter = $parse(attrs.checklistModel);
            var setter = getter.assign;
            var checklistChange = $parse(attrs.checklistChange);
            var value = $parse(attrs.checklistValue)(scope.$parent);
            var comparator = angular.equals;

            if (attrs.hasOwnProperty('checklistComparator')) {
                comparator = $parse(attrs.checklistComparator)(scope.$parent);
            }

            scope.$watch('checked', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                var current = getter(scope.$parent);
                if (newValue === true) {
                    setter(scope.$parent, add(current, value, comparator));
                } else {
                    setter(scope.$parent, remove(current, value, comparator));
                }

                if (checklistChange) {
                    checklistChange(scope);
                }
            });

            function setChecked(newArr, oldArr) {
                scope.checked = contains(newArr, value, comparator);
            }

            if (angular.isFunction(scope.$parent.$watchCollection)) {
                scope.$parent.$watchCollection(attrs.checklistModel, setChecked);
            } else {
                scope.$parent.$watch(attrs.checklistModel, setChecked, true);
            }
        }

        return {
            restrict: 'A',
            priority: 1000,
            terminal: true,
            scope: true,
            compile: function (tElement, tAttrs) {
                if (tElement[0].tagName !== 'INPUT' || tAttrs.type !== 'checkbox') {
                    throw 'checklist-model should be applied to `input[type="checkbox"]`.';
                }
                if (!tAttrs.checklistValue) {
                    throw 'You should provide `checklist-value`.';
                }
                tElement.removeAttr('checklist-model');
                tElement.attr('ng-model', 'checked');
                return postLinkFn;
            }
        };
    }]);

var defaultImage = "http://www.linio.com.mx/images/multistore/productonoDisponible.jpg";

var hawk = angular.module('hawk', ["checklist-model"]);

hawk.controller('SearchCtrl', function ($scope, $http, $timeout) {
        $scope.result = {}
        $scope.f = {};
        $scope.fs = {};
        $scope.attrFacets = ['weight_food', 'size', 'belt_material', 'processor_type', 'display_features', 'gender', 'calendar', 'style', 'age_group', 'power', 'toys_features', 'speciality', 'beauty_features', 'toys_characters', 'health_features', 'sport_type', 'home_features', 'printing_technology', 'product_shape', 'filter_color', 'breed_size', 'image_sensor', 'clock_type', 'language', 'frame_rate', 'hair_type', 'box_shape', 'area_of_use', 'health_format', 'capacity', 'step', 'skin_type', 'printing_color', 'system_memory', 'sports_features', 'genre', 'memory_type', 'hdd_size', 'operating_system', 'color'];
        $scope.genFacets = ['brand', 'price']
        $scope.defaultImage = defaultImage;
        $scope.page = 1;
        $scope.processing = 0;
        $scope.pageSize = 24;
        $scope.noCriteria = 1;
        $scope.defaultParams = {
            'dum': 'replace',
            'dum_count': 0,
            'size': $scope.pageSize,
            'rq': 5,
            'category_dept': 1,
            'gs': 10,
            'facet_count': 5
        };
        $scope.sort = 'relevance';

        $scope.$watch('fs.facet', function (newValue, oldValue) {
            $scope.search();
        }, true);

        $scope.$watch('fs.filter.price_min', function (newValue, oldValue) {
            if (newValue != oldValue && $scope.checkPrice4Search()) {
                $scope.search();
            }
        });
        $scope.$watch('fs.filter.price_max', function (newValue, oldValue) {
            if (newValue != oldValue && $scope.checkPrice4Search()) {
                $scope.search();
            }
        });

        $scope.checkPrice4Search = function () {
            var pmax = parseInt($scope.fs.filter.price_max, 10);
            var pmin = parseInt($scope.fs.filter.price_min, 10);
            var minprice = Math.floor(parseInt($scope.result.facets.price.min, 10));
            var maxprice = Math.ceil(parseInt($scope.result.facets.price.max, 10));
            if (!isNaN(pmax) && !isNaN(pmax) && pmax <= pmin) {
                return false;
            }
            if (!isNaN(pmax) && pmax <= minprice) {
                return false;
            }
            if (!isNaN(pmin) && pmin > maxprice) {
                return false;
            }
            return true;
        }

        $scope.clickCategory = function (id, deep) {
            $scope.defaultParams['category_dept'] = deep + 1;
            $scope.clickFilter("category", id);
        }

        // Feeds begin
        $scope.feeds = {};
        $scope.feedMeta = [
            {
                "url": "http://feed.datajet.io/1.0/recentlyViewed?size=4&from=now-1d",
                "title": "Recently Viewed by You",
                "name": "recentlyviewed"
            },
            {
                "url": "http://feed.datajet.io/1.0/specialDeals?size=4",
                "title": "Special Deals for You",
                "name": "specialdeals"
            },
            {
                "url": "http://feed.datajet.io/1.0/bestsellers?size=4&from=now-1d",
                "title": "Today's Best Sellers",
                "name": "bestsellers"
            },
            {
                "url": "http://feed.datajet.io/1.0/bestDeals?size=4&from=now-1d",
                "title": "Best Deals Today",
                "name": "bestdeals"
            },
            {
                "url": "http://feed.datajet.io/1.0/mostViewed?size=4&from=now-24h",
                "title": "Most Viewed Today",
                "name": "mostviewed"
            }
        ];
        $scope.feedKey = FEED_KEY;
        $scope.loadFeed = function (url, name) {
            if ($scope.feeds[name]) return 1;
            url = url + "&key=" + $scope.feedKey + "&uuid=" + $scope.myBid
            $http.get(url).success(function (data) {
                $scope.feeds[name] = data;
            })
        }
        $scope.loadFeeds = function () {
            for (var i in $scope.feedMeta) {
                var meta = $scope.feedMeta[i];
                $scope.loadFeed(meta["url"], meta["name"])
            }
            $scope.processing = 0;
        }
        // Feeds end

        //popular searches
        $scope.loadFeed("http://feed.datajet.io/1.0/popularSearches?from=now-1d&size=7", "popularsearches")


        $scope.reset = function () {
            $scope.result = {}
            $scope.f = {};
            $scope.fs = {};
            $scope.page = 1;
            $scope.processing = 0;
            $scope.noCriteria = 1;
        }

        $scope.moreLikeThis = function (item) {
            var sku = ""
            var url = "http://feed.datajet.io/1.0/moreLikeThis?method=default&key=" + $scope.feedKey + "&sku="
            if (item.skus) {
                sku = item.skus[0]
            } else {
                sku = item.sku
            }

            if (!sku) {
                return
            }
            url += sku;
            $http.get(url).success(function (data) {
                $scope.relatedProducts = data;
            })
            $scope.showRelatedProducts = 1;
            $('#relatedProductsModal').modal('show')

        }


        $scope.getApiUrl = function () {
            return "http://" + $scope.apiHost + "/1.0/product/?fields=id,url,title,price,image,brand,skus,sold_count,published_at&key=" + CLIENT_KEY;
        }

        $scope.clickFilter = function (k, v) {
            if (!$scope.fs["filter"]) {
                $scope.fs["filter"] = {};
            }
            $scope.fs["filter"][k] = v;
            $scope.search();
        }

        $scope.searchUserQ = function (q) {
            $scope.f.q = q;
            $scope.searchQ({'dum': 'info'})
        }

        $scope.searchQ = function (context) {
            try {
                $("#suggestions").catcomplete("close");
            } catch (err) {
                ;
            }
            $scope.page = 1;
            $scope.defaultParams['category_dept'] = 1;
            var params = angular.copy($scope.defaultParams);
            for (var key in context) {
                params[key] = context[key];
            }
            $scope.fs = {"q": $scope.f.q};
            params["q"] = $scope.fs.q;
            params["facet"] = angular.copy($scope.genFacets)
            angular.forEach($scope.attrFacets, function (v, k) {
                this.push(v);
            }, params["facet"]);
            $scope.load({"params": params});

        }

        $scope.makeParams = function () {
            var params = angular.copy($scope.defaultParams);

            params["filter"] = [];
            params["q"] = $scope.fs.q;
            params["facet"] = [];
            angular.forEach($scope.fs["filter"], function (v, k) {
                this.push(k + ':' + v);
            }, params["filter"]);
            angular.forEach($scope.fs["facet"], function (v, k) {
                angular.forEach(v, function (v2, k2) {
                    this.push(k + ':' + v2);
                }, params["filter"]);
            });
            params["facet"] = angular.copy($scope.genFacets)
            angular.forEach($scope.attrFacets, function (v, k) {
                this.push(v);
            }, params["facet"]);

            return params;
        }

        $scope.search = function () {
            $scope.page = 1;
            var params = $scope.makeParams();
            $scope.load({"params": params});
        }

        $scope.nextPage = function () {
            if ($scope.processing) {
                return;
            }
            $scope.processing = 1;
            var params = $scope.makeParams();
            params['page'] = $scope.page + 1;
            var config = {"params": params};

            $http.get($scope.getApiUrl(), config).success(function (data) {
                $scope.processing = 0;
                for (var i = 0; i < data.items.length; i++) {
                    $scope.result.items.push(data.items[i]);
                }
                $scope.page++;
            })

        }

        $scope.hasNextPage = function () {
            if (!$scope.result.count) {
                return false;
            }
            return $scope.result.count > ($scope.page * $scope.pageSize);
        }
        $scope.load = function (config) {
            if ($scope.processing) {
                return;
            }
            $scope.processing = 1;
            var params = config['params'];
            params['sort'] = $scope.sort;
            if ((!params['filter'] || params['filter'].length == 0) && !params['q']) {
                $scope.noCriteria = 1;
                $scope.loadFeeds();
                $scope.result = {};
                return;
            }
            $scope.noCriteria = 0;
            $http.get($scope.getApiUrl(), config).success(function (data) {
                $scope.page = 1;
                $scope.result = data;
                $scope.processing = 0;
                if (!$scope.result.count) {
                    $scope.loadFeeds();
                }
            })
        }

        $scope.setApiHost = function () {
            $scope.apiHost = $scope.apiHostField;
            try {
                localStorage.apiHost = $scope.apiHost;
            } catch (err) {
            }
            $scope.search();
        }

        // $scope.apiHostField = window.location.host;
        $scope.apiHostField = API_HOST;

        try {
            //$scope.apiHostField = localStorage.apiHost ? localStorage.apiHost : $scope.apiHostField;
        } catch (err) {
        }
        $scope.setApiHost();
    })
    .directive('checkImage', function ($http) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                return;
                attrs.$observe('ngSrc', function (ngSrc) {
                    $http.get(ngSrc).error(function () {
                        element.attr('src', defaultImage); // set default image
                    });
                });
            }
        };
    })
    .filter('faceter', function () {
        return function (input) {
            input = input.replace(/\_/g, " ");
            input = input.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
            return input;
        };
    });
