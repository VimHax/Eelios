import chalk from 'chalk';

import InterpreterError from './interpreterError';

import { Span } from '../lexer/token';
import { DataType } from '../parser/ast';

// UndefinedVariable //
/* This error will be thrown, by the Evaluator, if a variable is undefined */

export class UndefinedVariable implements InterpreterError {
	private readonly name: string;
	private readonly span: Span;

	public constructor(name: string, span: Span) {
		this.name = name;
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Undefined variable, ${chalk.blue(
				this.name
			)}, at ${this.span.print(contents)}`
		);
	}
}

// ExpectedDataTypeButFound //
/* This error will be thrown, by the Evaluator, if a value of a certain datatype was expected but found something else */

export class ExpectedDataTypesButFound implements InterpreterError {
	private readonly expected: DataType[];
	private readonly found: DataType;
	private readonly span: Span;

	public constructor(expected: DataType[], found: DataType, span: Span) {
		this.expected = expected;
		this.found = found;
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold(
				'ERROR >'
			)} Expected a value of type ${this.expected
				.map(dt => chalk.blue(dt.print()))
				.join(' OR ')}, but found a value of type ${chalk.blue(
				this.found.print()
			)}, at ${this.span.print(contents)}`
		);
	}
}

// InvalidIndex //
/* This error will be thrown, by the Evaluator, if the program tried to access an undefined element */

export class InvalidIndex implements InterpreterError {
	private readonly index: number;
	private readonly span: Span;

	public constructor(index: number, span: Span) {
		this.index = index;
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Element at the index ${chalk.blue(
				this.index
			)}, at ${this.span.print(contents)}, is undefined`
		);
	}
}

// InvalidFunction //
/* This error will be thrown, by the Evaluator, if a function didn't evaluate to a value */

export class InvalidFunction implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold(
				'ERROR >'
			)} The function call, at ${this.span.print(
				contents
			)}, didn't evaluate to a value`
		);
	}
}

// InvalidClosure //
/* This error will be thrown, by the Evaluator, if a function didn't evaluate to a value */

export class InvalidClosure implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold(
				'ERROR >'
			)} The closure call, at ${this.span.print(
				contents
			)}, didn't evaluate to a value`
		);
	}
}

// InvalidInstruction //
/* This error will be thrown, by the Evaluator, if a specific instruction didn't evaluate to a value */

export class InvalidInstruction implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} The instruction, at ${this.span.print(
				contents
			)}, didn't evaluate to a value`
		);
	}
}

// InvalidSelf //
/* This error will be thrown, by the Evaluator, if a function didn't evaluate to a value */

export class InvalidSelf implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Use of self, at ${this.span.print(
				contents
			)}, is invalid as it's not being used inside of a function or closure`
		);
	}
}

// InvalidArguments //
/* This error will be thrown, by the Evaluator, if the caller provided less or more than the arguments expected by a function or closure */

export class InvalidArguments implements InterpreterError {
	private readonly argLength: number;
	private readonly span: Span;

	public constructor(length: number, span: Span) {
		this.argLength = length;
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold(
				'ERROR >'
			)} Provided more or less than ${chalk.blue(
				this.argLength
			)} arguments to the function or closure, at ${this.span.print(
				contents
			)}`
		);
	}
}

// InvalidExec //
/* This error will be thrown, by the Evaluator, if the caller used the exec instruction outside of an expression */

export class InvalidExec implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Use of ${chalk.blue(
				'exec'
			)} instruction outside of an expression, at ${this.span.print(
				contents
			)}`
		);
	}
}

// InvalidLen //
/* This error will be thrown, by the Evaluator, if the caller used the len instruction outside of an expression */

export class InvalidLen implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Use of ${chalk.blue(
				'len'
			)} instruction outside of an expression, at ${this.span.print(
				contents
			)}`
		);
	}
}

// InvalidInput //
/* This error will be thrown, by the Evaluator, if the caller used the input instruction outside of an expression */

export class InvalidInput implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Use of ${chalk.blue(
				'input'
			)} instruction outside of an expression, at ${this.span.print(
				contents
			)}`
		);
	}
}

// InvalidToString //
/* This error will be thrown, by the Evaluator, if the caller used the toString instruction outside of an expression */

export class InvalidToString implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Use of ${chalk.blue(
				'toString'
			)} instruction outside of an expression, at ${this.span.print(
				contents
			)}`
		);
	}
}

// InvalidToNumber //
/* This error will be thrown, by the Evaluator, if the caller used the toNumber instruction outside of an expression */

export class InvalidToNumber implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Use of ${chalk.blue(
				'toNumber'
			)} instruction outside of an expression, at ${this.span.print(
				contents
			)}`
		);
	}
}

// InvalidToBoolean //
/* This error will be thrown, by the Evaluator, if the caller used the toBoolean instruction outside of an expression */

export class InvalidToBoolean implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Use of ${chalk.blue(
				'toBoolean'
			)} instruction outside of an expression, at ${this.span.print(
				contents
			)}`
		);
	}
}

// InvalidIsNumber //
/* This error will be thrown, by the Evaluator, if the caller used the isNumber instruction outside of an expression */

export class InvalidIsNumber implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Use of ${chalk.blue(
				'isNumber'
			)} instruction outside of an expression, at ${this.span.print(
				contents
			)}`
		);
	}
}

// InvalidIsBoolean //
/* This error will be thrown, by the Evaluator, if the caller used the isBoolean instruction outside of an expression */

export class InvalidIsBoolean implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Use of ${chalk.blue(
				'isBoolean'
			)} instruction outside of an expression, at ${this.span.print(
				contents
			)}`
		);
	}
}

// InvalidNumber //
/* This error will be thrown, by the Evaluator, if the caller tried to convert an invalid number to a number */

export class InvalidNumber implements InterpreterError {
	private readonly number: string;
	private readonly span: Span;

	public constructor(number: string, span: Span) {
		this.number = number;
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Failed to convert, ${chalk.blue(
				this.number
			)}, at ${this.span.print(contents)}, to a ${chalk.blue('Number')}`
		);
	}
}

// InvalidBoolean //
/* This error will be thrown, by the Evaluator, if the caller tried to convert an invalid boolean to a boolean */

export class InvalidBoolean implements InterpreterError {
	private readonly boolean: string;
	private readonly span: Span;

	public constructor(number: string, span: Span) {
		this.boolean = number;
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Failed to convert, ${chalk.blue(
				this.boolean
			)}, at ${this.span.print(contents)}, to a ${chalk.blue('Boolean')}`
		);
	}
}
