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

There's a different binary search algorithm that I find much easier to
understand.

## Outline

### Loop invariants

Informally, loop invariants are properties of a loop that remain unchanged as
the loop executes. For example, consider the following loop which prints every
element in an array:

```java
void print_array(A) {
  for (int i = 0; i < A.length; ++i) {
    print(A[i]);
  }
}
```

Two invariants for the duration of the loop are $0 \leq i$ and $i \lt
\text{A.length}$. We know that `i` is always greater than zero because we
initialize `i` to 0 and only increment it. And we also know that if `i` was
greater than or equal to `A.length`, the loop would have terminated.

### Reframing binary search

Suppose we want to find the index of 6 in the following (sorted) array:

<div class="array">

|     |     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0   | 2   | 3   | 6   | 9   | 10  | 20  | 58  | 60  |

</div>

Let's consider the same array, except we add a row which checks if each element
is greater than or equal to 6:

<div class="array">

|     |     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0   | 2   | 3   | 6   | 9   | 10  | 20  | 58  | 60  |
| F   | F   | F   | T   | T   | T   | T   | T   | T   |

</div>

Since this array is sorted, we find a region of false elements followed by a
region of true elements. Notice that the 6 is the first true element, and
thus lies on the boundary between the true elements and false elements---the
numbers less than 6 and the numbers greater than or equal to 6.

This is the structure we want to exploit: instead of looking for 6, let's
instead find the boundary between the two "true" and "false" regions. Then we
return the first element of the true region.

### An outline

We start with two indexes, `left` and `right`. `left` points to the first element and
`right` points to the last element:

<div class="array">

|        |     |     |     |     |     |     |     |         |
| ------ | --- | --- | --- | --- | --- | --- | --- | ------- |
| 0      | 2   | 3   | 6   | 9   | 10  | 20  | 58  | 60      |
| F      | F   | F   | T   | T   | T   | T   | T   | T       |
| `left` |     |     |     |     |     |     |     | `right` |

</div>

This sets up our loop invariant: at the end of each loop iteration `left`
always points to a false element, and `right` always points to a true element.
We want to our left and right indexes closer to each other while maintaining
the invariant. Next, we consider the `middle` element:

<div class="array">

|        |     |     |     |          |     |     |     |         |
| ------ | --- | --- | --- | -------- | --- | --- | --- | ------- |
| 0      | 2   | 3   | 6   | 9        | 10  | 20  | 58  | 60      |
| F      | F   | F   | T   | T        | T   | T   | T   | T       |
| `left` |     |     |     | `middle` |     |     |     | `right` |

</div>

If middle element corresponds to a false value, we assign `left := middle`.
Otherwise, if it corresponds to a true value, we assign `right := middle`. In
either case, our loop invariant is preserved.

In this case, the middle element corresponds to true, so we move `right` to
the middle.

<div class="array">

|        |     |     |     |         |     |     |     |     |
| ------ | --- | --- | --- | ------- | --- | --- | --- | --- |
| 0      | 2   | 3   | 6   | 9       | 10  | 20  | 58  | 60  |
| F      | F   | F   | T   | T       | T   | T   | T   | T   |
| `left` |     |     |     | `right` |     |     |     |     |

</div>

We pick the new middle element halfway between `left` and right:

<div class="array">

|        |     |          |     |         |     |     |     |     |
| ------ | --- | -------- | --- | ------- | --- | --- | --- | --- |
| 0      | 2   | 3        | 6   | 9       | 10  | 20  | 58  | 60  |
| F      | F   | F        | T   | T       | T   | T   | T   | T   |
| `left` |     | `middle` |     | `right` |     |     |     |     |

</div>

Since this middle corresponds to false, we assign `left := middle`.

<div class="array">

|     |     |        |     |         |     |     |     |     |
| --- | --- | ------ | --- | ------- | --- | --- | --- | --- |
| 0   | 2   | 3      | 6   | 9       | 10  | 20  | 58  | 60  |
| F   | F   | F      | T   | T       | T   | T   | T   | T   |
|     |     | `left` |     | `right` |     |     |     |     |

</div>

We then repeat this process until `left` and `right` are adjacent.

<div class="array">

|     |     |        |          |         |     |     |     |     |
| --- | --- | ------ | -------- | ------- | --- | --- | --- | --- |
| 0   | 2   | 3      | 6        | 9       | 10  | 20  | 58  | 60  |
| F   | F   | F      | T        | T       | T   | T   | T   | T   |
|     |     | `left` | `middle` | `right` |     |     |     |     |

</div>

<div class="array">

|     |     |        |         |     |     |     |     |     |
| --- | --- | ------ | ------- | --- | --- | --- | --- | --- |
| 0   | 2   | 3      | 6       | 9   | 10  | 20  | 58  | 60  |
| F   | F   | F      | T       | T   | T   | T   | T   | T   |
|     |     | `left` | `right` |     |     |     |     |     |

</div>

When `left` and `right` are right next to each other, we know that `right`
points to the first element greater than or equal to 6. We thus return the
index of the first true element, 3.

## The algorithm

Let's walk through the algorithm line by line:

```python {linenos=table,linenostart=1}
def binary_search(left, right, unary_op):
```

Our function takes in our left and right indexes and a `unary_op`. What is
`unary_op`? It's a function that takes the index of an element and tells us
whether that element corresponds to true or false. In the above example
where we look for 6, `unary_op` behaves like:

```python {linenos=table}
unary_op(0)  # False, because array[0] == 0  and 0 < 6
unary_op(2)  # False, because array[2] == 3  and 3 < 6
unary_op(3)  # True,  because array[3] == 6  and 6 >= 6
unary_op(7)  # True,  because array[7] == 58 and 58 >= 6
```

