import { Token, Span } from '../lexer/token';

// DataType //

export type DataType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'instruction'
	| FunctionDataType
	| ClosureDataType
	| ArrayDataType;

export interface FunctionDataType {
	datatype: 'function';
	parameters: DataType[];
	returnType: DataType;
}

export interface ClosureDataType {
	datatype: 'closure';
	parameters: DataType[];
	returnType: DataType;
}

export interface ArrayDataType {
	datatype: DataType;
}

// RValue Node //

export interface RValueVariableNode {
	name: string;
	span: Span;
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

export type RValueNode =
	| RValueVariableNode
	| RValueIndexOfNode
	| RValueCallNode;

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
	datatype: 'function';
	parameters: [string, DataType][];
	returnType: DataType;
	instruction: InstructionNode;
	span: Span;
}

export interface ClosureLiteralNode {
	datatype: 'closure';
	parameters: [string, DataType][];
	returnType: DataType;
	instruction: InstructionNode;
	span: Span;
}

export interface ArrayLiteralNode {
	values: ExpressionNode[];
	span: Span;
}

// Expression Node //

export type UnaryOperator = 'plus' | 'minus';

export interface UnaryNode {
	operator: UnaryOperator;
	operand: ExpressionNode;
	span: Span;
}

export type BinaryOperator =
	| 'add'
	| 'subtract'
	| 'multiply'
	| 'divide'
	| 'power'
	| 'modulus'
	| 'and'
	| 'or'
	| 'equal'
	| 'notequal'
	| 'lessthan'
	| 'greaterthan'
	| 'lessthanorequal'
	| 'greaterthanorequal';

export interface BinaryNode {
	operator: BinaryOperator;
	operands: [ExpressionNode, ExpressionNode];
	span: Span;
}

export type ExpressionNode =
	| RValueNode
	| StringLiteralNode
	| NumberLiteralNode
	| BooleanLiteralNode
	| ArrayLiteralNode
	| UnaryNode
	| BinaryNode
	| InstructionNode;

// LValue Node //

export interface LValueVariableNode {
	name: Token;
}

export interface LValueIndexOfNode {
	lvalue: LValueNode;
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
	type: 'eval';
	expression: ExpressionNode;
	span: Span;
}

export interface ReturnInstructionNode {
	type: 'ret';
	expression: ExpressionNode;
	span: Span;
}

export interface ExecuteInstructionNode {
	instruction: InstructionNode;
	span: Span;
}

export interface IfInstructionNode {
	condition: ExpressionNode;
	thenInstruction: InstructionNode;
	elseInstruction: InstructionNode | null;
	span: Span;
}

export interface WhileInstructionNode {
	condition: ExpressionNode;
	body: InstructionNode;
	span: Span;
}

export type InstructionNode =
	| PrintInstructionNode
	| AssignInstructionNode
	| EvaluateInstructionNode
	| ReturnInstructionNode
	| ExecuteInstructionNode
	| ArrayLiteralNode
	| IfInstructionNode
	| WhileInstructionNode;
