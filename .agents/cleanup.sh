current_working_directory=$(pwd)

current_file_location=$(dirname "$0")

cd ${current_file_location}/.. || exit

git restore .npmrc

# Restore all package.json and package-lock.json files
find . \( -name "package.json" -o -name "package-lock.json" \) -exec git restore {} +
