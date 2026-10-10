import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import Cookies from 'universal-cookie';
import {LanguageProvider} from '../language';
import Cart from './Cart';
import Checkout from './Checkout';
import {readBag} from './commerce';
jest.mock('./Footer',()=>()=>null);
const product={id:8101,title:'Sample piece',price:100,L_count:2,XL_count:1,XXL_count:0,images:['front']};
const cart=[{productId:'8101',title:'Old title',size:'L',quantity:1,price:1,left:99}];
const mount=(component)=><LanguageProvider><MemoryRouter><Routes><Route path="/" element={component}/><Route path="/recipte/:id/" element={<h1>Order confirmation</h1>}/></Routes></MemoryRouter></LanguageProvider>;
beforeEach(()=>{
  document.cookie='Lang=en; path=/';document.cookie='token=; max-age=0; path=/';new Cookies().set('cartData',cart,{path:'/'});
  Object.defineProperty(window,'crypto',{configurable:true,value:{randomUUID:()=> '2e5b6945-0993-4633-97db-7b6fcb09d44a'}});
  global.fetch=jest.fn(url=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(url.includes('filtered')?{data:[product]}:url.includes('get_loc')?{Province:['City']}:url.includes('addresses')?{addresses:[]}:{} )}));
});
afterEach(()=>{new Cookies().remove('cartData',{path:'/'});jest.restoreAllMocks();delete global.fetch;});
test('cart uses current prices and stock, updates quantity, and removes items',async()=>{
  render(mount(<Cart/>));await screen.findByRole('heading',{name:'Sample piece'});
  expect(screen.getAllByText('100,000 toman').length).toBeGreaterThan(0);
  const plus=screen.getByRole('button',{name:'Increase quantity Old title'});fireEvent.click(plus);
  expect(plus).toBeDisabled();expect(new Cookies().get('cartData')[0].quantity).toBe(2);
  fireEvent.click(screen.getByRole('button',{name:'Remove'}));expect(screen.getByRole('heading',{name:'Your bag is waiting'})).toBeInTheDocument();
});
test('unavailable cart lines block checkout and duplicate lines are grouped',async()=>{
  new Cookies().set('cartData',[{...cart[0],quantity:2},{...cart[0],quantity:1}],{path:'/'});
  expect(readBag()[0].quantity).toBe(3);
  render(mount(<Cart/>));await screen.findByText('Stock has changed. Reduce the quantity or remove this piece.');
  expect(screen.getByRole('button',{name:'Review your bag to continue'})).toBeDisabled();
});
test('checkout validates every field and preserves bag when request fails',async()=>{
  render(mount(<Checkout/>));const submit=await screen.findByRole('button',{name:/Place unpaid order/});await waitFor(()=>expect(submit).toBeEnabled());
  fireEvent.click(submit);expect(screen.getByLabelText('Postal code')).toHaveAttribute('aria-invalid','true');
  const fields={'First name':'Test','Last name':'Buyer',Province:'Province',City:'City','Street address':'Test street','Postal code':'۱۲۳۴۵۶۷۸۹۰','Phone number':'۰۹۱۲۳۴۵۶۷۸۹'};
  Object.entries(fields).forEach(([label,value])=>fireEvent.change(screen.getByLabelText(label),{target:{value}}));
  let finish;global.fetch.mockImplementation(url=>url.includes('submit_order')?new Promise(resolve=>{finish=resolve;}):Promise.resolve({ok:true,json:()=>Promise.resolve({data:[product]})}));
  fireEvent.click(submit);fireEvent.click(submit);
  expect(global.fetch.mock.calls.filter(([url])=>url.includes('submit_order')).length).toBe(1);
  finish({ok:false,status:400,json:()=>Promise.resolve({error:'Could not save order'})});
  await screen.findByText('Could not save order');expect(new Cookies().get('cartData')).toHaveLength(1);
  const request=global.fetch.mock.calls.find(([url])=>url.includes('submit_order'))[1];
  expect(JSON.parse(request.body)).toMatchObject({PostalCode:'1234567890',phoneNumber:'09123456789',checkout_key:'2e5b6945-0993-4633-97db-7b6fcb09d44a'});
});
test('changing province clears the old city and successful checkout clears the bag',async()=>{
  render(mount(<Checkout/>));const submit=await screen.findByRole('button',{name:/Place unpaid order/});await waitFor(()=>expect(submit).toBeEnabled());
  fireEvent.change(screen.getByLabelText('City'),{target:{value:'Previous city'}});fireEvent.change(screen.getByLabelText('Province'),{target:{value:'Province'}});expect(screen.getByLabelText('City')).toHaveValue('');
  Object.entries({'First name':'Test','Last name':'Buyer',City:'City','Street address':'Test street','Postal code':'1234567890','Phone number':'09123456789'}).forEach(([label,value])=>fireEvent.change(screen.getByLabelText(label),{target:{value}}));
  global.fetch.mockImplementation(url=>Promise.resolve({ok:true,status:201,json:()=>Promise.resolve({order_id:12345678})}));fireEvent.click(submit);
  await screen.findByRole('heading',{name:'Order confirmation'});expect(new Cookies().get('cartData')).toEqual([]);
});
