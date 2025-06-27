module Main (main) where

fibs :: [Int]
fibs = _fibs 0 1
  where
    _fibs :: Int -> Int -> [Int]
    _fibs fst snd = fst : _fibs snd (fst + snd)

-- Creating Lazy Streams 105 page
-- runghc -Wincomplete-patterns main.hs
main = print $ show $ fibs !! 50
