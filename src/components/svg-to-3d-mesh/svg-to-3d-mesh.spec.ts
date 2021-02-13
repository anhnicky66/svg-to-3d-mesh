import { newSpecPage } from '@stencil/core/testing';
import { SvgTo3DMesh } from './svg-to-3d-mesh';

describe('svg-to-3d-mesh', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [SvgTo3DMesh],
      html: '<svg-to-3d-mesh></svg-to-3d-mesh>',
    });
    expect(root).toEqualHtml(`
      <svg-to-3d-mesh>
        <mock:shadow-root>
          <div class="svg-to-3d-mesh__wrapper">
            <canvas></canvas>
          </div>
        </mock:shadow-root>
      </svg-to-3d-mesh>
    `);
  });
});
