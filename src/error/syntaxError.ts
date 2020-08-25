import chalk from 'chalk';

import InterpreterError from './interpreterError';

import { Span, Token, TokenKind } from '../lexer/token';

// InvalidCharacter //
/* This error will be thrown, by the Lexer, if an invalid character is found */

export class InvalidCharacter implements InterpreterError {
	private readonly character: string;
	private readonly span: Span;

	public constructor(character: string, span: Span) {
		this.character = character;
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold(
				'ERROR >'
			)} Found an invalid character, ${chalk.blue(
				this.character
			)}, at ${this.span.print(contents)}`
		);
	}
}

// UnterminatedStringLiteral //
/* This error will be thrown, by the Lexer, if a string is not terminated with a " */

export class UnterminatedStringLiteral implements InterpreterError {
	private readonly string: string;
	private readonly span: Span;

	public constructor(string: string, span: Span) {
		this.string = string;
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold(
				'ERROR >'
			)} Found an unterminated string literal, ${chalk.blue(
				this.string
			)}, at ${this.span.print(contents)}`
		);
	}
}

// ExpectedButFound //
/* This error will be thrown, by the Lexer, if a specific token was expected but found something else */

export class ExpectedButFound implements InterpreterError {
	private readonly expected: TokenKind;
	private readonly found: Token;

	public constructor(expected: TokenKind, found: Token) {
		this.expected = expected;
		this.found = found;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold('ERROR >')} Expected a ${chalk.blue(
				this.expected
			)} token, but found a ${chalk.blue(
				this.found.getKind()
			)}, at ${this.found.getSpan().print(contents)}`
		);
	}
}

// InvalidDataType //
/* This error will be thrown, by the Parser, if an invalid data type is found */

export class InvalidDataType implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold(
				'ERROR >'
			)} Found an invalid datatype, at ${this.span.print(contents)}`
		);
	}
}

// InvalidInstruction //
/* This error will be thrown, by the Parser, if an invalid instruction is found */

export class InvalidInstruction implements InterpreterError {
	private readonly span: Span;

	public constructor(span: Span) {
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold(
				'ERROR >'
			)} Found an invalid instruction, at ${this.span.print(contents)}`
		);
	}
}

// InvalidParameter //
/* This error will be thrown, by the Parser, if multiple parameters share the same name */

export class InvalidParameter implements InterpreterError {
	private readonly parameter: string;
	private readonly span: Span;

	public constructor(parameter: string, span: Span) {
		this.parameter = parameter;
		this.span = span;
	}

	public print(contents: string): void {
		console.log(
			`${chalk.red.bold(
				'ERROR >'
			)} Multiple parameters share the name ${chalk.blue(
				this.parameter
			)}, at ${this.span.print(contents)}`
		);
	}
}
