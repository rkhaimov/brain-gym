module Main (main) where

mapApply :: [a -> b] -> [a] -> [b]
mapApply fs = concatMap (mapEvery fs)
  where
    mapEvery :: [a -> b] -> a -> [b]
    mapEvery fs a = map ($ a) fs

-- Creating Lazy Streams 134 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = print (show undefined)
