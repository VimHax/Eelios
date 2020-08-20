import { Iter } from '../iter';
import { Token, TokenKind, Span } from '../token';
import { SyntaxError, SyntaxErrorKind } from '../../error/syntaxError';

export default function scanNumber(iter: Iter): Token | SyntaxError {
	let n = iter.currentChar() as string;
	const start = iter.currentIdx();
	iter.next();

	while (!iter.isEnd()) {
		const c = iter.currentChar() as string;
		if (isNaN(Number(c)) || c.trim().length === 0) {
			if (c !== '.') {
				break;
			}
		}
		n += c;
		iter.next();
	}

	const end = iter.currentIdx();
	const span = new Span(start, end);

	if (/^((\d+)|(\d*\.\d+)|(\d+\.\d*))$/.exec(n) !== null) {
		return new Token(TokenKind.NumberLiteral, Number(n), span);
	}

	return new SyntaxError(SyntaxErrorKind.InvalidCharacter, [n, span]);
}
