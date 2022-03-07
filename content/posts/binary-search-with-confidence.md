---
title: Binary search with confidence
subtitle: Updated March 2022.
date: 2019-10-21T04:26:10-07:00
code: true
math: true
draft: false
unlisted: false
_build:
  list: true
  render: true
_dummy_:
---

I've never intuitively understood binary search—--at least, I've never
understood its usual presentation. For example, take a quick glance at
Wikipedia's binary search code:

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

I can't understand why this code is correct without spending many minutes
considering:

1. Why do we have to add/subtract 1 in the loop?
1. What happens on small arrays?
1. What happens if the element isn't in the array?

There's another way to write binary search that not only do I find easier to
understand and prove correct, but also is more flexible.

## An outline

### Loop invariants


Before we dive into the binary search algorithm, I want to go over *loop
invariants*---background that will help us later when we try to prove the
algorithm's correctness.

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

One invariant that remains true during the loop is that `num` is even
(*Statement $A$*). Here's the argument:

1. *Statement 1:* <span></span>`num` starts off even (as 0 is even).
1. *Statement 2:* <span></span>If `num` is even at the beginning of a loop iteration, the loop will add two
   to it; hence `num` will be even at the end of that loop iteration.

From these two statements, we can deduce that `num` must be even after the
$n$th loop iteration for any arbitrarily large $n$: simply start from Statement
1, and repeatedly apply Statement 2 $n$ times:

1. (After $0$ loop iterations,) `num` is even. <span style="float: right">(Statement 1)</span>
1. After $1$ loop iteration, `num` is even. <span style="float: right">(Apply Statement 2)</span>
1. After $2$ loop iterations, `num` is even. <span style="float: right">(Apply Statement 2)</span>
1. After $3$ loop iterations, `num` is even. <span style="float: right">(Apply Statement 2)</span>
1. ...
1. After $n$ loop iterations, `num` is even. <span style="float: right">(Apply Statement 2)</span>
1. *Ad infinitum...*

The two combined complete our argument, and thus prove $A$ holds over all loop
interations. In other words, $A$ is *invariant.*

