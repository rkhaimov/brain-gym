module Main where

makeGreeting salutation person = salutation <> " " <> person

-- run runghc main.hs
main = print $ makeGreeting "Hello" "Jeff"
