import { Iter } from '../iter';
import { Token, TokenKind, Span } from '../token';
import { UnterminatedStringLiteral } from '../../error/syntaxError';

// scanString //
/* Extracts a string from the provided iterator */

export default function scanString(iter: Iter): Token {
	let string = '';
	let escaped = false;
	let terminated = false;
	const start = iter.currentIdx();
	iter.next();

	while (!iter.isEnd()) {
		const char = iter.currentChar() as string;
		if (char === '"' && !escaped) {
			terminated = true;
			break;
		}
		if (char === '\\' && !escaped) {
			iter.next();
			escaped = true;
			continue;
		}
		if (escaped) escaped = false;
		string += char;
		iter.next();
	}

	const end = iter.currentIdx();
	const span = new Span(start, end);
	iter.next();

	if (terminated) return new Token(TokenKind.StringLiteral, string, span);

	throw new UnterminatedStringLiteral(string, span);
}
