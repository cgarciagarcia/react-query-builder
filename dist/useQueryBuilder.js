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
import { useReducer, useState } from "react";
import { build, clearFilterAction, filterAction, includeAction, sortAction, } from "@/index";
var reducer = function (state, action) {
    switch (action === null || action === void 0 ? void 0 : action.type) {
        case "filter": {
            var filter = action.payload;
            return filterAction(filter.attribute, filter.value, state);
        }
        case "clear_filter": {
            return clearFilterAction(state);
        }
        case "include": {
            var includes = action.payload;
            return includeAction(includes, state);
        }
        case "sort": {
            var sorts = action.payload;
            return sortAction(sorts, state);
        }
        default: {
            return __assign({}, state);
        }
    }
};
var initialState = function () { return ({
    aliases: {},
    filters: [],
    includes: [],
    sorts: [],
}); };
export var useQueryBuilder = function (config) {
    if (config === void 0) { config = {}; }
    var init = useState(function () { return initialState(); })[0];
    var _a = useReducer(reducer, init, function (init) {
        var _a;
        return (__assign(__assign({}, init), { aliases: (_a = config === null || config === void 0 ? void 0 : config.aliases) !== null && _a !== void 0 ? _a : {} }));
    }), state = _a[0], dispatch = _a[1];
    var builder = {
        filters: function (attribute, value) {
            dispatch({
                type: "filter",
                payload: { attribute: attribute, value: value },
            });
            return builder;
        },
        build: function () { return build(state); },
        clearFilters: function () {
            dispatch({
                type: "clear_filter",
                payload: undefined,
            });
            return builder;
        },
        includes: function (includes) {
            dispatch({
                type: "include",
                payload: includes,
            });
            return builder;
        },
        sorts: function (attribute, direction) {
            dispatch({
                type: "sort",
                payload: [attribute, direction !== null && direction !== void 0 ? direction : "asc"],
            });
            return builder;
        },
    };
    return builder;
};
