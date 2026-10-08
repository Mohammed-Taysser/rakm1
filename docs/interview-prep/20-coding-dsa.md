# Coding & DSA (JavaScript)

> MERN/full-stack coding rounds rarely look like hardcore competitive programming. Expect 1–2 medium problems solvable in ~30–45 minutes, plus "implement-from-scratch" JavaScript classics (debounce, deep clone, Promise.all, LRU cache). Interviewers care about clear thinking, correct edge-case handling, clean idiomatic JS, and honest Big-O analysis — not whether you memorized an obscure algorithm. Use this file as a single-source study sheet: skim the **Quick Revision Checklist** before a round, drill the **Problem-Solving Patterns** (the highest-value section), and rehearse the **JavaScript-Specific** implementations out loud. Every solution here is runnable Node.js.

---

## Quick Revision Checklist

- **Hash map = your default tool.** Most "find / count / dedupe / pair" problems collapse to O(n) with a `Map`/object. Reach for it first.
- **Two pointers** for sorted arrays, pair-sums, palindromes, in-place reordering → O(n) time, O(1) space.
- **Sliding window** for "longest/shortest substring/subarray with constraint" → O(n) instead of O(n²) brute force.
- **Fast & slow pointers** for cycle detection in linked lists and finding the middle → O(1) space.
- **Prefix sums** turn repeated range-sum queries into O(1) lookups; pair with a hash map for "subarray sum = k".
- **Binary search** isn't just for arrays — use it on a _monotonic answer space_ ("min capacity to ship in D days").
- **BFS = shortest path / level order** (queue); **DFS = explore / path-exists / backtracking** (stack or recursion).
- **DP**: identify overlapping subproblems + optimal substructure. Memoize (top-down) first; convert to tabulation (bottom-up) if needed.
- **Backtracking** = DFS + undo. Used for permutations, combinations, subsets, N-Queens, Sudoku.
- **Monotonic stack** for "next greater/smaller element" and histogram problems → O(n).
- **Merge intervals**: sort by start, then merge overlaps.
- **JS sort gotcha**: `[10,2,1].sort()` → `[1,10,2]` (lexicographic!). Always pass a comparator for numbers: `.sort((a,b)=>a-b)`.
- **Complexities to know cold**: array push/pop O(1), shift/unshift O(n), indexOf/includes O(n); object/Map get/set/has O(1) avg; Set membership O(1); sort O(n log n).
- **Kadane's algorithm** (max subarray) and **Floyd's cycle detection** are the two "named" algorithms that show up most.
- **Always state**: brute force → optimization → time & space complexity, _before_ coding. Then test with edge cases (empty, single element, duplicates, negatives).

---

## Big-O & Complexity

### Common complexities (best → worst)

| Notation   | Name         | Example                                       |
| ---------- | ------------ | --------------------------------------------- |
| O(1)       | Constant     | Hash lookup, array index access, push/pop     |
| O(log n)   | Logarithmic  | Binary search, balanced BST operations        |
| O(n)       | Linear       | Single loop, linear scan                      |
| O(n log n) | Linearithmic | Efficient sorts (merge/quick/Timsort)         |
| O(n²)      | Quadratic    | Nested loops over the same array              |
| O(2ⁿ)      | Exponential  | Naive recursive Fibonacci, subset enumeration |
| O(n!)      | Factorial    | Generating all permutations                   |

### Complexity of JS array / object / Map / Set operations

| Operation                           | Complexity     | Notes                                     |
| ----------------------------------- | -------------- | ----------------------------------------- |
| `arr[i]` (read/write)               | O(1)           | Direct index                              |
| `arr.push` / `arr.pop`              | O(1) amortized | End of array                              |
| `arr.shift` / `arr.unshift`         | **O(n)**       | Reindexes everything — avoid in hot loops |
| `arr.indexOf` / `includes` / `find` | O(n)           | Linear scan                               |
| `arr.slice` / `concat` / spread     | O(n)           | Copies elements                           |
| `arr.splice`                        | O(n)           | Shifts elements                           |
| `arr.sort`                          | O(n log n)     | V8 uses Timsort                           |
| `obj.key` get/set/delete            | O(1) avg       | Hash map under the hood                   |
| `Map.get/set/has/delete`            | O(1) avg       | Preserves insertion order; any key type   |
| `Set.has/add/delete`                | O(1) avg       | Unique values, fast membership            |
| `Map`/`Set` iteration               | O(n)           | Insertion order                           |

