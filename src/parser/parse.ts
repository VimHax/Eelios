import Lexer from '../lexer/lexer';
import { InstructionNode } from './ast';

import ParseInstruction from './parseInstruction';

// parse //
/* Parses and returns an instruction */

export default function parse(contents: string): InstructionNode {
	const lexer = new Lexer(contents);
	return ParseInstruction(lexer);
}
