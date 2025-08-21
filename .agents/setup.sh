current_working_directory=$(pwd)

current_file_location=$(dirname "$0")

# Install ci-cd code
cd ${current_file_location}/.. || exit

echo "//npm.pkg.github.com/:_authToken=${$1}" >> .npmrc

npm ci

npm run build

git restore .npmrc
