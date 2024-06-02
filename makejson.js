const fs = require('fs');
const path = require('path');

paths = ['Analysis', 'Calculus', 'Chemistry', 'Combinatorics_', 'Combinatorics', 'Convolutions', 'Data Structures', 'Differential Equations', 'Fourier Analysis', 'Linear Algebra', 'Physics', 'Probability', 'Problem Solving', 'Statistics']

jsonData = []
function getFiles(directory) {
    let results = [];

    function readDir(dir) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                readDir(fullPath);
            } else {
                var title = file.replace('.html', '');
                jsonData.push({name: title, path: fullPath});
            }
        });
    }
    readDir(directory);
}

// Replace 'your_directory_path_here' with the path of the directory you want to scan
paths.forEach((file) => {
    getFiles(file);
});
fs.writeFile('articles.json', JSON.stringify(jsonData), (err) => {});
