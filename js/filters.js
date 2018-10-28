angular.module('app.filters', [])

.filter('toArray', function () {
  return function (obj, addKey) {
    if (!angular.isObject(obj)) return obj;
    if ( addKey === false ) {
      return Object.keys(obj).map(function(key) {
        return obj[key];
      });
    } else {
      return Object.keys(obj).map(function (key) {
        var value = obj[key];
        return angular.isObject(value) ?
          Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
          { $key: key, $value: value };
      });
    }
  };
})

.filter('difference', [function() {
    return function(arr1, arr2){
        if(arr1 == null)
            arr1 = [];
        if(arr2 == null)
            arr2 = [];
        return arr1.filter(function(n1) {
            for (let n2 of arr2)
                if (n2.id === n1.id)
                    return false;
            return true;
        });
    }
}])
