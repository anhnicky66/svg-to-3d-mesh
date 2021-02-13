import { Component, Prop, h, Element } from '@stencil/core';
import * as THREE from "three";
import createLoop from "canvas-loop";
import Tweenr from "tweenr";
import { parse as getSvgPaths } from "extract-svg-path";
import * as randomVec3Import from "gl-vec3/random";
import triangleCentroid from "triangle-centroid";
import reindex from "mesh-reindex";
import unindex from "unindex-mesh";
import svgMesh3d from "svg-mesh-3d";
import fragShader from "./shaders/fragShader";
import vertShader from "./shaders/vertShader";

const randomVec3 = randomVec3Import.default;

@Component({
  tag: 'svg-to-3d-mesh',
  styleUrl: 'svg-to-3d-mesh.css',
  shadow: true,
})
export class SvgTo3DMesh {
  @Prop() svgs: string[] = [];
  @Prop() height: number;
  @Prop() color: string = "#42b983";
  @Prop() backgroundColor: string = "#fff";
  @Prop() opacity: number = 1;
  @Prop() explodeInDuration: number = 1.5;
  @Prop() scaleUpDuration: number = 1;
  @Prop() scaleDownDuration: number = 0.75;
  @Prop() explodeOutDuration: number = 0.75;

  @Element() el: HTMLElement;

    private tweenr;
    private canvas: HTMLCanvasElement;
    private renderer;
    private scene;
    private camera;
    private attributes;
    private mesh;
    private app;
    private pointer = 0;

  componentDidLoad() {
    this.init();
    this.createApp();
    this.nextSvgMesh();
  }

  disconnectedCallback() {
    this.scene.dispose();
  }

  init() {
    this.tweenr = Tweenr({ defaultEase: "expoOut" });
    this.renderer = new THREE.WebGL1Renderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      // @ts-ignore
      devicePixelRatio: window.devicePixelRatio
    });
    this.renderer.setClearColor(this.backgroundColor, this.opacity);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
    this.camera.position.set(0, 0, 5);

  }

  private async nextSvgMesh(delay?, beforeRender?) {
    if (this.svgs.length === 0) {
      return;
    }
    delay = delay || 0;
    const current = this.svgs[this.pointer++ % this.svgs.length];
    const res = await fetch(current);
    const svg = await res.text();
    if (beforeRender) {
      beforeRender();
    }
    this.renderSvg(svg, delay);
  }

  private renderSvg(svg, delay?) {
    delay = delay || 0;

    const svgPath = getSvgPaths(svg);

    let complex = svgMesh3d(svgPath, {
      scale: 10,
      simplify: 0.01,
      randomization: 1500
    });

    complex = reindex(unindex(complex.positions, complex.cells));

    this.attributes = this.getAnimationAttributes(complex.positions, complex.cells);

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(complex.positions.length * 3);

    for (let i = 0, len = complex.positions.length; i < len; i++) {
      const pos = complex.positions[i];
      vertices[i * 3] = pos[0];
      vertices[i * 3 + 1] = pos[1];
      vertices[i * 3 + 2] = pos[2];
    }

    const faces = new Float32Array(complex.cells.length);

    for (let i = 0, len = complex.cells.length; i < len; i++) {
      const face = complex.cells[i];
      // @ts-ignore
      faces[i] = new THREE.Face3(face[0], face[1], face[2]);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute("face", new THREE.BufferAttribute(faces, 1));
    geometry.setAttribute("direction", new THREE.BufferAttribute(this.attributes.direction.value, 3));
    geometry.setAttribute("centroid", new THREE.BufferAttribute(this.attributes.centroid.value, 3));

    const rgbColor = this.hexToRgb(this.color);

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      wireframe: false,
      transparent: true,
      uniforms: {
        // @ts-ignore
        opacity: { type: "f", value: 0 },
        // @ts-ignore
        scale: { type: "f", value: 0 },
        // @ts-ignore
        animate: { type: "f", value: 0 },
        // @ts-ignore
        diffuseR: { type: "f", value: rgbColor.r / 255 },
        // @ts-ignore
        diffuseG: { type: "f", value: rgbColor.g / 255 },
        // @ts-ignore
        diffuseB: { type: "f", value: rgbColor.b / 255 }
      }
    });

    this.mesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.mesh);
      const interval = this.explodeInDuration + this.scaleUpDuration + this.scaleDownDuration + this.explodeOutDuration + delay;

      // explode in
      this.tweenr
        .to(material.uniforms.opacity, {
          delay: delay,
          duration: this.explodeInDuration,
          value: 1
        });
      this.tweenr.to(material.uniforms.animate, {
        value: 1,
        duration: this.explodeInDuration,
        delay: delay,
        ease: "expoInOut"
      });
      this.tweenr.to(material.uniforms.scale, {
        value: 1,
        duration: this.scaleUpDuration,
        delay: delay
      });

      // explode out
      this.tweenr.to(material.uniforms.scale, {
        delay: interval,
        value: 0,
        duration: this.scaleDownDuration,
        ease: "expoIn"
      });
      this.tweenr
        .to(material.uniforms.opacity, {
          delay: interval,
          duration: this.explodeOutDuration,
          value: 0
        });
      this.tweenr
        .to(material.uniforms.animate, {
          duration: this.explodeOutDuration,
          value: 0,
          delay: interval
        })
        .on("complete", () => {
          geometry.dispose();
          this.scene.remove(this.mesh);
          this.mesh = null;
          this.nextSvgMesh(0);
        });
  }

  private getAnimationAttributes(positions, cells) {
    const directions = new Float32Array(cells.length * 9);
    const centroids = new Float32Array(positions.length * 3);
    for (let i = 0; i < positions.length * 3; i++) {
      let f0, f1, f2;
      if (cells[i]) {
        [f0, f1, f2] = cells[i];
      } else {
        [f0, f1, f2] = [0, 0, 0];
      }
      const triangle = [positions[f0], positions[f1], positions[f2]];
      const center = triangleCentroid(triangle);
      const dir = new THREE.Vector3().fromArray(center);
      centroids[i * 3] = dir.x;
      centroids[i * 3 + 1] = dir.y;
      centroids[i * 3 + 2] = dir.z;
    }
    for (let j = 0; j < cells.length * 9; j++) {
      const random = randomVec3([], Math.random());
      const anim = new THREE.Vector3().fromArray(random);
      directions[j * 3] = anim.x;
      directions[j * 3 + 1] = anim.y;
      directions[j * 3 + 2] = anim.z;
    }
    return {
      direction: { type: "v3", value: directions },
      centroid: { type: "v3", value: centroids }
    };
  }

  private createApp() {
    this.app = createLoop(this.canvas, {
      scale: this.renderer.devicePixelRatio
    })
      .start()
      .on("tick", (time) => {
        this.renderApp(time);
      })
      .on("resize", () => {this.resize()});

    this.resize();
  }

  private resize() {
    const [width, height] = this.app.shape;
      this.camera.aspect = width / height;
      this.renderer.setSize(width, height, false);
      this.camera.updateProjectionMatrix();
      this.renderApp();
  }

  private renderApp(time?) {
    if (this.mesh) {
      const newTime = time * 0.00011;
      const rotation = newTime;
      this.mesh.rotation.y += rotation;
    }
    this.renderer.render(this.scene, this.camera);
  }

  private hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  render() {
    return <div class="svg-to-3d-mesh__wrapper" style={{height: this.height + "px"}}>
      <canvas ref={el => this.canvas = el as HTMLCanvasElement}></canvas>
    </div>;
  }
}
