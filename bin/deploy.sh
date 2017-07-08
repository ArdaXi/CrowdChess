#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
  exit 0;
fi

REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

openssl aes-256-cbc -K $encrypted_96b8b63b1486_key -iv $encrypted_96b8b63b1486_iv -in cs_travis_rsa.enc -out cs_travis_rsa -d
chmod 600 cs_travis_rsa
eval `ssh-agent -s`
ssh-add cs_travis_rsa

git clone $REPO dist
cd dist
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
cd ..

# Clean out existing contents
rm -rf dist/**/* || exit 0

gulp dist

cd dist

git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"

git add -A .
git commit -m "Deploy to GitHub Pages: ${SHA}"

git push $SSH_REPO $TARGET_BRANCH
