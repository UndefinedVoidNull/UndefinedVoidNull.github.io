---
title: "Construct N, Z, Q, R, C"
date: "2025-01-11"
categories: [Math]
toc: true
format: html
---

## $\N$
There are 2 common ways to construct $\mathbb{N}$
1. by `Peano Axioms`
2. by `Set Theory` ($\emptyset$ and $\cup$)

Dedekind–Peano Structure is the ternary tuple $(e,S,\N)$ such that
- $e$ is an element, $S$ is the a function, $\N$ is a set
- $e \in \N$ (neutral element)
- $\forall a \in \N, S(a)\in\N$ (successor function is $\N\rightarrow\N$)
- $\forall a,b\in\N, (S(a)=S(b) \implies a=b)$ (successor function is injection)
- $\forall a \in \N, S(a)\neq e$ (the range of successor function exclude $e$, no circle, $e$ is the first)
- $\forall P,\{P(e) \land \forall k \in \N,[P(k)\implies P(S(k))]\} \implies [\forall n \in \N, P(n)]$ (induction)

So, we can define $0 := e, 1:=S(0),2:=S(1)=S(S(0)), ...$

## $\Z$
By equivalence classes of ordered pairs of $N$, we can construct $\mathbb{Z}$

$(a, b)$ to express $a - b$

$$
\mathbb{Z} = \{[(a,b)] \mid a, b \in \mathbb{N} \} 
$$

## $\mathbb{Q}$
$$
\mathbb{Q} = \{\frac{m}{n}  \mid m, n \in \mathbb{Z}  \} 
$$


## $\mathbb{R}$
There are 3 common ways to construct $\mathbb{R}$
1. by Axioms (`Field Axioms`, `Order Axioms` and `Completeness Axiom`)
2. by `Cauchy Sequence`
3. by `Dedekind Cut`

### Field Axioms
A1
A2
A3
A4

M1
M2
M3
M4

DL

### Order Axioms

### Completeness Axiom

Archimedean property

## $\mathbb{C}$
$$
\mathbb{C} = \{a+bi \mid a, b \in \mathbb{R}, i^2 = -1  \} 
$$

