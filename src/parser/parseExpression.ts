import Lexer from '../lexer/lexer';
import { TokenKind, Span } from '../lexer/token';
import {
	ExpressionNode,
	StringLiteralNode,
	NumberLiteralNode,
	BooleanLiteralNode,
	ArrayLiteralNode,
	DataType,
	FunctionLiteralNode,
	ClosureLiteralNode,
	RValueNode,
	RValueVariableNode,
	RValueIndexOfNode,
	RValueCallNode,
	UnaryNode,
	BinaryNode
} from './ast';

import ParseDataType from './parseDataType';
import ParseInstruction from './parseInstruction';
import { InvalidParameter } from '../error/syntaxError';

// Primary //
/* Parses literals, variables, arrays & groupings */

function Primary(lexer: Lexer): ExpressionNode {
	const token = lexer.peek();
	switch (token.getKind()) {
		case TokenKind.StringLiteral:
			lexer.consume();
			return {
				value: token.getValue(),
				type: 'string',
				span: token.getSpan()
			} as StringLiteralNode;
		case TokenKind.NumberLiteral:
			lexer.consume();
			return {
				value: token.getValue(),
				type: 'number',
				span: token.getSpan()
			} as NumberLiteralNode;
		case TokenKind.BooleanLiteral:
			lexer.consume();
			return {
				value: token.getValue(),
				type: 'boolean',
				span: token.getSpan()
			} as BooleanLiteralNode;
		case TokenKind.Pipe: {
			lexer.consume();
			const start = token.getSpan().getStart();
			const parameters: [string, DataType][] = [];
			let first = true;
			let peek = lexer.peek();
			while (![TokenKind.EOF, TokenKind.Pipe].includes(peek.getKind())) {
				if (first) first = false;
				else lexer.consumeKind([TokenKind.Comma]);
				const name = lexer.consumeKind([TokenKind.Identifier]);
				if (parameters.find(p => p[0] === name.getValue())) {
					throw new InvalidParameter(name.getValue(), name.getSpan());
				}
				lexer.consumeKind([TokenKind.Colon]);
				const datatype = ParseDataType(lexer);
				parameters.push([name.getValue() as string, datatype]);
				peek = lexer.peek();
			}
			lexer.consumeKind([TokenKind.Pipe]);
			lexer.consumeKind([TokenKind.MinusGt]);
			const returnType = ParseDataType(lexer);
			const instruction = ParseInstruction(lexer);
			return {
				type: 'function',
				parameters,
				returnType,
				instruction,
				span: new Span(start, instruction.span.getEnd())
			} as FunctionLiteralNode;
		}
		case TokenKind.LParen: {
			lexer.consume();
			let isClosure = false;
			let peek = lexer.peek();
			if (peek.getKind() === TokenKind.RParen) {
				isClosure = true;
			} else {
				lexer.wind();
				while (
					![TokenKind.EOF, TokenKind.RParen].includes(peek.getKind())
				) {
					if (peek.getKind() === TokenKind.Colon) {
						isClosure = true;
						break;
					}
					lexer.consume();
					peek = lexer.peek();
				}
				lexer.unwind();
			}
			if (isClosure) {
				const start = token.getSpan().getStart();
				const parameters: [string, DataType][] = [];
				let first = true;
				while (
					![TokenKind.EOF, TokenKind.RParen].includes(peek.getKind())
				) {
					if (first) first = false;
					else lexer.consumeKind([TokenKind.Comma]);
					const name = lexer.consumeKind([TokenKind.Identifier]);
					if (parameters.find(p => p[0] === name.getValue())) {
						throw new InvalidParameter(
							name.getValue(),
							name.getSpan()
						);
					}
					lexer.consumeKind([TokenKind.Colon]);
					const datatype = ParseDataType(lexer);
					parameters.push([name.getValue() as string, datatype]);
					peek = lexer.peek();
				}
				lexer.consumeKind([TokenKind.RParen]);
				lexer.consumeKind([TokenKind.EqGt]);
				const returnType = ParseDataType(lexer);
				const instruction = ParseInstruction(lexer);
				return {
					type: 'closure',
					parameters,
					returnType,
					instruction,
					span: new Span(start, instruction.span.getEnd())
				} as ClosureLiteralNode;
			}
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			const expr = ParseExpression(lexer);
			lexer.consumeKind([TokenKind.RParen]);
			return expr;
		}
		case TokenKind.LBracket: {
			lexer.consume();
			const start = token.getSpan().getStart();
			const values: ExpressionNode[] = [];
			let first = true;
			let peek = lexer.peek();
			while (
				![TokenKind.EOF, TokenKind.RBracket].includes(peek.getKind())
			) {
				if (first) first = false;
				else lexer.consumeKind([TokenKind.Comma]);
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				const expr = ParseExpression(lexer);
				values.push(expr);
				peek = lexer.peek();
			}
			const endToken = lexer.consumeKind([TokenKind.RBracket]);
			return {
				type: 'array',
				values,
				span: new Span(start, endToken.getSpan().getEnd())
			} as ArrayLiteralNode;
		}
		case TokenKind.Identifier: {
			// Check If Assign Instruction //
			lexer.wind();
			lexer.consume();
			let peek = lexer.peek();
			while (peek.getKind() === TokenKind.LBracket) {
				lexer.consume();
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				ParseExpression(lexer);
				lexer.consumeKind([TokenKind.RBracket]);
				peek = lexer.peek();
			}
			lexer.unwind();
			if (peek.getKind() === TokenKind.LtMinus) break;
			lexer.consume();
			let rvalue: RValueNode = {
				type: 'variable',
				name: token.getValue(),
				span: token.getSpan()
			} as RValueVariableNode;
			peek = lexer.peek();
			while (
				[TokenKind.LBracket, TokenKind.LParen].includes(peek.getKind())
			) {
				if (peek.getKind() === TokenKind.LBracket) {
					const lBracketToken = lexer.consume();
					// eslint-disable-next-line @typescript-eslint/no-use-before-define
					const index = ParseExpression(lexer);
					const rBracketToken = lexer.consumeKind([
						TokenKind.RBracket
					]);
					rvalue = {
						type: 'indexof',
						rvalue,
						index,
						span: new Span(
							lBracketToken.getSpan().getStart(),
							rBracketToken.getSpan().getEnd()
						)
					} as RValueIndexOfNode;
				} else {
					const lparenToken = lexer.consume();
					let first = true;
					const args: ExpressionNode[] = [];
					let peek = lexer.peek();
					while (
						![TokenKind.EOF, TokenKind.RParen].includes(
							peek.getKind()
						)
					) {
						if (first) first = false;
						else lexer.consumeKind([TokenKind.Comma]);
						// eslint-disable-next-line @typescript-eslint/no-use-before-define
						const argument = ParseExpression(lexer);
						args.push(argument);
						peek = lexer.peek();
					}
					const rparenToken = lexer.consumeKind([TokenKind.RParen]);
					rvalue = {
						type: 'call',
						rvalue,
						arguments: args,
						span: new Span(
							lparenToken.getSpan().getStart(),
							rparenToken.getSpan().getEnd()
						)
					} as RValueCallNode;
				}
				peek = lexer.peek();
			}
			return rvalue;
		}
	}
	return ParseInstruction(lexer);
}

