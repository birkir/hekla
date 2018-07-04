echo "Setting up ssh-agent with write-access"
git config user.name "AppCenter"
git config user.email "travis@travis-ci.org"
echo -e "Host github.com\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
eval `ssh-agent -s`
ssh-add .travis/id_rsa
REPO=`git config remote.origin.url`
git remote set-url origin ${REPO/https:\/\/github.com\//git@github.com:}
git ls-remote

if [ -z "$APPCENTER_XCODE_PROJECT"]; then
fi

if [ -z "$APPCENTER_ANDROID_VARIANT" ]; then
fi
