import Equal from 'fast-deep-equal';
import util from 'util';

import Lens from './lens';
import Environment from './environment';
import { Span } from '../lexer/token';
import {
	InstructionNode,
	ExpressionNode,
	DataType,
	StringDataType,
	FunctionDataType,
	ClosureDataType,
	AnyDataType,
	NumberDataType,
	BooleanDataType,
	ClosureLiteralNode,
	FunctionLiteralNode,
	InstructionDataType,
	LValueNode,
	ArrayDataType
} from '../parser/ast';
import {
	ExpectedDataTypesButFound,
	UndefinedVariable,
	OutOfBounds,
	InvalidFunction,
	InvalidClosure,
	InvalidSelf,
	CannotCompare,
	InvalidInstruction
} from '../error/runtimeError';
import { Variable } from './variable';

interface Closure {
	type: 'closure';
	closure: ClosureLiteralNode;
	environment: Environment;
}

export default class Evaluator {
	private readonly instruction: InstructionNode;
	private environment: Environment | null = null;
	private self: Closure | FunctionLiteralNode | null = null;

	public constructor(instruction: InstructionNode) {
		this.instruction = instruction;
	}

	private getEnvironment(name: string, span: Span): Environment {
		if (this.environment === null) throw new UndefinedVariable(name, span);
		return this.environment;
	}

	protected setEnvironment(environment: Environment): void {
		this.environment = environment;
	}

	protected setSelf(newSelf: Closure | FunctionLiteralNode): void {
		this.self = newSelf;
	}

