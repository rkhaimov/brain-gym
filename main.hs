module Main (main) where

pairs = uncurry (+)

-- 87 page
-- run runghc main.hs
main = print $ show $ pairs [1, 2, 3]
