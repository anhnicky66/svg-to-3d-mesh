export default `
uniform float animate;
uniform float opacity;
uniform float diffuseR;
uniform float diffuseG;
uniform float diffuseB;

void main() {
  gl_FragColor = vec4(vec3(diffuseR, diffuseG, diffuseB), opacity).rgba;
}
`;
