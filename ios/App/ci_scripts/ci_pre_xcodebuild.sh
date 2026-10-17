#!/bin/sh
set -e

# Install root node deps and sync Capacitor iOS project
cd "$CI_WORKSPACE"
npm ci
npx cap sync ios