**Map vs object:** Prefer `Map` when keys aren't strings, when you need ordering guarantees, frequent add/remove, or `.size`. Use a plain object for simple string-keyed lookups and JSON-shaped data.

### How to analyze

1. **Count the loops** relative to input size n. Sequential loops add (O(n)+O(n)=O(n)); nested loops multiply (O(n²)).
2. **Drop constants and lower-order terms**: O(2n + 5) → O(n).
3. **Recursion**: total work = (number of calls) × (work per call). A recursion that halves the input each call → O(log n) depth; one that branches into 2 each call without memo → O(2ⁿ).
4. **Space**: count extra memory (auxiliary data structures + recursion call-stack depth). In-place algorithms aim for O(1) auxiliary space.
5. **Hidden costs**: `.includes` inside a loop is O(n²); copying with spread inside a loop is O(n²).

---

## Core Data Structures

### Arrays

Contiguous, index-accessible ordered list. JS arrays are dynamic and can hold mixed types.

- **JS:** `const a = [1, 2, 3];`
- **Time:** index O(1), search O(n), push/pop O(1), shift/unshift O(n).
- **Use when:** ordered data, index access, stack/queue (with caveats on `shift`).

### Strings

Immutable sequences of characters. Any "mutation" creates a new string.

- **JS:** `"abc"`, `s.split("")`, `[...s]`, `s.charCodeAt(0)`.
- **Time:** access O(1), concatenation in a loop is O(n²) — build an array and `.join("")` instead.
- **Use when:** text processing, parsing, pattern matching.

### Hash maps — objects / Map / Set

Key→value (or value-only for Set) with O(1) average access.

- **JS:** `const m = new Map(); m.set(k,v); m.get(k);` · `const s = new Set([1,2]); s.has(1);`
- **Time:** get/set/has/delete O(1) average.
- **Use when:** counting frequencies, dedup, caching, adjacency lists, "have I seen this?" checks.

### Stacks (LIFO)

Last-in-first-out. Native via array `push`/`pop`.

- **JS:** `const st = []; st.push(x); st.pop();`
- **Time:** push/pop/peek O(1).
- **Use when:** undo, matching parentheses, DFS, expression evaluation, monotonic stack.

### Queues (FIFO)

First-in-first-out. Array `push`+`shift` works but `shift` is O(n); use a head-pointer or a linked list for O(1) dequeue at scale.

- **JS:** `const q = []; q.push(x); const f = q.shift();`
- **Time:** enqueue O(1); dequeue O(1) with proper structure (O(n) with `shift`).
- **Use when:** BFS, task scheduling, rate limiting.

### Linked lists

Nodes holding a value + pointer to the next (and optionally prev) node.

- **JS:** `class Node { constructor(v){ this.val=v; this.next=null; } }`
- **Time:** insert/delete at known node O(1); search/access by index O(n).
- **Use when:** frequent insert/delete at ends/middle, constant-time splicing, building LRU caches.

### Trees / BST

Hierarchical nodes; a **Binary Search Tree** keeps left < node < right.

- **JS:** `class TreeNode { constructor(v){ this.val=v; this.left=this.right=null; } }`
- **Time (balanced BST):** search/insert/delete O(log n); O(n) if degenerate/unbalanced.
- **Use when:** hierarchical data, sorted data with fast lookup, range queries.

### Heaps (priority queue)

Complete binary tree where parent ≤ (min-heap) or ≥ (max-heap) children. JS has **no built-in heap** — implement with an array.

- **Time:** peek O(1), insert O(log n), extract-min/max O(log n).
- **Use when:** top-K elements, scheduling, Dijkstra, merge K sorted lists.

### Graphs

