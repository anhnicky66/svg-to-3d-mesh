# Introduction
This Stencil component is a wrapper of [@mattdesl](https://twitter.com/mattdesl)'s work on rendering SVG path string into 3D triangulated mesh.

<img src="https://anhnicky66.github.io/img/svgto3dmesh.gif" height="250" />

# Installation
```
npm install svg-to-3d-mesh --save
```
or
```
yarn add svg-to-3d-mesh
```

# Usage
## Without a Framework
```
<html>
  <head>
    <script type="module">
      import { defineCustomElements } from 'https://cdn.jsdelivr.net/npm/svg-to-3d-mesh/loader/index.es2017.js';
      defineCustomElements();
    </script>
  </head>
  <body>
    <svg-to-3d-mesh></svg-to-3d-mesh>
    <script>
        const svgTo3DMeshElement = document.querySelector("svg-to-3d-mesh");
        svgTo3DMeshElement.svgs = [
            "https://icons.getbootstrap.com/icons/alarm-fill.svg",
            "https://icons.getbootstrap.com/icons/basket.svg",
            "https://icons.getbootstrap.com/icons/battery-half.svg"
        ];
        svgTo3DMeshElement.explodeInDuration = 0.5;
        svgTo3DMeshElement.explodeOutDuration = 1;
        svgTo3DMeshElement.color = "#ffffff"
        svgTo3DMeshElement.backgroundColor = "#c42b6b";
    </script>
  </body>
</html>
```

## With VueJS
In main.js (or main.ts) file.
```
import Vue from "vue";
import { applyPolyfills, defineCustomElements } from 'svg-to-3d-mesh/loader';

Vue.config.ignoredElements = [/svg-to-3d-mesh/];
applyPolyfills().then(() => {
    defineCustomElements();
});

new Vue({
    render: h => h(App)
}).$mount('#app');
```
the component will then be avaiable in any of the Vue components
```
<div style="height: 800px; width: 100%;">
    <svg-to-3d-mesh
        :background-color.prop="'#c42b6b'"
        :color.prop="'ffffff'"
        :svgs.prop="[
            'https://icons.getbootstrap.com/icons/alarm-fill.svg',
            'https://icons.getbootstrap.com/icons/basket.svg',
            'https://icons.getbootstrap.com/icons/battery-half.svg'
        ]"
    ></svg-to-3d-mesh>
</div>
```
## With ReactJs
Coming soon

## With Angular
Coming soon

# Options
- `svgs` (default `[]`) : An array of svg files URLs
- `height` : The height of the canvas. By default, the canvas height will be the same as it's container.
- `color` : The converted 3d mesh color
- `backgroundColor` : The canvas background color
- `opacity` : The rendered scene opacity
- `explodeInDuration` : The duration of triangulated mesh explode-in animation
- `scaleUpDuration` : The duration of triangulated mesh scale-up animation
- `scaleDownDuration` : The duration of triangulated mesh scale-down animation
- `explodeOutDuration` : The duration of triangulated mesh explode-out animation