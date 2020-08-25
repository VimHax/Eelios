import Lexer from '../lexer/lexer';
import ParseExpression from './parseExpression';

import { ExpressionNode } from './ast';

// parse //
/* Parses and returns an instruction */

export default function parse(contents: string): ExpressionNode {
	const lexer = new Lexer(contents);
	return ParseExpression(lexer);
}
