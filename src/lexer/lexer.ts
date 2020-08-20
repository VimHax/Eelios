import { Token, TokenKind } from './token';
import { SyntaxError, SyntaxErrorKind } from '../error/syntaxError';
import { Iter } from './iter';
import scan from './scan/scan';

export default class Lexer {
	private readonly iter: Iter;
	private idx = -1;
	private winding = false;
	private windingIdx = 0;
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

	public peek(): Token | SyntaxError {
		const token = this.processed[this.idx + 1];
		if (token !== undefined) return token;
		const consumed = scan(this.iter);
		if (consumed instanceof Token) {
			this.processed.push(consumed);
		}
		return consumed;
	}

	public consume(): Token | SyntaxError {
		const token = this.processed[this.idx + 1];
		if (token !== undefined) {
			this.idx++;
			return token;
		}
		const consumed = scan(this.iter);
		if (consumed instanceof Token) {
			this.processed.push(consumed);
		}
		this.idx++;
		return consumed;
	}

	public consumeKind(kinds: TokenKind[]): Token | SyntaxError {
		const token = this.processed[this.idx + 1];
		if (token !== undefined) {
			if (!kinds.includes(token.getKind())) {
				return new SyntaxError(SyntaxErrorKind.ExpectedButFound, [
					kinds,
					token
				]);
			}
			this.idx++;
			return token;
		}
		const consumed = scan(this.iter);
		if (consumed instanceof Token) {
			if (!kinds.includes(consumed.getKind())) {
				return new SyntaxError(SyntaxErrorKind.ExpectedButFound, [
					kinds,
					consumed
				]);
			}
		}
		this.processed.push(consumed as Token);
		this.idx++;
		return consumed;
	}
}
