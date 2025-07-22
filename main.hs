module Main (main) where

n :: Int
n = _

-- Creating Lazy Streams 131 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = print $ show $ concatMap' (* 2) [[1, 2], [3, 4]]
