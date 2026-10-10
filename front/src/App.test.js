import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  document.cookie = 'Lang=fa; path=/';
  window.matchMedia = jest.fn(() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));
  global.fetch = jest.fn(url => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(url.includes('/recommend/') ? {
      data: [{id: 7000, title: 'Test shirt', price: 25, L_count: 0, XL_count: -12, XXL_count: -4, images: []}],
    } : {data: {T: [], hoodie: []}, results: []}),
  }));
});

test('language switch updates copy, direction, prices and persists after remount', async () => {
  const {unmount} = render(<App />);
  await screen.findByText('Test shirt');
  fireEvent.click(screen.getByRole('button', {name: 'Switch to English'}));
  expect(screen.getByRole('heading', {name: 'Latest pieces'})).toBeInTheDocument();
  expect(document.documentElement).toHaveAttribute('dir', 'ltr');
  expect(await screen.findByText('25,000 toman')).toBeInTheDocument();
  expect(screen.getByText('Sold out · View product')).toBeInTheDocument();
  unmount();
  render(<App />);
  expect(screen.getByRole('heading', {name: 'Latest pieces'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'تغییر زبان به فارسی'}));
  expect(document.documentElement).toHaveAttribute('dir', 'rtl');
  expect(screen.getByRole('heading', {name: 'آخرین محصولات'})).toBeInTheDocument();
  await screen.findByText('Test shirt');
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

test('homepage loads products and shows negative stock as unavailable', async () => {
  render(<App />);
  expect(await screen.findByText('Test shirt')).toBeInTheDocument();
  expect(screen.getByText('ناموجود · مشاهده محصول')).toBeInTheDocument();
  expect(screen.getByRole('heading', {name: 'آخرین محصولات'})).toBeInTheDocument();
});

test('collection menu opens and closes', async () => {
  render(<App />);
  await screen.findByText('Test shirt');
  const menu = screen.getByRole('button', {name: /منو/});
  fireEvent.click(menu);
  expect(screen.getByRole('navigation', {name: 'دسته بندی محصولات'})).toBeInTheDocument();
  expect(menu).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(screen.getByRole('button', {name: 'بستن منو'}));
  expect(screen.queryByRole('navigation', {name: 'دسته بندی محصولات'})).not.toBeInTheDocument();
});
