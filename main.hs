module Main (main) where

import Language.Haskell.TH (prim)

countdown :: Integer -> [Integer]
countdown n
  | n == 0 = [0]
  | otherwise = n : countdown (n - 1)
  
range = reverse . countdown

-- 73 page
-- run runghc main.hs
main = print $ show $ range 2