Nodes (vertices) + edges. Usually represented as an **adjacency list** (`Map<node, neighbors[]>`).

- **JS:** `const g = new Map(); g.set('A', ['B','C']);`
- **Time:** with adjacency list, BFS/DFS O(V + E).
- **Use when:** networks, dependencies, routing, social graphs.

### Tries (prefix trees)

Tree where each node represents a character; paths spell words.

- **Time:** insert/search a word of length L → O(L).
- **Use when:** autocomplete, prefix search, spell-check, word dictionaries.

---

## Problem-Solving Patterns

### 1. Two pointers

**What:** Use two indices moving toward each other (or in the same direction) to scan in O(n) instead of nested loops.
**When:** Sorted arrays, pair-sum, palindromes, removing duplicates, partitioning, in-place reordering.

```js
// Problem: given a SORTED array, return indices of two numbers that sum to target.
function twoSumSorted(nums, target) {
  let left = 0,
    right = nums.length - 1; // start at both ends
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right]; // found the pair
    if (sum < target)
      left++; // need a bigger sum → move left up
    else right--; // need a smaller sum → move right down
  }
  return [-1, -1]; // no valid pair
}
// Time: O(n)  |  Space: O(1)
```

### 2. Sliding window

**What:** Maintain a contiguous window `[left, right]` and expand/shrink it to satisfy a constraint, avoiding recomputation.
**When:** "Longest/shortest subarray or substring with condition", max sum of size-k subarray, distinct-char windows.

```js
// Problem: max sum of any contiguous subarray of size k.
function maxSubarraySum(nums, k) {
  let windowSum = 0,
    maxSum = -Infinity;
  let left = 0;
  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right]; // expand window to the right
    if (right - left + 1 === k) {
      // window reached size k
      maxSum = Math.max(maxSum, windowSum);
      windowSum -= nums[left]; // slide: drop leftmost element
      left++;
    }
  }
  return maxSum;
}
// Time: O(n)  |  Space: O(1)
```

### 3. Hash map / frequency counter

**What:** Count occurrences or remember seen values for O(1) lookups.
**When:** Anagrams, duplicates, "two sum" (unsorted), counting, grouping.

```js
// Problem: do two strings contain exactly the same characters (anagram)?
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1); // tally s
  for (const ch of t) {
    if (!counts.has(ch)) return false; // char not in s at all
    counts.set(ch, counts.get(ch) - 1); // decrement for t
    if (counts.get(ch) === 0) counts.delete(ch);
  }
  return counts.size === 0; // all counts balanced out
}
// Time: O(n)  |  Space: O(k) where k = distinct chars
```

### 4. Prefix sum

**What:** Precompute cumulative sums so any range sum is `prefix[j] - prefix[i]` in O(1).
**When:** Many range-sum queries; "subarray sum equals k" (combine with a hash map).

```js
// Problem: count subarrays whose sum equals k.
function subarraySumEqualsK(nums, k) {
  const seen = new Map([[0, 1]]); // prefix-sum 0 occurs once (empty prefix)
  let prefix = 0,
    count = 0;
  for (const n of nums) {
    prefix += n; // running prefix sum
    // if (prefix - k) was seen before, those subarrays sum to k
    count += seen.get(prefix - k) || 0;
    seen.set(prefix, (seen.get(prefix) || 0) + 1);
  }
  return count;
}
// Time: O(n)  |  Space: O(n)
```

### 5. Fast & slow pointers (cycle detection)

