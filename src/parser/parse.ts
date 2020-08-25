import Lexer from '../lexer/lexer';
import { ExpressionNode } from './ast';

import ParseExpression from './parseExpression';

// parse //
/* Parses and returns an instruction */

export default function parse(contents: string): ExpressionNode {
	const lexer = new Lexer(contents);
	return ParseExpression(lexer);
}
