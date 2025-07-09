module Main (main) where

zipWith' join = foldr onA onB
  where
    onB bs = []
    onA a onBF [] = []
    onA a onBF (b : bs) = join a b : onBF bs

-- Creating Lazy Streams 110 page
-- runghc -Wincomplete-patterns main.hs
main = print $ show $ zipWith' (,) [1, 2, 3] [4, 5, 6]
