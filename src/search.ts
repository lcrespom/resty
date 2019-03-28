export function search(query, json: Array<Object>) {
	if (!query || !query.search) return json
	console.log('Search:', query.search)
	let match = query.search.match(/^([^!<=>~\s]+)\s*(==|<|<=|>|>=|!=|=~)\s*([^!<=>~]+)$/)
	if (!match) return json
	let [_, prop, comp, value] = match
	return json.filter(o => checkCondition(o, prop, comp, value))
}

function checkCondition(o, prop: string, comp: string, value: string) {
	let left = o[prop]
	let right = value
	switch (comp) {
		case '==': return left == right
		case '<': return left < right
		case '<=': return left <= right
		case '>': return left > right
		case '>=': return left >= right
		case '!=': return left != right
		case '=~': return new RegExp(right).test(left)
	}
}
