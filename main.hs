module Main (main) where

pairs :: [Int] -> [Int] -> [(Int, Int)]
pairs as bs = [(a, b) | a <- as, a `elem` bs, b <- bs, odd b]

-- 87 page
-- run runghc main.hs
main = print $ show $ pairs [1, 2, 3]
