import { Iter } from '../iter';
import { Token, TokenKind, Span } from '../token';
import { SyntaxError } from '../../error/syntaxError';

export default function scanIdentifier(iter: Iter): Token | SyntaxError {
	let ident = iter.currentChar() as string;
	const start = iter.currentIdx();
	iter.next();

	while (!iter.isEnd()) {
		const c = iter.currentChar() as string;
		if (/^[a-zA-Z0-9_]$/.exec(c) === null) {
			break;
		}
		ident += c;
		iter.next();
	}

	const end = iter.currentIdx();
	const span = new Span(start, end);

	if (ident === 'fn') { return new Token(TokenKind.FnKw, undefined, span); }

	return new Token(TokenKind.Identifier, ident, span);
}
