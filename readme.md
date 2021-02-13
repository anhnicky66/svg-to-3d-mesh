# Introduction
This Stencil component is a wrapper of [@mattdesl](https://twitter.com/mattdesl)'s work on rendering SVG path string into 3D triangulated mesh.

# Installation
```
npm install svg-to-3d-mesh --save
```
or
```
yarn add svg-to-3d-mesh
```

# Usage
## With VueJS
In main.js (main.ts) file.
```
import Vue from "vue";
import { applyPolyfills, defineCustomElements } from 'svg-to-3d-mesh/loader';

applyPolyfills().then(() => {
    defineCustomElements();
});

new Vue({
    render: h => h(App)
}).$mount('#app');
```
