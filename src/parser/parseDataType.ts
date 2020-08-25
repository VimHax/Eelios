import Lexer from '../lexer/lexer';

import { TokenKind } from '../lexer/token';
import { InvalidDataType } from '../error/syntaxError';

import {
	DataType,
	ArrayDataType,
	FunctionDataType,
	ClosureDataType,
	StringDataType,
	NumberDataType,
	BooleanDataType,
	InstructionDataType
} from './ast';

// ParseDataType //
/* Parses and returns a data type */

export default function ParseDataType(lexer: Lexer): DataType {
	const token = lexer.consume();
	switch (token.getKind()) {
		// Parse String, Number, Boolean, Instruction or Array DataType //
		case TokenKind.Identifier: {
			const datatype = token.getValue() as string;
			if (datatype === 'Array') {
				lexer.consumeKind(TokenKind.Lt);
				const datatype = ParseDataType(lexer);
				lexer.consumeKind(TokenKind.Gt);
				return new ArrayDataType(datatype);
			}
			switch (datatype) {
				case 'String':
					return new StringDataType();
				case 'Number':
					return new NumberDataType();
				case 'Boolean':
					return new BooleanDataType();
				case 'Instruction':
					return new InstructionDataType();
			}
			throw new InvalidDataType(token.getSpan());
		}
		// Parse Function DataType //
		case TokenKind.Pipe: {
			const parameters: DataType[] = [];
			let first = true;
			let peek = lexer.peek();
			while (!peek.isKind([TokenKind.EOF, TokenKind.Pipe])) {
				if (first) first = false;
				else lexer.consumeKind(TokenKind.Comma);
				const parameter = ParseDataType(lexer);
				parameters.push(parameter);
				peek = lexer.peek();
			}
			lexer.consumeKind(TokenKind.Pipe);
			lexer.consumeKind(TokenKind.MinusGt);
			const returnType = ParseDataType(lexer);
			return new FunctionDataType(parameters, returnType);
		}
		// Parse Closure DataType //
		case TokenKind.LParen: {
			const parameters: DataType[] = [];
			let first = true;
			let peek = lexer.peek();
			while (!peek.isKind([TokenKind.EOF, TokenKind.RParen])) {
				if (first) first = false;
				else lexer.consumeKind(TokenKind.Comma);
				const parameter = ParseDataType(lexer);
				parameters.push(parameter);
				peek = lexer.peek();
			}
			lexer.consumeKind(TokenKind.RParen);
			lexer.consumeKind(TokenKind.EqGt);
			const returnType = ParseDataType(lexer);
			return new ClosureDataType(parameters, returnType);
		}
	}
	throw new InvalidDataType(token.getSpan());
}
