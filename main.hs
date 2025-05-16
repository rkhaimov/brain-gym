module Main (main) where

-- Returns all prime factors of an integer.
-- By definition:
--  * for 1 returns empty factors
--  * for prime returns an array of single element with that prime
factors :: Int -> [Int]
factors n =
  factors' n 2
  where
    factors' n divider
      | n == 1 = []
      | n `rem` divider == 0 = divider : factors' (n `div` divider) divider
      | otherwise = factors' n (divider + 1)

-- 73 page
-- run runghc main.hs
main = print $ show $ factors 12
