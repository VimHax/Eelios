/* eslint-disable @typescript-eslint/indent */
import { Span } from '../lexer/token';

// DataType //

export interface DataType {
	print: () => string;
}

export class AnyDataType implements DataType {
	public print(): string {
		return '_';
	}
}

export class StringDataType implements DataType {
	public print(): string {
		return 'String';
	}
}

export class NumberDataType implements DataType {
	public print(): string {
		return 'Number';
	}
}

export class BooleanDataType implements DataType {
	public print(): string {
		return 'Boolean';
	}
}

export class InstructionDataType implements DataType {
	public print(): string {
		return 'Instruction';
	}
}

export class FunctionDataType implements DataType {
	private readonly parameters: DataType[];
	private readonly returnType: DataType;

	public constructor(parameters: DataType[], returnType: DataType) {
		this.parameters = parameters;
		this.returnType = returnType;
	}

	public getParameters(): DataType[] {
		return this.parameters;
	}

	public getReturnType(): DataType {
		return this.returnType;
	}

	public print(): string {
		if (this.parameters.length === 0) {
			return `|| -> ${this.returnType.print()}`;
		}
		return `| ${this.parameters
			.map(p => p.print())
			.join(', ')} | -> ${this.returnType.print()}`;
	}
}

export class ClosureDataType implements DataType {
	private readonly parameters: DataType[];
	private readonly returnType: DataType;

	public constructor(parameters: DataType[], returnType: DataType) {
		this.parameters = parameters;
		this.returnType = returnType;
	}

	public getParameters(): DataType[] {
		return this.parameters;
	}

	public getReturnType(): DataType {
		return this.returnType;
	}

	public print(): string {
		if (this.parameters.length === 0) {
			return `() => ${this.returnType.print()}`;
		}
		return `( ${this.parameters
			.map(p => p.print())
			.join(', ')} ) => ${this.returnType.print()}`;
	}
}

export class ArrayDataType implements DataType {
	private readonly datatype: DataType;

	public constructor(datatype: DataType) {
		this.datatype = datatype;
	}

	public getDataType(): DataType {
		return this.datatype;
	}

	public print(): string {
		return `Array<${this.datatype.print()}>`;
	}
}

// AST Node //

interface ASTNode {
	getSpan: () => Span;
}

// RValue Node //

export class RValueVariableNode implements ASTNode {
	private readonly name: string;
	private readonly span: Span;

	public constructor(name: string, span: Span) {
		this.name = name;
		this.span = span;
	}

