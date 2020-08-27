# Eelios

[![Run on Repl.it](https://repl.it/badge/github/VimHax/Eelios)](https://repl.it/github/VimHax/Eelios)

Eelios is a programming language made, within approximately 2 weeks, for the ongoing (as of writing this) [Repl.It's Programming Jam](https://repl.it/jam). It is a pretty basic imperative language with a gimmick.

![The Jam](https://i.ibb.co/ZJzTxFc/image.png)

## Example Code

![The result](https://i.ibb.co/nftDwP9/image.png)

This code generates a render of the [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set).

```
[
	maxIterations <- 40,
	py <- 0,
	while py < 40 do [
		line <- "",
		px <- 0,
		yScaled <- py / 20 - 1,
		while px < 70 do [
			xScaled <- px / 20 - 2.5,
			x <- 0,
			y <- 0,
			i <- 0,
			while i < maxIterations & x ^ 2 + y ^ 2 <= 2 ^ 2 do [
				xTemp <- x ^ 2 - y ^ 2 + xScaled,
				y <- 2 * x * y + yScaled,
				x <- xTemp,
				i <- i + 1
			],
			part <- maxIterations / 8,
			if i > part * 7 then [ line <- line + "@" ]
			else if i > part * 6 then [ line <- line + "#" ]
			else if i > part * 5 then [ line <- line + "O" ]
			else if i > part * 4 then [ line <- line + "!" ]
			else if i > part * 3 then [ line <- line + ";" ]
			else if i > part * 2 then [ line <- line + ":" ]
			else if i > part then [ line <- line + "," ]
			else [ line <- line + "." ],
			px <- px + .5
		],
		print line,
		py <- py + 1
	]
]
```

## The Gimmick

![Arrays](https://i.ibb.co/DLw6ppm/image.png)

In virtually every language you can have arrays of numbers, strings, booleans etc, well in Eelios, you can also have arrays of instructions.

One of the instructions in Eelios is the `print` instruction, it prints text to the console.

```
print "Hi"
```

The above code would print `Hi` to the console

```
[
	print "Hi",
	print "Hello",
	print "Hi There"
]
```

This is an array of instructions, you can index this array like any other and add elements to it like any other.

```
[
	array <- [ print "Hi", print "Hello", print "Hi There" ],
	array[1],
	array[0],
	array[2]
]
```

![Program Output](https://i.ibb.co/HCqkk5N/image.png)

You might have noticed that the program itself is also an array of instructions, and yes, this is in-fact the case. I'll explain these concepts in more depth in the **Documentation**.

## The Documentation

Eelios doesn't care about the styling of the code, so indentation, spacing and all that stuff are all purely for readability.

### Comments

It's very basic. Simply, anything, until an EOL - *End Of Line* or EOF - *End Of File*, after a `#` is considered a comment and will be ignored by Eelios.

```
[
	some, # This is a comment
	# code, <- you can comment out lines of code
	nice
]
```

### Data Types

```
Number, # A number (could be an integer or float)
String, # An array of characters (though there isn't a character data type and strings aren't internally represented using an array)
Boolean, # `true` or `false`
Instruction, # An Instruction
Array<DataType>, # An array of some data (every element in the array must have the same data type)
| <DataType>, <DataType> | -> <DataType>, # A function
( <DataType>, <DataType> ) => <DataType>, # A closure
```

Yeah.... That's basically it. *Told you it's very basic...*

### Literals

```
1, 1.23, 2., .3 # Number literals (0 gets appended on the right and left side respectively for the last 2 literals, thus, 2.0, 0.3)
"Hi", "", "\"Hello World\"" # String literals (only double quotes can be used for string literals)
true, false # Boolean literals
```

> *"Told you it's very basic..."*

### Operators

```
+<Number>, -<Number> # Plus & Minus unary operators
<Number> ^ <Number> # Exponentiation binary operator
<Number> * <Number>, <Number> / <Number>, <Number> % <Number> # Multiplication, Division & Modulus binary operators
<T> + <T>, <Number> - <Number> # Addition & Subtraction binary operators (where T is Number | String)
<Number> < <Number>, <Number> > <Number>, <Number> <= <Number>, <Number> >= <Number> # Less Than, Greater Than, Less Than Or Equal & Greater Than Or Equal binary operators
<T> = <T>, <T> != <T> # Equal & Not Equal binary operators (where T is any data type other than Instruction or Array)
<Boolean> and <Boolean>, <Boolean> or <Number> # And & Or binary operators
```

All the operators are listed in the order of precedence, from highest to lowest. (So the plus & minus unary operators have the highest precedence)

### Instructions

This is the fun stuff... right, so any one instruction (any place where a single instruction is expected), in Eelios, can just be a single normal instruction or be an array of instructions or be an expression which evaluates to one of the former... A program in Eelios is just one instruction, however, since Eelios allows you to substitute any single instruction with an array of instructions, a program can, and most likely is, an array of instructions.

> ![Code of the Evaluator](https://i.ibb.co/980LCw1/image.png)
>
> The code for executing a program is literally just executing one instruction...

Take the `if` instruction, for example, it has the following syntax, `if <expression> then <instruction> else <instruction>`. You can use this instruction like shown below.

```
if a > b then print a else print b
```

The `if` instruction expects just a single instruction after the `then` keyword and after the optional `else` keyword. However, because Eelios allows you to substitute any one instruction with an array of instructions the following is also equally valid code.

```
if a > b then [ print "The larger number", print a ] else [ print "The larger number", print b ]
```

Eelios also allows you to substitute in any expression which evaluates to a instruction, thus, you can also do the following.

```
[
	thenBody <- [ print "The larger number", print a ],
	elseBody <- |  | -> Instruction [ eval [ print "The larger number", print b ] ],
	if a > b then thenBody else elseBody()
]
```

> The variable `elseBody` is a function which returns an array of instructions... Functions are explained in the next section

```
print <expression> # Prints the value of a single expression
print <expression> . <expression> # Prints the value of multiple expressions (the expressions are seperated by a `.`)
<variable> <- <expression> # Assigns the value that the expression evaluates to some variable
eval <expression> # Returns the value that the expression evaluates to the code which called the instruction, anything after the `eval` instruction will not be executed. (this behaves like the `return` keyword in virtually every other language)
exec <Instruction> # Executes the instruction and evaluates to the value that the instruction returned (this is the only instruction which can and can only be used in an expression, you can actually call this an operator if you like :D, even though it's not implemented as one)
if <expression> then <instruction> else <instruction> # If the expression evaluates to `true` the first instruction will be executed, otherwise, if the second instruction exists, it will be executed
while <expression> do <instruction> # The instruction will be executed repeatedly while the expression evaluates to `true`
```

> Unlike in every other language, the instructions inside of `if` and `while` statements aren't scoped, meaning, any variables you define inside of an `if` and `while` statement will not be discarded after Eelios continues from the instruction which made the variables.

Because of how the `eval` instruction and `exec` instructions work, you can emulate conditional (ternary) operator.

```
c <- exec if a > b then eval x else eval y
```

The `exec` instruction executes the `if` instruction and it executes the `eval` instruction which returns a value, that value is then assigned to `c`.

### Functions & Closures

Functions, in Eelios, are pure functions (functions whose output is always the same for a given input). Furthermore, functions, as well as closures, are  anonymous, the only way you can assign them a name is by assigning them to a variable.

```
| <parameter> : <datatype> | -> <datatype> <instruction>
```

Within the `| |` you provide the list of parameters with their respective data type and then after the `->` you provide the function return type. The instruction can reference the parameters by their names and can also, just like in any other instruction, define new variables... However, functions, as well as closures, are scoped, so any new variables you define inside of a function will be discarded after the function has been called.

The way you return a value from a function is using the previously mentioned `eval` instruction. Anything after the `eval` instruction will not be executed.

> There is no `void` return type, thus, every function, as well as closure, must always return a value

Closures are basically identical to functions in Eelios, the only difference is that they capture the environment that they were defined in, so variables which were defined before the closure can be used and also mutated (even if those values go out of scope).

```
( <parameter> : <datatype> ) => <datatype> <instruction>
```

> Any variables defined after the closure **cannot** be used inside of the closure, as, they were not a part of the environment it captured.

If you wish to do recursion in Eelios, you must use the `self` value to reference the current function.

#### Examples

##### Functions

```
| x : Number, y : Number | -> Number [
	eval x + y
]
```

This function takes 2 arguments of type `Number` and returns the addition of them. You can't exactly reuse this function, since it's anonymous, so you can assign it to a variable like shown below, if you want to reuse it.

```
add <- | x : Number, y : Number | -> Number eval x + y
```

> Since the instruction only contains a single instruction, the `eval` instruction, you can remove the **unnecessary** square brackets. (I prefer to keep them most of the time because it's easier to read with them)

```
larger <- | x: Number, y : Number | -> Number [
	if x > y then [
		eval x
	] else [
		eval y
	]
]
```

This function takes 2 arguments of type `Number` and returns the argument which was larger.

> ```
> [
> 	larger <- | x: Number, y : Number | -> Number [ if x > y then eval x, eval y ],
> 	print "The larger number is " . larger(4, 5)
> ]
> ```
>
> ![The result](https://i.ibb.co/YdXv9tM/image.png)

##### Closures

```
[
	a <- 5,
	increment <- () => Instruction [ a <- a + 1, eval [] ],
	print a,
	increment(),
	print a
]
```

![Result of the program](https://i.ibb.co/cFKMBz9/image.png)

Since this is a closure, it can use the variable `a` and also mutate `a`, which is exactly what it does. Whenever this closure is called, `a`, will be incremented by `1`.

> Notice I was able to call `increment` where an instruction was expected, Eelios does **not** support expression-statements, however, since instructions can be substituted by expressions which evaluate to instructions, this is exactly what we use. The `increment` closure evaluates to an empty array of instructions, thus, nothing would actually happen.
>
> If you wanted something to happen, you can make the array not empty,`increment <- () => Instruction [ a <- a + 1, eval print "Hey" ]`, this would print `Hi` every time it gets called, if it was called where a instruction was expected. (i.e. the result wasn't stored in a variable for example)

##### Recursion

```
[
	factorial <- | n: Number | -> Number [
		if n = 1 then eval n,
		eval n * self(n - 1)
	],
	print factorial(5)
]
```

This function recursively calls itself to evaluate the factorial of `5`. So, in this case, it evaluates to `1 * 2 * 3 * 4 * 5` which equals `120`.

![The result](https://i.ibb.co/c1Bs7y4/image.png)

## More Example Code

### The Hello World Program

```
print "Hello World"
```

### Make a instruction evaluate to a value

```
[
	a <- [
		x <- 2,
		eval x ^ 3,
		print "Hi"
	],
	print exec a
]
```

![The result](https://i.ibb.co/6XCHTq6/image.png)

The `eval` instruction evaluates the instruction being called to the value that it's expression evaluates to, in this case, `8`. The `exec` instruction simply executes the instructions, in order, and then finds the `eval` instruction and returns that value... If the `exec` instruction found no `eval` instructions, it would cause an error.

> *"Anything after the `eval` instruction will not be executed."*, this is why there is no "Hi" in the console.

### Make a program evaluate to a value

```
[
	a <- 4,
	b <- 5,
	eval a + b
]
```

![The result](https://i.ibb.co/z8T7J1d/image.png)

The program itself is also just another array of instructions, so the same rules apply.

### Make a callback instruction

```
[
	multiply <- | a: Number, b: Number, callback: Instruction | -> Instruction [
		product <- a * b,
		callback,
		eval []
	],
	multiply(2, 3, print "a: " . a . " x b: " . b . " = " . product)
]
```

![The result](https://i.ibb.co/QfN2LrK/image.png)

The instruction `print "a: " . a . " x b: " . b . " = " . product` is invalid outside of the multiply function, and indeed, you would get an error if you tried to execute it outside of the multiply function, but that's not being done here... It's only being executed inside of the multiply function where the variables `a`, `b` and `product` are all defined. Just because the instruction appears in the arguments it doesn't necessarily mean it's being executed. (Unless it's the argument of an `exec` instruction)

### Higher Order Functions & Arrays

```
[
	map <- | x: Number, fn : | Number | -> Number | -> Number [ eval fn(x) ],
	
	addOne <- | x: Number | -> Number [ eval x + 1 ],
	double <- | x: Number | -> Number [ eval x * 2 ],
	
	a <- [1, 2, 3, 4, 5],
	b <- [],
	c <- [],
	
	idx <- 0,
	while idx < 5 do [
		b[idx] <- map(a[idx], addOne),
		c[idx] <- map(a[idx], double),
		idx <- idx + 1
	],
	
	print a,
	print b,
	print c
]
```

![The result](https://i.ibb.co/x2pG7hy/image.png)

> You can also return functions or closures from functions and closures, you can also have arrays of functions and closures etc...

### Generate Fibonacci Numbers

Generates and prints the first 10 Fibonacci numbers.

```
[
    fib <- | n: Number | -> Number [
        if n <= 1 then [ 
            eval n 
        ] else [
            eval self(n - 1) + self(n - 2)
        ]
    ],
    idx <- 0,
    while idx < 10 do [
        n <- fib(idx),
        print n,
        idx <- idx + 1
    ]
]
```

![The result](https://i.ibb.co/qR4kjYc/image.png)