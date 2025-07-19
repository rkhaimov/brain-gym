module Main (main) where

concatMap' aToB = foldl mapConcat []
  where
    mapConcat bs as = bs <> map aToB as

-- Creating Lazy Streams 110 page
-- runghc -Wincomplete-patterns main.hs
main = print $ show $ concatMap' (* 2) [[1, 2], [3, 4]]
