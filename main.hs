module Main (main) where

printSmallNumber num =
  if num < 10
    then print num
    else print "the number is too big!"

guardSize num
  | num < 3 = "that's a small number"
  | num < 10 = "that's a medium number"
  | num < 100 = "that's a pretty big number"
  | num < 1000 = "wow, that's a giant number"
  | otherwise = "that's an unfathomably big number"

-- run runghc main.hs
main = printSmallNumber 10
