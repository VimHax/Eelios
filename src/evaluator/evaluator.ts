import chalk from 'chalk';

import Lens from './lens';
import Value from './value';
import Closure from './closure';
import Environment from './environment';
import isExpectedDatatype from './isExpectedDatatype';

import { Span } from '../lexer/token';
import { Variable } from './variable';

import {
	ExpressionNode,
	DataType,
	StringDataType,
	FunctionDataType,
	ClosureDataType,
	AnyDataType,
	NumberDataType,
	BooleanDataType,
	FunctionLiteralNode,
	InstructionDataType,
	LValueNode,
	ArrayDataType,
	StringLiteralNode,
	NumberLiteralNode,
	BooleanLiteralNode,
	ClosureLiteralNode,
	ArrayLiteralNode,
	RValueVariableNode,
	RValueIndexOfNode,
	RValueCallNode,
	UnaryNode,
	BinaryNode,
	ExecuteInstructionNode,
	LValueVariableNode,
	PrintInstructionNode,
	AssignInstructionNode,
	EvaluateInstructionNode,
	IfInstructionNode,
	WhileInstructionNode,
	RValueGroupingNode
} from '../parser/ast';

import {
	ExpectedDataTypesButFound,
	UndefinedVariable,
	InvalidIndex,
	InvalidFunction,
	InvalidClosure,
	InvalidSelf,
	InvalidInstruction,
	InvalidArguments,
	InvalidExec
} from '../error/runtimeError';

export default class Evaluator {
	private readonly instruction: ExpressionNode;
	private environment: Environment | null = null;
	private self: Closure | FunctionLiteralNode | null = null;

