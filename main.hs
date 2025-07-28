module Main (main) where

data CustomerInfo = CustomerInfo
  { firstName :: String,
    lastName :: String,
    widgetCount :: Int,
    balance :: Int
  }

-- Creating Lazy Streams 142 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = print (show undefined)