	private evaluateExpressionNode(
		expr: ExpressionNode
	): [any, DataType, Span] {
		switch (expr.type) {
			// Literals //
			case 'string': {
				return [
					expr.value,
					{ type: 'string' } as StringDataType,
					expr.span
				];
			}
			case 'number': {
				return [
					expr.value,
					{ type: 'number' } as NumberDataType,
					expr.span
				];
			}
			case 'boolean': {
				return [
					expr.value,
					{ type: 'boolean' } as BooleanDataType,
					expr.span
				];
			}
			case 'function': {
				return [
					expr,
					{
						type: 'function',
						parameters: expr.parameters.map(e => e[1]),
						returnType: expr.returnType
					} as FunctionDataType,
					expr.span
				];
			}
			case 'closure': {
				return [
					{ closure: expr, environment: this.environment } as Closure,
					{
						type: 'closure',
						parameters: expr.parameters.map(e => e[1]),
						returnType: expr.returnType
					} as ClosureDataType,
					expr.span
				];
			}
			case 'array': {
				if (expr.values.length === 0) {
					return [
						[],
						{
							type: 'array',
							datatype: { type: 'any' } as AnyDataType
						} as ArrayDataType,
						expr.span
					];
				}
				const res = this.evaluateExpressionNode(
					expr.values.shift() as ExpressionNode
				);
				const arr = [res[0]];
				const arrDatatype = res[1];
				for (const value of expr.values) {
					const res = this.evaluateExpressionNode(value);
					if (!Equal(res[1], arrDatatype)) {
						throw new ExpectedDataTypesButFound(
							[arrDatatype],
							res[1],
							res[2]
						);
					}
					arr.push(res[0]);
				}
				return [
					arr,
					{ type: 'array', datatype: arrDatatype } as ArrayDataType,
					expr.span
				];
			}
			// RValue //
			case 'variable': {
				if (expr.name === 'self') {
					if (this.self === null) throw new InvalidSelf(expr.span);
					if (this.self.type === 'function') {
						return [
							expr,
							{
								type: 'function',
								parameters: this.self.parameters.map(e => e[1]),
								returnType: this.self.returnType
							} as FunctionDataType,
							expr.span
						];
					}
					return [
						this.self.closure,
						{
							type: 'closure',
							parameters: this.self.closure.parameters.map(
								e => e[1]
							),
							returnType: this.self.closure.returnType
						} as ClosureDataType,
						expr.span
					];
				}
				const res = this.getEnvironment(
					expr.name,
					expr.span
				).getVariable(expr.name, expr.span);
				return [res.getValue(), res.getDatatype(), expr.span];
			}
			case 'indexof': {
				const res = this.evaluateExpressionNode(expr.rvalue);
				if (res[1].type !== 'array') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'array',
								datatype: { type: 'any' } as AnyDataType
							} as ArrayDataType
						],
						res[1],
						res[2]
					);
				}
				const index = this.evaluateExpressionNode(expr.index);
				if (index[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[{ type: 'number' } as NumberDataType],
						index[1],
						index[2]
					);
				}
				if (index[0] < 0 || index[0] >= res[0].length) {
					throw new OutOfBounds(index[0], index[2]);
				}
				return [res[0][index[0]], res[1].datatype, expr.span];
			}
			case 'call': {
				const res = this.evaluateExpressionNode(expr.rvalue);
				if (!['function', 'closure'].includes(res[1].type)) {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'function',
								parameters: [],
								returnType: { type: 'any' } as AnyDataType
							} as FunctionDataType,
							{
								type: 'closure',
								parameters: [],
								returnType: { type: 'any' } as AnyDataType
							} as ClosureDataType
						],
						res[1],
						res[2]
					);
				}
				if (res[1].type === 'function') {
					const fn = res[0] as FunctionLiteralNode;
					const evaluator = new Evaluator(fn.instruction);
					evaluator.setSelf(fn);
					const val = evaluator.evaluate();
					if (val === null) throw new InvalidFunction(expr.span);
					return [val[0], val[1], expr.span];
				}
				const closure = res[0] as Closure;
				const evaluator = new Evaluator(closure.closure.instruction);
				evaluator.setSelf(closure);
				evaluator.setEnvironment(closure.environment);
				const val = evaluator.evaluate();
				if (val === null) throw new InvalidClosure(expr.span);
				return [val[0], val[1], expr.span];
			}
			// Unary Operations //
			case 'plus': {
				const res = this.evaluateExpressionNode(expr.operand);
				if (res[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						res[1],
						res[2]
					);
				}
				return [res[0], res[1], expr.span];
			}
			case 'minus': {
				const res = this.evaluateExpressionNode(expr.operand);
				if (res[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						res[1],
						res[2]
					);
				}
				return [-res[0], res[1], expr.span];
			}
			// Binary Operations //
			case 'add': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (!['number', 'string'].includes(op1[1].type)) {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType,
							{
								type: 'string'
							} as StringDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (!Equal(op2[1].type, op1[1].type)) {
					throw new ExpectedDataTypesButFound(
						[op1[1]],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as number) + (op2[0] as number),
					op1[1],
					expr.span
				];
			}
			case 'subtract': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as number) - (op2[0] as number),
					op1[1],
					expr.span
				];
			}
			case 'multiply': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as number) * (op2[0] as number),
					op1[1],
					expr.span
				];
			}
			case 'divide': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as number) / (op2[0] as number),
					op1[1],
					expr.span
				];
			}
			case 'power': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as number) ^ (op2[0] as number),
					op1[1],
					expr.span
				];
			}
			case 'modulus': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as number) % (op2[0] as number),
					op1[1],
					expr.span
				];
			}
			case 'and': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'boolean') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'boolean'
							} as BooleanDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'boolean') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'boolean'
							} as BooleanDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as boolean) && (op2[0] as boolean),
					op1[1],
					expr.span
				];
			}
			case 'or': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'boolean') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'boolean'
							} as BooleanDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'boolean') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'boolean'
							} as BooleanDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as boolean) || (op2[0] as boolean),
					op1[1],
					expr.span
				];
			}
			case 'equal': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (
					['array', 'instruction', 'function', 'closure'].includes(
						op1[1].type
					)
				) {
					throw new CannotCompare(op1[2]);
				}
				if (op2[1].type !== op1[1].type) {
					throw new ExpectedDataTypesButFound(
						[op1[1]],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as boolean) === (op2[0] as boolean),
					{ type: 'boolean' } as BooleanDataType,
					expr.span
				];
			}
			case 'notequal': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (
					['array', 'instruction', 'function', 'closure'].includes(
						op1[1].type
					)
				) {
					throw new CannotCompare(op1[2]);
				}
				if (op2[1].type !== op1[1].type) {
					throw new ExpectedDataTypesButFound(
						[op1[1]],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as boolean) !== (op2[0] as boolean),
					{ type: 'boolean' } as BooleanDataType,
					expr.span
				];
			}
			case 'lessthan': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as number) < (op2[0] as number),
					{ type: 'boolean' } as BooleanDataType,
					expr.span
				];
			}
			case 'greaterthan': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as number) > (op2[0] as number),
					{ type: 'boolean' } as BooleanDataType,
					expr.span
				];
			}
			case 'lessthanorequal': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as number) <= (op2[0] as number),
					{ type: 'boolean' } as BooleanDataType,
					expr.span
				];
			}
			case 'greaterthanorequal': {
				const op1 = this.evaluateExpressionNode(expr.operands[0]);
				const op2 = this.evaluateExpressionNode(expr.operands[1]);
				if (op1[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op1[1],
						op1[2]
					);
				}
				if (op2[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'number'
							} as NumberDataType
						],
						op2[1],
						op2[2]
					);
				}
				return [
					(op1[0] as number) >= (op2[0] as number),
					{ type: 'boolean' } as BooleanDataType,
					expr.span
				];
			}
		}
		const res = this.evaluateInstructionNode(
			expr as InstructionNode,
			true,
			true
		);
		if (res === null) throw new InvalidInstruction(expr.span);
		return res;
	}

	private evaluateLValue(node: LValueNode): [Lens, Lens, Span] {
		switch (node.type) {
			case 'variable': {
				if (
					this.environment === null ||
					!this.environment.hasVariable(node.name)
				) {
					const variable = new Variable(node.name, null, {
						type: 'any'
					} as AnyDataType);
					this.environment = new Environment(
						this.environment,
						variable
					);
					return [
						{
							get: () => variable.getValue(),
							set: value => variable.setValue(value)
						} as Lens,
						{
							get: () => variable.getDatatype(),
							set: value => variable.setDatatype(value)
						} as Lens,
						node.span
					];
				}
				const variable = this.environment.getVariable(
					node.name,
					node.span
				);
				return [
					{
						get: () => variable.getValue(),
						set: value => variable.setValue(value)
					} as Lens,
					{
						get: () => variable.getDatatype(),
						set: value => variable.setDatatype(value)
					} as Lens,
					node.span
				];
			}
			case 'indexof': {
				const lenses = this.evaluateLValue(node.lvalue);
				const datatype = lenses[1].get() as DataType;
				if (datatype.type !== 'array') {
					throw new ExpectedDataTypesButFound(
						[
							{
								type: 'array',
								datatype: { type: 'any' } as AnyDataType
							} as ArrayDataType
						],
						datatype,
						lenses[2]
					);
				}
				const index = this.evaluateExpressionNode(node.index);
				if (index[1].type !== 'number') {
					throw new ExpectedDataTypesButFound(
						[{ type: 'number' } as NumberDataType],
						index[1],
						index[2]
					);
				}
				if (index[0] < 0) {
					throw new OutOfBounds(index[0] as number, index[2]);
				}
				const arr = lenses[0].get();
				if (arr === null) {
					lenses[0].set([]);
				}
				return [
					{
						get: () => lenses[0].get()[index[0]],
						set: value => {
							const arr = lenses[0].get();
							arr[index[0]] = value;
							lenses[0].set(arr);
						}
					} as Lens,
					{
						get: () => (lenses[1].get() as ArrayDataType).datatype,
						set: value => lenses[1].set(value)
					} as Lens,
					node.span
				];
			}
		}
	}

	private evaluateInstruction(
		value: any,
		datatype: DataType,
		span: Span
	): null | [any, DataType, Span] {
		if (
			datatype.type === 'instruction' ||
			(datatype.type === 'array' &&
				datatype.datatype.type === 'instruction')
		) {
			return this.evaluateInstructionNode(value, false, false);
		}
		throw new ExpectedDataTypesButFound(
			[
				{ type: 'instruction' } as InstructionDataType,
				{
					type: 'array',
					datatype: {
						type: 'instruction'
					} as InstructionDataType
				} as ArrayDataType
			],
			datatype,
			span
		);
	}

	private evaluateInstructionNode(
		ins: InstructionNode,
		expression: boolean,
		topLevel: boolean
	): null | [any, DataType, Span] {
		if (expression) {
			if (ins.type === 'exec' && topLevel) {
				return this.evaluateInstruction(
					...this.evaluateExpressionNode(ins.expression)
				);
			}
			return [
				ins,
				{ type: 'instruction' } as InstructionDataType,
				ins.span
			];
		}
		switch (ins.type) {
			case 'print': {
				const exprs = ins.expressions.map(e => {
					const res = this.evaluateExpressionNode(e);
					return util.inspect(res[0], false, null, true);
				});
				console.log(exprs.join(', '));
				return null;
			}
			case 'assign': {
				const lvalue = this.evaluateLValue(ins.lvalue);
				const datatype = lvalue[1].get() as DataType;
				const value = this.evaluateExpressionNode(ins.expression);
				if (
					datatype.type !== value[1].type &&
					datatype.type !== 'any'
				) {
					throw new ExpectedDataTypesButFound(
						[
							{ type: 'any' } as AnyDataType,
							{
								type: 'array',
								datatype: {
									type: 'instruction'
								} as InstructionDataType
							} as ArrayDataType
						],
						value[1],
						value[2]
					);
				}
				if (datatype.type === 'any') lvalue[1].set(value[1]);
				lvalue[0].set(value[0]);
				return null;
			}
			case 'eval': {
				const value = this.evaluateExpressionNode(ins.expression);
				return value;
			}
			case 'exec': {
				const value = this.evaluateExpressionNode(ins.expression);
				const res = this.evaluateInstruction(...value);
				return res;
			}
			case 'if': {
				const condition = this.evaluateExpressionNode(ins.condition);
				if (condition[1].type !== 'boolean') {
					throw new ExpectedDataTypesButFound(
						[{ type: 'boolean' } as BooleanDataType],
						condition[1],
						condition[2]
					);
				}
				if (condition[0]) {
					const thenExpression = this.evaluateExpressionNode(
						ins.thenExpression
					);
					return this.evaluateInstruction(...thenExpression);
				}
				if (ins.elseExpression === null) return null;
				const elseExpression = this.evaluateExpressionNode(
					ins.elseExpression
				);
				return this.evaluateInstruction(...elseExpression);
			}
			case 'while': {
				let exit = false;
				do {
					const condition = this.evaluateExpressionNode(
						ins.condition
					);
					if (condition[1].type !== 'boolean') {
						throw new ExpectedDataTypesButFound(
							[{ type: 'boolean' } as BooleanDataType],
							condition[1],
							condition[2]
						);
					}
					if (condition[0] === false) {
						exit = true;
					} else {
						const body = this.evaluateExpressionNode(ins.body);
						const res = this.evaluateInstruction(...body);
						if (res !== null) return res;
					}
				} while (!exit);
				return null;
			}
			case 'array': {
				for (const i of ins.values) {
					const res = this.evaluateInstructionNode(
						i as InstructionNode,
						false,
						false
					);
					if (res !== null) return res;
				}
				return null;
			}
		}
	}

	public evaluate(): null | [any, DataType, Span] {
		return this.evaluateInstructionNode(this.instruction, false, true);
	}
}
