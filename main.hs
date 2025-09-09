module Main where

class (Eq a) => Box a where
  value :: a

unique :: (Eq a) => [a] -> [a]
unique [] = []
unique (a : as) = a : unique (filter (/= a) as)

-- 231 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = undefined
