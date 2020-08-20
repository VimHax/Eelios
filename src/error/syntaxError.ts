import InterpreterError from './interpreterError';
import { Span, Token, TokenKind } from '../lexer/token';

export enum SyntaxErrorKind {
	InvalidCharacter = 'InvalidCharacter',
	UnterminatedStringLiteral = 'UnterminatedStringLiteral',
	ExpectedButFound = 'ExpectedButFound',
	InvalidDataType = 'InvalidDataType',
	InvalidInstruction = 'InvalidInstruction'
}

export class SyntaxError implements InterpreterError {
	private readonly kind: SyntaxErrorKind;
	private readonly info: any;

	public constructor(kind: SyntaxErrorKind, info: any) {
		this.kind = kind;
		this.info = info;
	}

	public print(contents: string): void {
		switch (this.kind) {
			case SyntaxErrorKind.InvalidCharacter: {
				const [char, span] = this.info as [string, Span];
				console.log(
					`Found an invalid character, "${char}", at ${span.print(
						contents
					)}`
				);
				break;
			}
			case SyntaxErrorKind.UnterminatedStringLiteral: {
				const [str, span] = this.info as [string, Span];
				console.log(
					`Found an unterminated string literal, "${str}", at ${span.print(
						contents
					)}`
				);
				break;
			}
			case SyntaxErrorKind.ExpectedButFound: {
				const [kind, token] = this.info as [TokenKind[], Token];
				console.log(
					`Expected a ${kind} token, but found a ${token.getKind()}, at ${token
						.getSpan()
						.print(contents)}`
				);
				break;
			}
			case SyntaxErrorKind.InvalidDataType: {
				const span = this.info as Span;
				console.log(
					`Found an invalid datatype, at ${span.print(contents)}`
				);
				break;
			}
			case SyntaxErrorKind.InvalidInstruction: {
				const span = this.info as Span;
				console.log(
					`Found an invalid instruction, at ${span.print(contents)}`
				);
				break;
			}
		}
	}
}
