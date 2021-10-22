# rcsb-saguaro-3D

RCSB Saguaro Web 3D is an open-source library built on the top of the [RCSB Saguaro 1D Feature Viewer](https://rcsb.github.io/rcsb-saguaro)
and [RCSB Molstar](https://github.com/rcsb/rcsb-molstar) designed to display protein features at the [RCSB Web Site](https://www.rcsb.org). The package collects protein annotations from the 
[1D Coordinate Server](https://1d-coordinates.rcsb.org) and the main [RCSB Data API](https://data.rcsb.org) and generates Protein 
Feature Summaries. The package allows access to RCSB Saguaro and Molstar methods to add or change displayed data. 

### Node Module Instalation
`npm install @rcsb/rcsb-saguaro-3d`

## Building & Running

### Build app
    npm install
    npm run buildOnlyApp
    
### Build examples 
    npm run buildOnlyExamples
    
From the root of the project:
    
    http-server -p PORT-NUMBER
    
and navigate to `localhost:PORT-NUMBER/build/dist/examples/`

### Main Classes and Methods

Class **`RcsbFv3DAssembly`** file `src/RcsbFv3D/RcsbFv3DAssembly.tsx` builds a predefined view for PDB entries. This is the methods used in the RCSB PDB web portal 
(ex: [4hhb](https://www.rcsb.org/3d-sequence/4HHB)). Soruce code example can be found in `src/examples/assembly/index.ts`.

Class **`RcsbFv3DCustom`** file `src/RcsbFv3D/RcsbFv3DCustom.tsx` builds a customized view between one or more feature viewers and a single Molstar plugin.

### CDN JavaScript
`<script src="https://cdn.jsdelivr.net/npm/@rcsb/rcsb-saguaro-app@3.0.0/build/dist/app.js" type="text/javascript"></script>`

Contributing
---
All contributions are welcome. Please, make a pull request or open an issue.

License
---

The MIT License

    Copyright (c) 2021 - now, RCSB PDB and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.