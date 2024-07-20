export var usingAlias = function (state, key) {
    var _a;
    return (_a = state.aliases[key]) !== null && _a !== void 0 ? _a : key;
};
