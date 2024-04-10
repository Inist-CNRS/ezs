#!/usr/bin/env bash

## Script base of the libpostal github action
## https://github.com/openvenues/node-postal/blob/master/.github/workflows/push.yml

# Install required dependencies to build libpostal
sudo apt-get update
sudo apt-get install build-essential curl autoconf automake libtool pkg-config

# Create working directory
sudo mkdir -p /code /data /deps
sudo chown "$USER":"$USER" /code /data /deps

# Install lib postal
cd /code || exit
git clone https://github.com/openvenues/libpostal
cd libpostal || exit
git reset --hard 8f2066b ## Reset to a fixed commit https://github.com/openvenues/libpostal/commit/8f2066b1d30f4290adf59cacc429980f139b8545
./bootstrap.sh
./configure --datadir=/data --prefix=/deps --bindir=/deps || cat config.log
make -j4
make install
