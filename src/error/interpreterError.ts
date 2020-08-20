// InterpreterError //
/* Every error which the Eelios interpreter throws will implements this interface */
/* (Which means every error thrown has a `print` method on it) */

export default interface InterpreterError {
	print: (contents: string) => void;
}
