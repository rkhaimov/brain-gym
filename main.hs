import Text.Read (Lexeme (Char, String), readMaybe)

data BinaryTree
  = Leaf
  | Branch BinaryTree Int BinaryTree

add' :: Int -> BinaryTree -> BinaryTree
add' value tree =
  case tree of
    Leaf -> Branch Leaf value Leaf
    Branch left n right ->
      if value == n
        then Branch left n right
        else
          if value < n
            then Branch (add' value left) n right
            else Branch left n (add' value right)

showStringTree :: BinaryTree -> String
showStringTree tree =
  case tree of
    Leaf -> "Leaf"
    Branch left value right -> show value <> " ( " <> showStringTree left <> " " <> showStringTree right <> " ) "

doesIntExist :: Int -> BinaryTree -> Bool
doesIntExist value tree =
  case tree of
    Leaf -> False
    Branch left n right -> (n == value) || (if value < n then doesIntExist value left else doesIntExist value right)

-- 173 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = print $ doesIntExist 5 $ add' 1 $ add' 4 $ add' 2 Leaf
