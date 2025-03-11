module Main (main) where
import Language.Haskell.TH (prim)

factorial n =
  if n == 1
    then 1
    else n * factorial (n - 1)

-- run runghc main.hs
main = print $ show $ factorial 5
