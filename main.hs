module Main (main) where

addValues [] = 0
addValues (first : rest) = first + (addValues rest)

modifyPair ("Hello", _) = "this is a salutation"
modifyPair (_, "George") = "this is a message for George"
modifyPair p = "I don't know what " <> show p <> " means"

favoriteFood person =
  case person of
    "Ren" -> "Tofu"
    "Rebecca" -> "Falafel"
    "George" -> "Banana"
    name -> "I Don't Know what " <> name <> " likes!"

handleNums l =
  case l of
    [] -> "An empty list"
    [x]
      | x == 0 -> "a list called: [0]"
      | x == 1 -> "a singular list of [1]"
      | even x -> "a singleton list containing an even number"
      | otherwise -> "the list contains " <> (show x)
    _list -> "the list has more than 1 element"

-- 90 page
-- run runghc main.hs
main = print $ show $ addValues [1, 2, 3]
