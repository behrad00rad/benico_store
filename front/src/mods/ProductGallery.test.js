import {render, screen, fireEvent} from '@testing-library/react';
import ProductGallery from './ProductGallery';
import {LanguageProvider} from '../language';

const media = ['front', 'model', 'detail'].map(name => ({src: `/${name}.webp`, fa: 'عکس', en: name, generated: true}));
const mount = () => render(<LanguageProvider><ProductGallery media={media} title="Graphic tee" price="250,000 toman"/></LanguageProvider>);
beforeEach(() => {document.cookie = 'Lang=en; path=/'; window.PointerEvent = MouseEvent; window.innerWidth = 1200;});
afterEach(() => {delete window.PointerEvent;});

test('horizontal pointer dragging changes images both ways and vertical gestures preserve the image', () => {
  const {container} = mount();
  const viewport = container.querySelector('.pdp-viewport');
  expect(container.querySelector('.pdp-slide').style.width).toBe('100%');
  Object.defineProperty(viewport, 'clientWidth', {value: 600});
  const drag = (from, to) => {
    fireEvent.pointerDown(viewport, {clientX: from[0], clientY: from[1]});
    fireEvent.pointerMove(viewport, {clientX: to[0], clientY: to[1]});
    fireEvent.pointerUp(viewport, {clientX: to[0], clientY: to[1]});
  };
  drag([400, 200], [200, 200]);
  expect(container.querySelector('.pdp-slide').style.width).toBe('50%');
  expect([...container.querySelectorAll('.pdp-slide[aria-hidden="false"] img')].map(image => image.getAttribute('src'))).toEqual(['/front.webp', '/model.webp']);
  drag([400, 200], [200, 200]);
  expect([...container.querySelectorAll('.pdp-slide[aria-hidden="false"] img')].map(image => image.getAttribute('src'))).toEqual(['/model.webp', '/detail.webp']);
  drag([200, 200], [400, 200]);
  drag([200, 200], [400, 200]);
  expect(container.querySelector('.pdp-slide').style.width).toBe('100%');
  expect(container.querySelector('.pdp-slide[aria-hidden="false"] img')).toHaveAttribute('src', '/front.webp');
  drag([200, 200], [205, 400]);
  expect(container.querySelector('.pdp-slide[aria-hidden="false"] img')).toHaveAttribute('src', '/front.webp');
});

test('transferring implicit touch capture from the image to the viewport keeps the drag active', () => {
  const {container} = mount();
  const viewport = container.querySelector('.pdp-viewport');
  const image = container.querySelector('.pdp-image');
  Object.defineProperty(viewport, 'clientWidth', {value: 600});
  fireEvent.pointerDown(image, {clientX: 400, clientY: 200});
  fireEvent.pointerMove(image, {clientX: 350, clientY: 200});
  fireEvent.lostPointerCapture(image);
  fireEvent.pointerMove(viewport, {clientX: 200, clientY: 200});
  fireEvent.pointerUp(viewport, {clientX: 200, clientY: 200});
  expect(screen.getByRole('button', {name: 'Image 2'})).toHaveAttribute('aria-pressed', 'true');
});

test('keyboard and thumbnails restore the full opening image and respect gallery endpoints', () => {
  const {container} = mount();
  const viewport = container.querySelector('.pdp-viewport');
  fireEvent.keyDown(viewport, {key: 'ArrowLeft'});
  expect(screen.getByRole('button', {name: 'Image 1'})).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', {name: 'Previous image'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button', {name: 'Image 2'}));
  expect(screen.getByRole('button', {name: 'Image 2'})).toHaveAttribute('aria-pressed', 'true');
  fireEvent.keyDown(viewport, {key: 'ArrowRight'});
  expect(screen.getByRole('button', {name: 'Next image'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button', {name: 'Image 1'}));
  expect(container.querySelector('.pdp-gallery')).toHaveClass('pdp-hero');
  expect(container.querySelector('.pdp-slide').style.width).toBe('100%');
});

test('mobile swipes advance one full-width image at a time', () => {
  window.innerWidth = 390;
  const {container} = mount();
  const viewport = container.querySelector('.pdp-viewport');
  Object.defineProperty(viewport, 'clientWidth', {value: 390});
  fireEvent.pointerDown(viewport, {clientX: 300, clientY: 200});
  fireEvent.pointerMove(viewport, {clientX: 100, clientY: 200});
  fireEvent.pointerUp(viewport, {clientX: 100, clientY: 200});
  expect([...container.querySelectorAll('.pdp-slide[aria-hidden="false"] img')].map(image => image.getAttribute('src'))).toEqual(['/model.webp']);
  expect(container.querySelectorAll('.pdp-slide')[1].style.width).toBe('100%');
});
