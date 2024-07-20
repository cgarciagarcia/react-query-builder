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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { usingAlias, } from "@/utils";
export var filterAction = function (attribute, value, state) {
    var _a;
    var alias = usingAlias(state, attribute);
    var prevFilter;
    var allFilters = state.filters.reduce(function (filters, filter) {
        if (filter.attribute === alias) {
            prevFilter = filter;
            return filters;
        }
        return __spreadArray(__spreadArray([], filters, true), [filter], false);
    }, []);
    var val = Array.isArray(value) ? value : [value];
    var newState = __assign(__assign({}, state), { filters: __spreadArray(__spreadArray([], allFilters, true), [
            {
                attribute: attribute,
                value: __spreadArray(__spreadArray([], ((_a = prevFilter === null || prevFilter === void 0 ? void 0 : prevFilter.value) !== null && _a !== void 0 ? _a : []), true), val, true),
            },
        ], false) });
    return newState;
};
export var clearFilterAction = function (state) {
    return __assign(__assign({}, state), { filters: [] });
};
