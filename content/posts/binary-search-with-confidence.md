---
title: Binary search with confidence
date: 2019-10-21T04:26:10-07:00
code: true
math: true
draft: false
unlisted: false
---

I've never intuitively understood binary search—at least, I've never understood
its usual presentation. For example, take a quick glance at Wikipedia's binary
search code:

```javascript {linenos=table}
function binary_search(A, n, T):
  L := 0
  R := n − 1
  while L <= R:
    m := floor((L + R) / 2)
    if A[m] < T:
      L := m + 1
    else if A[m] > T:
      R := m - 1
    else:
      return m
  return unsuccessful
```

I can't understand why this code is correct without spending at least a few
minutes thinking through all the edge cases: arrays of size 0, 1, 2, 3, arrays
without the desired element, etc.

There's another way to write binary search that not only do I find easier to
understand and prove correct, but also is more flexible.

## An outline

### Loop invariants

Informally, loop invariants are properties of a loop that remain unchanged as
the loop executes. For example, consider the following loop:

```java
int f() {
    int num = 0;
    for (int i = 0; i < 100; ++i) {
        num += 2;
    }
    return num;
}
```

One invariant that remains true during the loop is that `num` is even. Let's
call this statement---that `num` is even---"$A$". Here's the argument:

1. Since `num` starts off even, it remains even as the loop executes.
1. If `num` is even at the beginning of a loop iteration, the loop will add two
   to it; hence `num` will be even at the end of that loop iteration.

