const CHALLENGES = [
    {
        id: "two_sum",
        title: "Challenge: Two Sum",
        desc: "Return the indices of the two numbers that add up to target: target=9, nums=[2, 7, 11, 15] -> [0, 1]",
        starterCode: 
`def two_sum(nums, target):
    seen = {}
    for i in range(len(nums)):
        diff = target - nums[i]
        if diff in seen:
            return [seen[diff], i]
        seen[nums[i]] = i
    return []
`,
        solutionKeywords: ["target -", "seen[diff]", "seen[nums[i]] = i"],
        antiKeywords: ["* 0", "!=", "range(len(nums)) + 1"]
    },
    {
        id: "palindrome",
        title: "Challenge: Valid Palindrome",
        desc: "Return True if string s reads the same backwards, else False (e.g. 'racecar' -> True).",
        starterCode:
`def is_palindrome(s):
    cleaned = "".join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]
`,
        solutionKeywords: ["cleaned == cleaned[::-1]"],
        antiKeywords: ["* 0", "!=", "[::-2]"]
    },
    {
        id: "fizzbuzz",
        title: "Challenge: Mini FizzBuzz",
        desc: "Return 'Fizz' if n is div by 3, 'Buzz' if div by 5, 'FizzBuzz' if both, else str(n).",
        starterCode:
`def fizz_buzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    return str(n)
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