**What:** Two pointers at different speeds (Floyd's tortoise & hare). If they meet, there's a cycle.
**When:** Detecting cycles in linked lists, finding the middle node, finding a duplicate number.

```js
// Problem: does a linked list have a cycle?
function hasCycle(head) {
  let slow = head,
    fast = head;
  while (fast && fast.next) {
    slow = slow.next; // moves 1 step
    fast = fast.next.next; // moves 2 steps
    if (slow === fast) return true; // they meet → cycle exists
  }
  return false; // fast hit the end → no cycle
}
// Time: O(n)  |  Space: O(1)
```

### 6. Binary search (and on answer space)

**What:** Repeatedly halve a _sorted_ search range. Generalizes to searching a monotonic answer space.
**When:** Sorted arrays; "find minimum/maximum value that satisfies a condition".

```js
// Classic: index of target in a sorted array, or -1.
function binarySearch(nums, target) {
  let lo = 0,
    hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // avoids overflow vs (lo+hi)/2
    if (nums[mid] === target) return mid;
    if (nums[mid] < target)
      lo = mid + 1; // search right half
    else hi = mid - 1; // search left half
  }
  return -1;
}

// Binary search on ANSWER SPACE:
// Min eating speed so Koko finishes all banana piles within h hours.
function minEatingSpeed(piles, h) {
  const hoursNeeded = (speed) =>
    piles.reduce((sum, p) => sum + Math.ceil(p / speed), 0);
  let lo = 1,
    hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (hoursNeeded(mid) <= h)
      hi = mid; // mid works → try slower (smaller)
    else lo = mid + 1; // too slow → must eat faster
  }
  return lo; // smallest feasible speed
}
// Time: O(log n) for plain search; O(n log(maxPile)) for answer-space version
```

### 7. Recursion & backtracking

**What:** Solve by reducing to smaller subproblems. **Backtracking** = build candidates incrementally and _undo_ a choice when it can't lead to a solution.
**When:** Permutations, combinations, subsets, partitions, N-Queens, Sudoku, maze paths.

```js
// Problem: all subsets (the power set) of a distinct array.
function subsets(nums) {
  const result = [];
  const backtrack = (start, current) => {
    result.push([...current]); // every prefix state is a valid subset
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]); // choose nums[i]
      backtrack(i + 1, current); // explore further with it included
      current.pop(); // UNDO the choice (backtrack)
    }
  };
  backtrack(0, []);
  return result;
}
// Time: O(n · 2^n)  |  Space: O(n) recursion depth (excluding output)
```

### 8. BFS & DFS (trees & graphs)

**What:** Two traversal strategies. **BFS** explores level by level (queue) → shortest path in unweighted graphs. **DFS** goes deep first (stack/recursion) → path existence, components, topological order.
**When:** BFS for shortest path/level order; DFS for connectivity, cycle detection, exhaustive search.

```js
// BFS over a graph (adjacency list), returning visit order.
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift(); // dequeue (FIFO)
    order.push(node);
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor); // mark before enqueue to avoid dupes
        queue.push(neighbor);
      }
    }
  }
  return order;
}

// DFS (recursive) over a graph.
function dfs(graph, start, visited = new Set(), order = []) {
  visited.add(start);
  order.push(start);
  for (const neighbor of graph.get(start) || []) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited, order);
  }
  return order;
}
// Time: O(V + E)  |  Space: O(V)
```

### 9. Dynamic programming (memoization + tabulation)

**What:** Break a problem into overlapping subproblems and cache results. **Top-down** = recursion + memo. **Bottom-up** = iterative table.
**When:** Optimal substructure + overlapping subproblems: Fibonacci, coin change, knapsack, edit distance, longest common subsequence.

```js
// Classic: number of distinct ways to climb n stairs taking 1 or 2 steps.

// --- Top-down (memoization) ---
function climbStairsMemo(n, memo = new Map()) {
  if (n <= 2) return n; // 1 step→1 way, 2 steps→2 ways
  if (memo.has(n)) return memo.get(n); // reuse cached subproblem
  const ways = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);
  memo.set(n, ways);
  return ways;
}

// --- Bottom-up (tabulation), O(1) space ---
function climbStairsTab(n) {
  if (n <= 2) return n;
  let prev2 = 1,
    prev1 = 2; // ways(1), ways(2)
  for (let i = 3; i <= n; i++) {
    const cur = prev1 + prev2; // ways(i) = ways(i-1) + ways(i-2)
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
// Time: O(n)  |  Space: O(n) memo / O(1) tabulated
```

### 10. Greedy

**What:** Make the locally optimal choice at each step, trusting it leads to a global optimum (only works when the problem has the greedy-choice property).
**When:** Interval scheduling, jump games, coin change with canonical denominations, Huffman coding.

```js
// Problem: can you reach the last index? nums[i] = max jump length from i.
function canJump(nums) {
  let farthest = 0; // farthest index reachable so far
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false; // stuck — can't even reach i
    farthest = Math.max(farthest, i + nums[i]); // greedily extend reach
    if (farthest >= nums.length - 1) return true;
  }
  return true;
}
// Time: O(n)  |  Space: O(1)
```

### 11. Sorting (and the built-in `sort` gotcha)

**What:** Ordering data unlocks two-pointer, binary search, greedy, and dedup techniques.
**When:** Whenever order helps; cost is O(n log n).

```js
// GOTCHA: Array.prototype.sort() converts elements to STRINGS by default
// and sorts lexicographically.
console.log([10, 2, 1, 20].sort()); // [1, 10, 2, 20]  ❌ WRONG for numbers
console.log([10, 2, 1, 20].sort((a, b) => a - b)); // [1, 2, 10, 20] ✅ ascending
console.log([10, 2, 1, 20].sort((a, b) => b - a)); // [20, 10, 2, 1] ✅ descending

// Sorting objects by a field:
const people = [
  { name: "A", age: 30 },
  { name: "B", age: 25 },
];
people.sort((x, y) => x.age - y.age); // by age ascending

// Stable sort guaranteed since ES2019. sort() mutates in place;
// use [...arr].sort(...) to keep the original.
```

### 12. Stack-based (valid parentheses, monotonic stack)

**What:** Use a stack to remember the most recent relevant items. A **monotonic stack** keeps elements in increasing/decreasing order to answer "next greater/smaller" in O(n).
**When:** Bracket matching, expression parsing, next-greater-element, largest rectangle in histogram.

```js
// Valid parentheses: every opener has a correct matching closer.
function isValidParens(s) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch); // push openers
    } else {
      if (stack.pop() !== pairs[ch]) return false; // mismatch or empty
    }
  }
  return stack.length === 0; // all openers were closed
}

// Monotonic stack: for each element, the next greater element to its right.
function nextGreaterElements(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = []; // holds INDICES, values decreasing from bottom to top
  for (let i = 0; i < nums.length; i++) {
    // while current value is greater than value at stack-top index, resolve it
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      res[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return res;
}
// Time: O(n)  |  Space: O(n)
```

### 13. Merge intervals

**What:** Sort intervals by start, then sweep and merge overlaps.
**When:** Calendars, booking conflicts, range consolidation.

```js
// Problem: merge all overlapping intervals.
function mergeIntervals(intervals) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]); // sort by start
  const merged = [intervals[0].slice()];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const [start, end] = intervals[i];
    if (start <= last[1]) {
      // overlaps the last merged interval
      last[1] = Math.max(last[1], end); // extend it
    } else {
      merged.push([start, end]); // disjoint → new interval
    }
  }
  return merged;
}
// Time: O(n log n) for the sort  |  Space: O(n)
```

---

## JavaScript-Specific Coding Questions

These "implement-from-scratch" questions are extremely common in MERN/front-end interviews because they test your grasp of closures, `this`, the event loop, and Promises.

### debounce

Delays invocation until `delay` ms have passed since the _last_ call. Used for search-as-you-type, resize handlers.

```js
function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId); // cancel the pending call
    timerId = setTimeout(() => {
      fn.apply(this, args); // preserve `this` and arguments
    }, delay);
  };
}
// Usage: const onSearch = debounce(q => fetchResults(q), 300);
```

### throttle

Ensures `fn` runs at most once per `limit` ms. Used for scroll/mousemove handlers.

```js
function throttle(fn, limit) {
  let inThrottle = false;
  let lastArgs = null;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args); // run immediately (leading edge)
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          // run the most recent trailing call
          fn.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args; // remember the latest call
    }
  };
}
```

### deep clone

Recursively copies nested objects/arrays. (`structuredClone` is the modern built-in, but interviewers want the manual version.)

```js
function deepClone(value, seen = new WeakMap()) {
  // primitives (and functions) are returned as-is
  if (value === null || typeof value !== "object") return value;

  // handle special built-ins
  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  // handle circular references
  if (seen.has(value)) return seen.get(value);

  const clone = Array.isArray(value) ? [] : {};
  seen.set(value, clone); // register before recursing

  for (const key of Reflect.ownKeys(value)) {
    clone[key] = deepClone(value[key], seen); // recurse into each property
  }
  return clone;
}
```

### deepEqual

Structural equality check.

```js
function deepEqual(a, b) {
  if (a === b) return true; // same ref or same primitive
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  )
    return false;
  const keysA = Object.keys(a),
    keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false; // different shape
  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]), // recurse
  );
}
```

### flatten nested array

Flatten an arbitrarily nested array. (`arr.flat(Infinity)` is built-in; here's the manual recursion.)

```js
function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item)); // recurse and spread sub-results
    } else {
      result.push(item);
    }
  }
  return result;
}
// flatten([1, [2, [3, [4]], 5]]) → [1, 2, 3, 4, 5]
```

### curry

Transforms `f(a, b, c)` into `f(a)(b)(c)`, collecting args until enough are supplied.

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      // enough args → invoke
      return fn.apply(this, args);
    }
    // otherwise return a fn that gathers more args
    return (...next) => curried.apply(this, [...args, ...next]);
  };
}
// const add = curry((a, b, c) => a + b + c);
// add(1)(2)(3) === add(1, 2)(3) === add(1)(2, 3) === 6
```

### memoize

Caches results keyed by serialized arguments.

```js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args); // simple key; fine for primitive args
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

