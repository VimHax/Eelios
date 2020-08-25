import Value from './value';

import { DataType } from '../parser/ast';

// Variable //
/* Abstraction of a variable in Eelios, stores the name, value & data type */

export class Variable {
	private readonly name: string;
	private value: Value;

	public constructor(name: string, value: Value) {
		this.name = name;
		this.value = value;
	}

	public getName(): string {
		return this.name;
	}

	public getValue(): Value {
		return this.value;
	}

	public setValue(value: Value): void {
		this.value = value;
	}

	public getDatatype(): DataType {
		return this.value.getDataType();
	}
}
