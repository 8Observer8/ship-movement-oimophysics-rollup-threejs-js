
- [Demo on Glitch](https://ship-movement-oimophysics-rollup-threejs-js.glitch.me/)
- [Demo on Plunker](https://plnkr.co/edit/ENV8AfwIztG5YS7g?preview)

This demo uses free assets:
- Free model - [link](https://free3d.com/3d-model/low-poly-spaceship-37605.html)
- Free texture - [link](https://www.textures.com/download/PBR0110/133145)

![ship-movement-oimophysics-rollup-threejs-js-ezgif com-optimize](https://github.com/8Observer8/ship-movement-oimophysics-rollup-threejs-js/assets/3908473/0c8990a1-a926-4821-8800-445685fdaf2d)

Instructions for building and running the project in debug and release:

- Download and unzip this repository

- Go to the root folder of the example in the console

- Install these packages globally with the command:

> npm i -g http-server rollup uglify-js

- Add the Rollup bin folder to the Path. Type this command to know where npm was installed `npm config get prefix`. This command will show you the npm location. You will find the "node_modules" folder there. Go to the "rollup/bin" folder and copy this path, for example for me: `C:\Users\8Observer8\AppData\Roaming\npm\node_modules\rollup\dist\bin`. Add this folder to the path variable.

- Run http-server in the project directory:

> http-server -c-1

Note. The `-c-1` key allows you to disable caching.

- Start development mode with the following command:

> npm run dev

Note. Rollup will automatically keep track of saving changes to files and build a new index.js file ready for debugging. You can debug your project step by step in the browser by setting breakpoints.

- Go to the browser and type the address: localhost:8080/index.html

- Create a compressed file ready for publishing. Stop development mode, for example, with this command Ctrl + C in CMD, if it was launched before and enter the command:

> npm run release

Note. After this command, Rollup will create a compressed index.js file. Compression is done using the uglify-js package.

If you want to thank me: https://8observer8.github.io/donate.html