The above argument is an argument by [*mathematical
induction.*](https://en.wikipedia.org/wiki/Mathematical_induction) To make an
argument by mathematical induction, one has to prove two things: the *base
case* and the *inductive step*. To prove that Statement $A$ was invariant,
Statement 1 was the base case, and Statement 2 was the inductive step.

To make a correct argument by induction, you must prove both the base case and
the inductive step. Otherwise, the argument is not valid. For exmaple, if `num`
was initially odd, then our base case would be different, and that would change
our invariant: `num` would always be odd, not even, as a odd number would stay
odd every iteration.

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
or green. Color elements with value strictly less than 6 green, and elements
with value greater than or equal to 6 red.

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>6</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> </tbody>
</table>

<!-- |     |     |     |     |     |     |     |     |     | -->
<!-- | --- | --- | --- | --- | --- | --- | --- | --- | --- | -->
<!-- | 0   | 2   | 3   | 6   | 9   | 10  | 20  | 58  | 60  | -->
<!-- | G   | G   | G   | R   | R   | R   | R   | R   | R   | -->

</div>

Since this array is sorted, the color produces a clear structure: a contiguous
region of green elements, followed by a contiguous region of red elements.
(Convince yourself that all sorted arrays have a similar structure.)

Notice that 6 is the first red element. The previous element, 3, is a green
element.

Here is the insight: **Instead of looking for 6 directly, we could instead look
for the boundary between the green and red regions.** Once we find the
boundary, we can use it to locate the element we are searching for.

### The algorithm

We start with two indexes, `left` and `right`. `left` points to the first
element and `right` points to the last element:

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>6</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr> <td
class="dark-green heavy small"><code>left</code></td> <td></td> <td></td>
<td></td> <td></td> <td></td> <td></td> <td></td> <td class="dark-red heavy
small"><code>right</code></td> </tr> </tbody> </table>

<!-- |        |     |     |     |     |     |     |     |         | -->
<!-- | ------ | --- | --- | --- | --- | --- | --- | --- | ------- | -->
<!-- | 0      | 2   | 3   | 6   | 9   | 10  | 20  | 58  | 60      | -->
<!-- | G      | G   | G   | R   | R   | R   | R   | R   | R       | -->
<!-- | `left` |     |     |     |     |     |     |     | `right` | -->

</div>

This motivates our loop invariant: we want `left` to always point to a green
element, and `right` to always point to a red element. If we can keep moving
the `left` and `right` pointers closer to each other while maintaining the
invariant, then we will eventually find the boundary.


Let's consider the middle element:

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>6</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr> <td
class="dark-green heavy small"><code>left</code></td> <td></td> <td></td>
<td></td> <td><code>middle</code></td> <td></td> <td></td> <td></td> <td
class="dark-red heavy small"><code>right</code></td> </tr> </tbody> </table>

<!-- |        |     |     |     |          |     |     |     |         | -->
<!-- | ------ | --- | --- | --- | -------- | --- | --- | --- | ------- | -->
<!-- | 0      | 2   | 3   | 6   | 9        | 10  | 20  | 58  | 60      | -->
<!-- | G      | G   | G   | R   | R        | R   | R   | R   | R       | -->
<!-- | `left` |     |     |     | `middle` |     |     |     | `right` | -->

</div>

We have to choose a pointer---either `left` or `right`---to move to `middle`.
Which poitner should we choose?

Well, based on our loop invariant, it's clear: since the `middle` element is a
red element, we want to move `right` to `middle`. That would maintain the
invariant that `right` always points to red. (Moving `left` to `middle` would
break an invariant: that `left` always points to green!)

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>6</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr> <td
class="dark-green heavy small"><code>left</code></td> <td></td> <td></td>
<td></td> <td class="dark-red heavy small"><code>right</code></td> <td></td>
<td></td> <td></td> <td></td> </tr> </tbody> </table>

<!-- |        |     |     |     |         |     |     |     |     | -->
<!-- | ------ | --- | --- | --- | ------- | --- | --- | --- | --- | -->
<!-- | 0      | 2   | 3   | 6   | 9       | 10  | 20  | 58  | 60  | -->
<!-- | G      | G   | G   | R   | R       | R   | R   | R   | R   | -->
<!-- | `left` |     |     |     | `right` |     |     |     |     | -->

</div>

We pick the new middle element halfway between `left` and `right`:

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>6</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr> <td
class="dark-green heavy small"><code>left</code></td> <td></td>
<td><code>middle</code></td> <td></td> <td class="dark-red heavy
small"><code>right</code></td> <td></td> <td></td> <td></td> <td></td> </tr>
</tbody> </table>

<!-- |        |     |          |     |         |     |     |     |     | -->
<!-- | ------ | --- | -------- | --- | ------- | --- | --- | --- | --- | -->
<!-- | 0      | 2   | 3        | 6   | 9       | 10  | 20  | 58  | 60  | -->
<!-- | G      | G   | G        | R   | R       | R   | R   | R   | R   | -->
<!-- | `left` |     | `middle` |     | `right` |     |     |     |     | -->

</div>

Since this new middle element is green, we move `left` to `middle`. Notice how
little we have to think: just look at the color of the middle element, and move
the same-color pointer.


<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>6</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr>
<td></td> <td></td> <td class="dark-green heavy small"><code>left</code></td>
<td></td> <td class="dark-red heavy small"><code>right</code></td> <td></td>
<td></td> <td></td> <td></td> </tr> </tbody> </table>

<!-- |     |     |        |     |         |     |     |     |     | -->
<!-- | --- | --- | ------ | --- | ------- | --- | --- | --- | --- | -->
<!-- | 0   | 2   | 3      | 6   | 9       | 10  | 20  | 58  | 60  | -->
<!-- | G   | G   | G      | R   | R       | R   | R   | R   | R   | -->
<!-- |     |     | `left` |     | `right` |     |     |     |     | -->

</div>

We then repeat this process until `left` and `right` are adjacent. Here's the
next `middle`:

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>6</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr>
<td></td> <td></td> <td class="dark-green heavy small"><code>left</code></td>
<td><code>middle</code></td> <td class="dark-red heavy
small"><code>right</code></td> <td></td> <td></td> <td></td> <td></td> </tr>
</tbody> </table>

<!-- |     |     |        |          |         |     |     |     |     | -->
<!-- | --- | --- | ------ | -------- | ------- | --- | --- | --- | --- | -->
<!-- | 0   | 2   | 3      | 6        | 9       | 10  | 20  | 58  | 60  | -->
<!-- | G   | G   | G      | R        | R       | R   | R   | R   | R   | -->
<!-- |     |     | `left` | `middle` | `right` |     |     |     |     | -->

</div>

And it's red, so we move `right`:

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>6</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr>
<td></td> <td></td> <td class="dark-green heavy small"><code>left</code></td>
<td class="dark-red heavy small"><code>right</code></td> <td></td> <td></td>
<td></td> <td></td> <td></td> </tr> </tbody> </table>

<!-- |     |     |        |         |     |     |     |     |     | -->
<!-- | --- | --- | ------ | ------- | --- | --- | --- | --- | --- | -->
<!-- | 0   | 2   | 3      | 6       | 9   | 10  | 20  | 58  | 60  | -->
<!-- | G   | G   | G      | R       | R   | R   | R   | R   | R   | -->
<!-- |     |     | `left` | `right` |     |     |     |     |     | -->

</div>

Now `left` and `right` are right next to each other. Since `right` is red, we
know that it points to the first element greater than or equal to 6. We thus
can return its index, 3.

## The code

Our binary search function will take an array and a function `is_green`, which
tells us whether an element is green or not. (If it's not green, it must be
red.)

```python {linenos=table}
is_green(0)  # True, because array[0] == 0  and 0 < 6
is_green(2)  # True, because array[2] == 3  and 3 < 6
is_green(3)  # False,  because array[3] == 6  and 6 >= 6
is_green(7)  # False,  because array[7] == 58 and 58 >= 6
```

Here is the function. Think about what the main loop is doing: during every
iteration, we check whether the middle element is green or not. If it's green,
we move the left pointer; if it's not green, it's red, so we move the right
pointer.

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

# Call as such:
binary_search(array, lambda x: x < 6);
```

Recall our two desired invariants:

1. The left pointer points to a green element.
1. The right pointer points to a red element.

It should be clear that the above loop body would preserve those invariants;
convince yourself. Then, admire how the loop body writes itself. There is no
equality check, no `+1`/`-1` arithmetic: just move the correct-color pointer.

The `while` condition states that this loop only terminates when `left` is
adjacent to `right`. Combined with our invariants, that means if the loop
terminates, then left will point to the last green element and right will point
to the first red element.

So how do we know the loop terminates? We just need to show that on every
iteration, `middle` will be strictly in-between `left` and `right`; hence the
gap between the two must continually shrink.[^1] We leave this as an exercise to
the reader.[^2]

[^1]: To formally prove this, you would have again have to use a inductive
  argument. What is the base case? What is the inductive step?

[^2]: Hint: when `middle` is computed, `right` must be at least two larger
  than `left`.

Finally, when we exit the loop, we return the index of the first red element,
which we know `right` stores.

### The base case strikes back

Are we done? Not so fast!

In the previous section we showed that the loop body *maintains* our desired
invariants. In other words, we proved the inductive step: that *if* `left`
(`right`) pointed to a green (red) element at the beginning of a loop
iteration, it would continue to point to a green (red) element at the end.

But that's a big *if*, since we never established that the invariants were true
in the first place! If the entire array was green, for instance, we would only
<span>move</span> `left`. Then `right` would point to a green element after the
loop ended.

Stepping back, to prove that our loop is correct, we must prove that our
desired statements are invariant. We've already proved the inductive step
above. But to complete our argument, we **must** also "prove" the base case.

To prove the base case, we must ensure that before we enter the loop the
statements that we want to be invariant are indeed true. So we check that
`left` points to green and `right` points to red. If either isn't true, we can
return early.

```python {linenos=table,linenostart=2}
    left, right = 0, len(array) - 1
    if not array:
        return ?
    if not is_green(array[left]):
        return ?
    if is_green(array[right]):
        return ?

    # Loop...
```

What values should we return? There are three cases. First, if the array is all
red, it's clear: the first red element would be at index 0, so we can directly
return 0.

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>7</td>
<td>8</td> <td>8</td> <td>9</td> <td>12</td> <td>13</td> <td>20</td>
<td>58</td> <td>60</td> </tr> <tr> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> </tbody>
</table>

<!-- |     |     |        |         |     |     |     |     |     | -->
<!-- | --- | --- | ------ | ------- | --- | --- | --- | --- | --- | -->
<!-- | 7   | 8   | 8      | 9       | 12  | 13  | 20  | 58  | 60  | -->
<!-- | R   | R   | R      | R       | R   | R   | R   | R   | R   | -->

</div>

Second, if the array is all green, then what we should return is not as clear.
In practice, it's useful to return an index one past the end of the array. One
could imagine that the first red element would be there:

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>-2</td>
<td>-1</td> <td>0</td> <td>0</td> <td>1</td> <td>3</td> <td>4</td> <td>4</td>
<td><span style="white-space: nowrap;">one past end</span></td> </tr> <tr> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> </tr> </tbody> </table>

<!-- |     |     |        |         |     |     |     |     |     | -->
<!-- | --- | --- | ------ | ------- | --- | --- | --- | --- | --- | -->
<!-- | -2  | -1  | 0      | 0       | 1   | 3   | 4   | 4   | <span style="white-space: nowrap;">one past end</span> | -->
<!-- | G   | G   | G      | G       | G   | G   | G   | G   | R   | -->

Last, what if the array was empty? The same logic would apply: return one past
the end, which is the 0th element.

</div>

Here's the final code:

```python {linenos=table,linenostart=1}
def binary_search(array, is_green):
    left, right = 0, len(array) - 1
    if not array:
        return 0
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

# Call as such:
binary_search(array, lambda x: x < 6);
```

### What happens if the target element is missing?

Consider the same array, except with 6 changed to 7. Let's repeat our
algorithm, searching for 6. I'll omit the middle steps for brevity.

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>7</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr> <td
class="dark-green heavy small"><code>left</code></td> <td></td> <td></td>
<td></td> <td></td> <td></td> <td></td> <td></td> <td class="dark-red heavy
small"><code>right</code></td> </tr> </tbody> </table>

<!-- |        |     |     |     |     |     |     |     |         | -->
<!-- | ------ | --- | --- | --- | --- | --- | --- | --- | ------- | -->
<!-- | 0      | 2   | 3   | 7   | 9   | 10  | 20  | 58  | 60      | -->
<!-- | G      | G   | G   | R   | R   | R   | R   | R   | R       | -->
<!-- | `left` |     |     |     |     |     |     |     | `right` | -->

</div>

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>7</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr> <td
class="dark-green heavy small"><code>left</code></td> <td></td> <td></td>
<td></td> <td class="dark-red heavy small"><code>right</code></td> <td></td>
<td></td> <td></td> <td></td> </tr> </tbody> </table>

<!-- |        |     |     |     |         |     |     |     |     | -->
<!-- | ------ | --- | --- | --- | ------- | --- | --- | --- | --- | -->
<!-- | 0      | 2   | 3   | 7   | 9       | 10  | 20  | 58  | 60  | -->
<!-- | G      | G   | G   | R   | R       | R   | R   | R   | R   | -->
<!-- | `left` |     |     |     | `right` |     |     |     |     | -->

</div>

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>7</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr>
<td></td> <td></td> <td class="dark-green heavy small"><code>left</code></td>
<td></td> <td class="dark-red heavy small"><code>right</code></td> <td></td>
<td></td> <td></td> <td></td> </tr> </tbody> </table>

<!-- |     |     |        |     |         |     |     |     |     | -->
<!-- | --- | --- | ------ | --- | ------- | --- | --- | --- | --- | -->
<!-- | 0   | 2   | 3      | 7   | 9       | 10  | 20  | 58  | 60  | -->
<!-- | G   | G   | G      | R   | R       | R   | R   | R   | R   | -->
<!-- |     |     | `left` |     | `right` |     |     |     |     | -->

</div>

<div class="array">

<table> <thead> <tr> <th></th> <th></th> <th></th> <th></th> <th></th>
<th></th> <th></th> <th></th> <th></th> </tr> </thead> <tbody> <tr> <td>0</td>
<td>2</td> <td>3</td> <td>7</td> <td>9</td> <td>10</td> <td>20</td> <td>58</td>
<td>60</td> </tr> <tr> <td class="bg-light-green">G</td> <td
class="bg-light-green">G</td> <td class="bg-light-green">G</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> <td
class="bg-light-red">R</td> <td class="bg-light-red">R</td> </tr> <tr>
<td></td> <td></td> <td class="dark-green heavy small"><code>left</code></td>
<td class="dark-red heavy small"><code>right</code></td> <td></td> <td></td>
<td></td> <td></td> <td></td> </tr> </tbody> </table>

<!-- |     |     |        |         |     |     |     |     |     | -->
<!-- | --- | --- | ------ | ------- | --- | --- | --- | --- | --- | -->
<!-- | 0   | 2   | 3      | 7       | 9   | 10  | 20  | 58  | 60  | -->
<!-- | G   | G   | G      | R       | R   | R   | R   | R   | R   | -->
<!-- |     |     | `left` | `right` |     |     |     |     |     | -->

</div>

We end up with the same return value. This is because our algorithm doesn't
actually find the index of 6—it finds the leftmost index at which you could
insert 6 to keep the array sorted. That is, we could run the pseudocode:

```python
# True.
assert is_sorted(array)

index = binary_search(array, lambda i: array[i] < 6)
array.insert(index, 6)

# Always still True.
assert is_sorted(array)
```

This is a feature--—in some cases we only need to insert into a sorted array,
so we don't need to check if the returned index has a certain element in the
binary search procedure. It's better to leave that up to the caller.

Other binary search implementations, including [`bisect_left` in Python's
bisect
library,](https://docs.python.org/3/library/bisect.html#bisect.bisect_left)
also return the first valid insertion point.

This is also why we return one past the end if the array is entirely green or
when the array is empty. In both cases, the correct place to insert the new
element is at the end of the array.

<div class="next-container">
<div class="next">

[Binary search, revisited](/posts/binary-search-revisited)

</div>
</div>

<!-- <script> -->
<!-- Array.from(document.getElementsByTagName("td")).forEach((element) => { -->
<!--   if (element.innerText === "G") { -->
<!--     element.classList.add("bg-light-green"); -->
<!--   } else if (element.innerText === "R") { -->
<!--     element.classList.add("bg-light-red"); -->
<!--   } else if (element.innerText === "left") { -->
<!--     element.classList.add("dark-green", "heavy", "small"); -->
<!--   } else if (element.innerText === "right") { -->
<!--     element.classList.add("dark-red", "heavy", "small"); -->
<!--   } -->
<!-- }); -->
<!-- </script> -->
