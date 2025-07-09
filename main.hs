module Main (main) where

zipWith' :: (a -> b -> c) -> [a] -> [b] -> [c]
zipWith' join as bs =
  if null as
    then []
    else
      let a = head as
       in let b = head bs
           in join a b : zipWith' join (tail as) (tail bs)

-- Creating Lazy Streams 105 page
-- runghc -Wincomplete-patterns main.hs
main = print $ show $ zipWith' (+) [1, 2, 3] [1, 2, 3]
