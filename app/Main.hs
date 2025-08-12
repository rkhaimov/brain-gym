module Main where

import Data.Char (isPrint)
import Utils (myUtil)

countNonPrintableCharacters :: String -> Int
countNonPrintableCharacters = length . filter (not . isPrint)

-- cabal build lib:brain-gym
-- cabal build exe:brain-gym
-- cabal exec brain-gym
-- cabal run brain-gym
main :: IO ()
main = print (countNonPrintableCharacters ("Hello, Haskell!" <> myUtil))
