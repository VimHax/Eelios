import Value from './value';

export default interface Lens {
	get: () => Value;
	set: (value: Value) => void;
}
