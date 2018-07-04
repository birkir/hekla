# Cancel builds with [skip ci] as AppCenter's Build Machines don't currently do this.
COMMIT_MESSAGE=$(git log -1 --pretty=%B)

# echo "Setting up ssh-agent with write-access"
# git config user.name "AppCenter"
# git config user.email "travis@travis-ci.org"
# echo -e "Host github.com\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
# eval `ssh-agent -s`
# ssh-add .travis/id_rsa
# REPO=`git config remote.origin.url`
# git remote set-url origin ${REPO/https:\/\/github.com\//git@github.com:}
# git ls-remote

echo "hello" > hello.txt
git add hello.txt
git commit -m "Test commit"

echo $ID_RSA | base64 --decode > id_rsa
chmod 400 id_rsa
eval `ssh-agent -s`
ssh-add id_rsa
git config user.name "Travis CI"
git config user.email "travis@travis-ci.org"
REPO=`git config remote.origin.url`
git remote set-url origin ${REPO/https:\/\/github.com\//git@github.com:}
echo $REPO
git ls-remote
git push -f origin master
rm -rf id_rsa

if [ -z "$APPCENTER_XCODE_PROJECT"]; then
  echo "ios"
fi

if [ -z "$APPCENTER_ANDROID_VARIANT" ]; then
  echo "android"
fi


if [[ $COMMIT_MESSAGE = *"[skip ci]"* ]]; then

  if [ -z "$APPCENTER_XCODE_PROJECT"]; then
    APPCENTER_APPID="$IOS_CODEPUSH_APPID"
  fi

  if [ -z "$APPCENTER_ANDROID_VARIANT" ]; then
    APPCENTER_APPID="$ANDROID_CODEPUSH_APPID"
  fi

  curl -X PATCH "https://api.appcenter.ms/v0.1/apps/$APPCENTER_APPID/builds/$APPCENTER_BUILD_ID" -H "accept: application/json" -H "X-API-Token: $APPCENTER_API_KEY" -H "Content-Type: application/json" -d "{ \"status\": \"cancelling\" }"
fi
