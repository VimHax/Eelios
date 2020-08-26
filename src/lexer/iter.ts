// Iter //
/* This small class's purpose is to keep track of which character is currently being eaten by the lexer, */
/* as well as provide utility methods for easing the lexer's job */

export class Iter {
	private idx = 0;
	private readonly text: string;

	public constructor(text: string) {
		this.text = text;
	}

	public next(): void {
		const value = this.text[this.idx];
		if (value === undefined) return;
		this.idx++;
	}

	public peek(): string | undefined {
		return this.text[this.idx + 1];
	}

	public currentChar(): string | undefined {
		return this.text[this.idx];
	}

	public currentIdx(): number {
		return this.idx;
	}

	public isEOL(): boolean {
		return this.text[this.idx] === '\n';
	}

	public isEOF(): boolean {
		return this.text[this.idx] === undefined;
	}

	public isEnd(): boolean {
		return this.isEOF() || this.isEOL();
	}

	public skipWhitespace() {
		while (
			!this.isEOF() &&
			(this.currentChar() as string).trim().length === 0
		) {
			this.next();
		}
		if (!this.isEOF() && this.currentChar() === '#') {
			this.next();
			while (!this.isEnd()) {
				this.next();
			}
			this.skipWhitespace();
		}
	}
}
