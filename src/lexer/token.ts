import chalk from 'chalk';

// Span //
/* This class stores is used to store an area of code in the file contents */

export class Span {
	private readonly start: number;
	private readonly end: number;

	public constructor(start: number, end: number) {
		this.start = start;
		this.end = end;
	}

	public getStart(): number {
		return this.start;
	}

	public getEnd(): number {
		return this.end;
	}

	public print(contents: string): string {
		const lines = contents.split('\n');
		let total = 0;
		let lineNumber = 0;
		for (const [idx, line] of lines.entries()) {
			let length = line.length;
			if (idx + 1 < lines.length) length++;
			if (total + length > this.start) break;
			lineNumber++;
			total += length;
		}
		const [startCharNo, endCharNo] = [this.start - total, this.end - total];
		return chalk.red(
			`Line: ${lineNumber + 1}, Character: ${startCharNo + 1}-${
				endCharNo + 1
			}`
		);
	}
}

// TokenKind //
/* The types of tokens */

export enum TokenKind {
	EOF = 'EOF',
	Identifier = 'Identifier',

	Colon = 'Colon', // :
	Comma = 'Comma', // ,
	Dot = 'Dot', // .
	RParen = 'RParen', // (
	LParen = 'LParen', // )
	LBracket = 'LBracket', // [
	RBracket = 'RBracket', // ]

	Plus = 'Plus', // +
	Minus = 'Minus', // -
	Star = 'Star', // *
	Slash = 'Slash', // /
	Caret = 'Caret', // ^
	Percentage = 'Percentage', // %
	Ampersand = 'Ampersand', // &
	Pipe = 'Pipe', // |

	Not = 'Not', // !
	Eq = 'Eq', // =
	NotEq = 'NotEq', // !=
	Lt = 'Lt', // <
	Gt = 'Gt', // >
	Le = 'Le', // <=
	Ge = 'Ge', // >=

	LtMinus = 'LtMinus', // <-
	MinusGt = 'MinusGt', // ->
	EqGt = 'EqGt', // =>

	PrintKW = 'PrintKW',
	LenKW = 'LenKW',
	EvalKW = 'EvalKW',
	ExecKW = 'ExecKW',
	IfKW = 'IfKW',
	ThenKW = 'ThenKW',
	ElseKW = 'ElseKW',
	WhileKW = 'WhileKW',
	DoKW = 'DoKW',

	NumberLiteral = 'NumberLiteral',
	StringLiteral = 'StringLiteral',
	BooleanLiteral = 'BooleanLiteral'
}

// Token //
/* Used to store an "atomic" element of the language */

export class Token {
	private readonly kind: TokenKind;
	private readonly value: any;
	private readonly span: Span;

	public constructor(kind: TokenKind, value: any, span: Span) {
		this.kind = kind;
		this.value = value;
		this.span = span;
	}

	public getKind(): TokenKind {
		return this.kind;
	}

	public getValue(): any {
		return this.value;
	}

	public getSpan(): Span {
		return this.span;
	}

	public isKind(kinds: TokenKind[]): boolean {
		return kinds.includes(this.kind);
	}
}
