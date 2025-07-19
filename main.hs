module Main (main) where

concatMap' aToB = foldr mapConcat []
  where
    mapConcat as bs = map aToB as <> bs

-- Creating Lazy Streams 122 page
-- runghc -Wincomplete-patterns main.hs
main = print $ show $ concatMap' (* 2) [[1, 2], [3, 4]]
