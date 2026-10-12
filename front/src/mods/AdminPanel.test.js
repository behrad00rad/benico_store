import {render, screen, fireEvent} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {LanguageProvider} from '../language';
import AdminPanel from './AdminPanel';

const product = {id:8101,title:'Sample hoodie',category:'hoodie',price:590,L_count:5,XL_count:2,XXL_count:1,images:[]};
const overview = {user:{username:'manager'},products:[product],orders:[{id:12345,customer:'buyer',fname:'Test',lname:'Buyer',date:'2026-10-10T10:00:00Z',paid:false,price:590,address:'Test street',city:'Test city',state:'Test state',products:[{id:8101,title:'Sample hoodie',quantity:1,size:'L'}]}]};
const renderPanel = () => render(<BrowserRouter><LanguageProvider><AdminPanel/></LanguageProvider></BrowserRouter>);
beforeEach(() => {
  document.cookie='token=test-admin-token; path=/';
  document.cookie='Lang=en; path=/';
  window.history.replaceState(null,'','/admin/');
  global.fetch=jest.fn(()=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(overview)}));
});
afterEach(() => {document.cookie='token=; max-age=0; path=/'; document.cookie='Lang=fa; path=/'; jest.restoreAllMocks(); delete global.fetch;});

test('shows staff overview and detailed unpaid orders', async () => {
  renderPanel();
  expect(await screen.findByText('Everything you need to run Benico')).toBeInTheDocument();
  expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe('Token test-admin-token');
  fireEvent.click(screen.getByRole('button',{name:/Orders/}));
  fireEvent.click(screen.getByRole('button',{name:'View',exact:true}));
  const dialog=screen.getByRole('dialog',{name:'Order #12345'});
  expect(dialog).toHaveTextContent('Test street');
  expect(dialog).toHaveTextContent('Sample hoodie');
  expect(dialog).toHaveTextContent('Unpaid');
});

test('editing product converts toman to stored units and refreshes catalog', async () => {
  renderPanel();
  await screen.findByText('Everything you need to run Benico');
  fireEvent.click(screen.getByRole('button',{name:/Products/}));
  fireEvent.click(screen.getByRole('button',{name:'Edit',exact:true}));
  fireEvent.change(screen.getByLabelText('Price in toman'),{target:{value:'650000'}});
  global.fetch.mockImplementation((url,options)=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(options.method==='PATCH'?{product:{...product,price:650}}:overview)}));
  fireEvent.click(screen.getByRole('button',{name:'Save product'}));
  await screen.findByText('Product saved.');
  const update=global.fetch.mock.calls.find(([,options])=>options.method==='PATCH');
  expect(JSON.parse(update[1].body)).toMatchObject({price:650,L_count:5});
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('unauthorized users cannot see store data', async () => {
  global.fetch.mockResolvedValue({ok:false,status:403});
  renderPanel();
  await screen.findByRole('heading',{name:'Administrator access required'});
  expect(screen.queryByText('Sample hoodie')).not.toBeInTheDocument();
});


test('image removal waits for Save and Cancel preserves images', async () => {
  const withImage = {...product, images:['model-photo']};
  const catalog = {...overview, products:[withImage]};
  global.fetch.mockResolvedValue({ok:true,status:200,json:()=>Promise.resolve(catalog)});
  renderPanel();
  await screen.findByText('Everything you need to run Benico');
  fireEvent.click(screen.getByRole('button',{name:/Products/}));
  fireEvent.click(screen.getByRole('button',{name:'Edit',exact:true}));
  fireEvent.click(screen.getByRole('button',{name:'Remove image model-photo'}));
  expect(global.fetch.mock.calls.some(([,options])=>options.method==='DELETE')).toBe(false);
  fireEvent.click(screen.getByRole('button',{name:'Cancel',exact:true}));
  fireEvent.click(screen.getByRole('button',{name:'Edit',exact:true}));
  expect(screen.getByRole('button',{name:'Remove image model-photo'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Remove image model-photo'}));
  global.fetch.mockImplementation((url,options)=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(options.method?{product:{...withImage,images:[]}}:catalog)}));
  fireEvent.click(screen.getByRole('button',{name:'Save product'}));
  await screen.findByText('Product saved.');
  expect(global.fetch.mock.calls.some(([url,options])=>url==='/auth/manage/products/8101/images/model-photo/'&&options.method==='DELETE')).toBe(true);
});
