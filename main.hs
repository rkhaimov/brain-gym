module Main (main) where

data Peano = Zero | Successor Peano

toPeano :: Int -> Peano
toPeano 0 = Zero
toPeano n = Successor $ toPeano (n - 1)

fromPeano :: Peano -> Int
fromPeano Zero = 0
fromPeano (Successor of') = 1 + fromPeano of'

isPeanoEquals :: Peano -> Peano -> Bool
isPeanoEquals Zero Zero = True
isPeanoEquals (Successor ls) (Successor rs) = isPeanoEquals ls rs
isPeanoEquals _ _ = False

addPeano :: Peano -> Peano -> Peano
addPeano Zero right = right
addPeano (Successor ls) right = addPeano ls (Successor right)

-- 157 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = print $ show $ fromPeano $ addPeano (toPeano 5) (toPeano 10)
