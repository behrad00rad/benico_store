import React, { useContext, useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import CartSidebar from './sidebar';
import logo from '../logo.png'
import SearchBar from './searchbar';
import { ThemeContext } from './themeprovider';

const Nav = () => {
  const cookies =new Cookies() 
  const theme = useContext(ThemeContext);
  const isFarsi = cookies.getAll().Lang === 'fa';
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const handleReReadCookie = () =>{
    window.dispatchEvent(new CustomEvent('cartItemUpdated'));
    window.dispatchEvent(new CustomEvent('CartOpened'));
  } 


  const handleCartItemsChange = (updatedCartItems) => {
    setCartItems(updatedCartItems);
  };
  const [inverted,setin] = useState()
  useEffect(()=>{setin(theme == "benidark" ? " " : "invert" )},[theme])

  useEffect(() => {
    const cartData = cookies.get('cartData');
    if (cartData) {
      setCartItemCount(cartData.length);
    }

    window.addEventListener('cartItemCountUpdated', handleCartItemCountUpdated);

    return () => {
      window.removeEventListener('cartItemCountUpdated', handleCartItemCountUpdated);
    };
  }, []);

  const handleCartItemCountUpdated = (event) => {
    const updatedCartItemCount = event.detail; 
    setCartItemCount(updatedCartItemCount);
  };

const [checked ,setChecked] = useState('')

const HandleClose = () => {
    (checked == 'checked') ? setChecked(''): setChecked('checked');
}

  return (
    <nav data-theme={theme} className={`" bg-base-100 flex flex-row items-center top-0 left-0 right-0 z-50 font-ral p-4 h-[100px] min-w-screen gap-1 "`}>
        <div className=' w-full flex md:hidden  items-center h-[30px]'>
           <div className={'w-1/2 items-center '+inverted}>
             <svg className={'w-fit'+{inverted}} width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" fill="rgba(255,255,255,1)">
                </path>
             </svg>  
          </div>
        <a href="/" className="w-1/3">
           <img className={inverted} src={logo}/>
        </a>
          <div className='flex w-1/2 gap-6  justify-end'>
              <div className="drawer  w-fit">
                <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={checked} />
                <div className="drawer-content">
                    <label htmlFor="my-drawer" className="drawer-button" onClick={HandleClose}>
                    <div className="relative text-accent hover:text-neutral cursor-pointer flex">
                      <svg className={inverted} onClick={handleReReadCookie} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M7.00488 7.99951V5.99951C7.00488 3.23809 9.24346 0.999512 12.0049 0.999512C14.7663 0.999512 17.0049 3.23809 17.0049 5.99951V7.99951H20.0049C20.5572 7.99951 21.0049 8.44723 21.0049 8.99951V20.9995C21.0049 21.5518 20.5572 21.9995 20.0049 21.9995H4.00488C3.4526 21.9995 3.00488 21.5518 3.00488 20.9995V8.99951C3.00488 8.44723 3.4526 7.99951 4.00488 7.99951H7.00488ZM7.00488 9.99951H5.00488V19.9995H19.0049V9.99951H17.0049V11.9995H15.0049V9.99951H9.00488V11.9995H7.00488V9.99951ZM9.00488 7.99951H15.0049V5.99951C15.0049 4.34266 13.6617 2.99951 12.0049 2.99951C10.348 2.99951 9.00488 4.34266 9.00488 5.99951V7.99951Z" fill="rgba(255,255,255,1)"></path></svg>
                      {cartItemCount > 0 && (
                        <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                          {cartItemCount}
                        </span>
                      )}
                    </div>
                    </label>
                </div>
                <div className="drawer-side z-50">
                  <label htmlFor="my-drawer" className="drawer-overlay" onClick={HandleClose}></label>
                   <ul className="  menu p-4 w-5/6 gap-4 flex flex-col bg-base-100 text-base-content">
                      <div className={'h-1/12 w-1/12 cursor-pointer'+{inverted}} onClick={HandleClose} >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z" fill="rgba(255,255,255,1)"></path></svg>
                      </div>
                     <CartSidebar items={cookies.getAll()} onCartItemsChange={handleCartItemsChange} />
                  </ul>
               </div>    
            </div>
            <a href={cookies.getAll().userinfo?'/dashboard/detail':'/accounts'}  className={inverted}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" fill="rgba(255,255,255,1)"></path></svg>
            </a>
          </div>
        </div>
        <div className={`hidden md:block w-full items-center ${isFarsi?'font-yek':'font-mont font-thin'}`}>
            <div className='flex justify-between items-center p-3'>
                  <div className='w-1/3 '> 
                    <SearchBar/>
                  </div>
                  <a href="/" className="w-1/3 items-center flex justify-center">
                    <img className={`w-1/3 ${inverted}`} src={logo}/>
                  </a>
                  <ul className="flex gap-6 justify-end text-lg w-1/3">
                    <li>
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className=" bg-none rounded hover:opacity-70 text-accent p-2 cursor-pointer">{isFarsi?"دسته بندی":"Products"}</label>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow rounded bg-secondary text-neutral w-52">
                        <li><a href='/products/'>{isFarsi?'همه':'all'}</a></li>
                        <li><a href='/products/hoodie/1'>{isFarsi?'هودی':'hoodie'}</a></li>
                        <li><a href='/products/t-shirt/1'>{isFarsi?'تیشرت':'t-shirt'}</a></li>
                      </ul>
                    </div>
                    </li>
                    <li>
                    <div className="drawer  w-fit">
                      <input id="my-drawer2" type="checkbox" className="drawer-toggle" checked={checked} />
                      <div className="drawer-content ">
                          <label onClick={() =>{
                            handleReReadCookie();
                             HandleClose()
                             }
                             } htmlFor="my-drawer2" className="drawer-button">
                          <div className="relative text-center items-center text-accent hover:opacity-70 cursor-pointer flex w-full">
                              <span>
                              {isFarsi?'سبد خرید':'Cart'}
                              </span>
                              <svg className={inverted} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M7.00488 7.99951V5.99951C7.00488 3.23809 9.24346 0.999512 12.0049 0.999512C14.7663 0.999512 17.0049 3.23809 17.0049 5.99951V7.99951H20.0049C20.5572 7.99951 21.0049 8.44723 21.0049 8.99951V20.9995C21.0049 21.5518 20.5572 21.9995 20.0049 21.9995H4.00488C3.4526 21.9995 3.00488 21.5518 3.00488 20.9995V8.99951C3.00488 8.44723 3.4526 7.99951 4.00488 7.99951H7.00488ZM7.00488 9.99951H5.00488V19.9995H19.0049V9.99951H17.0049V11.9995H15.0049V9.99951H9.00488V11.9995H7.00488V9.99951ZM9.00488 7.99951H15.0049V5.99951C15.0049 4.34266 13.6617 2.99951 12.0049 2.99951C10.348 2.99951 9.00488 4.34266 9.00488 5.99951V7.99951Z" fill="rgba(255,255,255,1)"></path></svg>
                                    {cartItemCount > 0 && (
                              <span  className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                                {cartItemCount}
                              </span>
                            )} 
                          </div>
                          </label>
                       </div>
                      <div className="drawer-side z-50 ease-linear">
                          <label htmlFor="my-drawer2" onClick={HandleClose} className="drawer-overlay"></label>
                             <ul className="menu p-4 w-5/12 gap-4 flex flex-col bg-base-100 text-base-content">
                              <div className={'h-1/12 w-1/12 cursor-pointer '+inverted} onClick={HandleClose} >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z" fill="rgba(255,255,255,1)"></path></svg>
                              </div>
                                <CartSidebar items={cookies.getAll()} onCartItemsChange={handleCartItemsChange} />
                            </ul>
                      </div>    
                    </div>
                    </li>
                    <li>
                      <div className='w-full'>
                         <a href={cookies.getAll().userinfo?'/dashboard/detail':'/accounts'} className={'cursor-pointer hover:opacity-70 flex text-md text-accent items-center text-center'+{inverted}}>
                             <div className=''>
                                  <svg xmlns="http://www.w3.org/2000/svg" className={inverted} width="24" height="24" viewBox="0 0 24 24"><path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" fill="rgba(255,255,255,1)"></path></svg>
                             </div>
                          <span className='w-full'>
                              {cookies.getAll().userinfo?cookies.getAll().userinfo[0].username : isFarsi?'حساب کاربری':"accounts" }
                          </span>
                         </a>
                      </div>
                    </li>
                  </ul>
              </div>
        </div>
    </nav>
  );
};

export default Nav;
