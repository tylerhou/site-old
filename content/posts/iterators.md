---
title: Iterators and generators
subtitle:
date: 2021-01-03T09:52:47-08:00
code: true
math: true
draft: false
unlisted: false
_build:
  list: true
  render: true
_dummy_:
---

Iterators and generators are powerful tools that can help you write cleaner
and more expressive code. I review iterators, generators, and give some
practice problems.

## Iterators

In Python, iterators are objects that represent a sequence of values. Calling
`next()` on an iterator returns you the next element in that sequence.

When an iterator is exhausted (i.e. has no more elements), `next()` will throw
a `StopIteration` error which you can catch. Alternatively, you can pass in a
default value to `next` (`next(it, default)`); then the iterator will return
that default value instead when it is exhausted.

Iterators are so core to the Python language that `for` loops can be thought
of as "syntactic sugar"[^1] for while loops and iterators:

[^1]: In practice they generate different code; CPython has a special
  `FOR_ITER` instruction in its virtual machine:
  https://godbolt.org/z/1j1nKP5hn

```python
# These loops are logically equivalent to each other.
for i in range(10):
    print(i)

it = iter(range(10))
while True:
    try:
        i = next(it)
    except StopIteration:
        break
    print(i)
```

### Uses

Iterators are useful when you need to process a sequence of values in order.
Many algorithms need only linearly scan through a sequence once, so using an
iterator interface makes it easy to write code *generic* over the underlying
data structure.

In Python, because iterators are so ingrained into the `for` loop, it is
natural to write such code.

```python
def sum(it):
    """Finds the total sum of all items in the sequence.

    >>> sum([1, 2, 3])
    6
    >>> sum(set([1, 2, 3]))
    6
    >>> sum(range(1, 4))
    6
    """
    total = 0
    for item in it:
        total += item
    return total
```

In other languages with iterators, one has to make a more conscious effort to
use them.

Defining an iterator for a data structure also lets you pass that data
structure into other functions that only rely on the "sequence" interface of
iterators.

## Generators

Generators are, roughly, functions that "yield" one or more values through the
iterator interface. Generators were unique to Python until the standardization
of coroutines in C++20. Generators are objects that implement the iterator
interface; that is, you can call `next` on them.


```python
def fn():
    yield 1
    yield 2
    yield 3

generator = fn()  # fn()'s body has not started to execute yet.

# Start the generator.
print(next(generator))  # 1

# Keep resuming the generator.
print(next(generator))  # 2
print(next(generator))  # 3
print(next(generator))  # Raises StopIteration error.
```

As such, you can use generators as the iteration target in `for` loops:

```python
for i in fn():
    print(i)

# 1
# 2
# 3
```

### Uses

#### Outputting a sequence of values
One basic use for a generator is for a function that returns a list of values:
instead of returning a list, you could yield values one by one.

```python
# Instead of appending to a list...
def filter_l(input, predicate):
    result = []
    for item in input:
        if predicate(item):
            result.append(item)
    return result

# ise a generator!
def filter_g(input, predicate):
    for item in input:
        if predicate(item):
            yield item
```

The major advantage to yielding values one by one is because the computation
is *lazy*. For example, it's possible the code calling `filter` might not
need to filter out all values as it might not consume the whole sequence.

The downside is that the extra communication overhead can be worse for
performance overall. (But it's important to measure your code's performance
before you optimize!)

#### Iterators for data structures

In a similar vein, generators can be used to implement iterators for custom
data structures.

Generators work especially well for implementing iterators for recursive data
structures like trees, as these iterators can be difficult to code imperatively
because they need to carefully keep track of state (e.g., in a tree, the path
to the current node). Generators keep track of that state for us using the
call stack.

```python
def inorder_travseral(tree):
    if tree == None:
        return
    yield from inorder_traversal(tree.left)
    yield tree.value
    yield from inorder_traversal(tree.right)
```

#### Laziness

Because generators are lazy, they can also represent infinite streams of
values. A canonical example is a lazy infinite sequence of primes:

```python
import math

def is_prime(n):
    for i in range(2, math.isqrt(n) + 1):
        if n % i == 0:
            return False
    return True

def primes():
    """Yields an infinite list of primes.

    >>> from itertools import islice
    >>> list(islice(primes(), 10))
    [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    """
    i = 2
    while True:
        if is_prime(i):
            yield i
        i += 1
```

