import Lexer from '../lexer/lexer';
import { SyntaxError } from '../error/syntaxError';
import { InstructionNode } from './ast';

import ParseInstruction from './parseInstruction';

export default class Parser {
	private readonly lexer: Lexer;

	public constructor(contents: string) {
		this.lexer = new Lexer(contents);
	}

	public parse(): InstructionNode | SyntaxError {
		return ParseInstruction(this.lexer);
	}
}
