module Main where

data Box a = Box
  { value :: a
  }

--Type class definition example
--class Eq a where
---- (==) :: a -> a -> Bool

instance Eq (Box Int) where
  (==) left right = value left == value right

unique :: Eq a => [a] -> [a]
unique [] = []
unique (a : as) = a : unique (filter (/= a) as)

-- 231 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = undefined