	public getName(): string {
		return this.name;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export class RValueGroupingNode implements ASTNode {
	private readonly expression: ExpressionNode;
	private readonly span: Span;

	public constructor(expression: ExpressionNode, span: Span) {
		this.expression = expression;
		this.span = span;
	}

	public getExpression(): ExpressionNode {
		return this.expression;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export class RValueIndexOfNode implements ASTNode {
	private readonly rvalue: RValueNode;
	private readonly index: ExpressionNode;
	private readonly span: Span;

	public constructor(rvalue: RValueNode, index: ExpressionNode, span: Span) {
		this.rvalue = rvalue;
		this.index = index;
		this.span = span;
	}

	public getRValue(): RValueNode {
		return this.rvalue;
	}

	public getIndex(): ExpressionNode {
		return this.index;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export class RValueCallNode implements ASTNode {
	private readonly rvalue: RValueNode;
	private readonly args: ExpressionNode[];
	private readonly span: Span;

	public constructor(rvalue: RValueNode, args: ExpressionNode[], span: Span) {
		this.rvalue = rvalue;
		this.args = args;
		this.span = span;
	}

	public getRValue(): RValueNode {
		return this.rvalue;
	}

	public getArguments(): ExpressionNode[] {
		return this.args;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export type RValueNode =
	| RValueVariableNode
	| RValueGroupingNode
	| RValueIndexOfNode
	| RValueCallNode;

// Literal Node //

export class StringLiteralNode implements ASTNode {
	private readonly value: string;
	private readonly span: Span;

	public constructor(value: string, span: Span) {
		this.value = value;
		this.span = span;
	}

	public getValue(): string {
		return this.value;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export class NumberLiteralNode implements ASTNode {
	private readonly value: number;
	private readonly span: Span;

	public constructor(value: number, span: Span) {
		this.value = value;
		this.span = span;
	}

	public getValue(): number {
		return this.value;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export class BooleanLiteralNode implements ASTNode {
	private readonly value: boolean;
	private readonly span: Span;

	public constructor(value: boolean, span: Span) {
		this.value = value;
		this.span = span;
	}

	public getValue(): boolean {
		return this.value;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export class FunctionLiteralNode implements ASTNode {
	private readonly parameters: [string, DataType][];
	private readonly returnType: DataType;
	private readonly expression: ExpressionNode;
	private readonly span: Span;

	public constructor(
		parameters: [string, DataType][],
		returnType: DataType,
		expression: ExpressionNode,
		span: Span
	) {
		this.parameters = parameters;
		this.returnType = returnType;
		this.expression = expression;
		this.span = span;
	}

	public getParameters(): [string, DataType][] {
		return this.parameters;
	}

	public getReturnType(): DataType {
		return this.returnType;
	}

	public getExpression(): ExpressionNode {
		return this.expression;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export class ClosureLiteralNode implements ASTNode {
	private readonly parameters: [string, DataType][];
	private readonly returnType: DataType;
	private readonly expression: ExpressionNode;
	private readonly span: Span;

	public constructor(
		parameters: [string, DataType][],
		returnType: DataType,
		expression: ExpressionNode,
		span: Span
	) {
		this.parameters = parameters;
		this.returnType = returnType;
		this.expression = expression;
		this.span = span;
	}

	public getParameters(): [string, DataType][] {
		return this.parameters;
	}

	public getReturnType(): DataType {
		return this.returnType;
	}

	public getExpression(): ExpressionNode {
		return this.expression;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export class ArrayLiteralNode implements ASTNode {
	private readonly values: ExpressionNode[];
	private readonly span: Span;

	public constructor(values: ExpressionNode[], span: Span) {
		this.values = values;
		this.span = span;
	}

	public getValues(): ExpressionNode[] {
		return this.values;
	}

	public getSpan(): Span {
		return this.span;
	}
}

// Expression Node //

export type UnaryOperator = 'plus' | 'minus';

export class UnaryNode implements ASTNode {
	private readonly operator: UnaryOperator;
	private readonly operand: ExpressionNode;
	private readonly span: Span;

	public constructor(
		operator: UnaryOperator,
		operand: ExpressionNode,
		span: Span
	) {
		this.operator = operator;
		this.operand = operand;
		this.span = span;
	}

	public getOperator(): UnaryOperator {
		return this.operator;
	}

	public getOperand(): ExpressionNode {
		return this.operand;
	}

	public getSpan(): Span {
		return this.span;
	}
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

export class BinaryNode implements ASTNode {
	private readonly operator: BinaryOperator;
	private readonly operands: [ExpressionNode, ExpressionNode];
	private readonly span: Span;

	public constructor(
		operator: BinaryOperator,
		operand: [ExpressionNode, ExpressionNode],
		span: Span
	) {
		this.operator = operator;
		this.operands = operand;
		this.span = span;
	}

	public getOperator(): BinaryOperator {
		return this.operator;
	}

	public getOperands(): [ExpressionNode, ExpressionNode] {
		return this.operands;
	}

	public getSpan(): Span {
		return this.span;
	}
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

export class LValueVariableNode implements ASTNode {
	private readonly name: string;
	private readonly span: Span;

	public constructor(name: string, span: Span) {
		this.name = name;
		this.span = span;
	}

	public getName(): string {
		return this.name;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export class LValueIndexOfNode implements ASTNode {
	private readonly lvalue: LValueNode;
	private readonly index: ExpressionNode;
	private readonly span: Span;

	public constructor(lvalue: LValueNode, index: ExpressionNode, span: Span) {
		this.lvalue = lvalue;
		this.index = index;
		this.span = span;
	}

	public getLValue(): LValueNode {
		return this.lvalue;
	}

	public getIndex(): ExpressionNode {
		return this.index;
	}

	public getSpan(): Span {
		return this.span;
	}
}

export type LValueNode = LValueVariableNode | LValueIndexOfNode;

// Instruction Node //

export class PrintInstructionNode implements ASTNode {
	private readonly expressions: ExpressionNode[];
	private readonly span: Span;

	public constructor(expressions: ExpressionNode[], span: Span) {
		this.expressions = expressions;
		this.span = span;
	}

	public getExpressions(): ExpressionNode[] {
		return this.expressions;
	}

	public getSpan(): Span {
		return this.span;
	}

	public toString(): string {
		return 'Print Instruction';
	}
}

export class AssignInstructionNode implements ASTNode {
	private readonly lvalue: LValueNode;
	private readonly expression: ExpressionNode;
	private readonly span: Span;

	public constructor(
		lvalue: LValueNode,
		expression: ExpressionNode,
		span: Span
	) {
		this.lvalue = lvalue;
		this.expression = expression;
		this.span = span;
	}

	public getLValue(): LValueNode {
		return this.lvalue;
	}

	public getExpression(): ExpressionNode {
		return this.expression;
	}

	public getSpan(): Span {
		return this.span;
	}

	public toString(): string {
		return 'Assign Instruction';
	}
}

export class EvaluateInstructionNode implements ASTNode {
	private readonly expression: ExpressionNode;
	private readonly span: Span;

	public constructor(expression: ExpressionNode, span: Span) {
		this.expression = expression;
		this.span = span;
	}

	public getExpression(): ExpressionNode {
		return this.expression;
	}

	public getSpan(): Span {
		return this.span;
	}

	public toString(): string {
		return 'Evaluate Instruction';
	}
}

export class ExecuteInstructionNode implements ASTNode {
	private readonly expression: ExpressionNode;
	private readonly span: Span;

	public constructor(expression: ExpressionNode, span: Span) {
		this.expression = expression;
		this.span = span;
	}

	public getExpression(): ExpressionNode {
		return this.expression;
	}

	public getSpan(): Span {
		return this.span;
	}

	public toString(): string {
		return 'Execute Instruction';
	}
}

export class IfInstructionNode implements ASTNode {
	private readonly condition: ExpressionNode;
	private readonly thenExpression: ExpressionNode;
	private readonly elseExpression: ExpressionNode | null;
	private readonly span: Span;

	public constructor(
		condition: ExpressionNode,
		thenExpression: ExpressionNode,
		elseExpression: ExpressionNode | null,
		span: Span
	) {
		this.condition = condition;
		this.thenExpression = thenExpression;
		this.elseExpression = elseExpression;
		this.span = span;
	}

	public getCondition(): ExpressionNode {
		return this.condition;
	}

	public getThenExpression(): ExpressionNode {
		return this.thenExpression;
	}

	public getElseExpression(): ExpressionNode | null {
		return this.elseExpression;
	}

	public getSpan(): Span {
		return this.span;
	}

	public toString(): string {
		return 'If Instruction';
	}
}

export class WhileInstructionNode implements ASTNode {
	private readonly condition: ExpressionNode;
	private readonly bodyExpression: ExpressionNode;
	private readonly span: Span;

	public constructor(
		condition: ExpressionNode,
		bodyExpression: ExpressionNode,
		span: Span
	) {
		this.condition = condition;
		this.bodyExpression = bodyExpression;
		this.span = span;
	}

	public getCondition(): ExpressionNode {
		return this.condition;
	}

	public getBodyExpression(): ExpressionNode {
		return this.bodyExpression;
	}

	public getSpan(): Span {
		return this.span;
	}

	public toString(): string {
		return 'While Instruction';
	}
}

export type InstructionNode =
	| PrintInstructionNode
	| AssignInstructionNode
	| EvaluateInstructionNode
	| ExecuteInstructionNode
	| IfInstructionNode
	| WhileInstructionNode;
