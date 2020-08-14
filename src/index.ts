import { Token, TokenKind } from './lexer/token';
import Lexer from './lexer/lexer';
import fs from 'fs';

const contents = fs.readFileSync('./test.ee').toString();

const lexer = new Lexer(contents);
let token = lexer.consume();
const tokens = [];

while (token instanceof Token && token.getKind() !== TokenKind.EOF) {
	console.log(
		`Kind: ${token.getKind()} Value: '${token.getValue()}', Span: ${token
			.getSpan()
			.print(contents)}`
	);
	tokens.push(token);
	token = lexer.consume();
}

if (!(token instanceof Token)) token.print(contents);
