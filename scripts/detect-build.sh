COMMIT="$BUILD_SOURCEVERSION"
BUILD_ANDROID="0"
BUILD_IOS="0"

LAST_ANDROID=$(git log --grep='\[release android\]' -1 | grep -o -E -e "[0-9a-f]{40}")
LAST_IOS=$(git log --grep='\[release ios\]' -1 | grep -o -E -e "[0-9a-f]{40}")

if [[ "$LAST_ANDROID" == "" ]]; then
  echo "Warning: No previous [Android] build"
  LAST_ANDROID=$(git log --max-parents=0 HEAD | grep -o -E -e "[0-9a-f]{40}")
fi

if [[ "$LAST_IOS" == "" ]]; then
  echo "Warning: No previous [iOS] build"
  LAST_IOS=$(git log --max-parents=0 HEAD | grep -o -E -e "[0-9a-f]{40}")
fi

# Get list of files changed since last successful builds
TRIGGER_ANDROID=$(git rev-list $LAST_ANDROID..$COMMIT | xargs -L1 git diff-tree --no-commit-id --name-only -r | grep "^android")
TRIGGER_IOS=$(git rev-list $LAST_IOS..$COMMIT | xargs -L1 git diff-tree --no-commit-id --name-only -r | grep "^ios")

if [[ "$TRIGGER_ANDROID" != "" ]]; then
  BUILD_ANDROID=1
fi

if [[ "$TRIGGER_IOS" != "" ]]; then
  BUILD_IOS=1
fi

if [[ "$LANE" == "android" && "$BUILD_ANDROID" == "0" ]]; then
  FINISHED=1
fi

if [[ "$LANE" == "ios" && "$TRAVIS_BUILD_IOS" == "0" ]]; then
  FINISHED=1
fi
