/*
 * DaTtSs: status_d.js
 *
 * (c) Copyright Teleportd Ltd 2013
 *
 * @author: n1t0
 *
 * @log:
 * 2013-04-25  n1t0    Creation
 */
'use strict';

//
// ### StatusController
// Status controller used by `status` directive
//

angular.module('dattss.directives').controller('StatusController',
  function($scope, $timeout, $location) {
    $scope.show = [];
    $scope.hide = [];

    $scope.is_demo = /\/demo\/#\//.test($location.absUrl());

    /**************************************************************************/
    /*                                 HELPERS                                */
    /**************************************************************************/
    $scope.box_style = function(obj) {
      return {
        'margin-left': ((obj.depth) * -20) + 'px',
        'z-index': 1000 - (obj.depth * 10)
      };
    };

    $scope.align_left = function(obj) {
      return {
        'left': (obj.depth * -20) + 'px',
      }
    }

    $scope.z_index = function(obj) {
      return {
        'z-index': 1000 - (obj.depth * 10)
      }
    }

    /**************************************************************************/
    /*                               DATA UPDATE                              */
    /**************************************************************************/
    /* Recursively update the data and return the updated array               */
    $scope.update = function(current, update) {
      if(!Array.isArray(current) ||
         !Array.isArray(update)) {
        return;
      }

      var srt = function(a, b) {
        if (a.label > b.label) return 1;
        if (a.label < b.label) return -1;
        return 0;
      };
      current.sort(srt);
      update.sort(srt);

      var update_status = function(current, update) {
        ['c', 'g', 'ms'].forEach(function(type) {
          current[type] = current[type] || {};
          [ 'typ', 'pth', 'sum', 'cnt', 'max', 'min', 'top', 'bot', 'fst',
            'lst' ].forEach(function(val) {
              current[type][val] = update[type][val];
            });
        });
      };

      update.forEach(function(value_upd, i) {
        /* Value already exists, we update it */
        if(current[i] &&
           current[i].label === value_upd.label) {
          update_status(current[i].status, value_upd.status);
          $scope.update(current[i].child, value_upd.child);
        }
        /* Value does not exist, we insert it */
        else {
          var new_value = {
            status: value_upd.status,
            depth: value_upd.depth,
            label: value_upd.label,
            open: false,
            child: $scope.update([], value_upd.child)
          };

          if(current.length <= i) {
            current.push(new_value);
          }
          else {
            current.splice(i, 0, new_value);
          }
        }
      });
    };

    $scope.$watch('data', function(data) {
      if(Array.isArray(data) && data.length > 0) {
        $scope.no_data = false;
        if(!$scope.status) {
          $scope.status = data;
        }
        else {
          /* Recursively update the data */
          $scope.update($scope.status || [], data);
        }
      }
      else {
        $scope.no_data = true;
      }
    }, true);

    /**************************************************************************/
    /*                               VIEW HELPERS                             */
    /**************************************************************************/
    $scope.toggle_view = function(status) {
      if(status) {
        var deleted = false;
        $scope.show.forEach(function(s, idx) {
          if(status.pth === s.pth &&
             status.typ === s.typ) {
            $scope.show.splice(idx, 1);
            $scope.hide.push(status.typ + '-' + status.pth);
            deleted = true;
          }
        });
        if(!deleted) {
          $scope.show.push(status);
          var idx = $scope.hide.indexOf(status.typ + '-' + status.pth);
          if(idx !== -1) {
            $scope.hide.splice(idx, 1);
          }
        }
        $scope.$emit('show', status, !deleted);
      }
    };

    $scope.is_shown = function(status) {
      var shown = false;
      $scope.show.forEach(function(s) {
        if(s.typ === status.typ &&
           s.pth === status.pth) {
          shown = true;
        }
      });
      return shown;
    };

    /**************************************************************************/
    /*                            FAVORITES HELPERS                           */
    /**************************************************************************/
    $scope.toggle_favorite = function(status) {
      if(status) {
        var idx = $scope.favorites.indexOf(status.typ + '-' + status.pth);
        var deleted = false;
        if(idx !== -1) {
          $scope.favorites.splice(idx, 1);
          deleted = true;
        }
        else {
          $scope.favorites.push(status.typ + '-' + status.pth);
        }
        $scope.$emit('favorite', status, !deleted);
      }
    };

    $scope.is_favorite = function(status) {
      if(status && $scope.favorites) {
        var is_fav = ($scope.favorites.indexOf(status.typ + '-' + status.pth) !== -1);
        /* Automatically show the associated graph if user doesn't want to    */
        /* hide it                                                            */
        if(!$scope.is_shown(status) && is_fav &&
           $scope.hide.indexOf(status.typ + '-' + status.pth) === -1) {
          $scope.toggle_view(status);
        }
        return is_fav;
      }
      return false;
    }

    /**************************************************************************/
    /*                              ALERTS HELPERS                            */
    /**************************************************************************/
    $scope.add_alert = function(status) {
      $scope.alert_status = angular.copy(status);
    };
  });

//
// ### `status` directive
// The status directive build the tree menu containing all current status
// ```
// @data {=object} the current status to build
// @show {=array} an array containing all status to show
// @favorites {=array} an array of favorite paths
// ```
//
angular.module('dattss.directives').directive('status', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      data: '=',
      show: '=',
      favorites: '='
    },
    templateUrl: '/partials/dashboard/status_d.html',
    controller: 'StatusController'
  }
});