	public constructor(instruction: ExpressionNode) {
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
		expr: ExpressionNode,
		instruction: boolean
	): Value {
		// Literals //

		if (expr instanceof StringLiteralNode) {
			return new Value(
				expr.getValue(),
				new StringDataType(),
				expr.getSpan()
			);
		}

		if (expr instanceof NumberLiteralNode) {
			return new Value(
				expr.getValue(),
				new NumberDataType(),
				expr.getSpan()
			);
		}

		if (expr instanceof BooleanLiteralNode) {
			return new Value(
				expr.getValue(),
				new BooleanDataType(),
				expr.getSpan()
			);
		}

		if (expr instanceof FunctionLiteralNode) {
			return new Value(
				expr,
				new FunctionDataType(
					expr.getParameters().map(p => p[1]),
					expr.getReturnType()
				),
				expr.getSpan()
			);
		}

		if (expr instanceof ClosureLiteralNode) {
			return new Value(
				new Closure(expr, this.environment),
				new ClosureDataType(
					expr.getParameters().map(p => p[1]),
					expr.getReturnType()
				),
				expr.getSpan()
			);
		}

		if (expr instanceof ArrayLiteralNode && !instruction) {
			if (expr.getValues().length === 0) {
				return new Value(
					[],
					new ArrayDataType(new AnyDataType()),
					expr.getSpan()
				);
			}
			const array = [];
			let datatype: DataType | null = null;
			for (const value of expr.getValues()) {
				const res = this.evaluateExpressionNode(value, false);
				if (datatype === null) {
					datatype = res.getDataType();
				} else if (!isExpectedDatatype(datatype, res.getDataType())) {
					throw new ExpectedDataTypesButFound(
						[datatype],
						res.getDataType(),
						res.getSpan()
					);
				}
				array.push(res.getValue());
			}
			if (datatype instanceof InstructionDataType) {
				return new Value(
					new ArrayLiteralNode(array, expr.getSpan()),
					new ArrayDataType(datatype as DataType),
					expr.getSpan()
				);
			}
			return new Value(
				array,
				new ArrayDataType(datatype as DataType),
				expr.getSpan()
			);
		}

		// RValue //

		if (expr instanceof RValueVariableNode) {
			if (expr.getName() === 'self') {
				if (this.self === null) throw new InvalidSelf(expr.getSpan());
				if (this.self instanceof Closure) {
					return new Value(
						this.self,
						new ClosureDataType(
							this.self
								.getClosure()
								.getParameters()
								.map(p => p[1]),
							this.self.getClosure().getReturnType()
						),
						expr.getSpan()
					);
				}
				return new Value(
					this.self,
					new FunctionDataType(
						this.self.getParameters().map(p => p[1]),
						this.self.getReturnType()
					),
					expr.getSpan()
				);
			}
			const res = this.getEnvironment(
				expr.getName(),
				expr.getSpan()
			).getVariable(expr.getName(), expr.getSpan());
			return new Value(
				res.getValue().getValue(),
				res.getDatatype(),
				expr.getSpan()
			);
		}

		if (expr instanceof RValueGroupingNode) {
			const val = this.evaluateExpressionNode(
				expr.getExpression(),
				instruction
			);
			return new Value(val.getValue(), val.getDataType(), expr.getSpan());
		}

		if (expr instanceof RValueIndexOfNode) {
			const rvalue = this.evaluateExpressionNode(expr.getRValue(), false);
			if (
				!isExpectedDatatype(
					new ArrayDataType(new AnyDataType()),
					rvalue.getDataType()
				)
			) {
				throw new ExpectedDataTypesButFound(
					[new ArrayDataType(new AnyDataType())],
					rvalue.getDataType(),
					rvalue.getSpan()
				);
			}
			const index = this.evaluateExpressionNode(expr.getIndex(), false);
			if (
				!isExpectedDatatype(new NumberDataType(), index.getDataType())
			) {
				throw new ExpectedDataTypesButFound(
					[new NumberDataType()],
					index.getDataType(),
					index.getSpan()
				);
			}
			let element;
			if (
				isExpectedDatatype(
					new ArrayDataType(new InstructionDataType()),
					rvalue.getDataType()
				)
			) {
				element = rvalue.getValue().getValues()[index.getValue()];
			} else {
				element = rvalue.getValue()[index.getValue()];
			}
			if (element === undefined) {
				throw new InvalidIndex(index.getValue(), index.getSpan());
			}
			return new Value(
				element,
				(rvalue.getDataType() as ArrayDataType).getDataType(),
				expr.getSpan()
			);
		}

		if (expr instanceof RValueCallNode) {
			const rvalue = this.evaluateExpressionNode(expr.getRValue(), false);
			if (rvalue.getDataType() instanceof FunctionDataType) {
				const fn = rvalue.getValue() as FunctionLiteralNode;
				if (fn.getParameters().length !== expr.getArguments().length) {
					throw new InvalidArguments(
						fn.getParameters().length,
						expr.getSpan()
					);
				}
				const args = expr
					.getArguments()
					.map(arg => this.evaluateExpressionNode(arg, false));
				fn.getParameters().forEach((p, idx) => {
					if (!isExpectedDatatype(p[1], args[idx].getDataType())) {
						throw new ExpectedDataTypesButFound(
							[p[1]],
							args[idx].getDataType(),
							args[idx].getSpan()
						);
					}
				});
				let env: Environment | null = null;
				fn.getParameters().forEach((p, idx) => {
					env = new Environment(env, new Variable(p[0], args[idx]));
				});
				const instruction = this.evaluateExpressionNode(
					fn.getExpression(),
					true
				);
				if (
					!isExpectedDatatype(
						new InstructionDataType(),
						instruction.getDataType()
					)
				) {
					throw new ExpectedDataTypesButFound(
						[new InstructionDataType()],
						instruction.getDataType(),
						instruction.getSpan()
					);
				}
				const evaluator = new Evaluator(instruction.getValue());
				evaluator.setSelf(fn);
				if (env !== null) evaluator.setEnvironment(env);
				const val = evaluator.evaluate();
				if (val === null) throw new InvalidFunction(expr.getSpan());
				if (
					!isExpectedDatatype(fn.getReturnType(), val.getDataType())
				) {
					throw new ExpectedDataTypesButFound(
						[fn.getReturnType()],
						val.getDataType(),
						val.getSpan()
					);
				}
				return new Value(
					val.getValue(),
					val.getDataType(),
					expr.getSpan()
				);
			}
			if (rvalue.getDataType() instanceof ClosureDataType) {
				const c = rvalue.getValue() as Closure;
				if (
					c.getClosure().getParameters().length !==
					expr.getArguments().length
				) {
					throw new InvalidArguments(
						c.getClosure().getParameters().length,
						expr.getSpan()
					);
				}
				const args = expr
					.getArguments()
					.map(arg => this.evaluateExpressionNode(arg, false));
				c.getClosure()
					.getParameters()
					.forEach((p, idx) => {
						if (
							!isExpectedDatatype(p[1], args[idx].getDataType())
						) {
							throw new ExpectedDataTypesButFound(
								[p[1]],
								args[idx].getDataType(),
								args[idx].getSpan()
							);
						}
					});
				let env = c.getEnvironment();
				if (c.getClosure().getParameters().length > 0) {
					c.getClosure()
						.getParameters()
						.forEach((p, idx) => {
							env = new Environment(
								env,
								new Variable(p[0], args[idx])
							);
						});
				}
				const instruction = this.evaluateExpressionNode(
					c.getClosure().getExpression(),
					true
				);
				if (
					!isExpectedDatatype(
						new InstructionDataType(),
						instruction.getDataType()
					)
				) {
					throw new ExpectedDataTypesButFound(
						[new InstructionDataType()],
						instruction.getDataType(),
						instruction.getSpan()
					);
				}
				const evaluator = new Evaluator(instruction.getValue());
				evaluator.setSelf(c);
				if (env !== null) evaluator.setEnvironment(env);
				const val = evaluator.evaluate();
				if (val === null) throw new InvalidClosure(expr.getSpan());
				if (
					!isExpectedDatatype(
						c.getClosure().getReturnType(),
						val.getDataType()
					)
				) {
					throw new ExpectedDataTypesButFound(
						[c.getClosure().getReturnType()],
						val.getDataType(),
						val.getSpan()
					);
				}
				return new Value(
					val.getValue(),
					val.getDataType(),
					expr.getSpan()
				);
			}
			throw new ExpectedDataTypesButFound(
				[
					new FunctionDataType([], new AnyDataType()),
					new ClosureDataType([], new AnyDataType())
				],
				rvalue.getDataType(),
				rvalue.getSpan()
			);
		}

		// Unary Operations //

		if (expr instanceof UnaryNode) {
			const operand = this.evaluateExpressionNode(
				expr.getOperand(),
				false
			);
			if (
				!isExpectedDatatype(new NumberDataType(), operand.getDataType())
			) {
				throw new ExpectedDataTypesButFound(
					[new NumberDataType()],
					operand.getDataType(),
					operand.getSpan()
				);
			}
			if (expr.getOperator() === 'minus') {
				return new Value(
					-operand.getValue(),
					operand.getDataType(),
					expr.getSpan()
				);
			}
			return new Value(
				operand.getValue(),
				operand.getDataType(),
				expr.getSpan()
			);
		}

		// Binary Operations //

		if (expr instanceof BinaryNode) {
			const [LHS, RHS] = expr
				.getOperands()
				.map(op => this.evaluateExpressionNode(op, false));
			const span = new Span(
				LHS.getSpan().getStart(),
				RHS.getSpan().getEnd()
			);
			if (expr.getOperator() === 'add') {
				if (
					!isExpectedDatatype(
						new NumberDataType(),
						LHS.getDataType()
					) &&
					!isExpectedDatatype(new StringDataType(), LHS.getDataType())
				) {
					throw new ExpectedDataTypesButFound(
						[new NumberDataType(), new StringDataType()],
						LHS.getDataType(),
						LHS.getSpan()
					);
				}
				if (!isExpectedDatatype(LHS.getDataType(), RHS.getDataType())) {
					throw new ExpectedDataTypesButFound(
						[LHS.getDataType()],
						RHS.getDataType(),
						RHS.getSpan()
					);
				}
				return new Value(
					(LHS.getValue() as number) + (RHS.getValue() as number),
					LHS.getDataType(),
					span
				);
			}
			if (
				[
					'subtract',
					'multiply',
					'divide',
					'power',
					'modulus',
					'lessthan',
					'greaterthan',
					'lessthanorequal',
					'greaterthanorequal'
				].includes(expr.getOperator())
			) {
				const idx = [LHS, RHS]
					.map(op => {
						const datatype = op.getDataType();
						return isExpectedDatatype(
							new NumberDataType(),
							datatype
						);
					})
					.findIndex(op => !op);
				if (idx !== -1) {
					throw new ExpectedDataTypesButFound(
						[new NumberDataType()],
						[LHS, RHS][idx].getDataType(),
						[LHS, RHS][idx].getSpan()
					);
				}
				const [LHSVal, RHSVal] = [LHS.getValue(), RHS.getValue()];
				const numType = new NumberDataType();
				const boolType = new BooleanDataType();
				switch (expr.getOperator()) {
					case 'subtract':
						return new Value(LHSVal - RHSVal, numType, span);
					case 'multiply':
						return new Value(LHSVal * RHSVal, numType, span);
					case 'divide':
						return new Value(LHSVal / RHSVal, numType, span);
					case 'power':
						return new Value(LHSVal ** RHSVal, numType, span);
					case 'modulus':
						return new Value(LHSVal % RHSVal, numType, span);
					case 'lessthan':
						return new Value(LHSVal < RHSVal, boolType, span);
					case 'greaterthan':
						return new Value(LHSVal > RHSVal, boolType, span);
					case 'lessthanorequal':
						return new Value(LHSVal <= RHSVal, boolType, span);
				}
				return new Value(LHSVal >= RHSVal, boolType, span);
			}
			if (['and', 'or'].includes(expr.getOperator())) {
				const idx = [LHS, RHS]
					.map(op => {
						const datatype = op.getDataType();
						return isExpectedDatatype(
							new BooleanDataType(),
							datatype
						);
					})
					.findIndex(op => !op);
				if (idx !== -1) {
					throw new ExpectedDataTypesButFound(
						[new BooleanDataType()],
						[LHS, RHS][idx].getDataType(),
						[LHS, RHS][idx].getSpan()
					);
				}
				const [LHSVal, RHSVal] = [LHS.getValue(), RHS.getValue()];
				const boolType = new BooleanDataType();
				if (expr.getOperator() === 'and') {
					return new Value(LHSVal && RHSVal, boolType, span);
				}
				return new Value(LHSVal || RHSVal, boolType, span);
			}
			if (['equal', 'notequal'].includes(expr.getOperator())) {
				if (
					isExpectedDatatype(
						new InstructionDataType(),
						LHS.getDataType()
					) ||
					isExpectedDatatype(
						new ArrayDataType(new AnyDataType()),
						LHS.getDataType()
					)
				) {
					throw new ExpectedDataTypesButFound(
						[
							new NumberDataType(),
							new StringDataType(),
							new BooleanDataType()
						],
						LHS.getDataType(),
						LHS.getSpan()
					);
				}
				if (!isExpectedDatatype(LHS.getDataType(), RHS.getDataType())) {
					throw new ExpectedDataTypesButFound(
						[LHS.getDataType()],
						RHS.getDataType(),
						RHS.getSpan()
					);
				}
				const [LHSVal, RHSVal] = [LHS.getValue(), RHS.getValue()];
				const boolType = new BooleanDataType();
				if (expr.getOperator() === 'equal') {
					return new Value(LHSVal === RHSVal, boolType, span);
				}
				return new Value(LHSVal !== RHSVal, boolType, span);
			}
			throw new Error('Invalid operator');
		}

		if (expr instanceof ExecuteInstructionNode && !instruction) {
			const res = this.evaluateInstructionNode(expr.getExpression());
			if (res === null) {
				throw new InvalidInstruction(expr.getExpression().getSpan());
			}
			return res;
		}
		return new Value(expr, new InstructionDataType(), expr.getSpan());
	}

