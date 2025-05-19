module Main (main) where

isBalanced :: String -> Bool
isBalanced brackets =
  0 == count brackets
  where
    -- brackets аргумент игнорируется
    count = foldl (\count char -> if char == '(' then count + 1 else count - 1) 0

-- 76 page
-- run runghc main.hs
main = print $ show $ isBalanced ")))((("
