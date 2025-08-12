module Utils (Name (..), myUtil) where

myUtil :: String
myUtil = "42"

data Name = Name
  { value :: String
  }