Because `primes` is lazy, it only gives us a new prime every time we ask for
one.  Calling `list` directly on `primes()` would infinitely loop; that's why
we use `islice` to only take the first 10 values.[^2]


## Practice Problems

Many of these solutions involve writing a helper iterator function that
captures the iteration logic. Then, use the helper function to concisely
implement the main logic.

### Warmup: Linked List

Find the maximum number in a linked list. Assume the 61A definition of linked
list: linked list nodes are represented by instances of a `Link` class with a
`first` and a `rest` member.

```python
def maximum_linked_list(lst):
    """Finds the maximum number in a linked list.

    >>> maximum_linked_list(Link.fromList(1, 2, 3, 4))
    4
    """
    # YOUR CODE HERE


```

Once you're done with that, find the minimum number. How can you reuse the most
amount of code possible?

### Nested List

Flatten a nested list, which is a list whose elements may be other (potentially
nested) lists or non-list elements.

*Hint: Use `isinstance(value, list)` to check if a value is a list.*

```python
def flatten(lst):
    """Flattens a nested list.

    >>> flatten([[1, 2, 3], None, ["a", [4, [5]]]])
    [1, 2, 3, None, "a", 4, 5]
    """
    # YOUR CODE HERE


```


### Consecutive Numbers

Find the largest difference between two consecutive numbers in a list.

*Hint: Generators can yield tuples.*

```python
def largest_difference(lst):
    """Finds the largest difference between two consecutive numbers in lst.

    >>> largest_difference([1, 3, 2, 8, 2, 1, 5])
    6
    """
    # YOUR CODE HERE


```

Now find the smallest difference.

```python
def smallest_difference(lst):
    """Finds the smallest difference between two consecutive numbers in lst.

    >>> smallest_difference([1, 3, 2, 8, 2, 1, 5])
    1
    """
    # YOUR CODE HERE


```

### Merge Sorted Interval Lists

[Question from
Facebook.](https://leetcode.com/discuss/interview-question/124616/Merge-two-interval-lists)
Given two sorted interval lists, merge the intervals such that there are no
overlaps. Output the merged list. For example,

- The intervals `[1, 7]` and `[2, 10]` can be merged into `[1, 10]`.
- The intervals `[1, 5]` and `[5, 10]` can be merged into `[1, 10]`.
- The intervals `[1, 5]` and `[6, 10]` cannot be merged.

```python
def merge_interval_lists(first, second):
    """Merges two sorted interval lists.

    >>> first = [1, 5], [10, 14], [16, 18]
    >>> second = [2, 6], [8, 10], [11, 20]
    >>> merge_lists(first, second)
    [[1, 6], [8, 20]]
    """
    # YOUR CODE HERE


```

### Merge $k$ Sorted Lists

There exists a $O(n\log{k})$ solution using a heap, but there is a divide and
conquer solution with the same time complexity. You can use iterators and
generators to implement the divide and conquer solution as well. It's a bit
messy, but it's good practice.

```python
def merge_sorted_lists(*lsts):
    """Merges the sorted lists,

    Returns a new sorted list with all elements in the original list.

    Assume lists only contain numbers.

    >>> first = [1, 3, 4, 5, 5, 6, 10]
    >>> second = [-1, 0, 1, 1, 2, 4, 5, 9]
    >>> merge_sorted_lists(first, second)
    [-1, 0, 1, 1, 1, 2, 3, 4, 4, 5, 5, 5, 6, 9, 10]
    """
    # YOUR CODE HERE


```

### Permutations

Find all permutations of the set of integers from $1$ to $n$.

*Hint: `yield from`, and create a second generator to help with your logic.*

```python
def permutations(n):
    """Finds all permutations of the numbers 1, ..., n in ascending order.

    >>> list(permutations(3))
    [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
    """
    # YOUR CODE HERE


```

[^2]: This is inefficient as we loop through all numbers up to the square root
  when checking if a number is prime or not. Ideally, we could only loop
  through all primes. Unfortunately this is not as convenient to express in
  Python as every `primes()` generator is distinct. In truly lazy languages we
  could represent the `primes` list as a singular self referential data
  structure: the `primes` list would reference `is_prime`, which would
  recursively reference `primes` to look up the primes up to
  $\lfloor\sqrt{n}\rfloor$.
