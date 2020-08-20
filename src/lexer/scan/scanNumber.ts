import { Iter } from '../iter';
import { Token, TokenKind, Span } from '../token';
import { InvalidCharacter } from '../../error/syntaxError';

// scanNumber //
/* Extracts a number from the provided iterator */

export default function scanNumber(iter: Iter): Token {
	let number = iter.currentChar() as string;
	const start = iter.currentIdx();
	iter.next();

	while (!iter.isEnd()) {
		const char = iter.currentChar() as string;
		if (isNaN(Number(char)) || char.trim().length === 0) {
			if (char !== '.') break;
		}
		number += char;
		iter.next();
	}

	const end = iter.currentIdx();
	const span = new Span(start, end);

	if (/^((\d+)|(\d*\.\d+)|(\d+\.\d*))$/.exec(number) !== null) {
		return new Token(TokenKind.NumberLiteral, Number(number), span);
	}

	throw new InvalidCharacter(number, span);
}
