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
			`Undefined variable, ${this.name}, at ${this.span.print(contents)}`
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
			`Expected a value of type ${
				this.expected
			}, but found a value of type ${this.found}, at ${this.span.print(
				contents
			)}`
		);
	}
}

// OutOfBounds //
/* This error will be thrown, by the Evaluator, if the program tried to access a index out of bounds */

export class OutOfBounds implements InterpreterError {
	private readonly index: number;
	private readonly span: Span;

	public constructor(index: number, span: Span) {
		this.index = index;
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`Index ${this.index}, at ${this.span.print(
				contents
			)}, is out of bounds`
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
			`The function call, at ${this.span.print(
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
			`The closure call, at ${this.span.print(
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
			`The instruction, at ${this.span.print(
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
			`Use of self, at ${this.span.print(
				contents
			)}, is invalid as it's not being used inside of a function or closure`
		);
	}
}

// CannotCompare //
/* This error will be thrown, by the Evaluator, if a function didn't evaluate to a value */

export class CannotCompare implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`Cannot compare values of type Array, Instruction, Function or Closure, at ${this.span.print(
				contents
			)}`
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
			`Provided more or less than ${
				this.argLength
			} arguments to the function or closure, at ${this.span.print(
				contents
			)}`
		);
	}
}
