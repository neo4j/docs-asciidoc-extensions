const events = require('events');
const fs = require('fs')
const path = require('path')
const readline = require('readline');

const glob = require('glob')

const baseDir = `${__dirname}/../modules/`
const navFileName = 'content-nav.adoc'
const filePattern = `**/${navFileName}`
const xrefPattern = /xref:(.*)\.adoc\[(.*)\]/


glob(`${baseDir}${filePattern}`, async (err, matches) => {
      
  console.log(`content-nav files to process: ${matches.length}`)

  if (!matches.length) return
  
  const objects = matches
    .map(navFile => {

      (async function processLineByLine() {
        console.log(`Generating asciidoc files for ${navFile}`);
        try {
          const rl = readline.createInterface({
            input: fs.createReadStream(navFile),
            crlfDelay: Infinity
          });

          rl.on('line', (line) => {

            const xrefMatch = line.match(xrefPattern)
            
            if (!xrefMatch) return

            const createPath = path.join(path.dirname(navFile),'pages',xrefMatch[1] + '.adoc');
            if (fs.existsSync(createPath)) {
              console.log(`${createPath} already exists`)
              return
            }

            fs.mkdirSync(path.dirname(createPath), { recursive: true }, (err) => {
              if (err) throw err;
            });

            const docTitle = xrefMatch[2] ? xrefMatch[2] : xrefMatch[1].replace(/-|\//g, ' ');
            const fileContents = `// asciidoc file auto-generated by toc-gen\n= ${docTitle[0].toUpperCase() + docTitle.slice(1)}`

            console.log(`Creating ${createPath} `)
            fs.writeFileSync(createPath,fileContents,{ flag: 'w+' }, err => {})

          });

          await events.once(rl, 'close');

        } catch (err) {
          console.error(err);
        }
      })();

    })

})

  

