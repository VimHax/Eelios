import Lexer from '../lexer/lexer';
import { Span, TokenKind, Token } from '../lexer/token';
import { SyntaxError, SyntaxErrorKind } from '../error/syntaxError';
import {
	InstructionNode,
	PrintInstructionNode,
	EvaluateInstructionNode,
	ReturnInstructionNode,
	ExecuteInstructionNode,
	IfInstructionNode,
	WhileInstructionNode,
	ArrayLiteralNode,
	LValueNode,
	LValueVariableNode,
	LValueIndexOfNode,
	AssignInstructionNode
} from './ast';
import ParseExpression from './parseExpression';

export default function ParseInstruction(
	lexer: Lexer
): InstructionNode | SyntaxError {
	const token = lexer.consume();
	if (token instanceof SyntaxError) {
		return token;
	}
	switch (token.getKind()) {
		case TokenKind.PrintKW: {
			const expr = ParseExpression(lexer);
			if (expr instanceof SyntaxError) {
				return expr;
			}
			const exprs = [expr];
			let peek = lexer.peek();
			if (peek instanceof SyntaxError) {
				return peek;
			}
			while (peek.getKind() === TokenKind.Comma) {
				lexer.consume();
				const expr = ParseExpression(lexer);
				if (expr instanceof SyntaxError) {
					return expr;
				}
				exprs.push(expr);
				peek = lexer.peek();
				if (peek instanceof SyntaxError) {
					return peek;
				}
			}
			return {
				expressions: exprs,
				span: new Span(
					token.getSpan().getStart(),
					exprs[exprs.length - 1].span.getEnd()
				)
			} as PrintInstructionNode;
		}
		case TokenKind.EvalKW: {
			const expr = ParseExpression(lexer);
			if (expr instanceof SyntaxError) {
				return expr;
			}
			return {
				type: 'eval',
				expression: expr,
				span: new Span(token.getSpan().getStart(), expr.span.getEnd())
			} as EvaluateInstructionNode;
		}
		case TokenKind.RetKW: {
			const expr = ParseExpression(lexer);
			if (expr instanceof SyntaxError) {
				return expr;
			}
			return {
				type: 'ret',
				expression: expr,
				span: new Span(token.getSpan().getStart(), expr.span.getEnd())
			} as ReturnInstructionNode;
		}
		case TokenKind.ExecKW: {
			const instruction = ParseInstruction(lexer);
			if (instruction instanceof SyntaxError) {
				return instruction;
			}
			return {
				instruction,
				span: new Span(
					token.getSpan().getStart(),
					instruction.span.getEnd()
				)
			} as ExecuteInstructionNode;
		}
		case TokenKind.IfKW: {
			const condition = ParseExpression(lexer);
			if (condition instanceof SyntaxError) {
				return condition;
			}
			const then_ins = ParseInstruction(lexer);
			if (then_ins instanceof SyntaxError) {
				return then_ins;
			}
			const peek = lexer.peek();
			if (peek instanceof SyntaxError) {
				return peek;
			}
			if (peek.getKind() === TokenKind.ElseKW) {
				lexer.consume();
				const else_ins = ParseInstruction(lexer);
				if (else_ins instanceof SyntaxError) {
					return else_ins;
				}
				return {
					condition,
					thenInstruction: then_ins,
					elseInstruction: else_ins,
					span: new Span(
						token.getSpan().getStart(),
						else_ins.span.getEnd()
					)
				} as IfInstructionNode;
			}
			return {
				condition,
				thenInstruction: then_ins,
				elseInstruction: null,
				span: new Span(
					token.getSpan().getStart(),
					then_ins.span.getEnd()
				)
			} as IfInstructionNode;
		}
		case TokenKind.WhileKW: {
			const condition = ParseExpression(lexer);
			if (condition instanceof SyntaxError) {
				return condition;
			}
			const body = ParseInstruction(lexer);
			if (body instanceof SyntaxError) {
				return body;
			}
			return {
				condition,
				body,
				span: new Span(token.getSpan().getStart(), body.span.getEnd())
			} as WhileInstructionNode;
		}
		case TokenKind.Identifier: {
			let lvalue: LValueNode = {
				name: token.getValue(),
				span: token.getSpan()
			} as LValueVariableNode;
			let peek = lexer.peek();
			if (peek instanceof SyntaxError) {
				return peek;
			}
			while (peek.getKind() === TokenKind.LBracket) {
				const lBracketToken = lexer.consume() as Token;
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				const index = ParseExpression(lexer);
				if (index instanceof SyntaxError) {
					return index;
				}
				const rBracketToken = lexer.consumeKind([TokenKind.RBracket]);
				if (rBracketToken instanceof SyntaxError) {
					return rBracketToken;
				}
				lvalue = {
					lvalue,
					index,
					span: new Span(
						lBracketToken.getSpan().getStart(),
						rBracketToken.getSpan().getEnd()
					)
				} as LValueIndexOfNode;
				peek = lexer.peek();
				if (peek instanceof SyntaxError) {
					return peek;
				}
			}
			const ltMinusToken = lexer.consumeKind([TokenKind.LtMinus]);
			if (ltMinusToken instanceof SyntaxError) {
				return ltMinusToken;
			}
			const expr = ParseExpression(lexer);
			if (expr instanceof SyntaxError) {
				return expr;
			}
			return {
				lvalue,
				expression: expr,
				span: new Span(token.getSpan().getStart(), expr.span.getEnd())
			} as AssignInstructionNode;
		}
		case TokenKind.LBracket: {
			const start = token.getSpan().getStart();
			const values: InstructionNode[] = [];
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
				const instruction = ParseInstruction(lexer);
				if (instruction instanceof SyntaxError) return instruction;
				values.push(instruction);
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
	}
	return new SyntaxError(SyntaxErrorKind.InvalidInstruction, token.getSpan());
}
