var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
export var build = function (state) {
    var filters = state.filters.reduce(function (acc, filter) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a["filters[".concat(filter.attribute, "]")] = filter.value.join(","), _a)));
    }, {});
    var sorts = state.sorts.reduce(function (acc, sort) {
        var attribute = sort[0], dir = sort[1];
        var direction = dir === "desc" ? "-" : "";
        acc.push("".concat(direction).concat(attribute));
        return acc;
    }, []);
    var urlSearchParams = new URLSearchParams(__assign({}, filters));
    if (sorts.length > 0) {
        urlSearchParams.append("sort", sorts.join(","));
    }
    var searchParamsString = urlSearchParams.toString();
    return searchParamsString ? "?" + urlSearchParams.toString() : "";
};
