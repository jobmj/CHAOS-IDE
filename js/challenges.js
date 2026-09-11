const CHALLENGES = [
    {
        id: "two_sum",
        title: "Challenge: Two Sum",
        desc: "Return the indices of the two numbers that add up to target: target=9, nums=[2, 7, 11, 15] -> [0, 1]",
        // Starter code is now just comments and the function signature
        starterCode: 
`# Challenge: Two Sum
# Return the indices of the two numbers that add up to target.
# Example: target=9, nums=[2, 7, 11, 15] -> [0, 1]

def two_sum(nums, target):
    # Write your code here...
    pass
`,
        solutionKeywords: ["target -", "seen[diff]", "seen[nums[i]] = i"],
        antiKeywords: ["* 0", "!=", "range(len(nums)) + 1"]
    },
    {
        id: "palindrome",
        title: "Challenge: Valid Palindrome",
        desc: "Return True if string s reads the same backwards, else False (e.g. 'racecar' -> True).",
        // Starter code is now just comments and the function signature
        starterCode:
`# Challenge: Valid Palindrome
# Return True if string s reads the same backwards, else False.
# Example: 'racecar' -> True

def is_palindrome(s):
    # Write your code here...
    pass
`,
        solutionKeywords: ["cleaned == cleaned[::-1]"],
        antiKeywords: ["* 0", "!=", "[::-2]"]
    },
    {
        id: "fizzbuzz",
        title: "Challenge: Mini FizzBuzz",
        desc: "Return 'Fizz' if n is div by 3, 'Buzz' if div by 5, 'FizzBuzz' if both, else str(n).",
        // Starter code is now just comments and the function signature
        starterCode:
`# Challenge: Mini FizzBuzz
# Return 'Fizz' if n is div by 3, 'Buzz' if div by 5, 'FizzBuzz' if both, else str(n).

def fizz_buzz(n):
    # Write your code here...
    pass
`,
        solutionKeywords: ["n % 15 == 0", "n % 3 == 0", "n % 5 == 0"],
        antiKeywords: ["* 0", "!=", "n % 15 != 0"]
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