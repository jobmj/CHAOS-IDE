const CHALLENGES = [
    {
        id: "two_sum",
        title: "Challenge 01: Two Sum",
        category: "Arrays & Hashing",
        desc: "Return the indices of the two numbers that add up to target. Example: nums=[2, 7, 11, 15], target=9 -> [0, 1].",
        starterCode: 
`def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    pass
`,
        testScript: `
assert sorted(two_sum([2, 7, 11, 15], 9)) == [0, 1], f"Failed: expected [0, 1], got {two_sum([2, 7, 11, 15], 9)}"
assert sorted(two_sum([3, 2, 4], 6)) == [1, 2], f"Failed: expected [1, 2], got {two_sum([3, 2, 4], 6)}"
assert sorted(two_sum([3, 3], 6)) == [0, 1], f"Failed: expected [0, 1], got {two_sum([3, 3], 6)}"
print("✓ Test 1: [2, 7, 11, 15], target=9 -> [0, 1] PASSED")
print("✓ Test 2: [3, 2, 4], target=6 -> [1, 2] PASSED")
print("✓ Test 3: [3, 3], target=6 -> [0, 1] PASSED")
`
    },
    {
        id: "valid_palindrome",
        title: "Challenge 02: Valid Palindrome",
        category: "Two Pointers",
        desc: "Return True if string s reads the same backwards after converting to lowercase and stripping non-alphanumeric chars.",
        starterCode: 
`def is_palindrome(s):
    """
    :type s: str
    :rtype: bool
    """
    pass
`,
        testScript: `
assert is_palindrome("A man, a plan, a canal: Panama") is True, "Failed on 'A man, a plan, a canal: Panama'"
assert is_palindrome("race a car") is False, "Failed on 'race a car'"
assert is_palindrome(" ") is True, "Failed on empty/space string"
print("✓ Test 1: Palindrome sentence with punctuation PASSED")
print("✓ Test 2: Invalid palindrome rejected PASSED")
print("✓ Test 3: Empty string edge-case PASSED")
`
    },
    {
        id: "fizzbuzz",
        title: "Challenge 03: Classic FizzBuzz",
        category: "Math & Logic",
        desc: "Return a list of strings from 1 to n where multiples of 3 are 'Fizz', multiples of 5 are 'Buzz', and both are 'FizzBuzz'.",
        starterCode: 
`def fizz_buzz(n):
    """
    :type n: int
    :rtype: List[str]
    """
    pass
`,
        testScript: `
assert fizz_buzz(3) == ["1", "2", "Fizz"], f"Got {fizz_buzz(3)}"
assert fizz_buzz(5) == ["1", "2", "Fizz", "4", "Buzz"], f"Got {fizz_buzz(5)}"
assert fizz_buzz(15)[14] == "FizzBuzz", f"Index 14 should be FizzBuzz, got {fizz_buzz(15)[14]}"
print("✓ Test 1: n=3 PASSED")
print("✓ Test 2: n=5 PASSED")
print("✓ Test 3: n=15 FizzBuzz boundary PASSED")
`
    },
    {
        id: "reverse_string",
        title: "Challenge 04: In-Place Reverse",
        category: "Arrays",
        desc: "Modify the list of characters s in-place so it is reversed. Do not return anything, mutate s directly.",
        starterCode: 
`def reverse_string(s):
    """
    :type s: List[str]
    :rtype: None
    """
    pass
`,
        testScript: `
a = ["h","e","l","l","o"]
reverse_string(a)
assert a == ["o","l","l","e","h"], f"Expected ['o','l','l','e','h'], got {a}"

b = ["H","a","n","n","a","h"]
reverse_string(b)
assert b == ["h","a","n","n","a","H"], f"Expected ['h','a','n','n','a','H'], got {b}"
print("✓ Test 1: Odd-length reverse PASSED")
print("✓ Test 2: Even-length reverse PASSED")
`
    },
    {
        id: "valid_parentheses",
        title: "Challenge 05: Valid Parentheses",
        category: "Stack",
        desc: "Given a string containing '()[]{}', determine if the input string is valid.",
        starterCode: 
`def is_valid(s):
    """
    :type s: str
    :rtype: bool
    """
    pass
`,
        testScript: `
assert is_valid("()") is True, "Failed on '()'"
assert is_valid("()[]{}") is True, "Failed on '()[]{}'"
assert is_valid("(]") is False, "Failed on '(]'"
assert is_valid("([)]") is False, "Failed on '([)]'"
assert is_valid("{[]}") is True, "Failed on '{[]}'"
print("✓ All 5 bracket test configurations PASSED")
`
    },
    {
        id: "max_subarray",
        title: "Challenge 06: Maximum Subarray",
        category: "Dynamic Programming",
        desc: "Find the contiguous subarray which has the largest sum and return its sum.",
        starterCode: 
`def max_sub_array(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    pass
`,
        testScript: `
assert max_sub_array([-2,1,-3,4,-1,2,1,-5,4]) == 6, "Expected 6"
assert max_sub_array([1]) == 1, "Expected 1"
assert max_sub_array([5,4,-1,7,8]) == 23, "Expected 23"
print("✓ All Kadane algorithm cases PASSED")
`
    },
    {
        id: "single_number",
        title: "Challenge 07: Single Number",
        category: "Bit Manipulation",
        desc: "Every element in nums appears twice except for one. Find and return that single one.",
        starterCode: 
`def single_number(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    pass
`,
        testScript: `
assert single_number([2, 2, 1]) == 1, "Failed on [2, 2, 1]"
assert single_number([4, 1, 2, 1, 2]) == 4, "Failed on [4, 1, 2, 1, 2]"
assert single_number([1]) == 1, "Failed on [1]"
print("✓ XOR / parity test assertions PASSED")
`
    },
    {
        id: "contains_duplicate",
        title: "Challenge 08: Contains Duplicate",
        category: "Hash Set",
        desc: "Return True if any value appears at least twice in the array, and False if every element is distinct.",
        starterCode: 
`def contains_duplicate(nums):
    """
    :type nums: List[int]
    :rtype: bool
    """
    pass
`,
        testScript: `
assert contains_duplicate([1,2,3,1]) is True, "Failed on duplicate array"
assert contains_duplicate([1,2,3,4]) is False, "Failed on distinct array"
assert contains_duplicate([1,1,1,3,3,4,3,2,4,2]) is True, "Failed on multi-duplicates"
print("✓ Duplicate detection assertions PASSED")
`
    },
    {
        id: "climbing_stairs",
        title: "Challenge 09: Climbing Stairs",
        category: "Dynamic Programming",
        desc: "It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?",
        starterCode: 
`def climb_stairs(n):
    """
    :type n: int
    :rtype: int
    """
    pass
`,
        testScript: `
assert climb_stairs(2) == 2, "Expected 2 for n=2"
assert climb_stairs(3) == 3, "Expected 3 for n=3"
assert climb_stairs(5) == 8, "Expected 8 for n=5"
print("✓ Fibonacci step DP assertions PASSED")
`
    },
    {
        id: "merge_sorted_arrays",
        title: "Challenge 10: Merge Sorted Array",
        category: "Two Pointers",
        desc: "Merge sorted arrays nums1 and nums2 into nums1 as one sorted array in-place.",
        starterCode: 
`def merge(nums1, m, nums2, n):
    """
    :type nums1: List[int]
    :type m: int
    :type nums2: List[int]
    :type n: int
    :rtype: None
    """
    pass
`,
        testScript: `
n1 = [1,2,3,0,0,0]
merge(n1, 3, [2,5,6], 3)
assert n1 == [1,2,2,3,5,6], f"Expected [1,2,2,3,5,6], got {n1}"

n2 = [1]
merge(n2, 1, [], 0)
assert n2 == [1], f"Expected [1], got {n2}"
print("✓ In-place two-pointer merge assertions PASSED")
`
    }
];

let currentChallengeIndex = 0;

function getCurrentChallenge() {
    return CHALLENGES[currentChallengeIndex];
}

function nextChallenge() {
    currentChallengeIndex = (currentChallengeIndex + 1) % CHALLENGES.length;
    return getCurrentChallenge();
}