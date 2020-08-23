import Parse from './parser/parse';
import Evaluator from './evaluator/evaluator';

import fs from 'fs';
import util from 'util';

const contents = fs.readFileSync('./test.ee').toString();

try {
	const start = new Date();
	const parsed = Parse(contents);
	const end = new Date();
	console.log(
		`Time Taken - ${end.getMilliseconds() - start.getMilliseconds()}`
	);
	console.log(util.inspect(parsed, false, null, true));
	const evaluator = new Evaluator(parsed);
	const res = evaluator.evaluate();
	console.log(res);
} catch (err) {
	console.log(err);
	err.print(contents);
}
