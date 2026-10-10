import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {LanguageProvider} from '../language';
import ContentEditor from './ContentEditor';
const content={hero:{title_en:'Original hero',title_fa:'عنوان اصلی',eyebrow:'THE EDIT',button_en:'Explore',button_fa:'کشف',link:'/products/',image:'',position:'center'},intro:{title_en:'Intro',title_fa:'معرفی',text_en:'Intro copy',text_fa:'متن'},editorial_one:{title_en:'First card',title_fa:'اول',image:'',enabled:true},editorial_two:{title_en:'Second card',title_fa:'دوم',image:'',enabled:true},story:{title_en:'Story',title_fa:'داستان',enabled:true}};
beforeEach(()=>{document.cookie='Lang=en; path=/';document.cookie='token=test; path=/';global.fetch=jest.fn(()=>Promise.resolve({ok:true,json:()=>Promise.resolve({content,revision:2})}));});
afterEach(()=>{document.cookie='token=; max-age=0; path=/';jest.restoreAllMocks();delete global.fetch;});
test('editing updates preview, saves the expected revision, and persists across tabs',async()=>{
  const {rerender}=render(<LanguageProvider><ContentEditor active/></LanguageProvider>);
  await screen.findByDisplayValue('Original hero');fireEvent.change(screen.getAllByLabelText('English title')[0],{target:{value:'New hero'}});
  expect(screen.getByRole('heading',{name:'New hero'})).toBeInTheDocument();
  rerender(<LanguageProvider><ContentEditor active={false}/></LanguageProvider>);rerender(<LanguageProvider><ContentEditor active/></LanguageProvider>);
  expect(screen.getAllByLabelText('English title')[0]).toHaveValue('New hero');
  global.fetch.mockImplementation((url,options)=>Promise.resolve({ok:true,json:()=>Promise.resolve({content:JSON.parse(options.body).content,revision:3})}));
  fireEvent.click(screen.getByRole('button',{name:'Save to storefront'}));await screen.findByText('Content saved and now visible on the storefront.');
  const save=global.fetch.mock.calls.find(([,o])=>o.method==='PUT');expect(JSON.parse(save[1].body).revision).toBe(2);expect(JSON.parse(save[1].body).content.hero.title_en).toBe('New hero');
});
test('failed save keeps the draft and reload restores saved content',async()=>{
  render(<LanguageProvider><ContentEditor active/></LanguageProvider>);await screen.findByDisplayValue('Original hero');fireEvent.change(screen.getAllByLabelText('English title')[0],{target:{value:'Unsaved'}});
  global.fetch.mockResolvedValueOnce({ok:false,status:409,json:()=>Promise.resolve({error:'Changed elsewhere'})});fireEvent.click(screen.getByRole('button',{name:'Save to storefront'}));await screen.findByText('Changed elsewhere');expect(screen.getAllByLabelText('English title')[0]).toHaveValue('Unsaved');
  fireEvent.click(screen.getByRole('button',{name:'Reload saved version'}));await waitFor(()=>expect(screen.getAllByLabelText('English title')[0]).toHaveValue('Original hero'));
});
