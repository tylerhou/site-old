---
title: "Binary search, revisited"
subtitle:
date: 2022-03-05T04:50:48-08:00
code: true
math: true
draft: false
unlisted: false
_build:
  list: true
  render: true
_dummy_:
---

<div class="prev-container">
<div class="prev">

[Binary search with confidence](/posts/binary-search-with-confidence)

</div>
</div>

In the [previous post on binary search,](/posts/binary-search-with-confidence)
we wrote the following binary search implementation and justified its
correctness:

```python
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
binary_search(array, lambda x: x < 6)
```

## A shift in perspective

I want to change the parameters slightly: instead of passing an array, let's
try passing in left and right indices. Since we no longer have access to
`array` inside the `binary_search` function, we have to modify the `is_green`
parameter to take in an index instead of a value.

```python
def binary_search(left, right, is_green):
    if left >= right:
        return 0
    if not is_green(left):
        return 0
    if is_green(right):
        return right + 1

    while left + 1 < right:
        middle = (left + right) // 2
        if is_green(middle):
            left = middle
        else:
            right = middle

    return right

# Usage.
binary_search(0, len(array) - 1, lambda i: array[i] < 6)
```

Why make this change?
[Many](https://en.wikipedia.org/w/index.php?title=Binary_search_algorithm&oldid=1074688665#:~:text=is%20a%20search%20algorithm%20that%20finds%20the%20position%20of%20a%20target%20value%20within%20a%20sorted%20array.)
[references](https://www.khanacademy.org/computing/computer-science/algorithms/binary-search/a/binary-search#:~:text=Binary%20search%20is%20an%20efficient%20algorithm%20for%20finding%20an%20item%20from%20a%20sorted%20list%20of%20items.) <!-- Archive: https://archive.ph/uNvU4 -->
[claim](https://www.programiz.com/dsa/binary-search#:~:text=Binary%20Search%20is%20a%20searching%20algorithm%20for%20finding%20an%20element%27s%20position%20in%20a%20sorted%20array.)
that binary search is an algorithm for finding the position of a target value
in an array. But now our new `binary_search` function doesn't even take an
array to begin with. Why differ from convention?

### A generalization

Writing binary search as a function that takes a range (a low and high value)
and a function reveals the generalization: **binary search is an algorithm that
finds the boundary between contiguous ranges of "green" and "red" elements in
some range.**

Notice that the above definition doesn't mention an array at all. As long as we
have a known range and the requisite structure on that range (all green
elements, followed by all red elements), we can use binary search.

### A small example

Let's use binary search to find the first power of two larger than 1 million.
That is, we want to find an integer $n$ such that $2^{n} \gt 1{,}000{,}000$
and $2^{n-1} \le 1{,}000{,}000$.

Consider $2^n$. If $2^n \le 1{,}000{,}000$, let's call $n$ green. Otherwise,
$2^n \gt 1{,}000{,}000$, so let's call $n$ red. We could then write
`is_exp_green` as follows:

```python {linenos=false}
def is_exp_green(n):
    return (2 ** n) <= 1_000_000
```

Does `is_green` have the correct structure? Yes. First, we know that green
elements must be preceded by green elements: Suppose $n$ is green; that means
$2^{n} \le 1{,}000{,}000$. Then clearly $2^{n-1} \lt 2^{n} \le 1{,}000{,}000$.
So $n-1$ must also be green.

We can make a similar argument that all red elements must be followed by more
red elements, and no green elements. Thus, we have a region of green, followed
by a region of red.

Finally, we know that $0$ is green ($2^0 = 1 \lt 1{,}000{,}000$), and let's
guess $100$ is red. So we can call binary search
([Godbolt](https://godbolt.org/z/5r1vrKnjn)):

```python {linenos=false}
binary_search(0, 100, is_exp_green)  # 20
```

And it works! There is no array of values we're looking through. Here, binary
search helps us search for the first false value of `is_exp_green`. That
function definition, plus upper and lower bounds, are all we need.

It's also important to note that `is_exp_green` (which computes the power of 2)
is only executed $\mathcal{O}(\log{n})$ times. So this variant of binary search
is still efficient.

### A larger example

[An interview
question.](https://leetcode.com/discuss/interview-question/350800/Google-or-Onsite-or-Chocolate-Sweetness)
Suppose you have a chocolate bar with almonds. The chocolate bar has grooves,
dividing it into squares. Each square has a certain number of almonds.

You have $n-1$ friends, who all love almonds, so they will take the partitions
with the most number of almonds. That leaves you with the partition with the
least.

How can you divide the chocolate bar into $n$ partitions to maximize the number
of almonds you get? (You aren't allowed to reorder squares: you must break the
chocolate at $n-1$ points.)


---

I won't present the solution, but here is the main idea: we want to find
the largest value of $k$ such that we can give
