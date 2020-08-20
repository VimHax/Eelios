import Lexer from '../lexer/lexer';
import { TokenKind } from '../lexer/token';
import { SyntaxError, SyntaxErrorKind } from '../error/syntaxError';
import {
	DataType,
	ArrayDataType,
	FunctionDataType,
	ClosureDataType
} from './ast';

export default function ParseDataType(lexer: Lexer): DataType | SyntaxError {
	const token = lexer.consume();
	if (token instanceof SyntaxError) {
		return token;
	}
	switch (token.getKind()) {
		case TokenKind.Identifier: {
			const datatype = token.getValue() as string;
			if (datatype === 'Array') {
				const ltToken = lexer.consumeKind([TokenKind.Lt]);
				if (ltToken instanceof SyntaxError) {
					return ltToken;
				}
				const datatype = ParseDataType(lexer);
				if (datatype instanceof SyntaxError) {
					return datatype;
				}
				const gtToken = lexer.consumeKind([TokenKind.Gt]);
				if (gtToken instanceof SyntaxError) {
					return gtToken;
				}
				return { datatype } as ArrayDataType;
			}
			if (
				!['string', 'number', 'boolean', 'instruction'].includes(
					datatype
				)
			) {
				return new SyntaxError(
					SyntaxErrorKind.InvalidDataType,
					token.getSpan()
				);
			}
			return datatype as DataType;
		}
		case TokenKind.Pipe: {
			const parameters: DataType[] = [];
			let first = true;
			let peek = lexer.peek();
			if (peek instanceof SyntaxError) return peek;
			while (![TokenKind.EOF, TokenKind.Pipe].includes(peek.getKind())) {
				if (first) {
					first = false;
				} else {
					const commaToken = lexer.consumeKind([TokenKind.Comma]);
					if (commaToken instanceof SyntaxError) return commaToken;
				}
				const parameter = ParseDataType(lexer);
				if (parameter instanceof SyntaxError) {
					return parameter;
				}
				parameters.push(parameter);
				peek = lexer.peek();
				if (peek instanceof SyntaxError) return peek;
			}
			const pipeToken = lexer.consumeKind([TokenKind.Pipe]);
			if (pipeToken instanceof SyntaxError) {
				return pipeToken;
			}
			const minusGtToken = lexer.consumeKind([TokenKind.MinusGt]);
			if (minusGtToken instanceof SyntaxError) {
				return minusGtToken;
			}
			const returnType = ParseDataType(lexer);
			if (returnType instanceof SyntaxError) {
				return returnType;
			}
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
			if (peek instanceof SyntaxError) return peek;
			while (
				![TokenKind.EOF, TokenKind.RParen].includes(peek.getKind())
			) {
				if (first) {
					first = false;
				} else {
					const commaToken = lexer.consumeKind([TokenKind.Comma]);
					if (commaToken instanceof SyntaxError) return commaToken;
				}
				const parameter = ParseDataType(lexer);
				if (parameter instanceof SyntaxError) {
					return parameter;
				}
				parameters.push(parameter);
				peek = lexer.peek();
				if (peek instanceof SyntaxError) return peek;
			}
			const rparenToken = lexer.consumeKind([TokenKind.RParen]);
			if (rparenToken instanceof SyntaxError) {
				return rparenToken;
			}
			const eqGtToken = lexer.consumeKind([TokenKind.EqGt]);
			if (eqGtToken instanceof SyntaxError) {
				return eqGtToken;
			}
			const returnType = ParseDataType(lexer);
			if (returnType instanceof SyntaxError) {
				return returnType;
			}
			return {
				type: 'closure',
				parameters,
				returnType
			} as ClosureDataType;
		}
	}
	return new SyntaxError(SyntaxErrorKind.InvalidDataType, token.getSpan());
}
