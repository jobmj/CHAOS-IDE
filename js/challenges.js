const CHALLENGES = [
    {
        id: "two_sum",
        title: "Two Sum",
        category: "Arrays & Hashing",
        difficultyTag: "EASY",
        desc: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return the indices of the two numbers such that they add up to <code>target</code>.

You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice. You can return the answer in any order.`,
        inputFormat: "An integer list <code>nums</code> and an integer target value <code>target</code>.",
        outputFormat: "A list of two integers <code>[index1, index2]</code>.",
        constraints: [
            "2 <= len(nums) <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        sampleCases: [
            {
                input: "nums = [2, 7, 11, 15], target = 9",
                output: "[0, 1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                input: "nums = [3, 2, 4], target = 6",
                output: "[1, 2]",
                explanation: "nums[1] + nums[2] == 2 + 4 == 6. Indices are [1, 2]."
            }
        ],
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
print("✓ Sample Test 1: PASSED")
print("✓ Sample Test 2: PASSED")
print("✓ Hidden Test Suite: ALL ASSERTIONS VERIFIED")
`
    },
    {
        id: "valid_palindrome",
        title: "Valid Palindrome",
        category: "Two Pointers",
        difficultyTag: "EASY",
        desc: `A phrase is a <strong>palindrome</strong> if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string <code>s</code>, return <code>True</code> if it is a palindrome, or <code>False</code> otherwise.`,
        inputFormat: "A single string <code>s</code> consisting of printable ASCII characters.",
        outputFormat: "A boolean value (<code>True</code> or <code>False</code>).",
        constraints: [
            "1 <= len(s) <= 2 * 10^5",
            "s consists only of printable ASCII characters."
        ],
        sampleCases: [
            {
                input: 's = "A man, a plan, a canal: Panama"',
                output: "True",
                explanation: '"amanaplanacanalpanama" is a palindrome.'
            },
            {
                input: 's = "race a car"',
                output: "False",
                explanation: '"raceacar" is not a palindrome.'
            }
        ],
        starterCode: 
`def is_palindrome(s):
    """
    :type s: str
    :rtype: bool
    """
    pass
`,
        testScript: `
assert is_palindrome("A man, a plan, a canal: Panama") is True
assert is_palindrome("race a car") is False
assert is_palindrome(" ") is True
print("✓ Sample Test 1: PASSED")
print("✓ Sample Test 2: PASSED")
print("✓ Edge Case (Empty String): PASSED")
`
    },
    {
        id: "fizzbuzz",
        title: "FizzBuzz",
        category: "Math & Logic",
        difficultyTag: "EASY",
        desc: `Given an integer <code>n</code>, return a string array <code>answer</code> (1-indexed) where:
<ul>
  <li><code>answer[i] == "FizzBuzz"</code> if <code>i</code> is divisible by <code>3</code> and <code>5</code>.</li>
  <li><code>answer[i] == "Fizz"</code> if <code>i</code> is divisible by <code>3</code>.</li>
  <li><code>answer[i] == "Buzz"</code> if <code>i</code> is divisible by <code>5</code>.</li>
  <li><code>answer[i] == str(i)</code> (as a string) if none of the above conditions are true.</li>
</ul>`,
        inputFormat: "An integer <code>n</code>.",
        outputFormat: "A list of strings of length <code>n</code>.",
        constraints: [
            "1 <= n <= 10^4"
        ],
        sampleCases: [
            {
                input: "n = 3",
                output: '["1", "2", "Fizz"]',
                explanation: "3 is divisible by 3."
            },
            {
                input: "n = 5",
                output: '["1", "2", "Fizz", "4", "Buzz"]',
                explanation: "5 is divisible by 5."
            }
        ],
        starterCode: 
`def fizz_buzz(n):
    """
    :type n: int
    :rtype: List[str]
    """
    pass
`,
        testScript: `
assert fizz_buzz(3) == ["1", "2", "Fizz"]
assert fizz_buzz(5) == ["1", "2", "Fizz", "4", "Buzz"]
assert fizz_buzz(15)[14] == "FizzBuzz"
print("✓ Multiples of 3 & 5 PASSED")
print("✓ Array Bounds PASSED")
`
    },
    {
        id: "valid_parentheses",
        title: "Valid Parentheses",
        category: "Stack",
        difficultyTag: "EASY",
        desc: `Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.

An input string is valid if:
<ol>
  <li>Open brackets must be closed by the same type of brackets.</li>
  <li>Open brackets must be closed in the correct order.</li>
  <li>Every close bracket has a corresponding open bracket of the same type.</li>
</ol>`,
        inputFormat: "A string <code>s</code> of bracket characters.",
        outputFormat: "A boolean value (<code>True</code> or <code>False</code>).",
        constraints: [
            "1 <= len(s) <= 10^4",
            "s consists of parentheses only '()[]{}'."
        ],
        sampleCases: [
            {
                input: 's = "()"',
                output: "True",
                explanation: "Matches expected closure."
            },
            {
                input: 's = "(]"',
                output: "False",
                explanation: "Closing bracket does not match open bracket."
            }
        ],
        starterCode: 
`def is_valid(s):
    """
    :type s: str
    :rtype: bool
    """
    pass
`,
        testScript: `
assert is_valid("()") is True
assert is_valid("()[]{}") is True
assert is_valid("(]") is False
assert is_valid("([)]") is False
assert is_valid("{[]}") is True
print("✓ All Bracket Combinations PASSED")
`
    },
    {
        id: "max_subarray",
        title: "Maximum Subarray",
        category: "Dynamic Programming",
        difficultyTag: "MEDIUM",
        desc: `Given an integer array <code>nums</code>, find the subarray with the largest sum, and return <em>its sum</em>.

A <strong>subarray</strong> is a contiguous non-empty sequence of elements within an array.`,
        inputFormat: "An integer list <code>nums</code>.",
        outputFormat: "An integer representing the maximum subarray sum.",
        constraints: [
            "1 <= len(nums) <= 10^5",
            "-10^4 <= nums[i] <= 10^4"
        ],
        sampleCases: [
            {
                input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
                output: "6",
                explanation: "The subarray [4, -1, 2, 1] has the largest sum 6."
            },
            {
                input: "nums = [1]",
                output: "1",
                explanation: "The single element subarray [1] has the largest sum 1."
            }
        ],
        starterCode: 
`def max_sub_array(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    pass
`,
        testScript: `
assert max_sub_array([-2,1,-3,4,-1,2,1,-5,4]) == 6
assert max_sub_array([1]) == 1
assert max_sub_array([5,4,-1,7,8]) == 23
print("✓ Kadane's General Assertions PASSED")
print("✓ Single-Element & Negative Subarrays PASSED")
`
    },
    {
        id: "reverse_string",
        title: "Reverse String",
        category: "Arrays",
        difficultyTag: "EASY",
        desc: `Write a function that reverses a string. The input string is given as an array of characters <code>s</code>.

You must do this by modifying the input array <strong>in-place</strong> with <code>O(1)</code> extra memory. Do not return anything.`,
        inputFormat: "A list of single-character strings <code>s</code>.",
        outputFormat: "None (Mutates array in-place).",
        constraints: [
            "1 <= len(s) <= 10^5",
            "s[i] is a printable ascii character."
        ],
        sampleCases: [
            {
                input: 's = ["h","e","l","l","o"]',
                output: '["o","l","l","e","h"]',
                explanation: "Reversed in-place."
            }
        ],
        starterCode: 
`def reverse_string(s):
    """
    :type s: List[str]
    :rtype: None Do not return anything, modify s in-place instead.
    """
    pass
`,
        testScript: `
a = ["h","e","l","l","o"]
reverse_string(a)
assert a == ["o","l","l","e","h"]
b = ["H","a","n","n","a","h"]
reverse_string(b)
assert b == ["h","a","n","n","a","H"]
print("✓ In-Place Character Reversal PASSED")
`
    },
    {
        id: "single_number",
        title: "Single Number",
        category: "Bit Manipulation",
        difficultyTag: "EASY",
        desc: `Given a non-empty array of integers <code>nums</code>, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.`,
        inputFormat: "An integer list <code>nums</code>.",
        outputFormat: "The single unique integer.",
        constraints: [
            "1 <= len(nums) <= 3 * 10^4",
            "-3 * 10^4 <= nums[i] <= 3 * 10^4",
            "Each element appears twice except for one element which appears once."
        ],
        sampleCases: [
            {
                input: "nums = [2, 2, 1]",
                output: "1",
                explanation: "2 occurs twice, 1 occurs once."
            },
            {
                input: "nums = [4, 1, 2, 1, 2]",
                output: "4",
                explanation: "4 is the only number occurring once."
            }
        ],
        starterCode: 
`def single_number(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    pass
`,
        testScript: `
assert single_number([2, 2, 1]) == 1
assert single_number([4, 1, 2, 1, 2]) == 4
assert single_number([1]) == 1
print("✓ Bitwise Parity / Single Extraction PASSED")
`
    },
    {
        id: "contains_duplicate",
        title: "Contains Duplicate",
        category: "Hash Set",
        difficultyTag: "EASY",
        desc: `Given an integer array <code>nums</code>, return <code>True</code> if any value appears at least twice in the array, and return <code>False</code> if every element is distinct.`,
        inputFormat: "An integer list <code>nums</code>.",
        outputFormat: "A boolean value (<code>True</code> or <code>False</code>).",
        constraints: [
            "1 <= len(nums) <= 10^5",
            "-10^9 <= nums[i] <= 10^9"
        ],
        sampleCases: [
            {
                input: "nums = [1, 2, 3, 1]",
                output: "True",
                explanation: "1 appears at index 0 and 3."
            },
            {
                input: "nums = [1, 2, 3, 4]",
                output: "False",
                explanation: "All elements are distinct."
            }
        ],
        starterCode: 
`def contains_duplicate(nums):
    """
    :type nums: List[int]
    :rtype: bool
    """
    pass
`,
        testScript: `
assert contains_duplicate([1,2,3,1]) is True
assert contains_duplicate([1,2,3,4]) is False
assert contains_duplicate([1,1,1,3,3,4,3,2,4,2]) is True
print("✓ Hash Frequency / Duplicate Assertions PASSED")
`
    },
    {
        id: "climbing_stairs",
        title: "Climbing Stairs",
        category: "Dynamic Programming",
        difficultyTag: "EASY",
        desc: `You are climbing a staircase. It takes <code>n</code> steps to reach the top.

Each time you can either climb <code>1</code> or <code>2</code> steps. In how many distinct ways can you climb to the top?`,
        inputFormat: "An integer <code>n</code>.",
        outputFormat: "An integer representing the number of distinct ways.",
        constraints: [
            "1 <= n <= 45"
        ],
        sampleCases: [
            {
                input: "n = 2",
                output: "2",
                explanation: "1. 1 step + 1 step\n2. 2 steps"
            },
            {
                input: "n = 3",
                output: "3",
                explanation: "1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step"
            }
        ],
        starterCode: 
`def climb_stairs(n):
    """
    :type n: int
    :rtype: int
    """
    pass
`,
        testScript: `
assert climb_stairs(2) == 2
assert climb_stairs(3) == 3
assert climb_stairs(5) == 8
print("✓ Fibonacci State Progression PASSED")
`
    },
    {
        id: "merge_sorted_arrays",
        title: "Merge Sorted Array",
        category: "Two Pointers",
        difficultyTag: "EASY",
        desc: `You are given two integer arrays <code>nums1</code> and <code>nums2</code>, sorted in non-decreasing order, and two integers <code>m</code> and <code>n</code>, representing the number of elements in <code>nums1</code> and <code>nums2</code> respectively.

Merge <code>nums1</code> and <code>nums2</code> into a single array sorted in non-decreasing order inside <code>nums1</code> in-place.`,
        inputFormat: "<code>nums1</code> (size m+n), integer <code>m</code>, <code>nums2</code> (size n), integer <code>n</code>.",
        outputFormat: "None (Mutate <code>nums1</code> in-place).",
        constraints: [
            "nums1.length == m + n",
            "nums2.length == n",
            "0 <= m, n <= 200"
        ],
        sampleCases: [
            {
                input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
                output: "[1,2,2,3,5,6]",
                explanation: "The arrays we are merging are [1,2,3] and [2,5,6]."
            }
        ],
        starterCode: 
`def merge(nums1, m, nums2, n):
    """
    :type nums1: List[int]
    :type m: int
    :type nums2: List[int]
    :type n: int
    :rtype: None Do not return anything, modify nums1 in-place instead.
    """
    pass
`,
        testScript: `
n1 = [1,2,3,0,0,0]
merge(n1, 3, [2,5,6], 3)
assert n1 == [1,2,2,3,5,6]
n2 = [1]
merge(n2, 1, [], 0)
assert n2 == [1]
print("✓ Two-Pointer Reverse Merge In-Place PASSED")
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