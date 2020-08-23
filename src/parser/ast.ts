import { Span } from '../lexer/token';

// DataType //

export type DataType =
	| AnyDataType
	| StringDataType
	| NumberDataType
	| BooleanDataType
	| InstructionDataType
	| FunctionDataType
	| ClosureDataType
	| ArrayDataType;

export interface AnyDataType {
	type: 'any';
}

export interface StringDataType {
	type: 'string';
}

export interface NumberDataType {
	type: 'number';
}

export interface BooleanDataType {
	type: 'boolean';
}

export interface InstructionDataType {
	type: 'instruction';
}

export interface FunctionDataType {
	type: 'function';
	parameters: DataType[];
	returnType: DataType;
}

export interface ClosureDataType {
	type: 'closure';
	parameters: DataType[];
	returnType: DataType;
}

export interface ArrayDataType {
	type: 'array';
	datatype: DataType;
}

// RValue Node //

export interface RValueVariableNode {
	type: 'variable';
	name: string;
	span: Span;
}

export interface RValueIndexOfNode {
	type: 'indexof';
	rvalue: RValueNode;
	index: ExpressionNode;
	span: Span;
}

export interface RValueCallNode {
	type: 'call';
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
	type: 'string';
	value: string;
	span: Span;
}

export interface NumberLiteralNode {
	type: 'number';
	value: number;
	span: Span;
}

export interface BooleanLiteralNode {
	type: 'boolean';
	value: boolean;
	span: Span;
}

export interface FunctionLiteralNode {
	type: 'function';
	parameters: [string, DataType][];
	returnType: DataType;
	instruction: InstructionNode;
	span: Span;
}

export interface ClosureLiteralNode {
	type: 'closure';
	parameters: [string, DataType][];
	returnType: DataType;
	instruction: InstructionNode;
	span: Span;
}

export interface ArrayLiteralNode {
	type: 'array';
	values: ExpressionNode[];
	span: Span;
}

// Expression Node //

export type UnaryOperator = 'plus' | 'minus';

export interface UnaryNode {
	type: UnaryOperator;
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
	type: BinaryOperator;
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
	| InstructionNode
	| FunctionLiteralNode
	| ClosureLiteralNode;

// LValue Node //

export interface LValueVariableNode {
	type: 'variable';
	name: string;
	span: Span;
}

export interface LValueIndexOfNode {
	type: 'indexof';
	lvalue: LValueNode;
	index: ExpressionNode;
	span: Span;
}

export type LValueNode = LValueVariableNode | LValueIndexOfNode;

// Instruction Node //

export interface PrintInstructionNode {
	type: 'print';
	expressions: ExpressionNode[];
	span: Span;
}

export interface AssignInstructionNode {
	type: 'assign';
	lvalue: LValueNode;
	expression: ExpressionNode;
	span: Span;
}

export interface EvaluateInstructionNode {
	type: 'eval';
	expression: ExpressionNode;
	span: Span;
}

export interface ExecuteInstructionNode {
	type: 'exec';
	expression: ExpressionNode;
	span: Span;
}

export interface IfInstructionNode {
	type: 'if';
	condition: ExpressionNode;
	thenExpression: ExpressionNode;
	elseExpression: ExpressionNode | null;
	span: Span;
}

export interface WhileInstructionNode {
	type: 'while';
	condition: ExpressionNode;
	body: ExpressionNode;
	span: Span;
}

export type InstructionNode =
	| PrintInstructionNode
	| AssignInstructionNode
	| EvaluateInstructionNode
	| ExecuteInstructionNode
	| ArrayLiteralNode
	| IfInstructionNode
	| WhileInstructionNode;
