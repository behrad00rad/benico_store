import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {LanguageProvider} from '../language';
import Dashboard from './dashbord';
import CustomerAddressEditor from './CustomerAddressEditor';
jest.mock('./Footer',()=>()=>null);
const address={id:99001,fname:'Test',lname:'Buyer',state:'Province',city:'City',address:'Test street',phone_number:'09123456789',postal_code:'1234567890'};
const mount=initial=><LanguageProvider><MemoryRouter initialEntries={[initial]}><Routes><Route path="/dashboard/address/add/" element={<CustomerAddressEditor/>}/><Route path="/dashboard/address/edit/:id/" element={<CustomerAddressEditor/>}/><Route path="/dashboard/:Page/" element={<Dashboard/>}/></Routes></MemoryRouter></LanguageProvider>;
beforeEach(()=>{document.cookie='Lang=en; path=/';document.cookie='token=test; path=/';global.fetch=jest.fn(url=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(url.includes('profile')?{username:'buyer',email:'buyer@example.com'}:url.includes('orders')?{orders:[]}:url.includes('get_loc')?{Province:['City']}:{addresses:[address],address})}));});
afterEach(()=>{document.cookie='token=; max-age=0; path=/';jest.restoreAllMocks();delete global.fetch;});
test('account sections can change without reusing the previous section payload',async()=>{
  render(mount('/dashboard/detail/'));await screen.findByText('buyer@example.com');
  fireEvent.click(screen.getByRole('link',{name:'03 Address book ↗'}));await screen.findByText('Test street');
  fireEvent.click(screen.getByRole('link',{name:'02 My orders ↗'}));await screen.findByText('Your story starts here');
  fireEvent.click(screen.getByRole('link',{name:'01 Account details ↗'}));await screen.findByText('buyer@example.com');
});
test('editing an address saves validated fields and returns to the address book',async()=>{
  render(mount('/dashboard/address/edit/99001/'));await screen.findByDisplayValue('Test street');fireEvent.change(screen.getByLabelText('Street address'),{target:{value:'Updated street'}});
  fireEvent.click(screen.getByRole('button',{name:'Save address ↗'}));await screen.findByRole('heading',{name:'Address book'});await screen.findByText('Test street');
  const request=global.fetch.mock.calls.find(([,options])=>options?.method==='PATCH');expect(request[0]).toContain('/99001/');expect(JSON.parse(request[1].body)).toMatchObject({address:'Updated street',phoneNumber:'09123456789'});
});
