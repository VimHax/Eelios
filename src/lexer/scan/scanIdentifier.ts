import { Iter } from '../iter';
import { Token, TokenKind, Span } from '../token';

// scanIdentifier //
/* Extracts an identifier from the provided iterator */

export default function scanIdentifier(iter: Iter): Token {
	let ident = iter.currentChar() as string;
	const start = iter.currentIdx();
	iter.next();

	while (!iter.isEnd()) {
		const char = iter.currentChar() as string;
		if (/^[a-zA-Z0-9_]$/.exec(char) === null) break;
		ident += char;
		iter.next();
	}

	const end = iter.currentIdx();
	const span = new Span(start, end);

	switch (ident) {
		case 'true':
			return new Token(TokenKind.BooleanLiteral, true, span);
		case 'false':
			return new Token(TokenKind.BooleanLiteral, false, span);
		case 'print':
			return new Token(TokenKind.PrintKW, null, span);
		case 'eval':
			return new Token(TokenKind.EvalKW, null, span);
		case 'exec':
			return new Token(TokenKind.ExecKW, null, span);
		case 'if':
			return new Token(TokenKind.IfKW, null, span);
		case 'then':
			return new Token(TokenKind.ThenKW, null, span);
		case 'else':
			return new Token(TokenKind.ElseKW, null, span);
		case 'while':
			return new Token(TokenKind.WhileKW, null, span);
		case 'do':
			return new Token(TokenKind.DoKW, null, span);
	}

	return new Token(TokenKind.Identifier, ident, span);
}
