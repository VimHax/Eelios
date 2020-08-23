export default interface Lens {
	get: () => any;
	set: (value: any) => void;
}