	private evaluateLValue(node: LValueNode): [Lens, Span] {
		// Variable //

		if (node instanceof LValueVariableNode) {
			if (
				this.environment === null ||
				!this.environment.hasVariable(node.getName())
			) {
				const variable = new Variable(
					node.getName(),
					new Value(null, new AnyDataType(), node.getSpan())
				);
				this.environment = new Environment(this.environment, variable);
				return [
					{
						get: () => variable.getValue(),
						set: value => variable.setValue(value)
					} as Lens,
					node.getSpan()
				];
			}
			const variable = this.environment.getVariable(
				node.getName(),
				node.getSpan()
			);
			return [
				{
					get: () => variable.getValue(),
					set: value => variable.setValue(value)
				} as Lens,
				node.getSpan()
			];
		}

		// IndexOf //

		const [lens, span] = this.evaluateLValue(node.getLValue());
		const value = lens.get();
		if (
			!isExpectedDatatype(
				new ArrayDataType(new AnyDataType()),
				value.getDataType()
			)
		) {
			throw new ExpectedDataTypesButFound(
				[new ArrayDataType(new AnyDataType())],
				value.getDataType(),
				span
			);
		}
		const index = this.evaluateExpressionNode(node.getIndex(), false);
		if (!isExpectedDatatype(new NumberDataType(), index.getDataType())) {
			throw new ExpectedDataTypesButFound(
				[new NumberDataType()],
				index.getDataType(),
				index.getSpan()
			);
		}
		return [
			{
				get: () => {
					const v = lens.get().getValue()[index.getValue()];
					return new Value(
						v,
						(lens
							.get()
							.getDataType() as ArrayDataType).getDataType(),
						lens.get().getSpan()
					);
				},
				set: value => {
					const arr = lens.get().getValue();
					arr[index.getValue()] = value.getValue();
					lens.set(
						new Value(
							arr,
							new ArrayDataType(value.getDataType()),
							lens.get().getSpan()
						)
					);
				}
			} as Lens,
			node.getSpan()
		];
	}

