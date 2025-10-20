module Main where

readFloat = read @Float

adheresToReadShowContract :: forall a. (Show a, Read a) => a -> Bool
adheresToReadShowContract val =
  let a = show . (read @a) . show $ val
      b = show val
   in a == b

-- 264 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = undefined
