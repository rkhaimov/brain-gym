module Main (main) where

filter' :: (a -> Bool) -> [a] -> [a]
filter' predicate =
  foldr (onMap predicate) []
  where
    onMap f element acc =
      if f element
        then element : acc
        else acc

double :: [Int] -> [Int]
double = map' (* 2)

-- 80 page
-- run runghc main.hs
main = print $ show $ double [1, 2, 3]
