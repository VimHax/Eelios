import { DataType } from '../parser/ast';

export class Variable {
	private readonly name: string;
	private value: any;
	private datatype: DataType;

	public constructor(name: string, value: any, datatype: DataType) {
		this.name = name;
		this.value = value;
		this.datatype = datatype;
	}

	public getName(): string {
		return this.name;
	}

	public getValue(): any {
		return this.value;
	}

	public setValue(value: any): void {
		this.value = value;
	}

	public getDatatype(): DataType {
		return this.datatype;
	}

	public setDatatype(datatype: DataType): void {
		this.datatype = datatype;
	}
}
