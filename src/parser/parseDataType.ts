import Lexer from '../lexer/lexer';
import { TokenKind } from '../lexer/token';
import { InvalidDataType } from '../error/syntaxError';
import {
	DataType,
	ArrayDataType,
	FunctionDataType,
	ClosureDataType
} from './ast';

// ParseDataType //
/* Parses and returns a data type */

export default function ParseDataType(lexer: Lexer): DataType {
	const token = lexer.consume();
	switch (token.getKind()) {
		case TokenKind.Identifier: {
			const datatype = token.getValue() as string;
			if (datatype === 'Array') {
				lexer.consumeKind([TokenKind.Lt]);
				const datatype = ParseDataType(lexer);
				lexer.consumeKind([TokenKind.Gt]);
				return { datatype } as ArrayDataType;
			}
			if (
				!['string', 'number', 'boolean', 'instruction'].includes(
					datatype
				)
			) {
				throw new InvalidDataType(token.getSpan());
			}
			return { type: datatype } as DataType;
		}
		case TokenKind.Pipe: {
			const parameters: DataType[] = [];
			let first = true;
			let peek = lexer.peek();
			while (![TokenKind.EOF, TokenKind.Pipe].includes(peek.getKind())) {
				if (first) first = false;
				else lexer.consumeKind([TokenKind.Comma]);
				const parameter = ParseDataType(lexer);
				parameters.push(parameter);
				peek = lexer.peek();
			}
			lexer.consumeKind([TokenKind.Pipe]);
			lexer.consumeKind([TokenKind.MinusGt]);
			const returnType = ParseDataType(lexer);
			return {
				type: 'function',
				parameters,
				returnType
			} as FunctionDataType;
		}
		case TokenKind.LParen: {
			const parameters: DataType[] = [];
			let first = true;
			let peek = lexer.peek();
			while (
				![TokenKind.EOF, TokenKind.RParen].includes(peek.getKind())
			) {
				if (first) first = false;
				else lexer.consumeKind([TokenKind.Comma]);
				const parameter = ParseDataType(lexer);
				parameters.push(parameter);
				peek = lexer.peek();
			}
			lexer.consumeKind([TokenKind.RParen]);
			lexer.consumeKind([TokenKind.EqGt]);
			const returnType = ParseDataType(lexer);
			return {
				type: 'closure',
				parameters,
				returnType
			} as ClosureDataType;
		}
	}
	throw new InvalidDataType(token.getSpan());
}
