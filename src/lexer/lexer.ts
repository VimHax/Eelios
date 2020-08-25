import scan from './scan/scan';

import { Token, TokenKind } from './token';
import { Iter } from './iter';
import { ExpectedButFound } from '../error/syntaxError';

// Lexer //
/* This class scans and consumes tokens and contains utility methods which are used by the parser */

export default class Lexer {
	private idx = -1;
	private winding = false;
	private windingIdx = 0;
	private readonly iter: Iter;
	private readonly processed: Token[] = [];

	public constructor(contents: string) {
		this.iter = new Iter(contents);
	}

	public wind(): void {
		if (this.winding) throw Error('Already winding');
		this.winding = true;
		this.windingIdx = this.idx;
	}

	public unwind(): void {
		if (!this.winding) throw Error('Already unwinded');
		this.winding = false;
		this.idx = this.windingIdx;
	}

	public currentToken(): Token {
		return this.processed[this.idx];
	}

	public peek(): Token {
		const token = this.processed[this.idx + 1];
		if (token !== undefined) return token;
		const consumed = scan(this.iter);
		if (consumed instanceof Token) this.processed.push(consumed);
		return consumed;
	}

	public consume(): Token {
		const token = this.processed[this.idx + 1];
		if (token !== undefined) {
			this.idx++;
			return token;
		}
		const consumed = scan(this.iter);
		if (consumed instanceof Token) this.processed.push(consumed);
		this.idx++;
		return consumed;
	}

	public consumeKind(kind: TokenKind): Token {
		const token = this.processed[this.idx + 1];
		if (token !== undefined) {
			if (!token.isKind([kind])) {
				throw new ExpectedButFound(kind, token);
			}
			this.idx++;
			return token;
		}
		const consumed = scan(this.iter);
		if (consumed instanceof Token) {
			if (!consumed.isKind([kind])) {
				throw new ExpectedButFound(kind, consumed);
			}
		}
		this.processed.push(consumed);
		this.idx++;
		return consumed;
	}
}
