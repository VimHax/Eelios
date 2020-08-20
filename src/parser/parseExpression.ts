import Lexer from '../lexer/lexer';
import { TokenKind, Span, Token } from '../lexer/token';
import { SyntaxError } from '../error/syntaxError';
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

function Primary(lexer: Lexer): ExpressionNode | SyntaxError {
	const token = lexer.peek();
	if (token instanceof SyntaxError) return token;
	switch (token.getKind()) {
		case TokenKind.StringLiteral:
			lexer.consume();
			return {
				value: token.getValue(),
				datatype: 'string',
				span: token.getSpan()
			} as StringLiteralNode;
		case TokenKind.NumberLiteral:
			lexer.consume();
			return {
				value: token.getValue(),
				datatype: 'number',
				span: token.getSpan()
			} as NumberLiteralNode;
		case TokenKind.BooleanLiteral:
			lexer.consume();
			return {
				value: token.getValue(),
				datatype: 'boolean',
				span: token.getSpan()
			} as BooleanLiteralNode;
		case TokenKind.Pipe: {
			lexer.consume();
			const start = token.getSpan().getStart();
			const parameters: [string, DataType][] = [];
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
				const name = lexer.consumeKind([TokenKind.Identifier]);
				if (name instanceof SyntaxError) {
					return name;
				}
				const colonToken = lexer.consumeKind([TokenKind.Colon]);
				if (colonToken instanceof SyntaxError) {
					return colonToken;
				}
				const datatype = ParseDataType(lexer);
				if (datatype instanceof SyntaxError) {
					return datatype;
				}
				parameters.push([name.getValue() as string, datatype]);
				peek = lexer.peek();
				if (peek instanceof SyntaxError) return peek;
			}
			const endToken = lexer.consumeKind([TokenKind.Pipe]);
			if (endToken instanceof SyntaxError) return endToken;
			const minusGtToken = lexer.consumeKind([TokenKind.MinusGt]);
			if (minusGtToken instanceof SyntaxError) {
				return minusGtToken;
			}
			const returnType = ParseDataType(lexer);
			if (returnType instanceof SyntaxError) {
				return returnType;
			}
			const instruction = ParseInstruction(lexer);
			if (instruction instanceof SyntaxError) {
				return instruction;
			}
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

			// Determine Whether This Is a Closure Or Grouping //

			let isClosure = false;
			let peek = lexer.peek();
			if (peek instanceof SyntaxError) return peek;
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
					if (peek instanceof SyntaxError) return peek;
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
					if (first) {
						first = false;
					} else {
						const commaToken = lexer.consumeKind([TokenKind.Comma]);
						if (commaToken instanceof SyntaxError) {
							return commaToken;
						}
					}
					const name = lexer.consumeKind([TokenKind.Identifier]);
					if (name instanceof SyntaxError) {
						return name;
					}
					const colonToken = lexer.consumeKind([TokenKind.Colon]);
					if (colonToken instanceof SyntaxError) {
						return colonToken;
					}
					const datatype = ParseDataType(lexer);
					if (datatype instanceof SyntaxError) {
						return datatype;
					}
					parameters.push([name.getValue() as string, datatype]);
					peek = lexer.peek();
					if (peek instanceof SyntaxError) return peek;
				}
				const endToken = lexer.consumeKind([TokenKind.RParen]);
				if (endToken instanceof SyntaxError) return endToken;
				const eqGtToken = lexer.consumeKind([TokenKind.EqGt]);
				if (eqGtToken instanceof SyntaxError) {
					return eqGtToken;
				}
				const returnType = ParseDataType(lexer);
				if (returnType instanceof SyntaxError) {
					return returnType;
				}
				const instruction = ParseInstruction(lexer);
				if (instruction instanceof SyntaxError) {
					return instruction;
				}
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
			if (expr instanceof SyntaxError) {
				return expr;
			}
			const rparenToken = lexer.consumeKind([TokenKind.RParen]);
			if (rparenToken instanceof SyntaxError) {
				return rparenToken;
			}
			return expr;
		}
		case TokenKind.LBracket: {
			lexer.consume();
			const start = token.getSpan().getStart();
			const values: ExpressionNode[] = [];
			let first = true;
			let peek = lexer.peek();
			if (peek instanceof SyntaxError) return peek;
			while (
				![TokenKind.EOF, TokenKind.RBracket].includes(peek.getKind())
			) {
				if (first) {
					first = false;
				} else {
					const commaToken = lexer.consumeKind([TokenKind.Comma]);
					if (commaToken instanceof SyntaxError) return commaToken;
				}
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				const expr = ParseExpression(lexer);
				if (expr instanceof SyntaxError) return expr;
				values.push(expr);
				peek = lexer.peek();
				if (peek instanceof SyntaxError) return peek;
			}
			const endToken = lexer.consumeKind([TokenKind.RBracket]);
			if (endToken instanceof SyntaxError) return endToken;
			return {
				values,
				span: new Span(start, endToken.getSpan().getEnd())
			} as ArrayLiteralNode;
		}
		case TokenKind.Identifier: {
			lexer.consume();
			let rvalue: RValueNode = {
				name: token.getValue(),
				span: token.getSpan()
			} as RValueVariableNode;
			let peek = lexer.peek();
			if (peek instanceof SyntaxError) {
				return peek;
			}
			while (
				[TokenKind.LBracket, TokenKind.LParen].includes(peek.getKind())
			) {
				if (peek.getKind() === TokenKind.LBracket) {
					const lBracketToken = lexer.consume() as Token;
					// eslint-disable-next-line @typescript-eslint/no-use-before-define
					const index = ParseExpression(lexer);
					if (index instanceof SyntaxError) {
						return index;
					}
					const rBracketToken = lexer.consumeKind([
						TokenKind.RBracket
					]);
					if (rBracketToken instanceof SyntaxError) {
						return rBracketToken;
					}
					rvalue = {
						rvalue,
						index,
						span: new Span(
							lBracketToken.getSpan().getStart(),
							rBracketToken.getSpan().getEnd()
						)
					} as RValueIndexOfNode;
				} else {
					const lparenToken = lexer.consume() as Token;
					let first = true;
					const args: ExpressionNode[] = [];
					let peek = lexer.peek();
					if (peek instanceof SyntaxError) {
						return peek;
					}
					while (
						![TokenKind.EOF, TokenKind.RParen].includes(
							peek.getKind()
						)
					) {
						if (first) {
							first = false;
						} else {
							const commaToken = lexer.consumeKind([
								TokenKind.Comma
							]);
							if (commaToken instanceof SyntaxError) {
								return commaToken;
							}
						}
						// eslint-disable-next-line @typescript-eslint/no-use-before-define
						const argument = ParseExpression(lexer);
						if (argument instanceof SyntaxError) {
							return argument;
						}
						args.push(argument);
						peek = lexer.peek();
						if (peek instanceof SyntaxError) {
							return peek;
						}
					}
					const rparenToken = lexer.consumeKind([TokenKind.RParen]);
					if (rparenToken instanceof SyntaxError) {
						return rparenToken;
					}
					rvalue = {
						rvalue,
						arguments: args,
						span: new Span(
							lparenToken.getSpan().getStart(),
							rparenToken.getSpan().getEnd()
						)
					} as RValueCallNode;
				}
				peek = lexer.peek();
				if (peek instanceof SyntaxError) {
					return peek;
				}
			}
			return rvalue;
		}
	}
	return ParseInstruction(lexer);
}

