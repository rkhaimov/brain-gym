module Main (main) where

fib :: Int -> Int
fib 0 = 0
fib 1 = 1
fib n = fib (n - 1) + fib (n - 2)

fibs = map fib [0 ..]

-- 99 page
-- run runghc -Wincomplete-patterns main.hs
main = print $ show $ fibs !! 5
