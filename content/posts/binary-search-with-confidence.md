---
title: "Binary Search with Confidence"
date: 2019-10-21T04:26:10-07:00
draft: false
unlisted: false
---

I've never intuitively understood binary search—at least, I've never understood
its usual presentation. For example, take a quick glance at Wikipedia's binary
search code:

```javascript
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
minutes thinking through all the edge cases: arrays of size 0, 1, 2, 3, or
arrays without the desired element.

I find a different binary search algorithm much easier to understand and prove
correct. Before we look at the algorithm, let's make a digression...

## Loop invariants

To prove that our new binary search algorithm is correct, we will use a loop
invariant. A loop invariant is a property of a program that remains unchanged
as we iterate through a loop. As an example, consider this loop:

```java
void print_array(A) {
    for (int i = 0; i < A.length; ++i) {
        print(A[i]);
    }
}
```

We know the above code is likely correct because we know that our array
accesses will stay in bounds. The key loop invariant that tells us that is the
invariant `0 <= i < A.length`. We know that `i` is always greater than zero
because we initialize `i` to 0 and only increment it. And we also know that if
`i` was greater than or equal to `A.length`, the loop would have terminated.

## Reframing the problem

Suppose we want to find the index of 6 in the following (sorted) array:

{.array}
|   |   |   |   |   |    |    |    |    |
|---|---|---|---|---|----|----|----|----|
| 0 | 2 | 3 | 6 | 9 | 10 | 20 | 58 | 60 |

Let's consider the same array, except we add a row which checks if each element
is greater than or equal to 6:

{.array}
|   |   |   |   |   |    |    |    |    |
|---|---|---|---|---|----|----|----|----|
| 0 | 2 | 3 | 6 | 9 | 10 | 20 | 58 | 60 |
| F | F | F | T | T | T  | T  | T  | T  | 

Since this array is sorted, we find a region of false elements followed by a
region of true elements. Notice that the 6 is the first true element, and
thus lies on the boundary between the true elements and false elements—the
numbers less than 6 and the numbers greater than or equal to 6

This is the structure we want to exploit: instead of looking for 6, let's
instead find the boundary between the two regions. Then we return the first
element of the "true region", which is 6.

## An outline

We start with two indexes, left and right. Left points to the first element and
right points to the last element:

{.array}
|      |   |   |   |   |    |    |    |       |
|------|---|---|---|---|----|----|----|-------|
| 0    | 2 | 3 | 6 | 9 | 10 | 20 | 58 | 60    |
| F    | F | F | T | T | T  | T  | T  | T     |
| left |   |   |   |   |    |    |    | right |

This sets up our loop invariant: left always points to a false element, and
right always points to a true element. We want to our left and right indexes
closer to each other, while maintaining the invariant. Next, we consider the
middle element:

{.array}
|      |   |   |   |         |    |    |    |       |
|------|---|---|---|---------|----|----|----|-------|
| 0    | 2 | 3 | 6 | 9       | 10 | 20 | 58 | 60    |
| F    | F | F | T | T       | T  | T  | T  | T     |
| left |   |   |   |  middle |    |    |    | right |

If middle element corresponds to a false value, we move `left` to middle.
Otherwise, if it corresponds to a true value, we move `right` to the middle. In
either case, our loop invariant is preserved.

In this case, the middle element corresponds to true, so we move `right` to
the middle.

{.array}
|      |   |   |   |       |    |    |    |    |
|------|---|---|---|-------|----|----|----|----|
| 0    | 2 | 3 | 6 | 9     | 10 | 20 | 58 | 60 |
| F    | F | F | T | T     | T  | T  | T  | T  |
| left |   |   |   | right |    |    |    |    |

We pick the new middle element halfway between left and right:

{.array}
|      |   |        |   |       |    |    |    |    |
|------|---|--------|---|-------|----|----|----|----|
| 0    | 2 | 3      | 6 | 9     | 10 | 20 | 58 | 60 |
| F    | F | F      | T | T     | T  | T  | T  | T  |
| left |   | middle |   | right |    |    |    |    |

Since this middle is false, we move `left` to middle.

{.array}
|   |   |      |   |       |    |    |    |    |
|---|---|------|---|-------|----|----|----|----|
| 0 | 2 | 3    | 6 | 9     | 10 | 20 | 58 | 60 |
| F | F | F    | T | T     | T  | T  | T  | T  |
|   |   | left |   | right |    |    |    |    |

We then repeat this process until left and right are adjacent.

{.array}
|   |   |      |        |       |    |    |    |    |
|---|---|------|--------|-------|----|----|----|----|
| 0 | 2 | 3    | 6      | 9     | 10 | 20 | 58 | 60 |
| F | F | F    | T      | T     | T  | T  | T  | T  |
|   |   | left | middle | right |    |    |    |    |

{.array}
|   |   |   |      |       |    |    |    |    |
|---|---|---|------|-------|----|----|----|----|
| 0 | 2 | 3 | 6    | 9     | 10 | 20 | 58 | 60 |
| F | F | F | T    | T     | T  | T  | T  | T  |
|   |   |   | left | right |    |    |    |    |

When `left` and `right` are right next to each other, we know that `right`
points to the first element greater than or equal to 6. We return the index of
the first true element,`right`, which is 3.

## The algorithm

Let's walk through the algorithm line by line:

```python
def binary_search(left, right, unary_op):
```

Our function takes in our left and right indexes and a `unary_op`. What is
`unary_op`? It's a function that takes the index of an element and tells us
whether that element corresponds to true or false. In the above example
where we look for 6, `unary_op` behaves like:

```python
unary_op(0)  # False, because array[0] == 0  and 0 < 6
unary_op(2)  # False, because array[2] == 3  and 3 < 6
unary_op(3)  # True,  because array[3] == 6  and 6 >= 6
unary_op(7)  # True,  because array[7] == 58 and 58 >= 6
```

We write binary search in this manner because **binary search is a more general
algorithm than finding a number in a sorted list**—in fact, we can apply it to
any search problem whose search space is a range of numbers and the elements
in the range correspond to contiguous false and true regions. I'll write about
non-array binary searches in a followup post.

The next few lines check our boundary conditions. Just as we must build a solid
foundation before we build a house, we must make sure that our invariants are
initially valid before we start looping:

```python
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
return the first element (if all true) or one past the end (if all false). I'll
explain why we return one-past-the-end if the array corresponds to all false
soon.

