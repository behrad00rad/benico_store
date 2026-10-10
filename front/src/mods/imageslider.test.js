import {render, screen, fireEvent} from '@testing-library/react';
import ImageSlider from './imageslider';

test('gallery keeps images in separate slides and respects navigation boundaries', () => {
  const {container} = render(<ImageSlider uuids={['first', 'second']} />);
  const next = screen.getByRole('button', {name: 'تصویر بعدی'});
  const previous = screen.getByRole('button', {name: 'تصویر قبلی'});
  expect(previous).toBeDisabled();
  fireEvent.click(next);
  expect(container.querySelector('.gallery-track')).toHaveStyle('transform: translateX(-100%)');
  expect(next).toBeDisabled();
  fireEvent.click(previous);
  expect(container.querySelector('.gallery-track')).toHaveStyle('transform: translateX(-0%)');
});

test('gallery resets when a different product is loaded', () => {
  const {rerender} = render(<ImageSlider uuids={['first', 'second']} />);
  fireEvent.click(screen.getByRole('button', {name: 'تصویر بعدی'}));
  rerender(<ImageSlider uuids={['third', 'fourth']} />);
  expect(screen.getByRole('button', {name: 'تصویر قبلی'})).toBeDisabled();
});
