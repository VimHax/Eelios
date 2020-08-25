import { Variable } from './variable';
import { Span } from '../lexer/token';
import { UndefinedVariable } from '../error/runtimeError';

// Environment //
/* A linked list of variables */

export default class Environment {
	private readonly parent: Environment | null;
	private readonly variable: Variable;

	public constructor(parent: Environment | null, variable: Variable) {
		this.parent = parent;
		this.variable = variable;
	}

	public getVariable(name: string, span: Span): Variable {
		const result = this.variable.getName() === name;
		if (result) return this.variable;
		if (this.parent === null) throw new UndefinedVariable(name, span);
		return this.parent.getVariable(name, span);
	}

	public hasVariable(name: string): boolean {
		const result = this.variable.getName() === name;
		if (!result && this.parent !== null) {
			return this.parent.hasVariable(name);
		}
		return result;
	}
}
