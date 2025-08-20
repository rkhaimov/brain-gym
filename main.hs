module Main where

data Box a = Box
  { value :: a
  }

instance Eq (Box Int) where
  (==) left right = value left == value right

-- 231 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = undefined
