current_working_directory=$(pwd)

current_file_location=$(dirname "$0")

# Install ci-cd code
cd ${current_file_location}/.. || exit

echo "//npm.pkg.github.com/:_authToken=${NPM_READ_TOKEN}" >> .npmrc

npm install

npm run build

git restore .npmrc
