import { DataType } from '../parser/ast';
import { Span } from '../lexer/token';

// Value //
/* Abstraction of a value in Eelios, stores the value & data type */

export default class Value {
	private readonly value: any;
	private readonly datatype: DataType;
	private readonly span: Span;

	public constructor(value: any, datatype: DataType, span: Span) {
		this.value = value;
		this.datatype = datatype;
		this.span = span;
	}

	public getValue(): any {
		return this.value;
	}

	public getDataType(): DataType {
		return this.datatype;
	}

	public getSpan(): Span {
		return this.span;
	}
}
