current_working_directory=$(pwd)

current_file_location=$(dirname "$0")

npm_read_token=$1

# Install ci-cd code
cd ${current_file_location}/.. || exit

echo "//npm.pkg.github.com/:_authToken=${npm_read_token}" >> .npmrc

npm ci

npm run build

git restore .npmrc
