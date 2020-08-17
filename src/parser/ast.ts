import { Token, Span } from '../lexer/token';

// DataType //

export type DataType = 'string' | 'number' | 'boolean' | 'instruction' | FunctionDataType | ClosureDataType | ArrayDataType;

export interface FunctionDataType {
	parameters: DataType[];
	returnType: DataType;
}

export interface ClosureDataType {
	parameters: DataType[];
	returnType: DataType;
}

export interface ArrayDataType {
	datatype: DataType;
}

// RValue Node //

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
	span: Span;
}

export type RValueNode = RValueVariableNode | RValueIndexOfNode;

// Literal Node //

export interface StringLiteralNode {
	value: string;
	datatype: 'string';
	span: Span;
}

export interface NumberLiteralNode {
	value: number;
	datatype: 'number';
	span: Span;
}

export interface BooleanLiteralNode {
	value: boolean;
	datatype: 'boolean';
	span: Span;
}

export interface FunctionLiteralNode {
	parameters: [string, DataType][];
	returnType: DataType;
	instructions: InstructionNode;
	span: Span;
}

export interface ClosureLiteralNode {
	parameters: [string, DataType][];
	returnType: DataType;
	instructions: InstructionNode;
	span: Span;
}

export interface ArrayLiteralNode {
	values: ExpressionNode[];
	span: Span;
}

// Expression Node //

type UnaryOperator = 'plus' | 'minus';

export interface UnaryNode {
	operator: UnaryOperator;
	operand: ExpressionNode;
	span: Span;
}

type BinaryOperator = 'add' | 'subtract' | 'multiply' | 'divide' | 'modulus' | 'and' | 'or' | 'equal' | 'notequal' | 'lessthan' | 'greaterthan' | 'lessthanorequal' | 'greaterthanorequal';

export interface BinaryNode {
	operator: BinaryOperator;
	operands: [ExpressionNode, ExpressionNode];
	span: Span;
}

type ExpressionNode = RValueNode | StringLiteralNode | NumberLiteralNode | ArrayLiteralNode | UnaryNode | BinaryNode | InstructionNode;

// LValue Node //

export interface LValueVariableNode {
	name: Token;
}

export interface LValueIndexOfNode {
	rvalue: LValueNode;
	index: ExpressionNode;
	span: Span;
}

export type LValueNode = LValueVariableNode | LValueIndexOfNode;

// Instruction Node //

export interface PrintInstructionNode {
	expressions: ExpressionNode[];
	span: Span;
}

export interface AssignInstructionNode {
	lvalue: LValueNode;
	expression: ExpressionNode;
	span: Span;
}

export interface EvaluateInstructionNode {
	expression: ExpressionNode;
	span: Span;
}

export interface ReturnInstructionNode {
	expression: ExpressionNode;
	span: Span;
}

export interface ExecuteInstructionNode {
	instructions: InstructionNode;
	span: Span;
}

export interface IfInstructionNode {
	condition: ExpressionNode;
	then: InstructionNode;
	else: InstructionNode | null;
	span: Span;
}

export interface WhileInstructionNode {
	condition: ExpressionNode;
	body: InstructionNode;
	span: Span;
}

export type InstructionNode = PrintInstructionNode | AssignInstructionNode | EvaluateInstructionNode | ReturnInstructionNode | ExecuteInstructionNode | ArrayLiteralNode;
