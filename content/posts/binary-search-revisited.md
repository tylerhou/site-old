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
array anymore. Why differ from convention?

### The generalization

Writing binary search as a function that takes a range (a low and high value)
and a function reveals the generalization: **binary search is an algorithm that
finds the boundary between contiguous sections of "green" and "red" elements in
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
red elements. Thus, we have a region of green, followed by a region of red.

Finally, we know that 0 is green ($2^0 = 1 \lt 1{,}000{,}000$), and let's guess
100 is red. So we can call binary search
([Godbolt](https://godbolt.org/z/5r1vrKnjn)):

```python {linenos=false}
binary_search(0, 100, is_exp_green)  # 20
```

And it works! Here, binary search helps us search for the first false value of
`is_exp_green`. That function definition, plus upper and lower bounds, are all
we need. There is no array of values we're looking through.

It's also important to note that `is_exp_green` (which computes the power of 2)
is only executed $\mathcal{O}(\log{n})$ times. So this variant of binary search
is still efficient.

### [An interview question](https://leetcode.com/discuss/interview-question/350800/Google-or-Onsite-or-Chocolate-Sweetness)

Suppose you have a chocolate bar with almonds. The chocolate bar has grooves,
dividing it into squares. Each square has a certain number of almonds.

You have $n-1$ friends, who all love almonds, so they will take the partitions
with the most number of almonds. That leaves you with the partition with the
least. How can you divide the chocolate bar into $n$ partitions to maximize the
number of almonds you get? (You aren't allowed to reorder squares: you must
break the chocolate at $n-1$ points.)

<div class="array chocolate">

|        |     |     |     |     |     |
| ------ | --- | --- | --- | --- | --- |
| 6      | 3   | 2   | 8   | 7   | 5   |

<div class="caption">
Chocolate bar, to be split into three parts.
</div>
</div>

<div class="array chocolate">

|     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 6   | 3   |     | 2   | 8   |     | 7   | 5   |

<div class="caption">
Chocolate bar divided into 3 partitions. <br/>
The first partition has the fewest almonds (9).
</div>
</div>


### Main idea

Another way to state the problem is: find the largest value of $k$ such that we
can give everyone at least $k$ almonds by partitioning the chocolate bar.

Notice that this problem now has the same structure as above: if it's possible
to give everyone $k$ almonds, then it must be possible to give everyone $k-1$
almonds. And if it's not possible to give everyone $k$ almonds, then it's also
not possible to give everyone $k+1$ almonds.

<div class="array chocolate">

|     |     |     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6   | 3   |     | 2   | 8   |     | 7   |     |     | 5   |
<div class="caption">
Possible to give all three at least 7 almonds.
</div>

|     |     |     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6   |     | 3   | 2   | 8   |     | 7   |     |     | 5   |

<div class="caption">
So also possible to give at least 6 almonds.
</div>
</div>

<hr width="70%"/>

<div class="array chocolate">

|     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 6   | 3   | 2   |     | 8   | 7   |     | 5   |

<div class="caption">
Not possible to give all three at least 11 almonds.
</div>

|     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| 6   | 3   | 2   | 8   |     | 7   | 5   |

<div class="caption">
So not possible to give at least 12 almonds.
</div>
</div>


So, we have a region where it *is* possible to give everyone $k$ almonds,
followed by a region where it is not. We can find the boundary between the two
regions via binary search.

Our `is_green` function would then be a procedure that would decide whether it
is possible to give everyone at least $k$ almonds. Then we can use our binary
search implementation above to find the minimum impossible $k$ value. Then
the preceding value would be the maximum possible $k$ value.

### Decision problems and complexity theory

I am (obviously) not the first person to have noticed this generalization of
binary search. There are a few
[competitive](https://usaco.guide/silver/binary-search?lang=cpp)
[programming](https://www.topcoder.com/thrive/articles/Binary%20Search)
articles that teach binary search from a similar perpsective.

Another place where this variant of binary search appears is when "reducing"
optimization problems to their decision variants. Very informally, reducing a
problem $A$ to another problem $B$ means that you solve problem $A$ by calling
problem $B$ one or more times.[^1]

[^1]: Not a precise definition, but the details aren't important here.

We saw that above with the chocolates problem: in order to solve the chocolate
optimization problem $A$ ("maximize the number of almonds I receive"), we
instead reduced it to $B$, the decision problem ("can I give myself at least
$k$ almonds?") using $\mathcal{O}(\log{n})$ calls to $B$.

Binary search helped us accomplish the reduction with as few calls to $B$
possible. In general, binary search can help us quickly solve many optimization
problems that have decision variants with a similar structure.

For example, a famous problem in complexity theory is the travelling salesman
problem (TSP). The usual statement of TSP is: given some cities and roads (each
with travel cost) connecting cities, is it possible to visit every city exactly
once and return to the original city in under cost $C$?

Notice that this is a decision problem: the answer is either true or false. And
it also has the same structure that we can use for binary search: if it's
possible to make such a trip in cost $C$, it must be possible with cost $C-1$,
and if it's impossible in cost $C$, it must also be impossible with cost $C+1$.

Thus, consider an optimization variant of TSP: given a list of cities and
roads, what is the cost of the shortest path that visits every city exactly
once and returns to the original city? We can solve this with
$\mathcal{O}(\log{n})$ calls to TSP-Decision: pick some lower bound on the
cost and some upper bound and use binary search.

Again, no longer are we finding an element in an array, but we are finding the
boundary between falses (greens) and trues (reds) for TSP-Decision.
