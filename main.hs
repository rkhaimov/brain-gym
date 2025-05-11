module Main (main) where
import Language.Haskell.TH (prim)

fibonacci n
    | n == 0 = 0
    | n == 1 = 1
    | otherwise = fibonacci (n - 1) + fibonacci (n - 2)

-- 71 page
-- run runghc main.hs
main = print $ show $ fibonacci 10
