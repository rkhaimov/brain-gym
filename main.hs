module Main (main) where

partialFunction 0 = "I only work for 0"

-- 90 page
-- run runghc -Wincomplete-patterns main.hs
main = print $ show $ partialFunction 1
