module Main (main) where

reduce mapper initial values =
  if null values
    then initial
    else
      let mapped = mapper initial (head values)
       in reduce mapper mapped (tail values)

isBalanced :: String -> Bool
isBalanced brackets =
  0 == count brackets
  where
    -- brackets аргумент игнорируется
    count = reduce (\count char -> if char == '(' then count + 1 else count - 1) 0

-- 73 page
-- run runghc main.hs
main = print $ show $ isBalanced ")))((("
