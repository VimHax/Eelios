import {
	DataType,
	AnyDataType,
	StringDataType,
	NumberDataType,
	BooleanDataType,
	InstructionDataType,
	ArrayDataType,
	FunctionDataType,
	ClosureDataType
} from '../parser/ast';

// isExpectedDatatype //
/* Compares the actual datatype to the expected datatype provided and returns true if they match */

export default function isExpectedDatatype(
	expected: DataType,
	actual: DataType
): boolean {
	if (expected instanceof AnyDataType) return true;
	if (expected instanceof StringDataType) {
		return actual instanceof StringDataType;
	}
	if (expected instanceof NumberDataType) {
		return actual instanceof NumberDataType;
	}
	if (expected instanceof BooleanDataType) {
		return actual instanceof BooleanDataType;
	}
	if (expected instanceof InstructionDataType) {
		if (actual instanceof InstructionDataType) return true;
		if (actual instanceof ArrayDataType) {
			const datatype = actual.getDataType();
			if (datatype instanceof InstructionDataType) {
				return true;
			}
			if (datatype instanceof AnyDataType) {
				return true;
			}
			return false;
		}
		return false;
	}
	if (expected instanceof FunctionDataType) {
		if (!(actual instanceof FunctionDataType)) return false;
		if (expected.getParameters().length !== actual.getParameters().length) {
			return false;
		}
		const parameters = actual.getParameters();
		for (const [idx, parameter] of expected.getParameters().entries()) {
			if (!isExpectedDatatype(parameter, parameters[idx])) return false;
		}
		return isExpectedDatatype(
			expected.getReturnType(),
			actual.getReturnType()
		);
	}
	if (expected instanceof ClosureDataType) {
		if (!(actual instanceof ClosureDataType)) return false;
		if (expected.getParameters().length !== actual.getParameters().length) {
			return false;
		}
		const parameters = actual.getParameters();
		for (const [idx, parameter] of expected.getParameters().entries()) {
			if (!isExpectedDatatype(parameter, parameters[idx])) return false;
		}
		return isExpectedDatatype(
			expected.getReturnType(),
			actual.getReturnType()
		);
	}
	if (expected instanceof ArrayDataType) {
		if (!(actual instanceof ArrayDataType)) return false;
		return isExpectedDatatype(expected.getDataType(), actual.getDataType());
	}
	throw new Error('Invalid DataType');
}
