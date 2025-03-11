module Main (main) where

letWhereGreeting name place =
  let salutation = "Hello " <> name
      meetingInfo = location "Tuesday"
   in let date = 18
       in salutation <> " " <> meetingInfo <> show date
  where
    location day = "we met at " <> place <> " on a " <> day

-- run runghc main.hs
main = print $ letWhereGreeting "Jeff" "Bridge"