// Unary //
/* Parses the + & - unary operators */

function Unary(lexer: Lexer): ExpressionNode {
	const token = lexer.peek();
	if (![TokenKind.Plus, TokenKind.Minus].includes(token.getKind())) {
		return Primary(lexer);
	}
	const operator = token.getKind() === TokenKind.Plus ? 'plus' : 'minus';
	const plusToken = lexer.consume();
	const expr = Unary(lexer);
	return {
		type: operator,
		operand: expr,
		span: new Span(plusToken.getSpan().getStart(), expr.span.getEnd())
	} as UnaryNode;
}

// Exponentiation //
/* Parses the ^ binary operator */

function Exponentiation(lexer: Lexer): ExpressionNode {
	let expr = Unary(lexer);
	let peek = lexer.peek();
	while (peek.getKind() === TokenKind.Caret) {
		lexer.consume();
		const right = Unary(lexer);
		expr = {
			type: 'power',
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
	}
	return expr;
}

// Multiplication //
/* Parses the *, / & % binary operators */

function Multiplication(lexer: Lexer): ExpressionNode {
	let expr = Exponentiation(lexer);
	let peek = lexer.peek();
	while (
		[TokenKind.Star, TokenKind.Slash, TokenKind.Percentage].includes(
			peek.getKind()
		)
	) {
		lexer.consume();
		const right = Exponentiation(lexer);
		let operator = 'multiply';
		switch (peek.getKind()) {
			case TokenKind.Slash: {
				operator = 'divide';
				break;
			}
			case TokenKind.Percentage: {
				operator = 'modulus';
				break;
			}
		}
		expr = {
			type: operator,
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
	}
	return expr;
}

// Addition //
/* Parses the + & - binary operators */

function Addition(lexer: Lexer): ExpressionNode {
	let expr = Multiplication(lexer);
	let peek = lexer.peek();
	while ([TokenKind.Plus, TokenKind.Minus].includes(peek.getKind())) {
		lexer.consume();
		const right = Multiplication(lexer);
		const operator = peek.getKind() === TokenKind.Plus ? 'add' : 'subtract';
		expr = {
			type: operator,
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
	}
	return expr;
}

// Comparison //
/* Parses the <, >, <= & >= binary operators */

function Comparison(lexer: Lexer): ExpressionNode {
	let expr = Addition(lexer);
	let peek = lexer.peek();
	while (
		[TokenKind.Lt, TokenKind.Le, TokenKind.Gt, TokenKind.Ge].includes(
			peek.getKind()
		)
	) {
		lexer.consume();
		const right = Addition(lexer);
		let operator = 'lessthan';
		switch (peek.getKind()) {
			case TokenKind.Le: {
				operator = 'lessthanorequal';
				break;
			}
			case TokenKind.Gt: {
				operator = 'greaterthan';
				break;
			}
			case TokenKind.Ge: {
				operator = 'greaterthanorequal';
				break;
			}
		}
		expr = {
			type: operator,
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
	}
	return expr;
}

// Equality //
/* Parses the = & != binary operators */

function Equality(lexer: Lexer): ExpressionNode {
	let expr = Comparison(lexer);
	let peek = lexer.peek();
	while ([TokenKind.Eq, TokenKind.NotEq].includes(peek.getKind())) {
		lexer.consume();
		const right = Comparison(lexer);
		const operator = peek.getKind() === TokenKind.Eq ? 'equal' : 'notequal';
		expr = {
			type: operator,
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
	}
	return expr;
}

// LogicGates //
/* Parses the and & or binary operators */

function LogicGates(lexer: Lexer): ExpressionNode {
	let expr = Equality(lexer);
	let peek = lexer.peek();
	while ([TokenKind.Ampersand, TokenKind.Pipe].includes(peek.getKind())) {
		lexer.consume();
		const right = Equality(lexer);
		const operator = peek.getKind() === TokenKind.Ampersand ? 'and' : 'or';
		expr = {
			type: operator,
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
	}
	return expr;
}

// ParseExpression //
/* Parses an expression */

export default function ParseExpression(lexer: Lexer): ExpressionNode {
	return LogicGates(lexer);
}
