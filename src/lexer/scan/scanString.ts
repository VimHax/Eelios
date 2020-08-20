import { Iter } from '../iter';
import { Token, TokenKind, Span } from '../token';
import { SyntaxError, SyntaxErrorKind } from '../../error/syntaxError';

export default function scanString(iter: Iter): Token | SyntaxError {
	let str = '';
	const start = iter.currentIdx();
	let escaped = false;
	let terminated = false;
	iter.next();

	while (!iter.isEnd()) {
		const c = iter.currentChar() as string;
		if (c === '"' && !escaped) {
			terminated = true;
			break;
		}
		if (c === '\\' && !escaped) {
			iter.next();
			escaped = true;
			continue;
		}
		if (escaped) escaped = false;
		str += c;
		iter.next();
	}

	const end = iter.currentIdx();
	const span = new Span(start, end);
	iter.next();

	if (terminated) {
		return new Token(TokenKind.StringLiteral, str, span);
	}

	return new SyntaxError(SyntaxErrorKind.UnterminatedStringLiteral, [
		str,
		span
	]);
}
