---
title: Invariants
subtitle:
date: 2021-01-03T09:52:47-08:00
code: true
math: true
draft: false
unlisted: true
---

An invariant is a statement of system that remains true under "valid"
transformations. If that's too abstract, consider this statement:

<p class="text-center">I am younger than my parent.</p>

Or, more precisely,

$$
\text{myAgeInSeconds} < \text{parent'sAgeInSeconds}
$$

Is this an invariant? Yes, and no: it depends on the allowed transformations.
If one allows only the following transformation:

```python {linenos=table}
def oneSecondPasses():
    myAgeInSeconds += 1
    parentsAgeInSeconds += 1
```

Then yes, the statement is an invariant. We can prove this with a technique
called [_induction_](https://en.wikipedia.org/wiki/Mathematical_induction).
Inductive arguments consist of two proofs: a base case, and an inductive step.

Informally, we will show that at one point the statement was true (that I was
once younger than my parent at time $N$). This is the base case. Then we will
show that if I am younger than my parent at time $X$, then after a
transformation (a second passing), I will still be younger than my parent at
time $X + 1$ (the inductive step).

If we can prove these two things, then we can show that the statement is true
for all times $T \geq N$ by repeatedly applying the inductive step to the base
case.

#### The base case

We prove that I was younger than my parent at some time $N$.

1. By definition, when I was born, my age in seconds was $0$. Call this time $N$.
1. From the definition of "parent," my parent's age in seconds was greater than zero when I was born.
1. Therefore, when I was born, $0 = \text{myAge} < \text{parent'sAge}$.

#### The inductive step

Then, we need to prove that the passage of time does not change this invariant.
With the following reasoning, we prove that _if_ the invariant is true at time
$N$, then it _will still_ be true at time $N + 1$ (after one second passes):

1. Assume $\text{myAge} < \text{parent'sAge}$.
1. One second passes. So we set:
   1. $\text{nextMyAge} := \text{myAge} + 1$
   1. $\text{nextParent'sAge} := \text{parent'sAge} + 1$
1. We want to prove: $\text{nextMyAge} \stackrel{?}{<} \text{nextParent'sAge}$?
1. By (2), (3) is equivalent to $\text{myAge} + 1 \stackrel{?}{<} \text{parent'sAge} + 1$.
1. We are allowed to subtract $1$ from both sides of the above inequality,
   producing $\text{myAge} \stackrel{?}{<} \text{parent'sAge}$. This is what we
   assumed in (1), so it is true.

It should now be clear that for any time $T \geq N$, the property _I am younger
than my parent_ ($P$) is true---in other words, for all times $T \geq N$, the property
is invariant. Informally, we could argue:

1. Suppose $T \geq N$. We want to show $P$ is true at time $T$.
1. (1) implies there exists some finite $X$ where $N + X = T$.
1. We know $P$ is true at time $N$.
1. By the inductive step, we then know $P$ is true at time $N + 1$.
1. Again by the inductive step, we know $P$ is true at time $N + 2$.
1. By repeating the inductive step finitely many times, we can show that $P$ is true at time $N + X$.
1. Thus, $P$ is true at time $T$.

#### Transformations

If you have watched the documentary _Interstellar_, you will know that our
transformation does not accurately represent time in the real world. Time passes
differently for someone who is accelerating or who is under a gravitational
field. If my parent jumped in a rocket ship and accelerated away from Earth at
relativistic speeds, they would experience time "slower" then me. Then, when
they returned, I might be older than them.

The point is: invariants are not properties of just a system -- they also
depend on the available transformations of that system. In the system
$(\text{me}, \text{parent})$ with the set of transformations
$\{\text{oneSecondPasses}\}$, our relative ages are invariant. But add the
transformation $\text{rocketShipAdventure}$, and they are not.
