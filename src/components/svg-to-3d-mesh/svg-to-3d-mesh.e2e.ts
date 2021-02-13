import { newE2EPage } from '@stencil/core/testing';

describe('svg-to-3d-mesh', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<svg-to-3d-mesh></svg-to-3d-mesh>');
    const element = await page.find('svg-to-3d-mesh');
    expect(element).toHaveClass('hydrated');
  });
});
