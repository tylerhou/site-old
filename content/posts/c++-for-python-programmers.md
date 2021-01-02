---
title: 'C++ for Python Programmers: "Hello World!", and Memory'
subtitle: We write our first program and discuss stack and heap allocation.


  This post is the first in a series of posts about C++. Future topics will
  focus on values, pointers, references, copy/move constructors, and debugging
  tips.


  Although the title of this series is "C++ for Python Programmers", hopefully
  the content will still be useful for those who come from Java, JavaScript,
  Ruby, or other languages.
date: 2019-04-06T17:39:05-07:00
draft: false
unlisted: true
---

Welcome to C++! Let's start by writing our first program.

## Entry point

In Python, JavaScript, and Ruby, you can just start writing code:

```python
print("Hello, World!")
```

```js
console.log("Hello, World!");
```

```ruby
puts "Hello, World!"
```

When a C++ program runs, the `main` function is (usually) executed first.
Here is a C++ program which prints "Hello, World!" to standard out.

```c++
// hello.cc
#include <iostream>

int main() {
    // Write "Hello, World!" to standard output.
    std::cout << "Hello, World!";
    return 0; // Successful exit
}
```

To compile this code, install either [Clang](https://clang.llvm.org/) or [GNU
C++](https://gcc.gnu.org/). (If you're running a Linux/Unix-based system, one
should already be installed). In a command line:

1. If you chose Clang, run `clang++ hello.cc && ./a.out`.
1. If you chose GNU C++, run `g++ hello.cc && ./a.out`.

By historical convention, both compilers output the executable as `a.out`. You
can change this by passing the `-o` flag: `clang++ hello.cc -o hello && ./hello`.

The `main` function can return an integer which represents the program's _exit
code_. An exit code of `0` means that the program terminated without error.
Non-zero exit codes mean that the program encountered an error. Programs
usually define the meanings of their own non-zero exit codes, but [there are
informal conventions](http://tldp.org/LDP/abs/html/exitcodes.html) as well as
[efforts to standardize exit
codes](https://www.freebsd.org/cgi/man.cgi?query=sysexits).

## Memory

Most C++ programs store data in two regions of memory -- one called the stack,
and one called the heap.

Storage in Python, JavaScript, etc. depends on the implementation. For example,
the most popular implementation of Python, CPython, stores everything on the
heap. Other implementations of Python may choose to store some data on a
stack-like structure.

Java isn't much better -- it lets you explicitly allocate on the heap with the
`new` keyword, but only lets you allocate primitives (`int`, `float`, `double`,
`bool`, etc.) on the stack. (Note that newer versions of Java will allocate objects on the stack under certain circumstances[^1].)

[^1]: There are roughly two conditions which lets the Java compiler allocate an object on the stack instead of the heap: 1) the object must not "[escape](<https://en.wikipedia.org/wiki/Escape_analysis#Example_(Java)>)" the function and 2) the object's size must be _statically_ known (i.e. known at compile time).

Unlike the above languages, C++ gives you control over where your data
is allocated.

### The stack

As C++ executes a function, it must store the function's intermediate
computations somewhere. That somewhere is called a _frame_.

When function `a` calls `b`, `a` must wait for `b` to return before continuing
to execute. If `b` also calls `c`, then `b` must also wait for `c` to return.
This means that while executing `c`, we must keep track of the intermediate
computations of _all its parents_ -- `a` and `b` -- so that when `c` returns,
we can correctly resume executing `b`, and then `a`.

We can naturally store these frames in a data structure called a stack. A stack
is a nice choice because it has two operations -- push and pop -- that are
analogous to function operations. When we call a function, we push its frame to
the top of the stack. When that function returns, we pop its frame from the
stack.[^2]

