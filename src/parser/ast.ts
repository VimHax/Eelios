import { Token, Span } from '../lexer/token';

export interface RValueVariableNode {
	name: Token;
}

export interface RValueIndexOfNode {
	rvalue: RValueNode;
	index: ExpressionNode;
	span: Span;
}

export interface RValueCallNode {
	rvalue: RValueNode;
	arguments: ExpressionNode[];
}

export type RValueNode = RValueVariableNode | RValueIndexOfNode;

export interface StringLiteralNode {
	value: string;
	datatype: 'string';
}

export interface NumberLiteralNode {
	value: number;
	datatype: 'number';
}

export interface ArrayLiteralNode {
	values: ExpressionNode[];
	span: Span;
}

type UnaryOperator = 'plus' | 'minus';

export interface UnaryNode {
	operator: UnaryOperator;
	operand: ExpressionNode;
}

type BinaryOperator = 'add' | 'subtract' | 'multiply' | 'divide' | 'modulus' | 'and' | 'or' | 'equal' | 'notequal' | 'lessthan' | 'greaterthan' | 'lessthanorequal' | 'greaterthanorequal';

export interface BinaryNode {
	operator: BinaryOperator;
	operands: [ExpressionNode, ExpressionNode];
}

type ExpressionNode = RValueNode | StringLiteralNode | NumberLiteralNode | ArrayLiteralNode | UnaryNode | BinaryNode;

export interface LValueVariableNode {
	name: Token;
}

export interface LValueIndexOfNode {
	rvalue: LValueNode;
	index: ExpressionNode;
	span: Span;
}

export type LValueNode = LValueVariableNode | LValueIndexOfNode;
