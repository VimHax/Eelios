import Environment from './environment';

import { ClosureLiteralNode } from '../parser/ast';

// Closure //
/* Abstraction of a closure in Eelios, stores the literal & the captured environment */

export default class Closure {
	private readonly closure: ClosureLiteralNode;
	private readonly environment: Environment | null;

	public constructor(
		closure: ClosureLiteralNode,
		environment: Environment | null
	) {
		this.closure = closure;
		this.environment = environment;
	}

	public getClosure(): ClosureLiteralNode {
		return this.closure;
	}

	public getEnvironment(): Environment | null {
		return this.environment;
	}
}