[^2]: This is where [_stack overflow_](https://en.wikipedia.org/wiki/Stack_overflow) errors come from. As function calls are nested, the stack grows larger and larger. If functions calls are nested too deeply (such as infinitely recursive functions), then the program will run out of space to continue growing the stack, causing an overflow.

```c++
#include <iostream>

void c() {
    // The stack has four frames -- one for main, a, and b, and c.
    std::cout << "Inside main, a, and b, and c."
}

void b() {
    // The stack has three frames -- main, a, and b.
    c();
}

void a() {
    // The stack has two frames -- main, and a.
    b();
}

int main() {
    // The stack just has one frame -- main.
    a();
}
```

A function's stack frame contains some metadata about the function as well as
enough space to hold all _stack allocated_ variables. Variables are stored at
an address which is a constant offset from the base of the stack frame.

```c++
int main() {
    long a = 1;
    int b = 2;
    return a + b;
}
```

[Compiles down to](https://godbolt.org/#g:!((g:!((g:!((h:codeEditor,i:(j:1,lang:c%2B%2B,source:'int+main(%29+%7B%0A++++long+a+%3D+1%3B%0A++++int+b+%3D+2%3B%0A++++return+a+%2B+b%3B%0A%7D'%29,l:'5',n:'0',o:'C%2B%2B+source+%231',t:'0'%29%29,k:50,l:'4',n:'0',o:'',s:0,t:'0'%29,(g:!((h:compiler,i:(compiler:g83,filters:(b:'0',binary:'1',commentOnly:'0',demangle:'0',directives:'0',execute:'1',intel:'0',libraryCode:'1',trim:'1'%29,lang:c%2B%2B,libs:!(%29,options:'',source:1%29,l:'5',n:'0',o:'x86-64+gcc+8.3+(Editor+%231,+Compiler+%231%29+C%2B%2B',t:'0'%29%29,k:50,l:'4',n:'0',o:'',s:0,t:'0'%29%29,l:'2',n:'0',o:'',t:'0'%29%29,version:4)

```nasm
main:
        push    rbp
        mov     rbp, rsp
        ; rbp is the base, or start, of the stack frame.
        ; Write 1 to rbp-0...rbp-8  (8 bytes of storage, long a)
        mov     QWORD PTR [rbp-8], 1
        ; Write 2 to rbp-8...rbp-12 (4 bytes of storage, int b)
        mov     DWORD PTR [rbp-12], 2
        ; ...
```

Since these addresses are constant offsets, the size of all variables must be
known at compile time.[^3] This means you can store structs and fixed-size
arrays on the stack as well. When the function returns, variables allocated on
the stack are automatically freed.

```c++
struct point {
    int x;
    int y;
}

int calculate_point() {
    // The stack frame for calculate_point() allocates
    // enough memory to store point p's attributes. That
    // memory is automatically freed when calculate_point()
    // returns (when its stack frame is popped).
    point p{.x = 1, .y = 2};
    return p.x + p.y;
}

int main() {
  calculate_point();
}
```

[^3]: This is a lie; there's nothing preventing a program from dynamically allocating on the stack. In fact, there's even a Linux library function ([`alloca`](https://en.wikipedia.org/wiki/Variable-length_array)) which stack-allocates. The C99 standard includes [_variable length arrays_](https://en.wikipedia.org/wiki/Variable-lengtharray) which look like statically allocated arrays but really are essentially syntactic sugar over `alloca`. VLAs are not a part of the C++ standard, but various compilers like GNU C++ include a compiler extension to support them.

### The heap

Sometimes you can't statically know how much memory you need. For example, you
might need to dynamically create nodes for a linked list or a tree. Or, you
might need to create an array of integers whose length is only known when your
program runs.

C++ programs allocate memory too large for the stack or whose size is not known
at compile time on the heap.

#### Allocating memory

The most common way to manually allocate dynamic memory is with the [`new`
operator](http://www.cplusplus.com/reference/new/operator%20new/<Paste>).

(I say _manually_ allocate memory because C++11 provides more hygenic ways of
allocating memory via [RAII](https://en.cppreference.com/w/cpp/language/raii).
In idiomatic C++11, you should avoid calling `new` or `new[]` yourself. I'll
discuss RAII in a later post.)

The `new` operator will return a pointer to the allocated memory, which generally
resides on the heap.

```c++
struct MyNode {
    int value;
    MyNode* next;
}
// The * denotes that CreateNode() returns a "pointer"
// to a MyNode.
MyNode* CreateNode() {
    return new MyNode;
}

int main() {
    MyNode* = CreateNode();
}
```

`new` also has an array variant, `new[]`, which allocates an array:

```c++
int* CreateIntArray(int size) {
    return new int[size];
}
```

#### Freeing memory

In Python, the interpreter will automatically free unused memory for you.[^4]
In C++, you must manually manage your memory. To free memory, use the
corresponding `delete` operator for your `new` operator:

[^4]: If your program no longer uses an object, then Python will deallocate the memory associated with that object through a process known as "[garbage collection](<https://en.wikipedia.org/wiki/Garbage_collection_(computer_science))". Most Python implementations accomplish this through a combination of [reference counting](https://en.wikipedia.org/wiki/Reference_counting) and a [tracing garbage collector](https://en.wikipedia.org/wiki/Tracing_garbage_collection) to handle reference cycles. Many other languages (JavaScript, Ruby, Java) also are garbage collected.

1. If you allocated the memory with `new`, use `delete`
1. If you allocated the memory with `new[]`, use `delete[]`

If you use the wrong free operator (`delete[]` for `new`, or `delete` for
`new[]`), then the program's behavior is undefined -- it can choose to do
anything, including (but not limited to) crashing or corrupting memory.

If you forget to release dynamically allocated memory and then lose the pointer
to that memory, you are said to have [_leaked_
memory](https://en.wikipedia.org/wiki/Memory_leak). For small programs, this is
not a huge problem -- the operating system frees all allocated memory
automatically when your program exits. For large or long-lived programs, you
may run out of heap space, which will cause your program to slow down or crash.

In any case, memory leaks are usually a code smell -- a sign that your
program's logic is incorrect or could be improved. You can use tools like
[Clang's LeakSanitizer](https://clang.llvm.org/docs/LeakSanitizer.html) or
[Valgrind](http://valgrind.org/) to debug memory leaks.

Next time, we'll talk about pointers, references, and copying values.
