export interface IterNext {
	done: boolean;
	value?: string;
}

export class Iter {
	private idx = 0;
	private readonly text: string;

	public constructor(text: string) {
		this.text = text;
	}

	public next(): IterNext {
		const value = this.text[this.idx];
		if (value === undefined) {
			return {
				done: true
			};
		}
		this.idx++;
		return {
			done: false,
			value
		};
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
}