Then we write our main loop. Our main loop picks the middle element of left and
right. If it's false, then it moves left to the middle. If it's true, it moves
right to the middle. Again, this preserves our invariant.

```python
    while left + 1 != right:
        middle = (left + right) / 2
        if unary_op(middle):
            right = middle
        else:
            left = middle
```

Lastly, we want to return the first true element, which should be right—when we
exit the loop, `left = right - 1` (that's the loop exit condition), and since
`left` always points to false and `right` always points to true, we know that
`right` is the first true element.

```python
    return right
```

Next, let's write `left_find_in_sorted_array`. We prefix it with `left` because
if the searched-for element is in the array multiple times, we return the
leftmost.

```python
def left_find_in_sorted_array(array, lookfor):
```

We need to define our unary_op function:

```python
    def unary_op(element_idx):
        return array[element_idx] >= lookfor
```

Let's quickly check this function's correctness: if `lookfor = 6` and
`array[element_idx] = 5`, then `unary_op` returns `False`, and if
`array[element_idx] = 6`, then `unary_op` returns true, which is what we want.

And to finish it off, we call `binary_search`:

```python
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

    # Main loop which keeps tightening our search range.
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

{.array}
|      |   |   |   |   |    |    |    |       |
|------|---|---|---|---|----|----|----|-------|
| 0    | 2 | 3 | 6 | 9 | 10 | 20 | 58 | 60    |
| F    | F | F | T | T | T  | T  | T  | T     |
| left |   |   |   |   |    |    |    | right |

{.array}
|      |   |   |   |       |    |    |    |    |
|------|---|---|---|-------|----|----|----|----|
| 0    | 2 | 3 | 6 | 9     | 10 | 20 | 58 | 60 |
| F    | F | F | T | T     | T  | T  | T  | T  |
| left |   |   |   | right |    |    |    |    |

{.array}
|   |   |      |   |       |    |    |    |    |
|---|---|------|---|-------|----|----|----|----|
| 0 | 2 | 3    | 6 | 9     | 10 | 20 | 58 | 60 |
| F | F | F    | T | T     | T  | T  | T  | T  |
|   |   | left |   | right |    |    |    |    |

{.array}
|   |   |   |      |       |    |    |    |    |
|---|---|---|------|-------|----|----|----|----|
| 0 | 2 | 3 | 6    | 9     | 10 | 20 | 58 | 60 |
| F | F | F | T    | T     | T  | T  | T  | T  |
|   |   |   | left | right |    |    |    |    |

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

Check back for part two, where I'll explain how binary search can be applied to
problems besides sorted-array problems.