### Promise.all polyfill

Resolves when _all_ promises resolve (preserving order); rejects on the _first_ rejection.

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = new Array(promises.length);
    let remaining = promises.length;
    if (remaining === 0) return resolve([]); // empty input edge case
    promises.forEach((p, i) => {
      // Promise.resolve handles non-promise values too
      Promise.resolve(p).then(
        (value) => {
          results[i] = value; // keep original order via index
          remaining--;
          if (remaining === 0) resolve(results);
        },
        (err) => reject(err), // first rejection short-circuits
      );
    });
  });
}
```

### custom EventEmitter

Pub/sub: register handlers by event name and emit events to them.

```js
class EventEmitter {
  constructor() {
    this.events = new Map(); // eventName → array of listeners
  }
  on(event, listener) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(listener);
    return this; // chainable
  }
  off(event, listener) {
    if (!this.events.has(event)) return this;
    this.events.set(
      event,
      this.events.get(event).filter((l) => l !== listener),
    );
    return this;
  }
  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper); // auto-remove after first call
    };
    return this.on(event, wrapper);
  }
  emit(event, ...args) {
    if (!this.events.has(event)) return false;
    // copy the array so off() during emit doesn't disrupt iteration
    [...this.events.get(event)].forEach((listener) => listener(...args));
    return true;
  }
}
```

### Array.prototype.map / reduce polyfill

```js
Array.prototype.myMap = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      // skip holes in sparse arrays
      result[i] = callback.call(thisArg, this[i], i, this);
    }
  }
  return result;
};

