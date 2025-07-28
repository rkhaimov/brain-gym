module Main (main) where


data LeftType
data RightType

onLeft :: LeftType -> Int
onLeft left = onRight left;

onRight :: RightType -> Int
onRight right = undefined;

--Couldn't match expected type ‘RightType’ with actual type ‘LeftType’

-- Creating Lazy Streams 134 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = print (show undefined)
