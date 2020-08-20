import { Iter } from '../iter';
import { Token, TokenKind, Span } from '../token';
import { InvalidCharacter } from '../../error/syntaxError';

import scanString from './scanString';
import scanNumber from './scanNumber';
import scanIdentifier from './scanIdentifier';

// scan //
/* Extracts a single token from the iterator provided and returns it */

export default function scan(iter: Iter): Token {
	iter.skipWhitespace();

	const char = iter.currentChar();
	const start = iter.currentIdx();
	if (char === undefined) {
		return new Token(TokenKind.EOF, null, new Span(start, start));
	}

	function consume(kind: TokenKind, length: number) {
		while (length > 0) {
			iter.next();
			length--;
		}
		return new Token(kind, null, new Span(start, iter.currentIdx()));
	}

	switch (char) {
		case '"':
			return scanString(iter);
		case ':':
			return consume(TokenKind.Colon, 1);
		case ',':
			return consume(TokenKind.Comma, 1);
		case '(':
			return consume(TokenKind.LParen, 1);
		case ')':
			return consume(TokenKind.RParen, 1);
		case '[':
			return consume(TokenKind.LBracket, 1);
		case ']':
			return consume(TokenKind.RBracket, 1);
		case '+':
			return consume(TokenKind.Plus, 1);
		case '-': {
			const cc = iter.peek();
			if (cc === '>') return consume(TokenKind.MinusGt, 2);
			return consume(TokenKind.Minus, 1);
		}
		case '*':
			return consume(TokenKind.Star, 1);
		case '/':
			return consume(TokenKind.Slash, 1);
		case '^':
			return consume(TokenKind.Caret, 1);
		case '%':
			return consume(TokenKind.Percentage, 1);
		case '&':
			return consume(TokenKind.Ampersand, 1);
		case '|':
			return consume(TokenKind.Pipe, 1);
		case '=': {
			const nextChar = iter.peek();
			if (nextChar === '>') return consume(TokenKind.EqGt, 2);
			return consume(TokenKind.Eq, 1);
		}
		case '!': {
			const nextChar = iter.peek();
			if (nextChar === '=') return consume(TokenKind.NotEq, 2);
			return consume(TokenKind.Not, 1);
		}
		case '<': {
			const nextChar = iter.peek();
			if (nextChar !== undefined) {
				switch (nextChar) {
					case '=':
						return consume(TokenKind.Le, 2);
					case '-':
						return consume(TokenKind.LtMinus, 2);
				}
			}
			return consume(TokenKind.Lt, 1);
		}
		case '>': {
			const nextChar = iter.peek();
			if (nextChar !== undefined && nextChar === '=') {
				return consume(TokenKind.Ge, 2);
			}
			return consume(TokenKind.Gt, 1);
		}
	}

	if (/^[a-zA-Z_]$/.exec(char) !== null) return scanIdentifier(iter);
	if (/^[0-9.]$/.exec(char) !== null) return scanNumber(iter);

	throw new InvalidCharacter(char, new Span(start, start + 1));
}
