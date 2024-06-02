import http from 'http'
import fs from 'fs'
import path from 'path';
import mime from 'mime-types'
//import markdownEngine from './markdown_engine.mjs'
import { unified } from 'unified'
//import {read} from 'to-vfile'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkMath from 'remark-math'
import rehypeMathjax from 'rehype-mathjax'
//import remarkBreaks from 'remark-breaks'
import { JSDOM } from 'jsdom'
/*
const {unified} = require('unified')
const remarkParse = requrie('remark-parse');
const remarkFrontmatter = require('remark-frontmatter');
const remarkGfm = require('remark-rehype');
const rehypeStringify = require('rehype-stringify');
const fs = require('fs'); */

const hostname = '127.0.0.1';
const port = 3000;

const vault = '../vaults/Mathematics/';

const json_data = [];
const promises = [
    new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("initial promise ended!");
            resolve();
        }, 9000);
    })
];

const server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('res sent');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    //searchDir(vault);
    runConversions();
});

function runConversions() {
    searchDir(vault);
    console.log(promises);
    Promise.all(promises)
        .then((result) => {
            console.log("SUCCESS");
            fs.writeFile('articles.json', JSON.stringify(json_data), (err) => {
                if (err) throw err;
            });
        })
        .catch(() => {
            console.log("ERROR THROWN");
        });
}

function searchDir(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) throw err;
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) throw err;
                if (stats.isDirectory()) searchDir(filePath);
                else {
                    const mimeType = mime.lookup(filePath);
                    if (mimeType == 'text/markdown')  {
                        fs.readFile(filePath, 'utf8', (err, data) => {
                            if (data.length === 0) return;
                            if (err) throw err;
                            const promise_ = convert_data(data, file)
                            promises.push(promise_);
                            console.log(promises);
                        });
                        //to_html(filePath, file);
                        //markdownEngine.to_html(filePath, file)
                    }
                }
            });
        });
    });
    return 1;
}


const save_path = './pages/';
const save_path_temp = './pages/tmp/';
const local_path = '/pages/tmp/';

function to_html(filePath, file) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (data.length === 0) return;
        if (err) throw err;
        promises.push(convert_data(data, file));
    });
}

async function convert_data(data, file) {
    const parsed = await unified()
        .use(remarkParse)
        .use(remarkFrontmatter)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(remarkMath)
        .use(rehypeMathjax)
        //.use(rehypeKatex)
        .use(rehypeStringify)
        //.use(remarkBreaks)
        .process(data);

    //console.log(String(parsed))
    // TODO: insert it into a div 
    const html_string = String(parsed);
    insert_to_template(html_string, file);
    fs.writeFile(save_path + file.replace('.md', '.html'), html_string, (err) => {
        if (err) throw err;
    });

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`finished with: ${file}`);
            resolve();
        }, 2000);
    });
}

// ignores emtpy files
function insert_to_template(html_data, file) {
    const template_html = fs.readFileSync('./article_template.html');
    const dom = new JSDOM(template_html);
    dom.window.document.addEventListener("DOMContentLoaded", (event) => {
        const child = new JSDOM(html_data);
        const title = file.replace('.md', '');
        child.window.document.addEventListener("DOMContentLoaded", (event) => {
            const child_elements = child.window.document.children;
            const article = dom.window.document.querySelector('.article');
            var heading = dom.window.document.createElement('h1');
            heading.innerHTML = title;
            console.log(title);
            article.appendChild(heading)
            for (var i = 0; i < child_elements.length; i++) {
                article.appendChild(child_elements.item(i));
            }

            const output = dom.serialize();
            fs.writeFileSync(save_path_temp + title + '.html', output, (err) => {
                if (err) throw err;
            });
            json_data.push({name: title, path: local_path + title + '.html'});
        });
    });
}

/*
var markdownEngine = {
    to_html: to_html
} 

export default markdownEngine;

*/