The above argument is an argument by [*mathematical
induction.*](https://en.wikipedia.org/wiki/Mathematical_induction). To make an
argument by mathematical induction, one has to prove two things: the *base
case* and the *inductive step*.


The first statement above---that $A$ was initially true---is the base case.
The second statement---that if $A$ was true, then $A$ will still be true after
one more iteration---is the inductive step.

The two combined complete our argument by induction, and thus prove that our
invariant holds over all loop iterations. Statment (1) says `num` starts off as
even, and statement (2) says `num` stays even if it was already even; thus
`num` will always be even.

It's important that we prove both statements true. If `num` was initially odd,
then our base case would be different. And that would change our invariant:
`num` would always be odd, not even, as a odd number would stay odd every
iteration.

Similarly, if we had added a different constant to `num` every loop iteration,
then the [parity](https://en.wikipedia.org/wiki/Parity_(mathematics)) of
`num` would might not stay the same at the end of each iteration. Depending on
the constant, that would also mean that our invariant would no longer hold.

### Reframing binary search

Returning back to binary search, suppose we want to find the index of 6 in the
following sorted array:

<div class="array">

|     |     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0   | 2   | 3   | 6   | 9   | 10  | 20  | 58  | 60  |

</div>

Let's consider the same array, except we label each element with a color---red
or green. Green elements are those less than 6, and red elements are those
greater than or equal to 6.

<div class="array">

|     |     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0   | 2   | 3   | 6   | 9   | 10  | 20  | 58  | 60  |
| G   | G   | G   | R   | R   | R   | R   | R   | R   |

</div>

Since this array is sorted, it has a clear structure: a contiguous region of
green elements, followed by a contiguous region of red elements. (Convince
yourself that all sorted arrays have a similar structure.)

Notice that 6 is the first red element. The previous element, 3, is a green
element.

Here is the insight: **Instead of looking for 6 directly, we could instead look
for the boundary between the green and red regions.** Once we find the
boundary, we can use it to locate the element we are searching for.

### The algorithm

We start with two indexes, `left` and `right`. `left` points to the first
element and `right` points to the last element:

<div class="array">

|        |     |     |     |     |     |     |     |         |
| ------ | --- | --- | --- | --- | --- | --- | --- | ------- |
| 0      | 2   | 3   | 6   | 9   | 10  | 20  | 58  | 60      |
| G      | G   | G   | R   | R   | R   | R   | R   | R       |
| `left` |     |     |     |     |     |     |     | `right` |

</div>

This motivates our loop invariant: we want `left` to always point to a green
element, and `right` to always point to a red element. If we can keep moving
the `left` and `right` pointers closer to each other while maintaining the
invariant, then we will eventually find the boundary.


Let's consider the middle element:

<div class="array">

|        |     |     |     |          |     |     |     |         |
| ------ | --- | --- | --- | -------- | --- | --- | --- | ------- |
| 0      | 2   | 3   | 6   | 9        | 10  | 20  | 58  | 60      |
| G      | G   | G   | R   | R        | R   | R   | R   | R       |
| `left` |     |     |     | `middle` |     |     |     | `right` |

</div>

We have to choose which pointer---either `left` or `right`---to move to
`middle`. How might we choose?

Well, based on our loop invariant, it's clear: since the `middle` element is a
red element, we want to move `right` to `middle`. That would maintain the
invariant that `right` always points to red. (Moving `left` to `middle` would
break an invariant: that `left` always points to green!)

<div class="array">

|        |     |     |     |         |     |     |     |     |
| ------ | --- | --- | --- | ------- | --- | --- | --- | --- |
| 0      | 2   | 3   | 6   | 9       | 10  | 20  | 58  | 60  |
| G      | G   | G   | R   | R       | R   | R   | R   | R   |
| `left` |     |     |     | `right` |     |     |     |     |

</div>

We pick the new middle element halfway between `left` and `right`:

<div class="array">

|        |     |          |     |         |     |     |     |     |
| ------ | --- | -------- | --- | ------- | --- | --- | --- | --- |
| 0      | 2   | 3        | 6   | 9       | 10  | 20  | 58  | 60  |
| G      | G   | G        | R   | R       | R   | R   | R   | R   |
| `left` |     | `middle` |     | `right` |     |     |     |     |

</div>

Since this new middle element is green, we move `left` to `middle`. Notice how
little we have to think: just look at the color of the middle element, and move
the same-color pointer.


<div class="array">

|     |     |        |     |         |     |     |     |     |
| --- | --- | ------ | --- | ------- | --- | --- | --- | --- |
| 0   | 2   | 3      | 6   | 9       | 10  | 20  | 58  | 60  |
| G   | G   | G      | R   | R       | R   | R   | R   | R   |
|     |     | `left` |     | `right` |     |     |     |     |

</div>

We then repeat this process until `left` and `right` are adjacent. Here's the
next `middle`:

<div class="array">

|     |     |        |          |         |     |     |     |     |
| --- | --- | ------ | -------- | ------- | --- | --- | --- | --- |
| 0   | 2   | 3      | 6        | 9       | 10  | 20  | 58  | 60  |
| G   | G   | G      | R        | R       | R   | R   | R   | R   |
|     |     | `left` | `middle` | `right` |     |     |     |     |

</div>

And it's red, so we move `right`:

<div class="array">

|     |     |        |         |     |     |     |     |     |
| --- | --- | ------ | ------- | --- | --- | --- | --- | --- |
| 0   | 2   | 3      | 6       | 9   | 10  | 20  | 58  | 60  |
| G   | G   | G      | R       | R   | R   | R   | R   | R   |
|     |     | `left` | `right` |     |     |     |     |     |

</div>

Now `left` and `right` are right next to each other. Since `right` is red, we
know that it points to the first element greater than or equal to 6. We thus
can return its index, 3.

## The code

Let's walk through the code that implements the above algorithm line by line:

Our binary search function will take an array and a function `is_green`, which
tells us whether an element is green or not. (If it's not green, it must be
red.)

```python {linenos=table}
is_green(0)  # False, because array[0] == 0  and 0 < 6
is_green(2)  # False, because array[2] == 3  and 3 < 6
is_green(3)  # True,  because array[3] == 6  and 6 >= 6
is_green(7)  # True,  because array[7] == 58 and 58 >= 6
```

Here is the function. Think about what the main loop is doing: during every
iteration, we check whether the middle element is green or not. If it's green,
we move the left pointer; if it's not green, it's red, so we move the right
pointer. This preserves both invariants.

```python {linenos=table,linenostart=1}
def binary_search(array, is_green):
    left, right = 0, len(array) - 1
    # Main loop which narrows our search range.
    while left + 1 < right:
        middle = (left + right) // 2
        if is_green(array[middle]):
            left = middle
        else:
            right = middle

    return right
```

Recall our two invariants:

1. The left pointer should always point to a green element.
1. The right pointer should always point to a red element.

It's clear that the above loop body preserves those invariants. Then, admire
how the loop body writes itself. There is no equality check, no `+1`/`-1`
arithmetic: just move the correct-color pointer.

The `while` condition states that this loop only terminates when `left` is
adjacent to `right`. Combined with our invariants, that means if the loop
terminates, then left will point to the last green element and right will point
to the first red element.

So how do we know the loop terminates? We just need to show that on every
iteration, `middle` will be strictly in-between `left` and `right`; hence the
gap between the two must continually shrink.[^1] We leave this as an exercise to
the reader.[^2]

[^1]: To formally prove this, you would have again have to use a inductive
argument. What is the base case? What is the inductive case?

[^2]: (Hint: when `middle` is computed, `right` must be at least two larger
  than `left`.)

Finally, when we exit the loop, we return the index of the first red element,
which we know `right` stores.

### The base case strikes back

Are we done? Not so fast!

In the previous section we showed that the loop body *maintains* the invariant.
In other words, we proved the inductive step: that *if* `left` (`right`)
pointed to a green element at the beginning of a loop iteration, it would
continue to point to a green (red) element at the end.

But that's a big *if*, since we never established that the invariant was true
in the first place! If the entire array was green, for instance, we would only
<span>move</span> `left`. Then `right` would point to a green element after the loop ended.

Stepping back, to prove that our loop is correct, we must prove that the
invariant holds. To do that, we **must** prove the base case. Otherwise, our
argument is incomplete.

To "prove" the base case, we can check that `left` points to green and `right`
points to red before entering the loop. If either isn't true, we can return
early.

```python {linenos=table,linenostart=2}
    left, right = 0, len(array) - 1
    if not is_green(array[left]):
        return ?
    if is_green(array[right]):
        return ?

    # Loop...
```

What values should we return? If the array is all red, it's clear: the first
red element would be at `left`, so we can directly return `left`.

<div class="array">

|     |     |        |         |     |     |     |     |     |
| --- | --- | ------ | ------- | --- | --- | --- | --- | --- |
| 7   | 8   | 8      | 9       | 12  | 13  | 20  | 58  | 60  |
| R   | R   | R      | R       | R   | R   | R   | R   | R   |

</div>

If the array is all green, then it's not as clear. In practice, it's useful
to return an index one past the end of the array. One could imagine that the
first red element would be there:

<div class="array">

|     |     |        |         |     |     |     |     |     |
| --- | --- | ------ | ------- | --- | --- | --- | --- | --- |
| -2  | -1  | 0      | 0       | 1   | 3   | 4   | 4   | <span style="white-space: nowrap;">one past end</span> |
| G   | G   | G      | G       | G   | G   | G   | G   | R   |

</div>

So the final code would look like:

```python {linenos=table,linenostart=2}
def binary_search(array, is_green):
    left, right = 0, len(array) - 1
    if not is_green(array[left]):
        return 0
    if is_green(array[right]):
        return len(array)

    # Main loop which narrows our search range.
    while left + 1 < right:
        middle = (left + right) // 2
        if is_green(array[middle]):
            left = middle
        else:
            right = middle

    return right
```

### What happens if the element we're looking for isn't in the array?

Consider the same array, except with 6 changed to 7. Let's repeat our
algorithm, searching for 6. I'll omit the middle steps for brevity.

<div class="array">

|        |     |     |     |     |     |     |     |         |
| ------ | --- | --- | --- | --- | --- | --- | --- | ------- |
| 0      | 2   | 3   | 7   | 9   | 10  | 20  | 58  | 60      |
| G      | G   | G   | R   | R   | R   | R   | R   | R       |
| `left` |     |     |     |     |     |     |     | `right` |

</div>

<div class="array">

|        |     |     |     |         |     |     |     |     |
| ------ | --- | --- | --- | ------- | --- | --- | --- | --- |
| 0      | 2   | 3   | 7   | 9       | 10  | 20  | 58  | 60  |
| G      | G   | G   | R   | R       | R   | R   | R   | R   |
| `left` |     |     |     | `right` |     |     |     |     |

</div>

<div class="array">

|     |     |        |     |         |     |     |     |     |
| --- | --- | ------ | --- | ------- | --- | --- | --- | --- |
| 0   | 2   | 3      | 7   | 9       | 10  | 20  | 58  | 60  |
| G   | G   | G      | R   | R       | R   | R   | R   | R   |
|     |     | `left` |     | `right` |     |     |     |     |

</div>

<div class="array">

|     |     |        |         |     |     |     |     |     |
| --- | --- | ------ | ------- | --- | --- | --- | --- | --- |
| 0   | 2   | 3      | 7       | 9   | 10  | 20  | 58  | 60  |
| G   | G   | G      | R       | R   | R   | R   | R   | R   |
|     |     | `left` | `right` |     |     |     |     |     |

</div>

We end up with the same return value. This is because our algorithm doesn't
actually find the index of 6—it finds the leftmost index at which you could
insert 6 to keep the array sorted. That is, we could run the pseudocode:

```python
CHECK_IS_SORTED(array)  # true

index = left_find_in_sorted_array(array, 6)
array.insert(index, 6)

CHECK_IS_SORTED(array)  # always still true
```

This is a feature, not a bug—in many cases we only need to insert into a sorted
array, so we don't need to check if the returned index has a certain element.
This is also the behavior of [`bisect_left` in Python's bisect
library.](https://docs.python.org/3/library/bisect.html#bisect.bisect_left)

This is also why we return one past the end if the array is entirely green:
since the entire array is less than the desired element, to maintain sorted
order we would want to insert the element at the end. That would be the same as
inserting at `len(array)`.

<div class="next-container">
<div class="next">

[☛ Binary search, revisited.](/posts/binary-search-revisited)

</div>
</div>

<!-- TODO(tylerhou): Move this to binary search revisited. --!>
<!-- We write binary search in this manner because **binary search is a more general -->
<!-- algorithm than finding a number in a sorted list**—in fact, we can apply it to -->
<!-- any search problem whose search space is a range of numbers and the elements -->
<!-- in the range correspond to contiguous false and true regions. -->

<!-- The next few lines check our boundary conditions---the base case of our -->
<!-- induction. -->

<!-- ```python {linenos=table,linenostart=2} -->
<!--   # Check edge cases. -->
<!--   if not array or not left < right: -->
<!--     return None -->

<!--   # left should always point to False, so return early. -->
<!--   if unary_op(left) == True: -->
<!--     return 0 -->

<!--   # right should always point to True. -->
<!--   if unary_op(right) == False: -->
<!--     # Return array.length here because the array is all falses. -->
<!--     # We want to return the index of the first true element, -->
<!--     # and if the array were longer, the first true element -->
<!--     # might be one after the end. -->
<!--     return array.length -->
<!-- ``` -->

<!-- Another way of thinking about the left and right checks are that they detect if -->
<!-- the whole array corresponds to all true or false. In those cases, we need to -->
<!-- return the first element (if all true) or one past the end (if all false). (If -->
<!-- the whole array corresponds to false, we can imagine that the first "true" -->
<!-- element is one past the end.) -->

<script>
Array.from(document.getElementsByTagName("td")).forEach((element) => {
  if (element.innerText === "G") {
    element.classList.add("bg-light-green");
  } else if (element.innerText === "R") {
    element.classList.add("bg-light-red");
  } else if (element.innerText === "left") {
    element.classList.add("dark-green", "heavy", "small");
  } else if (element.innerText === "right") {
    element.classList.add("dark-red", "heavy", "small");
  }
});
</script>
