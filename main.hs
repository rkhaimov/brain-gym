module Main where

makeGreeting = (<>) . (<> " ")

-- run runghc main.hs
main = print $ makeGreeting "Hello" "Jeff"
