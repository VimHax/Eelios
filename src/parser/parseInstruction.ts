import Lexer from '../lexer/lexer';
import ParseExpression from './parseExpression';

import { Span, TokenKind } from '../lexer/token';
import { InvalidInstruction } from '../error/syntaxError';

import {
	InstructionNode,
	PrintInstructionNode,
	EvaluateInstructionNode,
	ExecuteInstructionNode,
	IfInstructionNode,
	WhileInstructionNode,
	LValueNode,
	LValueVariableNode,
	LValueIndexOfNode,
	AssignInstructionNode,
	ExpressionNode
} from './ast';

// ParseInstruction //
/* Parses and returns an instruction node */

export default function ParseInstruction(lexer: Lexer): InstructionNode {
	const token = lexer.consume();
	switch (token.getKind()) {
		// Parse Print Instructions //
		case TokenKind.PrintKW: {
			const expr = ParseExpression(lexer);
			const exprs = [expr];
			let peek = lexer.peek();
			while (peek.isKind([TokenKind.Dot])) {
				lexer.consume();
				const expr = ParseExpression(lexer);
				exprs.push(expr);
				peek = lexer.peek();
			}
			return new PrintInstructionNode(
				exprs,
				new Span(
					token.getSpan().getStart(),
					exprs[exprs.length - 1].getSpan().getEnd()
				)
			);
		}
		// Parse Eval Instructions //
		case TokenKind.EvalKW: {
			const expr = ParseExpression(lexer);
			return new EvaluateInstructionNode(
				expr,
				new Span(token.getSpan().getStart(), expr.getSpan().getEnd())
			);
		}
		// Parse Exec Instructions //
		case TokenKind.ExecKW: {
			const instruction = ParseExpression(lexer);
			return new ExecuteInstructionNode(
				instruction,
				new Span(
					token.getSpan().getStart(),
					instruction.getSpan().getEnd()
				)
			);
		}
		// Parse If Instructions //
		case TokenKind.IfKW: {
			const condition = ParseExpression(lexer);
			lexer.consumeKind(TokenKind.ThenKW);
			const thenExpression = ParseExpression(lexer);
			const peek = lexer.peek();
			let elseExpression: ExpressionNode | null = null;
			if (peek.isKind([TokenKind.ElseKW])) {
				lexer.consume();
				elseExpression = ParseExpression(lexer);
			}
			return new IfInstructionNode(
				condition,
				thenExpression,
				elseExpression,
				new Span(
					token.getSpan().getStart(),
					thenExpression.getSpan().getEnd()
				)
			);
		}
		// Parse While Instructions //
		case TokenKind.WhileKW: {
			const condition = ParseExpression(lexer);
			lexer.consumeKind(TokenKind.DoKW);
			const body = ParseExpression(lexer);
			return new WhileInstructionNode(
				condition,
				body,
				new Span(token.getSpan().getStart(), body.getSpan().getEnd())
			);
		}
		// Parse Assign Instructions //
		case TokenKind.Identifier: {
			let lvalue: LValueNode = new LValueVariableNode(
				token.getValue(),
				token.getSpan()
			);
			let peek = lexer.peek();
			while (peek.isKind([TokenKind.LBracket])) {
				const lBracketToken = lexer.consume();
				const index = ParseExpression(lexer);
				const rBracketToken = lexer.consumeKind(TokenKind.RBracket);
				lvalue = new LValueIndexOfNode(
					lvalue,
					index,
					new Span(
						lBracketToken.getSpan().getStart(),
						rBracketToken.getSpan().getEnd()
					)
				);
				peek = lexer.peek();
			}
			lexer.consumeKind(TokenKind.LtMinus);
			const expr = ParseExpression(lexer);
			return new AssignInstructionNode(
				lvalue,
				expr,
				new Span(token.getSpan().getStart(), expr.getSpan().getEnd())
			);
		}
	}
	throw new InvalidInstruction(token.getSpan());
}
