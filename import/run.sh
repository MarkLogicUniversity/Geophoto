FILES=`ls es6 | grep es6`;
for f in $FILES
do
  n=`basename $f .es6`
  `babel es6/$f --out-file lib/$n.js`
done

files=`ls es6 | grep es6`
for f in $FILES
do
  n=`basename $f .es6`
  `babel es6/$f --out-file lib/merged.js`
done
