module Main (main) where

reverse' :: [Int] -> [Int]
reverse' = foldr concat' []
  where
    concat' :: Int -> [Int] -> [Int]
    concat' n ns = ns <> [n]

-- Creating Lazy Streams 105 page
-- runghc -Wincomplete-patterns main.hs
main = print $ show $ reverse' [1, 2, 3, 4]
