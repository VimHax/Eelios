import Lexer from '../lexer/lexer';
import { Span, TokenKind } from '../lexer/token';
import { InvalidInstruction } from '../error/syntaxError';
import {
	InstructionNode,
	PrintInstructionNode,
	EvaluateInstructionNode,
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

// ParseInstruction //
/* Parses and returns an instruction */

export default function ParseInstruction(lexer: Lexer): InstructionNode {
	const token = lexer.consume();
	switch (token.getKind()) {
		case TokenKind.PrintKW: {
			const expr = ParseExpression(lexer);
			const exprs = [expr];
			let peek = lexer.peek();
			while (peek.getKind() === TokenKind.Comma) {
				lexer.consume();
				const expr = ParseExpression(lexer);
				exprs.push(expr);
				peek = lexer.peek();
			}
			return {
				type: 'print',
				expressions: exprs,
				span: new Span(
					token.getSpan().getStart(),
					exprs[exprs.length - 1].span.getEnd()
				)
			} as PrintInstructionNode;
		}
		case TokenKind.EvalKW: {
			const expr = ParseExpression(lexer);
			return {
				type: 'eval',
				expression: expr,
				span: new Span(token.getSpan().getStart(), expr.span.getEnd())
			} as EvaluateInstructionNode;
		}
		case TokenKind.ExecKW: {
			const instruction = ParseInstruction(lexer);
			if (instruction instanceof SyntaxError) return instruction;
			return {
				type: 'exec',
				expression: instruction,
				span: new Span(
					token.getSpan().getStart(),
					instruction.span.getEnd()
				)
			} as ExecuteInstructionNode;
		}
		case TokenKind.IfKW: {
			const condition = ParseExpression(lexer);
			const then_ins = ParseInstruction(lexer);
			const peek = lexer.peek();
			if (peek.getKind() === TokenKind.ElseKW) {
				lexer.consume();
				const else_ins = ParseInstruction(lexer);
				return {
					type: 'if',
					condition,
					thenExpression: then_ins,
					elseExpression: else_ins,
					span: new Span(
						token.getSpan().getStart(),
						else_ins.span.getEnd()
					)
				} as IfInstructionNode;
			}
			return {
				type: 'if',
				condition,
				thenExpression: then_ins,
				elseExpression: null,
				span: new Span(
					token.getSpan().getStart(),
					then_ins.span.getEnd()
				)
			} as IfInstructionNode;
		}
		case TokenKind.WhileKW: {
			const condition = ParseExpression(lexer);
			const body = ParseInstruction(lexer);
			return {
				type: 'while',
				condition,
				body,
				span: new Span(token.getSpan().getStart(), body.span.getEnd())
			} as WhileInstructionNode;
		}
		case TokenKind.Identifier: {
			let lvalue: LValueNode = {
				type: 'variable',
				name: token.getValue(),
				span: token.getSpan()
			} as LValueVariableNode;
			let peek = lexer.peek();
			while (peek.getKind() === TokenKind.LBracket) {
				const lBracketToken = lexer.consume();
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				const index = ParseExpression(lexer);
				const rBracketToken = lexer.consumeKind([TokenKind.RBracket]);
				lvalue = {
					type: 'indexof',
					lvalue,
					index,
					span: new Span(
						lBracketToken.getSpan().getStart(),
						rBracketToken.getSpan().getEnd()
					)
				} as LValueIndexOfNode;
				peek = lexer.peek();
			}
			lexer.consumeKind([TokenKind.LtMinus]);
			const expr = ParseExpression(lexer);
			return {
				type: 'assign',
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
			while (
				![TokenKind.EOF, TokenKind.RBracket].includes(peek.getKind())
			) {
				if (first) first = false;
				else lexer.consumeKind([TokenKind.Comma]);
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				const instruction = ParseInstruction(lexer);
				if (instruction instanceof SyntaxError) return instruction;
				values.push(instruction);
				peek = lexer.peek();
			}
			const endToken = lexer.consumeKind([TokenKind.RBracket]);
			return {
				type: 'array',
				values,
				span: new Span(start, endToken.getSpan().getEnd())
			} as ArrayLiteralNode;
		}
	}
	throw new InvalidInstruction(token.getSpan());
}