We write binary search in this manner because **binary search is a more general
algorithm than finding a number in a sorted list**—in fact, we can apply it to
any search problem whose search space is a range of numbers and the elements
in the range correspond to contiguous false and true regions.

The next few lines check our boundary conditions---the base case of our
induction.

```python {linenos=table,linenostart=2}
  # Check edge cases.
  if not array or not left < right:
    return None

  # left should always point to False, so return early.
  if unary_op(left) == True:
    return 0

  # right should always point to True.
  if unary_op(right) == False:
    # Return array.length here because the array is all falses.
    # We want to return the index of the first true element,
    # and if the array were longer, the first true element
    # might be one after the end.
    return array.length
```

Another way of thinking about the left and right checks are that they detect if
the whole array corresponds to all true or false. In those cases, we need to
return the first element (if all true) or one past the end (if all false). (If
the whole array corresponds to false, we can imagine that the first "true"
element is one past the end.)

Then we write our main loop. Our main loop picks the element in the middle of
`left` and `right`. If it's false, then it moves `left` to the middle. If it's
true, it moves `right` to the middle. Again, this preserves our invariant.

```python {linenos=table,linenostart=18}
  # Main loop which narrows our search range.
  while left + 1 != right:
    middle = (left + right) / 2
    if unary_op(middle):
      right = middle
    else:
      left = middle
```

Lastly, we want to return the first true element, which should be `right`. We
`right` is the first true element because the loop only exits when `left` is
directly adjacent to it. Since `left` only points to false elements, we know
`right` is the first true element.

```python {linenos=table,linenostart=26}
  return right
```

Next, let's write `left_find_in_sorted_array`. We prefix it with "left" because
if the searched-for element is in the array multiple times, we return the
leftmost.

```python {linenos=table,linenostart=28}
def left_find_in_sorted_array(array, lookfor):
```

We need to define our unary_op function:

```python {linenos=table,linenostart=30}
  def unary_op(element_idx):
    return array[element_idx] >= lookfor
```

Let's quickly check this function's correctness:

- If `lookfor = 6` and `array[element_idx] = 5`, then `unary_op` returns `False`.
- If `lookfor = 6` and `array[element_idx] = 6`, then `unary_op` returns `True`.

And to finish it off, we call `binary_search`:

```python {linenos=table,linenostart=33}
  left = 0
  right = array.length - 1
  return binary_search(left, right, unary_op)
```

Here's the whole code:

```python
def binary_search(left, right, unary_op):
  # Check edge cases.
  if not array or not left < right:
    return None

  # left should always point to False, so return early.
  if unary_op(left) == True:
    return 0

  # right should always point to True.
  if unary_op(right) == False:
    # Return array.length here because the array is all falses.
    # We want to return the index of the first true element,
    # and if the array were longer, the first true element
    # might be one after the end.
    return array.length

  # Main loop which narrows our search range.
  while left + 1 != right:
    middle = (left + right) / 2
    if unary_op(middle):
      right = middle
    else:
      left = middle

  return right

def left_find_in_sorted_array(array, lookfor):

  def unary_op(element_idx):
    return array[element_idx] >= lookfor

  left = 0
  right = array.length - 1
  return binary_search(left, right, unary_op)
```

### What happens if the element we're looking for isn't in the array?

Consider the same array, except with 6 changed to 7. Let's repeat our
algorithm, searching for 6. I'll omit the middle steps for brevity, so work out
the steps in your head. Remember, `left` points to false and `right` points to
true.

<div class="array">

|        |     |     |     |     |     |     |     |         |
| ------ | --- | --- | --- | --- | --- | --- | --- | ------- |
| 0      | 2   | 3   | 6   | 9   | 10  | 20  | 58  | 60      |
| F      | F   | F   | T   | T   | T   | T   | T   | T       |
| `left` |     |     |     |     |     |     |     | `right` |

</div>

<div class="array">

|        |     |     |     |         |     |     |     |     |
| ------ | --- | --- | --- | ------- | --- | --- | --- | --- |
| 0      | 2   | 3   | 6   | 9       | 10  | 20  | 58  | 60  |
| F      | F   | F   | T   | T       | T   | T   | T   | T   |
| `left` |     |     |     | `right` |     |     |     |     |

</div>

<div class="array">

|     |     |        |     |         |     |     |     |     |
| --- | --- | ------ | --- | ------- | --- | --- | --- | --- |
| 0   | 2   | 3      | 6   | 9       | 10  | 20  | 58  | 60  |
| F   | F   | F      | T   | T       | T   | T   | T   | T   |
|     |     | `left` |     | `right` |     |     |     |     |

</div>

<div class="array">

|     |     |        |         |     |     |     |     |     |
| --- | --- | ------ | ------- | --- | --- | --- | --- | --- |
| 0   | 2   | 3      | 6       | 9   | 10  | 20  | 58  | 60  |
| F   | F   | F      | T       | T   | T   | T   | T   | T   |
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

This is also why we return `array.length` if the array corresponds to all
falses—since the entire array is less than the desired element, then we would
want to insert the element at the end, which is the same as inserting at
array.length.

<script>
Array.from(document.getElementsByTagName("td")).forEach((element) => {
  if (element.innerText === "F") {
    element.classList.add("bg-light-red");
  } else if (element.innerText === "T") {
    element.classList.add("bg-light-green");
  } else if (element.innerText === "left") {
    element.classList.add("dark-red", "heavy", "small");
  } else if (element.innerText === "right") {
    element.classList.add("dark-green", "heavy", "small");
  }
});
</script>
