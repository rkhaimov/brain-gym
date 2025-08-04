module Main (main) where

data List a = Empty | Cons a (List a)

fromList :: [a] -> List a
fromList = foldr Cons Empty

toList :: List a -> [a]
toList = foldr' (:) []

foldr' :: (a -> b -> b) -> b -> List a -> b
foldr' _ b Empty = b
foldr' f b (Cons x xs) = f x (foldr' f b xs)

foldl' :: (b -> a -> b) -> b -> List a -> b
foldl' _ b Empty = b
foldl' f b (Cons x xs) = foldl' f (f b x) xs

head' :: List a -> Maybe a
head' Empty = Nothing
head' (Cons x _) = Just x

reverse' :: List a -> List a
reverse' = foldl' (flip Cons) Empty

-- 160 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = print $ show $ toList $ reverse' $ fromList [1, 2, 3]
