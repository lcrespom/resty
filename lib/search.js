"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
function search(query, json) {
    if (!query || !query.search)
        return json;
    console.log('Search:', query.search);
    let match = query.search.match(/^([^!<=>~\s]+)\s*(==|<|<=|>|>=|!=|=~)\s*([^!<=>~]+)$/);
    if (!match)
        return json;
    let [_, prop, comp, value] = match;
    return json.filter(o => checkCondition(o, prop, comp, value));
}
exports.search = search;
function checkCondition(o, prop, comp, value) {
    let left = o[prop];
    let right = value;
    switch (comp) {
        case '==': return left == right;
        case '<': return left < right;
        case '<=': return left <= right;
        case '>': return left > right;
        case '>=': return left >= right;
        case '!=': return left != right;
        case '=~': return new RegExp(right).test(left);
    }
}
