import Lexer from '../lexer/lexer';
import ParseDataType from './parseDataType';
import ParseInstruction from './parseInstruction';

import { TokenKind, Span } from '../lexer/token';
import { InvalidParameter } from '../error/syntaxError';

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
	BinaryNode,
	BinaryOperator,
	RValueGroupingNode
} from './ast';

// Primary //
/* Parses literals, rvalues, arrays & groupings */

function Primary(lexer: Lexer): ExpressionNode {
	const token = lexer.peek();
	switch (token.getKind()) {
		// Parse String Literals //
		case TokenKind.StringLiteral:
			lexer.consume();
			return new StringLiteralNode(token.getValue(), token.getSpan());
		// Parse Number Literals //
		case TokenKind.NumberLiteral:
			lexer.consume();
			return new NumberLiteralNode(token.getValue(), token.getSpan());
		// Parse Boolean Literals //
		case TokenKind.BooleanLiteral:
			lexer.consume();
			return new BooleanLiteralNode(token.getValue(), token.getSpan());
		// Parse Function Literals //
		case TokenKind.Pipe: {
			lexer.consume();
			const start = token.getSpan().getStart();
			const parameters: [string, DataType][] = [];
			let first = true;
			let peek = lexer.peek();
			while (!peek.isKind([TokenKind.EOF, TokenKind.Pipe])) {
				if (first) first = false;
				else lexer.consumeKind(TokenKind.Comma);
				const name = lexer.consumeKind(TokenKind.Identifier);
				if (parameters.find(p => p[0] === name.getValue())) {
					throw new InvalidParameter(name.getValue(), name.getSpan());
				}
				lexer.consumeKind(TokenKind.Colon);
				const datatype = ParseDataType(lexer);
				parameters.push([name.getValue() as string, datatype]);
				peek = lexer.peek();
			}
			lexer.consumeKind(TokenKind.Pipe);
			lexer.consumeKind(TokenKind.MinusGt);
			const returnType = ParseDataType(lexer);
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			const instruction = ParseExpression(lexer);
			return new FunctionLiteralNode(
				parameters,
				returnType,
				instruction,
				new Span(start, instruction.getSpan().getEnd())
			);
		}
		// Parse Closure Literals & Groupings //
		case TokenKind.LParen: {
			lexer.consume();
			// Check Whether This Is A Closure Literal //
			let isClosure = false;
			let peek = lexer.peek();
			if (peek.isKind([TokenKind.RParen])) {
				isClosure = true;
			} else {
				lexer.wind();
				if (peek.isKind([TokenKind.Identifier])) {
					lexer.consume();
					peek = lexer.peek();
					if (peek.isKind([TokenKind.Colon])) {
						isClosure = true;
					}
				}
				lexer.unwind();
			}
			// Parse Closure Literal //
			if (isClosure) {
				const start = token.getSpan().getStart();
				const parameters: [string, DataType][] = [];
				let first = true;
				peek = lexer.peek();
				while (!peek.isKind([TokenKind.EOF, TokenKind.RParen])) {
					if (first) first = false;
					else lexer.consumeKind(TokenKind.Comma);
					const name = lexer.consumeKind(TokenKind.Identifier);
					if (parameters.find(p => p[0] === name.getValue())) {
						throw new InvalidParameter(
							name.getValue(),
							name.getSpan()
						);
					}
					lexer.consumeKind(TokenKind.Colon);
					const datatype = ParseDataType(lexer);
					parameters.push([name.getValue() as string, datatype]);
					peek = lexer.peek();
				}
				lexer.consumeKind(TokenKind.RParen);
				lexer.consumeKind(TokenKind.EqGt);
				const returnType = ParseDataType(lexer);
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				const instruction = ParseExpression(lexer);
				return new ClosureLiteralNode(
					parameters,
					returnType,
					instruction,
					new Span(start, instruction.getSpan().getEnd())
				);
			}
			// Parse Grouping //
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			const expr = ParseExpression(lexer);
			lexer.consumeKind(TokenKind.RParen);
			let rvalue: RValueNode = new RValueGroupingNode(
				expr,
				expr.getSpan()
			);
			peek = lexer.peek();
			while (peek.isKind([TokenKind.LBracket, TokenKind.LParen])) {
				if (peek.isKind([TokenKind.LBracket])) {
					lexer.consume();
					// eslint-disable-next-line @typescript-eslint/no-use-before-define
					const index = ParseExpression(lexer);
					const rBracketToken = lexer.consumeKind(TokenKind.RBracket);
					rvalue = new RValueIndexOfNode(
						rvalue,
						index,
						new Span(
							rvalue.getSpan().getStart(),
							rBracketToken.getSpan().getEnd()
						)
					);
				} else {
					lexer.consume();
					let first = true;
					const args: ExpressionNode[] = [];
					let peek = lexer.peek();
					while (!peek.isKind([TokenKind.EOF, TokenKind.RParen])) {
						if (first) first = false;
						else lexer.consumeKind(TokenKind.Comma);
						// eslint-disable-next-line @typescript-eslint/no-use-before-define
						const argument = ParseExpression(lexer);
						args.push(argument);
						peek = lexer.peek();
					}
					const rparenToken = lexer.consumeKind(TokenKind.RParen);
					rvalue = new RValueCallNode(
						rvalue,
						args,
						new Span(
							rvalue.getSpan().getStart(),
							rparenToken.getSpan().getEnd()
						)
					);
				}
				peek = lexer.peek();
			}
			return rvalue;
		}
		// Parse Array Literals //
		case TokenKind.LBracket: {
			lexer.consume();
			const start = token.getSpan().getStart();
			const values: ExpressionNode[] = [];
			let first = true;
			let peek = lexer.peek();
			while (!peek.isKind([TokenKind.EOF, TokenKind.RBracket])) {
				if (first) first = false;
				else lexer.consumeKind(TokenKind.Comma);
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				const expr = ParseExpression(lexer);
				values.push(expr);
				peek = lexer.peek();
			}
			const endToken = lexer.consumeKind(TokenKind.RBracket);
			return new ArrayLiteralNode(
				values,
				new Span(start, endToken.getSpan().getEnd())
			);
		}
		// Parse RValues //
		case TokenKind.Identifier: {
			// Check If Assign Instruction //
			lexer.wind();
			lexer.consume();
			let peek = lexer.peek();
			while (peek.isKind([TokenKind.LBracket])) {
				lexer.consume();
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				ParseExpression(lexer);
				lexer.consumeKind(TokenKind.RBracket);
				peek = lexer.peek();
			}
			lexer.unwind();
			if (peek.isKind([TokenKind.LtMinus])) break;
			lexer.consume();
			let rvalue: RValueNode = new RValueVariableNode(
				token.getValue(),
				token.getSpan()
			);
			peek = lexer.peek();
			while (peek.isKind([TokenKind.LBracket, TokenKind.LParen])) {
				if (peek.isKind([TokenKind.LBracket])) {
					lexer.consume();
					// eslint-disable-next-line @typescript-eslint/no-use-before-define
					const index = ParseExpression(lexer);
					const rBracketToken = lexer.consumeKind(TokenKind.RBracket);
					rvalue = new RValueIndexOfNode(
						rvalue,
						index,
						new Span(
							rvalue.getSpan().getStart(),
							rBracketToken.getSpan().getEnd()
						)
					);
				} else {
					lexer.consume();
					let first = true;
					const args: ExpressionNode[] = [];
					let peek = lexer.peek();
					while (!peek.isKind([TokenKind.EOF, TokenKind.RParen])) {
						if (first) first = false;
						else lexer.consumeKind(TokenKind.Comma);
						// eslint-disable-next-line @typescript-eslint/no-use-before-define
						const argument = ParseExpression(lexer);
						args.push(argument);
						peek = lexer.peek();
					}
					const rparenToken = lexer.consumeKind(TokenKind.RParen);
					rvalue = new RValueCallNode(
						rvalue,
						args,
						new Span(
							rvalue.getSpan().getStart(),
							rparenToken.getSpan().getEnd()
						)
					);
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
	if (!token.isKind([TokenKind.Plus, TokenKind.Minus])) {
		return Primary(lexer);
	}
	const operator = token.isKind([TokenKind.Plus]) ? 'plus' : 'minus';
	const plusToken = lexer.consume();
	const expr = Unary(lexer);
	return new UnaryNode(
		operator,
		expr,
		new Span(plusToken.getSpan().getStart(), expr.getSpan().getEnd())
	);
}

// Exponentiation //
/* Parses the ^ binary operator */

function Exponentiation(lexer: Lexer): ExpressionNode {
	let expr = Unary(lexer);
	let peek = lexer.peek();
	while (peek.isKind([TokenKind.Caret])) {
		lexer.consume();
		const right = Unary(lexer);
		expr = new BinaryNode(
			'power',
			[expr, right],
			new Span(expr.getSpan().getStart(), right.getSpan().getEnd())
		);
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
		peek.isKind([TokenKind.Star, TokenKind.Slash, TokenKind.Percentage])
	) {
		lexer.consume();
		const right = Exponentiation(lexer);
		let operator: BinaryOperator = 'multiply';
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
		expr = new BinaryNode(
			operator,
			[expr, right],
			new Span(expr.getSpan().getStart(), right.getSpan().getEnd())
		);
		peek = lexer.peek();
	}
	return expr;
}

// Addition //
/* Parses the + & - binary operators */

function Addition(lexer: Lexer): ExpressionNode {
	let expr = Multiplication(lexer);
	let peek = lexer.peek();
	while (peek.isKind([TokenKind.Plus, TokenKind.Minus])) {
		lexer.consume();
		const right = Multiplication(lexer);
		const operator = peek.isKind([TokenKind.Plus]) ? 'add' : 'subtract';
		expr = new BinaryNode(
			operator,
			[expr, right],
			new Span(expr.getSpan().getStart(), right.getSpan().getEnd())
		);
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
		peek.isKind([TokenKind.Lt, TokenKind.Le, TokenKind.Gt, TokenKind.Ge])
	) {
		lexer.consume();
		const right = Addition(lexer);
		let operator: BinaryOperator = 'lessthan';
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
		expr = new BinaryNode(
			operator,
			[expr, right],
			new Span(expr.getSpan().getStart(), right.getSpan().getEnd())
		);
		peek = lexer.peek();
	}
	return expr;
}

// Equality //
/* Parses the = & != binary operators */

function Equality(lexer: Lexer): ExpressionNode {
	let expr = Comparison(lexer);
	let peek = lexer.peek();
	while (peek.isKind([TokenKind.Eq, TokenKind.NotEq])) {
		lexer.consume();
		const right = Comparison(lexer);
		const operator = peek.isKind([TokenKind.Eq]) ? 'equal' : 'notequal';
		expr = new BinaryNode(
			operator,
			[expr, right],
			new Span(expr.getSpan().getStart(), right.getSpan().getEnd())
		);
		peek = lexer.peek();
	}
	return expr;
}

// LogicGates //
/* Parses the and & or binary operators */

function LogicGates(lexer: Lexer): ExpressionNode {
	let expr = Equality(lexer);
	let peek = lexer.peek();
	while (peek.isKind([TokenKind.Ampersand, TokenKind.Pipe])) {
		lexer.consume();
		const right = Equality(lexer);
		const operator = peek.isKind([TokenKind.Ampersand]) ? 'and' : 'or';
		expr = new BinaryNode(
			operator,
			[expr, right],
			new Span(expr.getSpan().getStart(), right.getSpan().getEnd())
		);
		peek = lexer.peek();
	}
	return expr;
}

// ParseExpression //
/* Parses an expression */

export default function ParseExpression(lexer: Lexer): ExpressionNode {
	return LogicGates(lexer);
}