	private evaluateInstructionNode(expr: ExpressionNode): null | Value {
		const value = this.evaluateExpressionNode(expr, true);
		const ins = value.getValue();
		if (
			!isExpectedDatatype(new InstructionDataType(), value.getDataType())
		) {
			throw new ExpectedDataTypesButFound(
				[new InstructionDataType()],
				value.getDataType(),
				value.getSpan()
			);
		}
		if (ins instanceof Array) {
			for (const i of ins) {
				const res = this.evaluateInstructionNode(i);
				if (res !== null) return res;
			}
			return null;
		}
		if (ins instanceof PrintInstructionNode) {
			const exprs = ins.getExpressions().map(e => {
				const res = this.evaluateExpressionNode(e, false);
				return res.getValue().toString();
			});
			console.log(chalk.green.bold('> ') + chalk.white(exprs.join('')));
			return null;
		}
		if (ins instanceof AssignInstructionNode) {
			const lvalue = this.evaluateLValue(ins.getLValue());
			const datatype = lvalue[0].get().getDataType();
			const value = this.evaluateExpressionNode(
				ins.getExpression(),
				false
			);
			if (!isExpectedDatatype(datatype, value.getDataType())) {
				throw new ExpectedDataTypesButFound(
					[datatype],
					value.getDataType(),
					value.getSpan()
				);
			}
			lvalue[0].set(value);
			return null;
		}
		if (ins instanceof EvaluateInstructionNode) {
			const value = this.evaluateExpressionNode(
				ins.getExpression(),
				false
			);
			return value;
		}
		if (ins instanceof ExecuteInstructionNode) {
			throw new InvalidExec(ins.getSpan());
		}
		if (ins instanceof IfInstructionNode) {
			const condition = this.evaluateExpressionNode(
				ins.getCondition(),
				true
			);
			if (
				!isExpectedDatatype(
					new BooleanDataType(),
					condition.getDataType()
				)
			) {
				throw new ExpectedDataTypesButFound(
					[new BooleanDataType()],
					condition.getDataType(),
					condition.getSpan()
				);
			}
			if (condition.getValue()) {
				return this.evaluateInstructionNode(ins.getThenExpression());
			}
			if (ins.getElseExpression() === null) return null;
			return this.evaluateInstructionNode(
				ins.getElseExpression() as ExpressionNode
			);
		}
		if (ins instanceof WhileInstructionNode) {
			let exit = false;
			do {
				const condition = this.evaluateExpressionNode(
					ins.getCondition(),
					true
				);
				if (
					!isExpectedDatatype(
						new BooleanDataType(),
						condition.getDataType()
					)
				) {
					throw new ExpectedDataTypesButFound(
						[new BooleanDataType()],
						condition.getDataType(),
						condition.getSpan()
					);
				}
				if (condition.getValue() === false) {
					exit = true;
				} else {
					const res = this.evaluateInstructionNode(
						ins.getBodyExpression()
					);
					if (res !== null) return res;
				}
			} while (!exit);
			return null;
		}
		if (ins instanceof ArrayLiteralNode) {
			for (const i of ins.getValues()) {
				const res = this.evaluateInstructionNode(i);
				if (res !== null) return res;
			}
			return null;
		}
		throw new Error('Invalid instruction node');
	}

	public evaluate(): null | Value {
		return this.evaluateInstructionNode(this.instruction);
	}
}
