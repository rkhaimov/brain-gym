module Main where

class (Eq a) => Printable a where
  toPrintable :: a -> String

instance Printable Int where
  toPrintable = show

data A = A

instance (Eq A) => Printable A where
  toPrintable = show

s = toPrintable (A)

class (Show a, Eq a) => Box a where
  value :: a

instance Box Int where
  value = 0

unique :: (Eq a) => [a] -> [a]
unique [] = []
unique (a : as) = a : unique (filter (/= a) as)

-- 236 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = undefined
