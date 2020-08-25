import fs from 'fs';
import chalk from 'chalk';

import Parse from './parser/parse';
import Evaluator from './evaluator/evaluator';

console.log(chalk.green.bold('Eelios v1.0.0 by VimHax'));
const contents = fs.readFileSync('./program.ee').toString();

try {
	const parsed = Parse(contents);
	const evaluator = new Evaluator(parsed);
	const res = evaluator.evaluate();
	if (res === null) {
		console.log(
			chalk.green.bold('Program Exited, Without Evaluating To A Value')
		);
	} else {
		console.log(
			chalk.green.bold(
				`Program Exited, It Evaluated To - ${res.getValue().toString()}`
			)
		);
	}
} catch (err) {
	err.print(contents);
}