Array.prototype.myReduce = function (callback, initialValue) {
  let acc = initialValue;
  let startIndex = 0;
  if (arguments.length < 2) {
    // no initial value provided
    if (this.length === 0)
      throw new TypeError("Reduce of empty array with no initial value");
    acc = this[0]; // use first element as seed
    startIndex = 1;
  }
  for (let i = startIndex; i < this.length; i++) {
    acc = callback(acc, this[i], i, this);
  }
  return acc;
};
```

### group by

```js
function groupBy(arr, keyFn) {
  return arr.reduce((groups, item) => {
    const key = typeof keyFn === "function" ? keyFn(item) : item[keyFn];
    (groups[key] ||= []).push(item); // logical-OR-assign creates bucket
    return groups;
  }, {});
}
// groupBy([6.1, 4.2, 6.3], Math.floor) → { 6: [6.1, 6.3], 4: [4.2] }
```

### retry with backoff

```js
async function retryWithBackoff(fn, retries = 3, baseDelay = 200) {
  let attempt = 0;
  while (true) {
    try {
      return await fn(); // success → return immediately
    } catch (err) {
      attempt++;
      if (attempt > retries) throw err; // out of retries → propagate
      const delay = baseDelay * 2 ** (attempt - 1); // exponential backoff
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
```

### LRU cache (Map-based)

A `Map` preserves insertion order, so the _first_ key is the least-recently used. On access, delete-and-reinsert to mark a key as most-recently used.

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    this.cache.delete(key); // remove...
    this.cache.set(key, value); // ...and re-add → now most-recent
    return value;
  }
  put(key, value) {
    if (this.cache.has(key))
      this.cache.delete(key); // refresh position
    else if (this.cache.size >= this.capacity) {
      const lruKey = this.cache.keys().next().value; // oldest = first key
      this.cache.delete(lruKey); // evict least-recently used
    }
    this.cache.set(key, value); // insert as most-recent
  }
}
// All operations O(1).
```

### async pool / limit concurrency

Run async tasks with a cap on how many run simultaneously.

```js
async function asyncPool(limit, items, iteratorFn) {
  const results = [];
  const executing = new Set();
  for (const [i, item] of items.entries()) {
    const p = Promise.resolve().then(() => iteratorFn(item, i));
    results.push(p);
    executing.add(p);
    p.finally(() => executing.delete(p)); // free a slot when done
    if (executing.size >= limit) {
      await Promise.race(executing); // wait for any one to finish
    }
  }
  return Promise.all(results); // gather everything in order
}
// await asyncPool(2, urls, url => fetch(url)); // max 2 fetches at once
```

---

## Classic Interview Problems

Helper types used below:

```js
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
```

### 1. Two Sum (unsorted)

```js
// Return indices of the two numbers adding to target.
function twoSum(nums, target) {
  const seen = new Map(); // value → index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
// Time: O(n) | Space: O(n)
```

### 2. Valid Anagram

```js
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  for (const c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}
// Time: O(n) | Space: O(1) (bounded alphabet)
```

### 3. Reverse a Linked List

```js
function reverseList(head) {
  let prev = null,
    cur = head;
  while (cur) {
    const next = cur.next; // save next
    cur.next = prev; // reverse pointer
    prev = cur; // advance prev
    cur = next; // advance cur
  }
  return prev; // new head
}
// Time: O(n) | Space: O(1)
```

### 4. Valid Parentheses

```js
function isValid(s) {
  const stack = [],
    map = { ")": "(", "]": "[", "}": "{" };
  for (const c of s) {
    if (c in map) {
      if (stack.pop() !== map[c]) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}
// Time: O(n) | Space: O(n)
```

### 5. Maximum Subarray (Kadane's algorithm)

```js
function maxSubArray(nums) {
  let maxSoFar = nums[0],
    curMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    // either extend the current subarray or start fresh at nums[i]
    curMax = Math.max(nums[i], curMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, curMax);
  }
  return maxSoFar;
}
// Time: O(n) | Space: O(1)
```

### 6. Merge Two Sorted Lists

```js
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode();
  let tail = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 || l2; // attach whatever remains
  return dummy.next;
}
// Time: O(n + m) | Space: O(1)
```

### 7. FizzBuzz

```js
function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push("FizzBuzz");
    else if (i % 3 === 0) out.push("Fizz");
    else if (i % 5 === 0) out.push("Buzz");
    else out.push(String(i));
  }
  return out;
}
// Time: O(n) | Space: O(n)
```

### 8. Longest Substring Without Repeating Characters

```js
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0,
    best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (lastSeen.has(c) && lastSeen.get(c) >= left) {
      left = lastSeen.get(c) + 1; // jump left past the duplicate
    }
    lastSeen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
// Time: O(n) | Space: O(min(n, alphabet))
```

### 9. Group Anagrams

```js
function groupAnagrams(strs) {
  const map = new Map();
  for (const str of strs) {
    const key = [...str].sort().join(""); // sorted chars = anagram signature
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(str);
  }
  return [...map.values()];
}
// Time: O(n · k log k) | Space: O(n · k), k = max string length
```

### 10. Binary Search

```js
function search(nums, target) {
  let lo = 0,
    hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
// Time: O(log n) | Space: O(1)
```

### 11. Find the Duplicate Number (Floyd's cycle detection)

```js
// Array of n+1 ints in [1, n]; exactly one duplicate. O(1) space, no mutation.
function findDuplicate(nums) {
  let slow = nums[0],
    fast = nums[0];
  do {
    // phase 1: find a meeting point inside the cycle
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  slow = nums[0]; // phase 2: find cycle entry = the duplicate
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}
// Time: O(n) | Space: O(1)
```

### 12. Climbing Stairs (DP)

```js
function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1,
    b = 2;
  for (let i = 3; i <= n; i++) [a, b] = [b, a + b];
  return b;
}
// Time: O(n) | Space: O(1)
```

### 13. Invert Binary Tree

```js
function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}
// Time: O(n) | Space: O(h) recursion stack
```

### 14. Binary Tree Level Order Traversal (BFS)

```js
function levelOrder(root) {
  if (!root) return [];
  const result = [],
    queue = [root];
  while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
// Time: O(n) | Space: O(n)
```

### 15. Contains Duplicate

```js
function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length; // a Set drops duplicates
}
// Time: O(n) | Space: O(n)
```

### 16. Move Zeroes (in-place)

```js
function moveZeroes(nums) {
  let insertPos = 0; // next slot for a non-zero
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[insertPos], nums[i]] = [nums[i], nums[insertPos]];
      insertPos++;
    }
  }
  return nums;
}
// Time: O(n) | Space: O(1)
```

### 17. Best Time to Buy and Sell Stock

```js
function maxProfit(prices) {
  let minPrice = Infinity,
    best = 0;
  for (const price of prices) {
    minPrice = Math.min(minPrice, price); // lowest buy seen so far
    best = Math.max(best, price - minPrice); // best profit if sold today
  }
  return best;
}
// Time: O(n) | Space: O(1)
```

---

## Tips for the Live Coding Round

- **Clarify before coding.** Restate the problem in your own words. Ask about input size, types, ranges, duplicates, empty/null inputs, sorted-or-not, and whether you can mutate the input. This catches misunderstandings early and shows rigor.
- **Think aloud.** Interviewers score your _process_, not just the final answer. Narrate your approach, the trade-offs you're weighing, and why you pick one structure over another.
- **Start with the brute force, then optimize.** "The naive solution is O(n²) with nested loops. I can get it to O(n) using a hash map because..." — this beats freezing while hunting for the optimal answer.
- **State complexity proactively.** Give time _and_ space Big-O for your approach before and after optimizing. If asked to improve it, say which bound you're targeting.
- **Write clean, idiomatic JS.** Meaningful names, small helper functions, `const`/`let` (never `var`), early returns over deep nesting. Avoid clever one-liners that hide bugs.
- **Handle edge cases explicitly.** Empty array, single element, all-duplicates, negatives, overflow, null/undefined, and the "not found" case. Mention them even if you don't code every guard.
- **Test your code by hand.** Dry-run a small example and a tricky edge case line by line. Track variable values out loud. Finding your own bug looks far better than the interviewer finding it.
- **Manage time.** If stuck, say so and propose a partial/brute-force solution rather than going silent. A working O(n²) beats a broken O(n).
- **What interviewers look for:** correctness, communication, code quality, complexity awareness, edge-case handling, debugging ability, and how you respond to hints (collaboratively, not defensively).
- **Don't over-engineer.** Solve the asked problem cleanly; don't gold-plate with unrequested abstractions.

---

## Further Reading

- [LeetCode](https://leetcode.com/) — practice problems; filter by company and topic; the "Top Interview 150" list is well-suited to MERN rounds.
- [NeetCode](https://neetcode.io/) — curated problem roadmap with clear video explanations grouped by pattern.
- [MDN: JavaScript reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript) — authoritative docs for array/Map/Set methods and their semantics.
- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/) — quick visual reference for data-structure and algorithm complexities.