function Unary(lexer: Lexer): ExpressionNode | SyntaxError {
	const token = lexer.peek();
	if (token instanceof SyntaxError) {
		return token;
	}
	if (![TokenKind.Plus, TokenKind.Minus].includes(token.getKind())) {
		return Primary(lexer);
	}
	const operator = token.getKind() === TokenKind.Plus ? 'plus' : 'minus';
	const plusToken = lexer.consume() as Token;
	const expr = Unary(lexer);
	if (expr instanceof SyntaxError) {
		return expr;
	}
	return {
		operator,
		operand: expr,
		span: new Span(plusToken.getSpan().getStart(), expr.span.getEnd())
	} as UnaryNode;
}

function Exponentiation(lexer: Lexer): ExpressionNode | SyntaxError {
	let expr = Unary(lexer);
	if (expr instanceof SyntaxError) {
		return expr;
	}
	let peek = lexer.peek();
	if (peek instanceof SyntaxError) {
		return peek;
	}
	while (peek.getKind() === TokenKind.Caret) {
		lexer.consume();
		const right = Unary(lexer);
		if (right instanceof SyntaxError) {
			return right;
		}
		expr = {
			operator: 'power',
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
		if (peek instanceof SyntaxError) {
			return peek;
		}
	}
	return expr;
}

function Multiplication(lexer: Lexer): ExpressionNode | SyntaxError {
	let expr = Exponentiation(lexer);
	if (expr instanceof SyntaxError) {
		return expr;
	}
	let peek = lexer.peek();
	if (peek instanceof SyntaxError) {
		return peek;
	}
	while (
		[TokenKind.Star, TokenKind.Slash, TokenKind.Percentage].includes(
			peek.getKind()
		)
	) {
		lexer.consume();
		const right = Exponentiation(lexer);
		if (right instanceof SyntaxError) {
			return right;
		}
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
			operator,
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
		if (peek instanceof SyntaxError) {
			return peek;
		}
	}
	return expr;
}

function Addition(lexer: Lexer): ExpressionNode | SyntaxError {
	let expr = Multiplication(lexer);
	if (expr instanceof SyntaxError) {
		return expr;
	}
	let peek = lexer.peek();
	if (peek instanceof SyntaxError) {
		return peek;
	}
	while ([TokenKind.Plus, TokenKind.Minus].includes(peek.getKind())) {
		lexer.consume();
		const right = Multiplication(lexer);
		if (right instanceof SyntaxError) {
			return right;
		}
		const operator = peek.getKind() === TokenKind.Plus ? 'add' : 'subtract';
		expr = {
			operator,
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
		if (peek instanceof SyntaxError) {
			return peek;
		}
	}
	return expr;
}

function Comparison(lexer: Lexer): ExpressionNode | SyntaxError {
	let expr = Addition(lexer);
	if (expr instanceof SyntaxError) {
		return expr;
	}
	let peek = lexer.peek();
	if (peek instanceof SyntaxError) {
		return peek;
	}
	while (
		[TokenKind.Lt, TokenKind.Le, TokenKind.Gt, TokenKind.Ge].includes(
			peek.getKind()
		)
	) {
		lexer.consume();
		const right = Addition(lexer);
		if (right instanceof SyntaxError) {
			return right;
		}
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
			operator,
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
		if (peek instanceof SyntaxError) {
			return peek;
		}
	}
	return expr;
}

function Equality(lexer: Lexer): ExpressionNode | SyntaxError {
	let expr = Comparison(lexer);
	if (expr instanceof SyntaxError) {
		return expr;
	}
	let peek = lexer.peek();
	if (peek instanceof SyntaxError) {
		return peek;
	}
	while ([TokenKind.Eq, TokenKind.NotEq].includes(peek.getKind())) {
		lexer.consume();
		const right = Comparison(lexer);
		if (right instanceof SyntaxError) {
			return right;
		}
		const operator = peek.getKind() === TokenKind.Eq ? 'equal' : 'notequal';
		expr = {
			operator,
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
		if (peek instanceof SyntaxError) {
			return peek;
		}
	}
	return expr;
}

function LogicGates(lexer: Lexer): ExpressionNode | SyntaxError {
	let expr = Equality(lexer);
	if (expr instanceof SyntaxError) {
		return expr;
	}
	let peek = lexer.peek();
	if (peek instanceof SyntaxError) {
		return peek;
	}
	while ([TokenKind.Ampersand, TokenKind.Pipe].includes(peek.getKind())) {
		lexer.consume();
		const right = Equality(lexer);
		if (right instanceof SyntaxError) {
			return right;
		}
		const operator = peek.getKind() === TokenKind.Ampersand ? 'and' : 'or';
		expr = {
			operator,
			operands: [expr, right],
			span: new Span(expr.span.getStart(), right.span.getEnd())
		} as BinaryNode;
		peek = lexer.peek();
		if (peek instanceof SyntaxError) {
			return peek;
		}
	}
	return expr;
}

export default function ParseExpression(
	lexer: Lexer
): ExpressionNode | SyntaxError {
	return LogicGates(lexer);
}
